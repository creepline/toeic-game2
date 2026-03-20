// 生成 1000 个托业单词 - 100 关版本
const fs = require('fs');
const iconv = require('iconv-lite');

const inputPath = 'C:\\Users\\hp\\Desktop\\托业单词纯文本整理.txt';
const outputPath = 'C:\\Users\\hp\\.openclaw\\workspace\\toeic-game\\src\\toeicWords-full.js';

const raw = fs.readFileSync(inputPath);
const content = iconv.decode(raw, 'gbk');
const lines = content.split(/\r?\n/);

const words = [];

lines.forEach((line) => {
  line = line.trim();
  
  if (!line || line.startsWith('-')) return;
  
  const parts = line.split('\t');
  if (parts.length < 2) return;
  
  let word = parts[0].trim();
  let meaning = parts.slice(1).join(' ').trim();
  
  // 清理单词
  word = word.replace(/\([^)]*\)/g, '').replace(/\[.*?\]/g, '').replace(/vt\.|vi\.|n\.|adj\.|adv\./g, '').trim();
  
  // 过滤
  if (word.length < 2) return;
  if (word.includes(':') || word.includes('=')) return;
  if (/^[\u4e00-\u9fa5]+$/.test(word)) return;
  if (!meaning || meaning.length < 1) return;
  if (word.includes(' ')) return;  // 排除短语，只要单个单词
  
  words.push({ word, meaning });
});

// 去重
const uniqueWords = [];
const seen = new Set();
words.forEach(w => {
  const key = w.word.toLowerCase();
  if (!seen.has(key)) {
    seen.add(key);
    uniqueWords.push(w);
  }
});

console.log(`✓ 原始解析：${words.length} 个单词`);
console.log(`✓ 去重后：${uniqueWords.length} 个单词`);

// 取前 1000 个
const wordsForOutput = uniqueWords.slice(0, 1000);
const totalLevels = Math.ceil(wordsForOutput.length / 10);

console.log(`✓ 生成 ${wordsForOutput.length} 个单词，分为 ${totalLevels} 关`);

// 生成 JS 文件
const output = `// 托业核心词汇库 - ${wordsForOutput.length}个高频单词
// 分为${totalLevels}关，每关 10 个单词
// 生成时间：${new Date().toLocaleString('zh-CN')}

export const toeicWords = [
${wordsForOutput.map(w => `  { word: '${w.word.replace(/'/g, "\\'")}', phonetic: '', meaning: '${w.meaning.replace(/'/g, "\\'")}' }`).join(',\n')}
];
`;

fs.writeFileSync(outputPath, output, 'utf-8');
console.log(`\n✓ 文件已保存：${outputPath}`);

// 显示前 20 个单词
console.log('\n前 20 个单词预览:');
wordsForOutput.slice(0, 20).forEach((w, i) => {
  console.log(`  ${i + 1}. ${w.word} - ${w.meaning}`);
});
