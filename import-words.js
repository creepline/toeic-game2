const fs = require('fs');
const path = require('path');

// 读取托业单词纯文本文件
const desktopPath = path.join(process.env.USERPROFILE, 'Desktop');
const toeicTxtPath = path.join(desktopPath, '托业单词纯文本.txt');

console.log('正在读取托业单词文件...');
console.log('文件路径:', toeicTxtPath);

try {
  const content = fs.readFileSync(toeicTxtPath, 'utf8');
  const lines = content.split('\n');
  
  const words = [];
  let currentCategory = '';
  
  lines.forEach(line => {
    line = line.trim();
    
    // 检查是否是分类标题
    if (line.startsWith('TOEIC Vocabulary-') || line.startsWith('-')) {
      currentCategory = line.replace(/-/g, '').trim();
      return;
    }
    
    // 跳过空行和注释
    if (!line || line.startsWith('') || line.startsWith('')) {
      return;
    }
    
    // 解析单词行（英文 + 中文）
    const match = line.match(/^([a-zA-Z\s\-\(\)]+)\s+(.+)$/);
    if (match) {
      const word = match[1].trim();
      const meaning = match[2].trim();
      
      // 跳过太短的单词（可能是误识别）
      if (word.length > 2 && meaning.length > 1) {
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
  const jsContent = `// 托业核心词汇库 - 从文档导入
export const toeicWords = ${JSON.stringify(words, null, 2)};
`;
  
  const outputPath = path.join(process.cwd(), 'toeic-game', 'src', 'toeicWords-imported.js');
  fs.writeFileSync(outputPath, jsContent);
  
  console.log(`\n📦 单词已保存到：${outputPath}`);
  console.log(`\n前 20 个单词预览：`);
  words.slice(0, 20).forEach((w, i) => {
    console.log(`${i + 1}. ${w.word} - ${w.meaning}`);
  });
  
} catch (error) {
  console.error('读取失败:', error.message);
}

console.log('\n完成！');
