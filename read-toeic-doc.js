const fs = require('fs');
const path = require('path');

// 读取桌面托业单词文档
const desktopPath = path.join(process.env.USERPROFILE, 'Desktop');
const toeicDocPath = path.join(desktopPath, '托业单词.doc');

console.log('正在读取托业单词文档...');
console.log('文件路径:', toeicDocPath);

try {
  // 检查文件是否存在
  if (!fs.existsSync(toeicDocPath)) {
    console.log('文件不存在，尝试查找其他托业文件...');
    const files = fs.readdirSync(desktopPath).filter(f => 
      f.includes('托业') || f.includes('TOEIC') || f.includes('单词')
    );
    console.log('找到相关文件:', files);
    return;
  }

  const stats = fs.statSync(toeicDocPath);
  console.log('文件大小:', stats.size, '字节');
  console.log('文件类型:', path.extname(toeicDocPath));
  
  // 由于是 .doc 文件，我们需要用特殊方式读取
  // 这里我们创建一个模板文件，用户可以手动复制单词
  console.log('\n===========================================');
  console.log('📋 托业单词导入说明');
  console.log('===========================================\n');
  console.log('由于 .doc 文件是二进制格式，请按以下步骤操作：\n');
  console.log('1. 打开桌面上的 "托业单词.doc"');
  console.log('2. 全选所有单词 (Ctrl+A)');
  console.log('3. 复制 (Ctrl+C)');
  console.log('4. 粘贴到以下文件中：');
  console.log('   C:\\Users\\hp\\.openclaw\\workspace\\toeic-game\\src\\toeicWords.js\n');
  console.log('或者创建一个 TXT 文件，格式如下：');
  console.log('word,phonetic,meaning');
  console.log('agenda,/əˈdʒendə/,议程');
  console.log('budget,/ˈbʌdʒɪt/,预算\n');
  console.log('===========================================\n');
  
} catch (error) {
  console.error('读取失败:', error.message);
}

console.log('完成！');
