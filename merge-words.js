// 合并 toeicWords-example.js (500 词带例句) + toeicWords-full.js (1000 词)
// 生成 1000 词带例句版本（前 500 词有完整例句，后 500 词基础版）

const fs = require('fs');

// 读取 example 文件（需要提取内容）
const exampleContent = fs.readFileSync('src/toeicWords-example.js', 'utf-8');

// 解析 example 中的单词数据
const exampleWords = [];
const exampleRegex = /\{\s*word:\s*'([^']+)',\s*phonetic:\s*'([^']+)',\s*meaning:\s*'([^']+)',\s*example:\s*'([^']+)',\s*exampleTranslation:\s*'([^']+)'\s*\}/g;
let match;

while ((match = exampleRegex.exec(exampleContent)) !== null) {
  exampleWords.push({
    word: match[1],
    phonetic: match[2],
    meaning: match[3],
    example: match[4],
    exampleTranslation: match[5]
  });
}

console.log(`✓ 从 example 文件提取 ${exampleWords.length} 个带例句的单词`);

// 读取 full 文件
const fullContent = fs.readFileSync('src/toeicWords-full.js', 'utf-8');
const fullRegex = /\{\s*word:\s*'([^']+)',\s*phonetic:\s*'([^']*)',\s*meaning:\s*'([^']+)'\s*\}/g;
const fullWords = [];

while ((match = fullRegex.exec(fullContent)) !== null) {
  fullWords.push({
    word: match[1],
    phonetic: match[2],
    meaning: match[3]
  });
}

console.log(`✓ 从 full 文件提取 ${fullWords.length} 个单词`);

// 合并：优先使用 example 中的完整数据
const exampleWordSet = new Set(exampleWords.map(w => w.word.toLowerCase()));
const mergedWords = [...exampleWords];

// 添加 full 中独有的单词
fullWords.forEach(w => {
  if (!exampleWordSet.has(w.word.toLowerCase())) {
    mergedWords.push(w);
  }
});

console.log(`✓ 合并后共 ${mergedWords.length} 个单词`);

// 取前 1000 个
const outputWords = mergedWords.slice(0, 1000);
const totalLevels = Math.ceil(outputWords.length / 10);

console.log(`✓ 输出 ${outputWords.length} 个单词，分为 ${totalLevels} 关`);
console.log(`✓ 带例句的单词：${outputWords.filter(w => w.example).length} 个`);

// 生成 JS 文件
const output = `// 托业核心词汇库 - ${outputWords.length}个高频单词
// 分为${totalLevels}关，每关 10 个单词
// 生成时间：${new Date().toLocaleString('zh-CN')}
// 前${exampleWords.length}个单词包含例句

export const toeicWords = [
${outputWords.map(w => {
  if (w.example) {
    return `  { word: '${w.word.replace(/'/g, "\\'")}', phonetic: '${w.phonetic.replace(/'/g, "\\'")}', meaning: '${w.meaning.replace(/'/g, "\\'")}', example: '${w.example.replace(/'/g, "\\'")}', exampleTranslation: '${w.exampleTranslation.replace(/'/g, "\\'")}' }`;
  } else {
    return `  { word: '${w.word.replace(/'/g, "\\'")}', phonetic: '${w.phonetic.replace(/'/g, "\\'")}', meaning: '${w.meaning.replace(/'/g, "\\'")}' }`;
  }
}).join(',\n')}
];
`;

fs.writeFileSync('src/toeicWords-full.js', output, 'utf-8');
console.log('\n✓ 文件已保存：src/toeicWords-full.js');

// 显示前 10 个单词预览
console.log('\n前 10 个单词预览:');
outputWords.slice(0, 10).forEach((w, i) => {
  console.log(`  ${i + 1}. ${w.word} - ${w.meaning}${w.example ? ' ✓有例句' : ''}`);
});
