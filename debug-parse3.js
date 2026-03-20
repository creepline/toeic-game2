const fs = require('fs');
const iconv = require('iconv-lite');

const inputPath = 'C:\\Users\\hp\\Desktop\\托业单词纯文本整理.txt';
const raw = fs.readFileSync(inputPath);
const content = iconv.decode(raw, 'gbk');
const lines = content.split(/\r?\n/);

let wordCount = 0;
let skipReasons = { empty: 0, category: 0, notEnoughParts: 0, tooShort: 0, specialChars: 0, chinese: 0, badMeaning: 0, phrase: 0, ok: 0 };

lines.forEach((line, idx) => {
  line = line.trim();
  
  if (!line) { skipReasons.empty++; return; }
  if (line.startsWith('-')) { skipReasons.category++; return; }
  
  const parts = line.split('\t');
  
  if (parts.length < 2) { skipReasons.notEnoughParts++; return; }
  
  let word = parts[0].trim();
  let meaning = parts.slice(1).join(' ').trim();
  
  word = word.replace(/\([^)]*\)/g, '').replace(/\[.*?\]/g, '').replace(/vt\.|vi\.|n\.|adj\.|adv\./g, '').trim();
  
  if (word.length < 2) { skipReasons.tooShort++; return; }
  if (word.includes(':') || word.includes('=')) { skipReasons.specialChars++; return; }
  if (/^[\u4e00-\u9fa5]+$/.test(word)) { skipReasons.chinese++; return; }
  if (meaning.includes('') || meaning.length < 1) { skipReasons.badMeaning++; return; }
  if (word.includes(' ')) { skipReasons.phrase++; return; }
  
  skipReasons.ok++;
  wordCount++;
});

console.log('统计结果:');
console.log(JSON.stringify(skipReasons, null, 2));
console.log(`\n成功解析：${wordCount} 个单词`);

// 显示前 10 个成功的
console.log('\n前 10 个成功解析的单词:');
let count = 0;
lines.forEach((line, idx) => {
  if (count >= 10) return;
  line = line.trim();
  if (!line || line.startsWith('-')) return;
  
  const parts = line.split('\t');
  if (parts.length < 2) return;
  
  let word = parts[0].trim();
  let meaning = parts.slice(1).join(' ').trim();
  word = word.replace(/\([^)]*\)/g, '').replace(/\[.*?\]/g, '').replace(/vt\.|vi\.|n\.|adj\.|adv\./g, '').trim();
  
  if (word.length < 2 || word.includes(':') || word.includes('=') || /^[\u4e00-\u9fa5]+$/.test(word) || word.includes(' ')) return;
  
  console.log(`  ${count + 1}. "${word}" - "${meaning}"`);
  count++;
});
