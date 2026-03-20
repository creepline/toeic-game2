const fs = require('fs');
const iconv = require('iconv-lite');

const inputPath = 'C:\\Users\\hp\\Desktop\\托业单词纯文本整理.txt';
const raw = fs.readFileSync(inputPath);
const content = iconv.decode(raw, 'gbk');

console.log('文件前 2000 字符:');
console.log(content.substring(0, 2000));

console.log('\n\n=== 逐行分析前 30 行 ===');
const lines = content.split(/\r?\n/);
lines.slice(0, 30).forEach((line, idx) => {
  console.log(`行${idx}: [${line}]`);
  console.log(`  长度：${line.length}, 包含 tab: ${line.includes('\t')}`);
  const parts = line.split(/\t+|\s{2,}/);
  console.log(`  分割后：${parts.length} 部分`, parts);
});
