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
        <el-card shadow="hover" class="menu-card" @click="startGame">
          <div class="card-icon">🎮</div>
          <h3>开始游戏</h3>
          <p>挑战 {{ totalLevels }} 个关卡</p>
        </el-card>
        
        <el-card shadow="hover" class="menu-card" @click="showWordBook = true">
          <div class="card-icon">📖</div>
          <h3>单词本</h3>
          <p>{{ allWords.length }} 个核心词汇</p>
        </el-card>
        
        <el-card shadow="hover" class="menu-card" @click="showRanking = true">
          <div class="card-icon">🏆</div>
          <h3>排行榜</h3>
          <p>看看谁最厉害</p>
        </el-card>
        
        <el-card shadow="hover" class="menu-card" @click="showAbout = true">
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
    <el-dialog v-model="showWordBook" title="📖 托业核心词汇" width="800px">
      <el-input 
        v-model="searchWord" 
        placeholder="搜索单词..." 
        clearable
        style="margin-bottom: 15px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-table :data="filteredWords" style="width: 100%" max-height="500">
        <el-table-column prop="word" label="单词" width="150" />
        <el-table-column prop="phonetic" label="音标" width="120" />
        <el-table-column prop="meaning" label="释义" />
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showWordBook = false">关闭</el-button>
          <el-button type="primary" @click="exportWords">导出单词表</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 排行榜对话框 -->
    <el-dialog v-model="showRanking" title="🏆 排行榜" width="500px">
      <el-table :data="ranking" style="width: 100%">
        <el-table-column type="index" label="排名" width="80" />
        <el-table-column prop="name" label="玩家" width="120" />
        <el-table-column prop="score" label="总分" />
        <el-table-column prop="levels" label="通关数" />
      </el-table>
    </el-dialog>
    
    <!-- 关于对话框 -->
    <el-dialog v-model="showAbout" title="ℹ️ 关于游戏" width="600px">
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
import { toeicWords } from './toeicWords.js'

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
const searchWord = ref('')

// 关卡配置
const wordsPerLevel = 10
const totalLevels = Math.ceil(toeicWords.length / wordsPerLevel)
const passedLevels = ref(0)
const totalScore = ref(0)

// 排行榜数据
const ranking = ref([
  { name: '张三', score: 5000, levels: 10 },
  { name: '李四', score: 4500, levels: 10 },
  { name: '王五', score: 3800, levels: 8 },
  { name: '赵六', score: 3200, levels: 7 },
  { name: '小明', score: 2800, levels: 5 }
])

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
  
  localStorage.setItem('toeicGame_progress', JSON.stringify({
    passedLevels: passedLevels.value,
    totalScore: totalScore.value
  }))
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

// 加载进度
const loadProgress = () => {
  const saved = localStorage.getItem('toeicGame_progress')
  if (saved) {
    const data = JSON.parse(saved)
    passedLevels.value = data.passedLevels || 0
    totalScore.value = data.totalScore || 0
  }
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
  background: #95a5a6;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border: 2px solid #7f8c8d;
}

.card-front::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 80%;
  background: url('/card-back.jpg') center/contain no-repeat;
  opacity: 0.8;
  filter: grayscale(100%);
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
}

.word {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  word-break: break-word;
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
    font-size: 12px;
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
    font-size: 10px;
  }
  
  .menu-cards {
    grid-template-columns: 1fr;
  }
}
</style>
