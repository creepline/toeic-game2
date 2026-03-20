<template>
  <div class="toeic-game">
    <!-- 游戏首页 -->
    <div v-if="gameState === 'home'" class="home-screen">
      <h1>🎴 托业单词记忆大挑战</h1>
      <p class="subtitle">TOEIC Vocabulary Memory Game</p>
      
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-label">总词库</span>
          <span class="stat-value">{{ allWords.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总关卡</span>
          <span class="stat-value">{{ totalLevels }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已通过</span>
          <span class="stat-value">{{ passedLevels }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总积分</span>
          <span class="stat-value">{{ totalScore }}</span>
        </div>
      </div>
      
      <div class="menu-cards">
        <el-card shadow="hover" class="menu-card" @click="startGame" @touchstart="startGame">
          <div class="card-icon">🎮</div>
          <h3>开始游戏</h3>
          <p>挑战 {{ totalLevels }} 个关卡</p>
        </el-card>
        
        <el-card shadow="hover" class="menu-card" @click="openWordBook" @touchstart="openWordBook">
          <div class="card-icon">📖</div>
          <h3>单词本</h3>
          <p>{{ allWords.length }} 个核心词汇</p>
        </el-card>
        
        <el-card shadow="hover" class="menu-card" @click="openRanking" @touchstart="openRanking">
          <div class="card-icon">🏆</div>
          <h3>排行榜</h3>
          <p>看看谁最厉害</p>
        </el-card>
        
        <el-card shadow="hover" class="menu-card" @click="openAbout" @touchstart="openAbout">
          <div class="card-icon">ℹ️</div>
          <h3>关于游戏</h3>
          <p>游戏规则说明</p>
        </el-card>
      </div>
    </div>
    
    <!-- 游戏进行中 -->
    <div v-if="gameState === 'playing'" class="game-screen">
      <div class="game-header">
        <div class="game-info">
          <span class="level-badge">第 {{ currentLevel }} 关</span>
          <span class="progress-text">进度：{{ currentLevel }}/{{ totalLevels }}</span>
        </div>
        <div class="game-stats">
          <div class="stat">
            <el-icon><Clock /></el-icon>
            <span>{{ formatTime(timeElapsed) }}</span>
          </div>
          <div class="stat">
            <el-icon><Trophy /></el-icon>
            <span>{{ score }} 分</span>
          </div>
          <div class="stat">
            <el-icon><Refresh /></el-icon>
            <span>{{ moves }} 步</span>
          </div>
        </div>
        <el-button size="small" @click="quitGame">退出</el-button>
      </div>
      
      <div class="game-board">
        <div 
          v-for="(card, index) in cards" 
          :key="index"
          class="card"
          :class="{ 'flipped': card.flipped, 'matched': card.matched }"
          @click="flipCard(index)"
        >
          <div class="card-inner">
            <div class="card-front">🎴</div>
            <div class="card-back">
              <div class="word-content">
                <div class="word">{{ card.text }}</div>
                <el-button 
                  v-if="card.flipped || card.matched"
                  circle 
                  type="primary" 
                  size="small"
                  class="card-play-btn"
                  @click.stop="playCardWord(card.text)"
                >
                  🔊
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="game-tips">
        <el-alert 
          :title="getTip()" 
          type="info" 
          :closable="false" 
          show-icon 
        />
      </div>
    </div>
    
    <!-- 关卡完成 -->
    <div v-if="gameState === 'completed'" class="result-screen">
      <el-card class="result-card">
        <div class="result-icon">🎉</div>
        <h2>恭喜通关！</h2>
        <div class="result-stats">
          <div class="result-stat">
            <span class="label">用时</span>
            <span class="value">{{ formatTime(timeElapsed) }}</span>
          </div>
          <div class="result-stat">
            <span class="label">步数</span>
            <span class="value">{{ moves }} 步</span>
          </div>
          <div class="result-stat">
            <span class="label">得分</span>
            <span class="value score">{{ score }}</span>
          </div>
        </div>
        
        <div class="stars">
          <span v-for="i in 3" :key="i" class="star" :class="{ active: i <= starRating }">⭐</span>
        </div>
        
        <div class="word-review">
          <h4>本关学习的单词（{{ currentLevelWords.length }}个）：</h4>
          <div class="word-list">
            <div v-for="word in currentLevelWords" :key="word.word" class="word-item">
              <span class="en">{{ word.word }}</span>
              <span class="cn">{{ word.meaning }}</span>
            </div>
          </div>
        </div>
        
        <div class="result-actions">
          <el-button @click="gameState = 'home'">返回主页</el-button>
          <el-button type="primary" @click="nextLevel" v-if="currentLevel < totalLevels">
            下一关 →
          </el-button>
          <el-button type="success" @click="gameState = 'home'" v-else>
            🏆 完成所有关卡
          </el-button>
        </div>
      </el-card>
    </div>
    
    <!-- 单词本对话框 -->
    <el-dialog 
      v-model="showWordBook" 
      title="📖 托业核心词汇" 
      width="900px"
      :close-on-click-modal="true"
      append-to-body
      destroy-on-close
    >
      <!-- 关卡选择 -->
      <div class="wordbook-tabs">
        <el-tabs v-model="wordBookTab">
          <el-tab-pane label="📚 按关卡学习" name="levels">
            <div class="level-selector">
              <el-button 
                v-for="i in totalLevels" 
                :key="i"
                :type="selectedLevel === i ? 'primary' : 'default'"
                size="small"
                @click="selectLevel(i)"
              >
                第{{ i }}关
              </el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="🔍 搜索单词" name="search">
            <el-input 
              v-model="searchWord" 
              placeholder="输入单词或释义搜索..." 
              clearable
              size="large"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <!-- 单词列表 -->
      <div class="word-list-container">
        <div v-if="wordBookTab === 'levels'" class="level-words">
          <div class="level-header">
            <h3>第 {{ selectedLevel }} 关 - {{ getLevelName(selectedLevel) }}</h3>
            <div class="level-actions">
              <el-button type="success" size="small" @click="playAllWords">
                🔊 播放全部
              </el-button>
              <el-button type="warning" size="small" @click="toggleAutoPlay">
                {{ autoPlay ? '⏸ 停止连读' : '▶ 自动连读' }}
              </el-button>
            </div>
          </div>
          <div class="word-cards">
            <div 
              v-for="(word, idx) in getLevelWords(selectedLevel)" 
              :key="idx"
              class="word-card"
              :class="{ 'playing': currentPlayingIndex === idx && isPlaying, 'expanded': expandedWord === idx }"
            >
              <div class="word-main">
                <span class="word-text">{{ word.word }}</span>
                <span class="word-phonetic">{{ word.phonetic }}</span>
                <div class="word-actions">
                  <el-button 
                    circle 
                    type="primary" 
                    size="small"
                    class="play-btn"
                    @click="playWord(word, idx)"
                  >
                    🔊
                  </el-button>
                  <el-button 
                    v-if="word.example"
                    circle 
                    type="info" 
                    size="small"
                    class="example-btn"
                    @click="toggleExample(idx)"
                  >
                    📖
                  </el-button>
                </div>
              </div>
              <div class="word-meaning">{{ word.meaning }}</div>
              
              <!-- 例句区域 -->
              <div v-if="word.example && expandedWord === idx" class="word-example">
                <div class="example-text">
                  <span class="example-label">例句：</span>
                  <p>{{ word.example }}</p>
                </div>
                <div v-if="word.exampleTranslation" class="example-translation">
                  {{ word.exampleTranslation }}
                </div>
                <el-button 
                  size="small" 
                  type="primary" 
                  link
                  @click="playExample(word)"
                >
                  🔊 播放例句
                </el-button>
              </div>
              
              <div class="word-index">{{ idx + 1 }}/{{ getLevelWords(selectedLevel).length }}</div>
            </div>
          </div>
        </div>
        
        <div v-else class="search-results">
          <div v-if="filteredWords.length === 0" class="empty-tip">
            <el-empty description="没有找到匹配的单词" />
          </div>
          <div v-else class="word-cards">
            <div 
              v-for="(word, idx) in filteredWords" 
              :key="idx"
              class="word-card"
            >
              <div class="word-main">
                <span class="word-text">{{ word.word }}</span>
                <span class="word-phonetic">{{ word.phonetic }}</span>
                <el-button 
                  circle 
                  type="primary" 
                  size="small"
                  class="play-btn"
                  @click="playWord(word, -1)"
                >
                  🔊
                </el-button>
              </div>
              <div class="word-meaning">{{ word.meaning }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showWordBook = false">关闭</el-button>
          <el-button type="primary" @click="exportWords">导出单词表</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 排行榜对话框 -->
    <el-dialog 
      v-model="showRanking" 
      title="🏆 排行榜" 
      width="600px"
      :close-on-click-modal="true"
      append-to-body
      destroy-on-close
    >
      <div class="ranking-tabs">
        <el-tabs>
          <el-tab-pane label="🌍 本地排行">
            <div v-if="localRanking.length === 0" class="empty-tip">
              <p>还没有记录哦，快来挑战吧！</p>
            </div>
            <el-table v-else :data="localRanking" style="width: 100%" max-height="400">
              <el-table-column type="index" label="排名" width="80" />
              <el-table-column prop="name" label="玩家" width="150" />
              <el-table-column prop="score" label="分数" width="100">
                <template #default="{ row }">
                  <span :class="{ 'highlight': row.name === nickname }">{{ row.score }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="levels" label="关卡" width="80" />
              <el-table-column prop="time" label="用时" width="100" />
              <el-table-column prop="date" label="日期" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="📥 挑战好友">
            <div class="challenge-section">
              <p class="tip">输入好友的分享码，挑战 TA 的成绩！</p>
              <el-input 
                v-model="challengeCode" 
                placeholder="例如：TOEIC-5000-LV10-ABCD"
                maxlength="25"
                style="margin-bottom: 15px"
              />
              <el-button type="primary" @click="verifyChallenge" :disabled="!challengeCode">
                验证挑战码
              </el-button>
              <div v-if="challengeResult" class="challenge-result">
                <el-alert 
                  :title="challengeResult.title" 
                  :type="challengeResult.type" 
                  :closable="false" 
                  show-icon 
                />
                <div v-if="challengeResult.success" class="challenge-target">
                  <p><strong>目标成绩：</strong>{{ challengeResult.score }} 分</p>
                  <p><strong>目标关卡：</strong>第 {{ challengeResult.level }} 关</p>
                  <el-button type="success" @click="startChallenge">开始挑战</el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showRanking = false">关闭</el-button>
          <el-button type="danger" @click="clearRanking">清除记录</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 昵称输入对话框 -->
    <el-dialog 
      v-model="showNickname" 
      title="🎮 欢迎来到托业单词游戏！" 
      width="450px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <p>给自己起个昵称吧（可以随时更改）：</p>
      <el-input 
        v-model="nickname" 
        placeholder="例如：英语达人、学习小王"
        maxlength="20"
        @keyup.enter="saveNickname"
      />
      <template #footer>
        <el-button type="primary" @click="saveNickname">开始游戏</el-button>
      </template>
    </el-dialog>
    
    <!-- 分享对话框 -->
    <el-dialog v-model="showShareDialog" title="🎉 分享你的成绩！" width="500px">
      <div class="share-content">
        <div class="share-card">
          <div class="share-header">🎴 托业单词记忆大挑战</div>
          <div class="share-stats">
            <div class="share-stat">
              <span class="label">玩家</span>
              <span class="value">{{ nickname || '匿名玩家' }}</span>
            </div>
            <div class="share-stat">
              <span class="label">分数</span>
              <span class="value highlight">{{ score }}</span>
            </div>
            <div class="share-stat">
              <span class="label">关卡</span>
              <span class="value">{{ currentLevel }}</span>
            </div>
            <div class="share-stat">
              <span class="label">步数</span>
              <span class="value">{{ moves }}</span>
            </div>
          </div>
          <div class="share-code">
            <p>分享码（好友可挑战）：</p>
            <code>{{ shareCode }}</code>
          </div>
        </div>
        <div class="share-actions">
          <el-button @click="copyShareCode">📋 复制分享码</el-button>
          <el-button type="primary" @click="shareToWechat">📱 分享给好友</el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="showShareDialog = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 关于对话框 -->
    <el-dialog 
      v-model="showAbout" 
      title="ℹ️ 关于游戏" 
      width="600px"
      :close-on-click-modal="true"
      append-to-body
      destroy-on-close
    >
      <div class="about-content">
        <h3>🎮 游戏规则</h3>
        <ol>
          <li>点击卡牌翻开，找到<strong>单词和对应释义</strong>的配对</li>
          <li>匹配成功则消除，失败则重新盖上</li>
          <li>全部匹配完成即通过关卡</li>
          <li>步数越少，星级越高</li>
        </ol>
        
        <h3>⭐ 评分标准</h3>
        <ul>
          <li>⭐⭐⭐：10 步以内完成</li>
          <li>⭐⭐：11-15 步完成</li>
          <li>⭐：15 步以上完成</li>
        </ul>
        
        <h3>📚 词库说明</h3>
        <p>包含 <strong>{{ allWords.length }}</strong> 个托业（TOEIC）考试核心商务词汇，分为 {{ totalLevels }} 个关卡，帮助你在游戏中提升英语水平！</p>
        <p><strong>每关单词数：</strong>{{ wordsPerLevel }} 个</p>
        
        <h3>💡 游戏技巧</h3>
        <ul>
          <li>记住牌的位置可以提高效率</li>
          <li>先翻边缘的牌，更容易记忆</li>
          <li>步数越少，星级越高哦！</li>
        </ul>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Clock, Trophy, Refresh } from '@element-plus/icons-vue'
import { toeicWords } from './toeicWords-full.js'

// 游戏状态
const gameState = ref('home')
const currentLevel = ref(1)
const score = ref(0)
const moves = ref(0)
const timeElapsed = ref(0)
const cards = ref([])
const flippedCards = ref([])
const matchedPairs = ref(0)
const showWordBook = ref(false)
const showRanking = ref(false)
const showAbout = ref(false)
const showNickname = ref(false)
const searchWord = ref('')
const nickname = ref('')
const showShareDialog = ref(false)
const shareCode = ref('')
const challengeCode = ref('')
const challengeResult = ref(null)
const isChallengeMode = ref(false)
const challengeTarget = ref(null)

// 单词本相关
const wordBookTab = ref('levels')
const selectedLevel = ref(1)
const isPlaying = ref(false)
const currentPlayingIndex = ref(-1)
const autoPlay = ref(false)
const speechSynth = ref(null)
const expandedWord = ref(-1)
const voicesLoaded = ref(false)

// 加载语音列表（浏览器需要）
const loadVoices = () => {
  const voices = window.speechSynthesis.getVoices()
  if (voices.length > 0) {
    voicesLoaded.value = true
    console.log('已加载语音:', voices.map(v => `${v.name} (${v.lang})`).slice(0, 5))
  }
}

// 浏览器语音加载事件
if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices()
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices
  }
}

// 关卡配置
const wordsPerLevel = 10
const totalLevels = Math.ceil(toeicWords.length / wordsPerLevel)
const passedLevels = ref(0)
const totalScore = ref(0)

// 关卡名称（200 关完整主题）
const levelThemes = [
  '求职招聘', '办公室事务', '市场营销', '银行业务', '商务旅行',
  '餐饮', '国际贸易', '公司法务', '人力资源管理', '财务会计',
  '金融投资', '生产制造', '保险养老', '交通通勤', '行业领域',
  '合同法律', '薪酬福利', '经营管理', '公司企业', '投资证券',
  '董事会', '公告信息', '商务信函', '邀请活动', '新闻报道',
  '体育比赛', '统计数字', '统计图表', '广播电视', '天气报告',
  '计算机', '互联网', '人工智能', '数据分析', '项目管理',
  '客户服务', '供应链', '物流配送', '质量控制', '安全健康',
  '环境保护', '能源电力', '房地产', '建筑工程', '设计创意',
  '媒体传播', '教育培训', '医疗健康', '制药生物', '农业科技',
  '纺织服装', '食品饮料', '家居用品', '电子产品', '机械设备',
  '汽车工业', '航空航天', '船舶海运', '铁路运输', '公共交通',
  '酒店旅游', '娱乐休闲', '健身运动', '美容化妆', '时尚奢侈品',
  '零售批发', '电子商务', '广告公关', '市场调研', '咨询顾问',
  '法律法务', '税务审计', '风险管理', '合规监管', '政府采购',
  '非营利组织', '政府机构', '国际组织', '外交事务', '军事国防',
  '社会科学', '自然科学', '数学统计', '物理化学', '生物科学',
  '地质环境', '天文气象', '海洋科学', '心理学', '哲学宗教',
  '文学艺术', '音乐舞蹈', '戏剧电影', '摄影摄像', '博物馆图书馆',
  '社交礼仪', '人际关系', '沟通技巧', '领导力', '团队合作',
  '时间管理', '决策能力', '创新思维', '问题解决', '职业规划',
  '创业指导', '投资理财', '保险规划', '退休计划', '税务筹划',
  '国际贸易术语', '商务谈判', '跨文化交流', '外语学习', '翻译技巧',
  '会议组织', '活动策划', '演讲演示', '报告撰写', '公文写作',
  '电话会议', '视频通话', '邮件沟通', '即时通讯', '社交媒体',
  '办公自动化', '文档管理', '数据处理', '信息检索', '知识管理',
  '商务旅行准备', '机场手续', '机上服务', '酒店入住', '餐饮预订',
  '当地交通', '会议安排', '商务拜访', '礼品赠送', '文化禁忌',
  '紧急情况', '医疗服务', '保险理赔', '法律咨询', '使领馆联系'
]

// 获取关卡名称
const getLevelName = (level) => {
  return levelThemes[level - 1] || `第${level}关`
}

// 排行榜数据（本地存储）
const localRanking = ref([])

// 生成分享码
const generateShareCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `TOEIC-${score.value}-${currentLevel.value}-${code}`
}

// 验证分享码格式
const isValidShareCode = (code) => {
  return /^TOEIC-\d+-\d+-[A-HJ-NP-Z2-9]{4}$/.test(code)
}

// 加载排行榜
const loadRanking = () => {
  const saved = localStorage.getItem('toeicGame_ranking')
  if (saved) {
    localRanking.value = JSON.parse(saved)
  }
  // 如果没有昵称，提示输入
  if (!nickname.value) {
    const savedName = localStorage.getItem('toeicGame_nickname')
    if (savedName) {
      nickname.value = savedName
    } else {
      showNickname.value = true
    }
  }
}

// 保存排行榜
const saveRanking = () => {
  // 按分数降序排序
  localRanking.value.sort((a, b) => b.score - a.score)
  // 只保留前 50 名
  localRanking.value = localRanking.value.slice(0, 50)
  localStorage.setItem('toeicGame_ranking', JSON.stringify(localRanking.value))
}

// 保存进度
const saveProgress = () => {
  localStorage.setItem('toeicGame_progress', JSON.stringify({
    passedLevels: passedLevels.value,
    totalScore: totalScore.value,
    nickname: nickname.value
  }))
}

// 计算属性
const allWords = computed(() => toeicWords)
const currentLevelWords = computed(() => {
  const start = (currentLevel.value - 1) * wordsPerLevel
  return toeicWords.slice(start, start + wordsPerLevel)
})

const filteredWords = computed(() => {
  if (!searchWord.value) return toeicWords
  return toeicWords.filter(w => 
    w.word.toLowerCase().includes(searchWord.value.toLowerCase()) ||
    w.meaning.includes(searchWord.value)
  )
})

const starRating = computed(() => {
  if (moves.value <= 10) return 3
  if (moves.value <= 15) return 2
  return 1
})

// 初始化关卡
const initLevel = (level) => {
  const words = currentLevelWords.value
  const cardPairs = []
  
  words.forEach((word, idx) => {
    cardPairs.push({
      id: idx,
      text: word.word,
      matchId: idx,
      flipped: false,
      matched: false
    })
    cardPairs.push({
      id: idx + 100,
      text: word.meaning,
      matchId: idx,
      flipped: false,
      matched: false
    })
  })
  
  const allCards = cardPairs.sort(() => Math.random() - 0.5)
  
  cards.value = allCards
  flippedCards.value = []
  matchedPairs.value = 0
  moves.value = 0
  timeElapsed.value = 0
  score.value = level * 100
  
  const timer = setInterval(() => {
    if (gameState.value === 'playing') {
      timeElapsed.value++
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

// 开始游戏
const startGame = () => {
  currentLevel.value = 1
  gameState.value = 'playing'
  initLevel(1)
  ElMessage.success('游戏开始！加油！')
}

// 翻牌
const flipCard = (index) => {
  const card = cards.value[index]
  
  if (card.flipped || card.matched) return
  if (flippedCards.value.length >= 2) return
  
  card.flipped = true
  flippedCards.value.push(index)
  
  if (flippedCards.value.length === 2) {
    moves.value++
    setTimeout(checkMatch, 1000)
  }
}

// 检查匹配
const checkMatch = () => {
  const [idx1, idx2] = flippedCards.value
  const card1 = cards.value[idx1]
  const card2 = cards.value[idx2]
  
  if (card1.matchId === card2.matchId) {
    card1.matched = true
    card2.matched = true
    matchedPairs.value++
    score.value += 10
    
    if (matchedPairs.value === currentLevelWords.value.length) {
      setTimeout(levelComplete, 500)
    }
  } else {
    card1.flipped = false
    card2.flipped = false
  }
  
  flippedCards.value = []
}

// 关卡完成
const levelComplete = () => {
  gameState.value = 'completed'
  passedLevels.value = Math.max(passedLevels.value, currentLevel.value)
  totalScore.value += score.value
  
  // 保存到排行榜
  const record = {
    name: nickname.value || '匿名玩家',
    score: totalScore.value,
    levels: passedLevels.value,
    time: formatTime(timeElapsed.value),
    date: new Date().toLocaleDateString('zh-CN')
  }
  localRanking.value.push(record)
  saveRanking()
  saveProgress()
  
  // 生成分享码
  shareCode.value = generateShareCode()
  showShareDialog.value = true
}

// 下一关
const nextLevel = () => {
  if (currentLevel.value < totalLevels) {
    currentLevel.value++
    gameState.value = 'playing'
    initLevel(currentLevel.value)
  }
}

// 退出游戏
const quitGame = () => {
  if (confirm('确定要退出游戏吗？进度将不会保存。')) {
    gameState.value = 'home'
  }
}

// 获取提示
const getTip = () => {
  const tips = [
    '翻牌找到单词和对应释义的配对！',
    '记住牌的位置可以提高效率哦~',
    '步数越少，星级越高！',
    '加油！你可以的！',
    `本关有 ${wordsPerLevel} 个单词，努力拿到 3 颗星！`
  ]
  return tips[Math.floor(Math.random() * tips.length)]
}

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 导出单词表
const exportWords = () => {
  const content = toeicWords.map(w => `${w.word}\t${w.phonetic}\t${w.meaning}`).join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '托业单词表.txt'
  a.click()
  ElMessage.success('单词表已导出')
}

// 打开单词本
const openWordBook = () => {
  showWordBook.value = true
}

// 打开排行榜
const openRanking = () => {
  showRanking.value = true
}

// 打开关于
const openAbout = () => {
  showAbout.value = true
}

// 加载进度
const loadProgress = () => {
  const saved = localStorage.getItem('toeicGame_progress')
  if (saved) {
    const data = JSON.parse(saved)
    passedLevels.value = data.passedLevels || 0
    totalScore.value = data.totalScore || 0
    if (data.nickname) {
      nickname.value = data.nickname
    }
  }
  loadRanking()
}

// 保存昵称
const saveNickname = () => {
  if (!nickname.value.trim()) {
    ElMessage.warning('请输入昵称')
    return
  }
  localStorage.setItem('toeicGame_nickname', nickname.value)
  showNickname.value = false
  ElMessage.success(`欢迎，${nickname.value}！`)
}

// 验证挑战码
const verifyChallenge = () => {
  if (!isValidShareCode(challengeCode.value)) {
    challengeResult.value = {
      title: '无效的挑战码，请检查格式',
      type: 'error',
      success: false
    }
    return
  }
  
  // 解析挑战码
  const parts = challengeCode.value.split('-')
  const targetScore = parseInt(parts[1])
  const targetLevel = parseInt(parts[2])
  
  challengeResult.value = {
    title: '挑战码有效！准备好接受挑战了吗？',
    type: 'success',
    success: true,
    score: targetScore,
    level: targetLevel
  }
  challengeTarget.value = { score: targetScore, level: targetLevel }
}

// 开始挑战
const startChallenge = () => {
  if (!challengeTarget.value) return
  
  isChallengeMode.value = true
  showRanking.value = false
  currentLevel.value = 1
  gameState.value = 'playing'
  initLevel(1)
  ElMessage.info(`挑战目标：超过 ${challengeTarget.value.score} 分！`)
}

// 复制分享码
const copyShareCode = () => {
  navigator.clipboard.writeText(shareCode.value).then(() => {
    ElMessage.success('分享码已复制！')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

// 分享到微信
const shareToWechat = () => {
  const text = `🎴 托业单词记忆大挑战\n玩家：${nickname.value || '匿名'}\n分数：${totalScore.value}\n关卡：${passedLevels.value}\n分享码：${shareCode.value}\n快来挑战我吧！`
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制，去微信粘贴分享给好友吧！')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 清除排行榜
const clearRanking = () => {
  if (confirm('确定要清除所有排行榜记录吗？此操作不可恢复！')) {
    localRanking.value = []
    localStorage.removeItem('toeicGame_ranking')
    ElMessage.success('已清除排行榜')
    showRanking.value = false
  }
}

// ========== 单词本发音功能 ==========

// 选择关卡
const selectLevel = (level) => {
  selectedLevel.value = level
  stopPlaying()
  // 强制更新视图
  setTimeout(() => {
    window.scrollTo(0, 0)
  }, 100)
}

// 获取当前关卡单词（用于单词本）
const getLevelWords = (level) => {
  const start = (level - 1) * wordsPerLevel
  return toeicWords.slice(start, start + wordsPerLevel)
}

// 播放单词发音
const playWord = (word, index = -1) => {
  if (!window.speechSynthesis) {
    ElMessage.warning('您的浏览器不支持发音功能')
    return
  }
  
  // 停止当前播放
  window.speechSynthesis.cancel()
  
  currentPlayingIndex.value = index
  isPlaying.value = true
  
  // 创建语音实例
  const utterance = new SpeechSynthesisUtterance(word.word)
  utterance.lang = 'en-US'
  utterance.rate = 0.8
  utterance.pitch = 1
  
  // 尝试获取英语语音
  const voices = window.speechSynthesis.getVoices()
  const enVoice = voices.find(v => v.lang.includes('en'))
  if (enVoice) {
    utterance.voice = enVoice
  }
  
  utterance.onend = () => {
    isPlaying.value = false
    currentPlayingIndex.value = -1
    
    // 自动播放下一个
    const levelWords = getLevelWords(selectedLevel.value)
    if (autoPlay.value && index >= 0 && index < levelWords.length - 1) {
      setTimeout(() => {
        playWord(levelWords[index + 1], index + 1)
      }, 500)
    }
  }
  
  utterance.onerror = (event) => {
    console.error('发音错误:', event)
    isPlaying.value = false
    currentPlayingIndex.value = -1
    ElMessage.error('发音失败，请检查浏览器设置')
  }
  
  speechSynth.value = utterance
  window.speechSynthesis.speak(utterance)
  
  // 调试信息
  console.log('播放单词:', word.word, '语音:', enVoice?.name || '默认')
}

// 播放卡片单词（游戏模式）
const playCardWord = (text) => {
  if (!window.speechSynthesis) {
    ElMessage.warning('您的浏览器不支持发音功能')
    return
  }
  
  if (speechSynth.value) {
    speechSynth.value.cancel()
  }
  
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.8
  utterance.pitch = 1
  
  utterance.onend = () => {
    isPlaying.value = false
  }
  
  utterance.onerror = () => {
    isPlaying.value = false
  }
  
  speechSynth.value = utterance
  window.speechSynthesis.speak(utterance)
}

// 播放全部单词
const playAllWords = () => {
  const levelWords = getLevelWords(selectedLevel.value)
  if (levelWords.length === 0) {
    ElMessage.warning('当前关卡没有单词')
    return
  }
  autoPlay.value = true
  playWord(levelWords[0], 0)
}

// 停止播放
const stopPlaying = () => {
  if (speechSynth.value) {
    speechSynth.value.cancel()
  }
  isPlaying.value = false
  currentPlayingIndex.value = -1
  autoPlay.value = false
}

// 切换自动播放
const toggleAutoPlay = () => {
  if (autoPlay.value) {
    stopPlaying()
  } else {
    playAllWords()
  }
}

// 展开/收起例句
const toggleExample = (idx) => {
  expandedWord.value = expandedWord.value === idx ? -1 : idx
}

// 播放例句
const playExample = (word) => {
  if (!word.example || !window.speechSynthesis) {
    ElMessage.warning('该单词没有例句')
    return
  }
  
  if (speechSynth.value) {
    speechSynth.value.cancel()
  }
  
  const utterance = new SpeechSynthesisUtterance(word.example)
  utterance.lang = 'en-US'
  utterance.rate = 0.9
  utterance.pitch = 1
  
  window.speechSynthesis.speak(utterance)
}

// 监听对话框关闭
const closeWordBook = () => {
  showWordBook.value = false
  stopPlaying()
}

loadProgress()
</script>

<style scoped>
.toeic-game {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.home-screen {
  text-align: center;
  padding-top: 40px;
}

.home-screen h1 {
  font-size: 36px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 18px;
  margin-bottom: 40px;
}

.stats-bar {
  display: flex;
  justify-content: center;
  gap: 30px;
  padding: 20px;
  background: rgba(255,255,255,0.8);
  border-radius: 10px;
  color: #2c3e50;
  max-width: 800px;
  margin: 0 auto 40px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: bold;
}

.menu-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.menu-card {
  cursor: pointer;
  transition: all 0.3s;
  padding: 30px 20px;
  background: white;
  border: 1px solid #e0e0e0;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
}

.menu-card:active {
  transform: scale(0.98);
}

.menu-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(52,152,219,0.2);
  border-color: #3498db;
}

.card-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.menu-card h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.menu-card p {
  color: #7f8c8d;
  font-size: 14px;
}

.game-screen {
  padding: 20px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255,255,255,0.95);
  border-radius: 8px;
}

.game-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.level-badge {
  background: #3498db;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
}

.progress-text {
  color: #5f6c7b;
  font-size: 14px;
}

.game-stats {
  display: flex;
  gap: 20px;
}

.game-stats .stat {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
}

.game-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.card {
  aspect-ratio: 3/4;
  perspective: 1000px;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #5a67d8;
  font-size: 32px;
}

.card-back {
  background: white;
  transform: rotateY(180deg);
  padding: 10px;
  border: 2px solid #3498db;
}

.word-content {
  text-align: center;
  padding: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.word {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  word-break: break-word;
}

.card-play-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  font-size: 16px;
}

.card.matched .card-back {
  background: #e8f5e9;
  border: 2px solid #67c23a;
}

.game-tips {
  max-width: 600px;
  margin: 0 auto;
}

.result-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.result-card {
  text-align: center;
  padding: 40px;
  max-width: 600px;
}

.result-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.result-card h2 {
  margin-bottom: 30px;
  color: #333;
}

.result-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
}

.result-stat {
  text-align: center;
}

.result-stat .label {
  display: block;
  color: #999;
  font-size: 14px;
  margin-bottom: 5px;
}

.result-stat .value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.result-stat .value.score {
  color: #409eff;
}

.stars {
  font-size: 40px;
  margin-bottom: 30px;
}

.star {
  color: #bdc3c7;
}

.star.active {
  color: #f39c12;
}

.word-review {
  text-align: left;
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.word-review h4 {
  margin-bottom: 15px;
  color: #666;
}

.word-list {
  display: grid;
  gap: 10px;
}

.word-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
}

.word-item .en {
  font-weight: bold;
  color: #409eff;
}

.word-item .cn {
  color: #666;
}

.result-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.about-content h3 {
  margin: 20px 0 10px 0;
  color: #333;
}

.about-content ol, .about-content ul {
  margin-left: 20px;
  line-height: 1.8;
  color: #666;
}

.about-content p {
  line-height: 1.6;
  color: #666;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

/* 手机端适配 */
@media (max-width: 768px) {
  .toeic-game {
    padding: 10px;
  }
  
  .home-screen h1 {
    font-size: 24px;
  }
  
  .stats-bar {
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .menu-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .menu-card {
    padding: 20px 10px;
  }
  
  .card-icon {
    font-size: 36px;
  }
  
  .game-board {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  
  .card {
    aspect-ratio: 3/4;
  }
  
  .word {
    font-size: 16px;
  }
  
  .game-header {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .game-stats {
    gap: 10px;
    font-size: 12px;
  }
  
  .result-card {
    padding: 20px;
  }
  
  .result-stats {
    flex-direction: column;
    gap: 15px;
  }
}

/* 小屏幕手机 */
@media (max-width: 480px) {
  .game-board {
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
  }
  
  .card-front, .card-back {
    padding: 5px;
  }
  
  .word {
    font-size: 14px;
  }
  
  .menu-cards {
    grid-template-columns: 1fr;
  }
}

/* 排行榜样式 */
.ranking-tabs {
  margin-top: 10px;
}

.empty-tip {
  text-align: center;
  padding: 40px;
  color: #999;
}

.empty-tip p {
  font-size: 16px;
  margin: 0;
}

.highlight {
  color: #409eff;
  font-weight: bold;
}

.challenge-section {
  padding: 20px 0;
}

.challenge-section .tip {
  color: #666;
  margin-bottom: 15px;
}

.challenge-result {
  margin-top: 20px;
}

.challenge-target {
  margin-top: 15px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 8px;
}

.challenge-target p {
  margin: 8px 0;
  color: #333;
}

/* 单词本样式 */
.wordbook-tabs {
  margin-bottom: 20px;
}

.level-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 15px;
}

.level-selector .el-button {
  min-width: 80px;
}

.word-list-container {
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.level-header h3 {
  margin: 0;
  font-size: 18px;
}

.level-actions {
  display: flex;
  gap: 10px;
}

.level-actions .el-button {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.3);
  color: white;
}

.level-actions .el-button:hover {
  background: rgba(255,255,255,0.3);
}

.word-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.word-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 15px;
  transition: all 0.3s;
  position: relative;
  cursor: pointer;
}

.word-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.word-card.playing {
  border-color: #67c23a;
  background: #f0f9ff;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.word-main {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.word-text {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  flex: 1;
}

.word-phonetic {
  font-size: 14px;
  color: #999;
  font-family: 'Arial', sans-serif;
}

.play-btn {
  flex-shrink: 0;
}

.word-meaning {
  font-size: 15px;
  color: #666;
  line-height: 1.5;
}

.word-index {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 12px;
  color: #ccc;
}

.word-actions {
  display: flex;
  gap: 5px;
  align-items: center;
}

.word-example {
  margin-top: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.example-text {
  margin-bottom: 8px;
}

.example-label {
  display: inline-block;
  font-size: 12px;
  color: #3b82f6;
  font-weight: bold;
  margin-bottom: 4px;
}

.example-text p {
  margin: 0;
  font-size: 15px;
  color: #1e40af;
  line-height: 1.6;
  font-style: italic;
}

.example-translation {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  line-height: 1.5;
}

.word-card.expanded {
  border-color: #3b82f6;
  background: #f8fafc;
}

.empty-tip {
  text-align: center;
  padding: 60px 20px;
}

/* 分享卡片样式 */
.share-content {
  text-align: center;
}

.share-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.share-header {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}

.share-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.share-stat {
  background: rgba(255,255,255,0.2);
  padding: 10px;
  border-radius: 8px;
}

.share-stat .label {
  display: block;
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 5px;
}

.share-stat .value {
  display: block;
  font-size: 20px;
  font-weight: bold;
}

.share-stat .value.highlight {
  font-size: 28px;
  color: #ffd700;
}

.share-code {
  background: rgba(255,255,255,0.9);
  color: #333;
  padding: 15px;
  border-radius: 8px;
}

.share-code p {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.share-code code {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #667eea;
  font-family: monospace;
  letter-spacing: 2px;
}

.share-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>
