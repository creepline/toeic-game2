// 生成 2000 个托业单词的脚本 - 修复版
const fs = require('fs');
const iconv = require('iconv-lite');

const inputPath = 'C:\\Users\\hp\\Desktop\\托业单词纯文本整理.txt';
const outputPath = 'C:\\Users\\hp\\.openclaw\\workspace\\toeic-game\\src\\toeicWords-full.js';

// 读取原始 buffer
const raw = fs.readFileSync(inputPath);

// 使用 GBK 编码解码
let content;
try {
  content = iconv.decode(raw, 'gbk');
  console.log('✓ 使用 GBK 编码成功解码');
} catch (err) {
  console.error('GBK 解码失败:', err.message);
  content = raw.toString('utf-8');
}

const lines = content.split(/\r?\n/);
const words = [];
let currentCategory = '通用商务';

console.log(`开始处理 ${lines.length} 行...`);

// 处理每一行
lines.forEach((line, idx) => {
  line = line.trim();
  
  // 跳过空行
  if (!line) return;
  
  // 跳过分类标题（以 - 开头）
  if (line.startsWith('-')) {
    return;
  }
  
  // 解析单词行（格式：英文 [tab] 中文）- 只用 tab 分隔
  const parts = line.split('\t');
  
  if (parts.length >= 2) {
    let word = parts[0].trim();
    let meaning = parts.slice(1).join(' ').trim();
    
    // 清理单词（去除括号、音标、词性等）
    word = word.replace(/\([^)]*\)/g, '')
               .replace(/\[.*?\]/g, '')
               .replace(/vt\.|vi\.|n\.|adj\.|adv\./g, '')
               .trim();
    
    // 跳过太短或包含特殊符号的行
    if (word.length < 2 || word.includes(':') || word.includes('=')) {
      return;
    }
    
    // 跳过纯中文释义
    if (/^[\u4e00-\u9fa5]+$/.test(word)) {
      return;
    }
    
    // 跳过释义太短的行
    if (meaning.length < 1) {
      return;
    }
    
    words.push({
      word: word,
      phonetic: '',
      meaning: meaning,
      category: currentCategory
    });
  }
});

console.log(`原始解析：${words.length} 个单词`);

// 去重
const uniqueWords = [];
const seen = new Set();
words.forEach(w => {
  const key = w.word.toLowerCase();
  if (!seen.has(key) && !w.word.includes(' ')) {  // 排除短语
    seen.add(key);
    uniqueWords.push(w);
  }
});

console.log(`去重后：${uniqueWords.length} 个单词`);

// 生成 JavaScript 文件
const wordsForOutput = uniqueWords.slice(0, 2000);
const output = `// 托业核心词汇库 - ${wordsForOutput.length}个高频单词
// 包含托业考试所有高频词汇，分为${Math.ceil(wordsForOutput.length / 10)}关，每关 10 个单词
// 自动生成于 ${new Date().toLocaleString('zh-CN')}

export const toeicWords = [
${wordsForOutput.map(w => `  { word: '${w.word.replace(/'/g, "\\'")}', phonetic: '${w.phonetic}', meaning: '${w.meaning.replace(/'/g, "\\'")}' }`).join(',\n')}
];
`;

fs.writeFileSync(outputPath, output, 'utf-8');
console.log(`\n✓ 文件已保存到：${outputPath}`);
console.log(`✓ 共生成 ${wordsForOutput.length} 个单词`);
console.log(`✓ 可以分为 ${Math.ceil(wordsForOutput.length / 10)} 关`);

// 输出前 10 个单词预览
console.log('\n前 10 个单词预览:');
wordsForOutput.slice(0, 10).forEach((w, i) => {
  console.log(`  ${i + 1}. ${w.word} - ${w.meaning}`);
});
