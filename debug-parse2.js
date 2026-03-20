const fs = require('fs');
const iconv = require('iconv-lite');

const inputPath = 'C:\\Users\\hp\\Desktop\\托业单词纯文本整理.txt';
const raw = fs.readFileSync(inputPath);
const content = iconv.decode(raw, 'gbk');

console.log('=== 逐行分析前 30 行（检查分隔符）===');
const lines = content.split(/\r?\n/);
let wordCount = 0;

lines.slice(0, 50).forEach((line, idx) => {
  if (line.startsWith('-')) {
    console.log(`\n行${idx}: [分类] ${line}`);
    return;
  }
  
  // 检查是否包含 tab
  const hasTab = line.includes('\t');
  const tabCount = (line.match(/\t/g) || []).length;
  
  if (hasTab) {
    const parts = line.split('\t');
    console.log(`行${idx}: [TAB 分隔，${tabCount}个 tab]`);
    console.log(`  单词："${parts[0]}" (长度${parts[0].length})`);
    console.log(`  释义："${parts[1]}" (长度${parts[1]?.length || 0})`);
    wordCount++;
  } else {
    console.log(`行${idx}: [无 TAB] "${line.substring(0, 50)}..."`);
  }
});

console.log(`\n\n前 50 行中找到 ${wordCount} 个单词`);
