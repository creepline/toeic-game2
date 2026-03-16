const fs = require('fs');

// 读取桌面上的所有 txt 文件
const files = fs.readdirSync('C:\\Users\\hp\\Desktop').filter(f => 
  f.endsWith('.txt') && (f.includes('托业') || f.includes('TOEIC') || f.includes('单词'))
);

console.log('找到的托业单词文件:');
files.forEach(f => console.log(' -', f));

if (files.length > 0) {
  const content = fs.readFileSync('C:\\Users\\hp\\Desktop\\' + files[0], 'utf8');
  const lines = content.split('\n');
  
  console.log(`\n文件共有 ${lines.length} 行`);
  console.log('\n前 50 行内容:');
  lines.slice(0, 50).forEach((line, i) => {
    if (line.trim()) {
      console.log(`${i + 1}. ${line}`);
    }
  });
}
