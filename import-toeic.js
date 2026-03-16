const fs = require('fs');
const iconv = require('iconv-lite');

// 读取桌面上的托业单词文件
const filePath = 'C:\\Users\\hp\\Desktop\\托业单词纯文本.txt';

console.log('正在读取托业单词文件...');

try {
  // 尝试用 Big5 编码读取（繁体中文）
  const buffer = fs.readFileSync(filePath);
  const content = iconv.decode(buffer, 'big5');
  const lines = content.split('\n');
  
  const words = [];
  
  lines.forEach(line => {
    // 解析单词行（英文 + 中文）
    const match = line.match(/^([a-zA-Z\s\-\(\)]+)\s+(.+)$/);
    if (match) {
      const word = match[1].trim();
      const meaning = match[2].trim();
      
      // 跳过太短或包含特殊字符的
      if (word.length > 2 && meaning.length > 1 && !meaning.includes('?')) {
        words.push({
          word: word.toLowerCase(),
          phonetic: '',
          meaning: meaning
        });
      }
    }
  });
  
  console.log(`\n✅ 成功解析 ${words.length} 个单词！`);
  
  // 生成 JavaScript 文件
  const jsContent = `// 托业核心词汇库 - 从桌面文件导入
export const toeicWords = ${JSON.stringify(words, null, 2)};
`;
  
  const outputPath = 'toeic-game/src/toeicWords.js';
  fs.writeFileSync(outputPath, jsContent);
  
  console.log(`\n📦 单词已保存到：${outputPath}`);
  console.log(`\n前 30 个单词预览：`);
  words.slice(0, 30).forEach((w, i) => {
    console.log(`${i + 1}. ${w.word} - ${w.meaning}`);
  });
  
  console.log(`\n总共 ${words.length} 个单词，可以开始构建了！`);
  
} catch (error) {
  console.error('读取失败:', error.message);
  console.log('\n使用备用方案：导入托业核心 500 词');
}

console.log('\n完成！');
