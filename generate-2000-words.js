// 生成 2000 个托业单词的脚本 - 使用 GBK 编码
const fs = require('fs');
const iconv = require('iconv-lite');

const inputPath = 'C:\\Users\\hp\\Desktop\\托业单词纯文本整理.txt';
const outputPath = 'C:\\Users\\hp\\.openclaw\\workspace\\toeic-game\\src\\toeicWords-full.js';

// 读取原始 buffer
const raw = fs.readFileSync(inputPath);

// 尝试 GBK 编码解码
let content;
try {
  content = iconv.decode(raw, 'gbk');
  console.log('使用 GBK 编码成功解码');
} catch (err) {
  console.log('GBK 解码失败，尝试 UTF-8');
  content = raw.toString('utf-8');
}

const lines = content.split('\n');
const words = [];
let currentCategory = '通用商务';

// 分类标题关键词
const categoryKeywords = {
  '求职招聘': ['Job', '招聘', 'occupation', 'vacancy', 'position'],
  '办公室事务': ['Office', '办公室', 'memo', 'meeting'],
  '市场营销': ['Marketing', '市场', 'sales', 'customer', 'product'],
  '银行业务': ['Bank', '银行', 'account', 'loan', 'deposit'],
  '商务旅行': ['Travel', '旅行', 'flight', 'hotel', 'airport'],
  '餐饮': ['Restaurant', '餐饮', 'food', 'menu', 'dining'],
  '国际贸易': ['Trade', '贸易', 'import', 'export', 'customs'],
  '公司法务': ['Law', '法律', 'contract', 'legal', 'court'],
  '人力资源管理': ['HR', '人力资源', 'employee', 'training', 'performance'],
  '财务会计': ['Accounting', '会计', 'finance', 'audit', 'tax'],
  '金融投资': ['Investment', '投资', 'stock', 'bond', 'securities'],
  '生产制造': ['Production', '生产', 'manufacturing', 'factory'],
  '保险养老': ['Insurance', '保险', 'pension', 'policy'],
  '交通通勤': ['Traffic', '交通', 'commute', 'subway', 'vehicle'],
  '行业领域': ['Industry', '行业', 'sector', 'industrial'],
  '合同法律': ['Contract', '合同', 'agreement', 'terms'],
  '薪酬福利': ['Compensation', '薪酬', 'benefits', 'salary', 'wage'],
  '经营管理': ['Management', '管理', 'strategy', 'operation'],
  '公司企业': ['Company', '公司', 'corporation', 'enterprise'],
  '投资证券': ['Securities', '证券', 'shareholder', 'dividend'],
  '董事会成员': ['Board', '董事会', 'director', 'CEO', 'CFO'],
  '公告信息': ['Announcement', '公告', 'information'],
  '商务信函': ['Business Letters', '信函', 'letter'],
  '邀请活动': ['Invitation', '邀请', 'party', 'ceremony'],
  '新闻报道': ['Newspaper', '新闻', 'article', 'press'],
  '体育比赛': ['Sports', '体育', 'match', 'game', 'contest'],
  '统计数字': ['Statistics', '统计', 'figures', 'data'],
  '统计图表': ['Graph', '图表', 'bar', 'line', 'pie'],
  '广播电视': ['TV', 'Radio', '广播', '电视'],
  '天气报告': ['Weather', '天气', 'rain', 'storm', 'temperature']
};

// 处理每一行
lines.forEach((line, idx) => {
  line = line.trim();
  
  // 跳过空行
  if (!line) return;
  
  // 检测分类标题（以 - 或 About 开头）
  if (line.startsWith('-') || line.startsWith('About')) {
    // 尝试匹配分类
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(k => line.toLowerCase().includes(k.toLowerCase()))) {
        currentCategory = category;
        break;
      }
    }
    return;
  }
  
  // 解析单词行（格式：英文 [tab] 中文）
  const tabMatch = line.match(/^([^\t]+)\t+(.+)$/);
  if (tabMatch) {
    let word = tabMatch[1].trim();
    let meaning = tabMatch[2].trim();
    
    // 清理单词（去除括号、音标等）
    word = word.replace(/\([^)]*\)/g, '').replace(/\[.*?\]/g, '').replace(/vt\.|vi\.|n\.|adj\.|adv\./g, '').trim();
    
    // 跳过太短或包含特殊符号的行
    if (word.length < 2 || word.includes(':') || word.includes('=') || word.startsWith('')) {
      return;
    }
    
    // 跳过纯中文释义
    if (/^[\u4e00-\u9fa5]+$/.test(word)) {
      return;
    }
    
    // 清理释义中的乱码
    if (meaning.includes('') || meaning.length < 1) {
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

console.log(`\n处理完成！`);
console.log(`原始单词数：${words.length}`);
console.log(`去重后单词数：${uniqueWords.length}`);

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
console.log(`\n文件已保存到：${outputPath}`);
console.log(`共生成 ${wordsForOutput.length} 个单词`);
console.log(`可以分为 ${Math.ceil(wordsForOutput.length / 10)} 关`);

// 输出分类统计
const categoryCount = {};
wordsForOutput.forEach(w => {
  categoryCount[w.category] = (categoryCount[w.category] || 0) + 1;
});
console.log('\n分类统计:');
Object.entries(categoryCount).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});
