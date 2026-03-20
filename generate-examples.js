// 为 1000 个单词生成例句（使用简单模板）
const fs = require('fs');

// 读取当前词库
const content = fs.readFileSync('src/toeicWords-full.js', 'utf-8');
const wordRegex = /\{\s*word:\s*'([^']+)',\s*phonetic:\s*'([^']*)',\s*meaning:\s*'([^']+)'(?:,\s*example:\s*'([^']+)',\s*exampleTranslation:\s*'([^']+)')?\s*\}/g;

const words = [];
let match;

while ((match = wordRegex.exec(content)) !== null) {
  words.push({
    word: match[1],
    phonetic: match[2],
    meaning: match[3],
    example: match[4] || null,
    exampleTranslation: match[5] || null
  });
}

console.log(`读取 ${words.length} 个单词`);
console.log(`已有例句：${words.filter(w => w.example).length} 个`);

// 为没有例句的单词生成简单例句（模板化）
function makeExample(w, idx) {
  const templates = [
    `The ${w.word} is important in business.`,
    `We need to ${w.word} this project.`,
    `Please ${w.word} the document.`,
    `The company will ${w.word} next week.`,
    `I want to ${w.word} this opportunity.`,
    `They decided to ${w.word} the plan.`,
    `The ${w.word} was successful.`,
    `We should ${w.word} carefully.`,
    `The manager will ${w.word} the meeting.`,
    `This ${w.word} helps us improve.`,
  ];
  return templates[idx % templates.length];
}

function makeTranslation(w, idx) {
  const templates = [
    `${w.word} 在商务中很重要。`,
    `我们需要${w.word}这个项目。`,
    `请${w.word}这份文件。`,
    `公司下周将${w.word}。`,
    `我想${w.word}这个机会。`,
    `他们决定${w.word}这个计划。`,
    `${w.word} 很成功。`,
    `我们应该仔细${w.word}。`,
    `经理将${w.word}会议。`,
    `这个${w.word}帮助我们改进。`,
  ];
  return templates[idx % templates.length];
}

let generated = 0;
words.forEach((w, idx) => {
  if (!w.example) {
    w.example = makeExample(w, idx);
    w.exampleTranslation = makeTranslation(w, idx);
    generated++;
  }
});

console.log(`生成例句：${generated} 个`);

// 生成输出
const output = `// 托业核心词汇库 - ${words.length}个高频单词（带例句）
// 分为${Math.ceil(words.length / 10)}关，每关 10 个单词
// 生成时间：${new Date().toLocaleString('zh-CN')}

export const toeicWords = [
${words.map(w => `  { word: '${w.word.replace(/'/g, "\\'")}', phonetic: '${w.phonetic.replace(/'/g, "\\'")}', meaning: '${w.meaning.replace(/'/g, "\\'")}', example: '${w.example.replace(/'/g, "\\'")}', exampleTranslation: '${w.exampleTranslation.replace(/'/g, "\\'")}' }`).join(',\n')}
];
`;

fs.writeFileSync('src/toeicWords-full.js', output, 'utf-8');
console.log('\n✓ 文件已保存：src/toeicWords-full.js');
console.log(`✓ 所有 ${words.length} 个单词现在都有例句`);

// 显示前 10 个预览
console.log('\n前 10 个单词预览:');
words.slice(0, 10).forEach((w, i) => {
  console.log(`  ${i + 1}. ${w.word}`);
  console.log(`     例句：${w.example}`);
  console.log(`     翻译：${w.exampleTranslation}`);
});
