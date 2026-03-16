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
      <div class="dialog-footer">
        <el-button @click="showWordBook = false">关闭</el-button>
        <el-button type="primary" @click="exportWords">导出单词表</el-button>
      </div>
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

// 托业核心词汇库（200 个单词）
const toeicWords = [
  // 第 1 关：基础商务词汇（20 个）
  { word: 'agenda', phonetic: '/əˈdʒendə/', meaning: '议程' },
  { word: 'budget', phonetic: '/ˈbʌdʒɪt/', meaning: '预算' },
  { word: 'candidate', phonetic: '/ˈkændɪdət/', meaning: '候选人' },
  { word: 'deadline', phonetic: '/ˈdedlaɪn/', meaning: '截止日期' },
  { word: 'employee', phonetic: '/ɪmˈplɔɪi/', meaning: '员工' },
  { word: 'forecast', phonetic: '/ˈfɔːrkæst/', meaning: '预测' },
  { word: 'headquarters', phonetic: '/ˈhedkwɔːrtərz/', meaning: '总部' },
  { word: 'invoice', phonetic: '/ˈɪnvɔɪs/', meaning: '发票' },
  { word: 'launch', phonetic: '/lɔːntʃ/', meaning: '推出' },
  { word: 'manufacturer', phonetic: '/ˌmænjuˈfæktʃərər/', meaning: '制造商' },
  { word: 'negotiate', phonetic: '/nɪˈɡoʊʃieɪt/', meaning: '谈判' },
  { word: 'occupancy', phonetic: '/ˈɑːkjəpənsi/', meaning: '入住率' },
  { word: 'personnel', phonetic: '/ˌpɜːrsəˈnel/', meaning: '人事部门' },
  { word: 'quarterly', phonetic: '/ˈkwɔːrtərli/', meaning: '季度的' },
  { word: 'revenue', phonetic: '/ˈrevənuː/', meaning: '收入' },
  { word: 'shareholder', phonetic: '/ˈʃerhoʊldər/', meaning: '股东' },
  { word: 'timetable', phonetic: '/ˈtaɪmteɪbl/', meaning: '时间表' },
  { word: 'undertake', phonetic: '/ˌʌndərˈteɪk/', meaning: '承担' },
  { word: 'vendor', phonetic: '/ˈvendər/', meaning: '供应商' },
  { word: 'warehouse', phonetic: '/ˈwerhaʊs/', meaning: '仓库' },
  
  // 第 2 关：企业管理（20 个）
  { word: 'yield', phonetic: '/jiːld/', meaning: '产量/收益' },
  { word: 'merger', phonetic: '/ˈmɜːrdʒər/', meaning: '合并' },
  { word: 'acquisition', phonetic: '/ˌækwɪˈzɪʃn/', meaning: '收购' },
  { word: 'subsidiary', phonetic: '/səbˈsɪdieri/', meaning: '子公司' },
  { word: 'competitor', phonetic: '/kəmˈpetɪtər/', meaning: '竞争对手' },
  { word: 'strategic', phonetic: '/strəˈtiːdʒɪk/', meaning: '战略的' },
  { word: 'efficient', phonetic: '/ɪˈfɪʃnt/', meaning: '高效的' },
  { word: 'innovative', phonetic: '/ˈɪnəveɪtɪv/', meaning: '创新的' },
  { word: 'collaborate', phonetic: '/kəˈlæbəreɪt/', meaning: '合作' },
  { word: 'implement', phonetic: '/ˈɪmplɪment/', meaning: '实施' },
  { word: 'potential', phonetic: '/pəˈtenʃl/', meaning: '潜力' },
  { word: 'significant', phonetic: '/sɪɡˈnɪfɪkənt/', meaning: '重要的' },
  { word: 'sustainable', phonetic: '/səˈsteɪnəbl/', meaning: '可持续的' },
  { word: 'transparent', phonetic: '/trænsˈperənt/', meaning: '透明的' },
  { word: 'versatile', phonetic: '/ˈvɜːrsətl/', meaning: '多功能的' },
  { word: 'accountable', phonetic: '/əˈkaʊntəbl/', meaning: '负责任的' },
  { word: 'comprehensive', phonetic: '/ˌkɑːmprɪˈhensɪv/', meaning: '全面的' },
  { word: 'simultaneous', phonetic: '/ˌsaɪmlˈteɪniəs/', meaning: '同时的' },
  { word: 'unprecedented', phonetic: '/ʌnˈpresɪdentɪd/', meaning: '史无前例的' },
  { word: 'vulnerable', phonetic: '/ˈvʌlnərəbl/', meaning: '易受攻击的' },
  
  // 第 3 关：市场营销（20 个）
  { word: 'advertising', phonetic: '/ˈædvərtaɪzɪŋ/', meaning: '广告' },
  { word: 'brand', phonetic: '/brænd/', meaning: '品牌' },
  { word: 'campaign', phonetic: '/kæmˈpeɪn/', meaning: '活动' },
  { word: 'consumer', phonetic: '/kənˈsuːmər/', meaning: '消费者' },
  { word: 'distribution', phonetic: '/ˌdɪstrɪˈbjuːʃn/', meaning: '分销' },
  { word: 'export', phonetic: '/ˈekspɔːrt/', meaning: '出口' },
  { word: 'franchise', phonetic: '/ˈfræntʃaɪz/', meaning: '特许经营' },
  { word: 'guarantee', phonetic: '/ˌɡærənˈtiː/', meaning: '保证' },
  { word: 'import', phonetic: '/ˈɪmpɔːrt/', meaning: '进口' },
  { word: 'joint venture', phonetic: '/dʒɔɪnt ˈventʃər/', meaning: '合资企业' },
  { word: 'kit', phonetic: '/kɪt/', meaning: '工具包' },
  { word: 'license', phonetic: '/ˈlaɪsns/', meaning: '许可证' },
  { word: 'market share', phonetic: '/ˈmɑːrkɪt ʃer/', meaning: '市场份额' },
  { word: 'outlet', phonetic: '/ˈaʊtlet/', meaning: ' outlets' },
  { word: 'promotion', phonetic: '/prəˈmoʊʃn/', meaning: '促销' },
  { word: 'publicity', phonetic: '/pʌbˈlɪsəti/', meaning: '宣传' },
  { word: 'retail', phonetic: '/ˈriːteɪl/', meaning: '零售' },
  { word: 'sample', phonetic: '/ˈsæmpəl/', meaning: '样品' },
  { word: 'trademark', phonetic: '/ˈtreɪdmɑːrk/', meaning: '商标' },
  { word: 'wholesale', phonetic: '/ˈhoʊlseɪl/', meaning: '批发' },
  
  // 第 4 关：人力资源（20 个）
  { word: 'applicant', phonetic: '/ˈæplɪkənt/', meaning: '申请人' },
  { word: 'benefits', phonetic: '/ˈbenɪfɪts/', meaning: '福利' },
  { word: 'commission', phonetic: '/kəˈmɪʃn/', meaning: '佣金' },
  { word: 'contract', phonetic: '/ˈkɑːntrækt/', meaning: '合同' },
  { word: 'dismiss', phonetic: '/dɪsˈmɪs/', meaning: '解雇' },
  { word: 'evaluate', phonetic: '/ɪˈvæljueɪt/', meaning: '评估' },
  { word: 'flexible', phonetic: '/ˈfleksəbl/', meaning: '灵活的' },
  { word: 'grievance', phonetic: '/ˈɡriːvəns/', meaning: '申诉' },
  { word: 'hire', phonetic: '/ˈhaɪər/', meaning: '雇佣' },
  { word: 'incentive', phonetic: '/ɪnˈsentɪv/', meaning: '激励' },
  { word: 'job description', phonetic: '/dʒɑːb dɪˈskrɪpʃn/', meaning: '职位描述' },
  { word: 'qualifications', phonetic: '/ˌkwɑːlɪfɪˈkeɪʃnz/', meaning: '资格' },
  { word: 'recruit', phonetic: '/rɪˈkruːt/', meaning: '招聘' },
  { word: 'salary', phonetic: '/ˈsæləri/', meaning: '薪水' },
  { word: 'training', phonetic: '/ˈtreɪnɪŋ/', meaning: '培训' },
  { word: 'unemployment', phonetic: '/ˌʌnɪmˈplɔɪmənt/', meaning: '失业' },
  { word: 'vacancy', phonetic: '/ˈveɪkənsi/', meaning: '空缺' },
  { word: 'wage', phonetic: '/weɪdʒ/', meaning: '工资' },
  { word: 'workforce', phonetic: '/ˈwɜːrkfɔːrs/', meaning: '劳动力' },
  { word: 'resign', phonetic: '/rɪˈzaɪn/', meaning: '辞职' },
  
  // 第 5 关：财务会计（20 个）
  { word: 'accounting', phonetic: '/əˈkaʊntɪŋ/', meaning: '会计' },
  { word: 'asset', phonetic: '/ˈæset/', meaning: '资产' },
  { word: 'balance sheet', phonetic: '/ˈbæləns ʃiːt/', meaning: '资产负债表' },
  { word: 'bankrupt', phonetic: '/ˈbæŋkrʌpt/', meaning: '破产的' },
  { word: 'capital', phonetic: '/ˈkæpɪtl/', meaning: '资本' },
  { word: 'cash flow', phonetic: '/kæʃ floʊ/', meaning: '现金流' },
  { word: 'credit', phonetic: '/ˈkredɪt/', meaning: '信用' },
  { word: 'debit', phonetic: '/ˈdebɪt/', meaning: '借方' },
  { word: 'depreciation', phonetic: '/dɪˌpriːʃiˈeɪʃn/', meaning: '折旧' },
  { word: 'equity', phonetic: '/ˈekwəti/', meaning: '股权' },
  { word: 'expenditure', phonetic: '/ɪkˈspendɪtʃər/', meaning: '支出' },
  { word: 'financial', phonetic: '/faɪˈnænʃl/', meaning: '财务的' },
  { word: 'income', phonetic: '/ˈɪnkʌm/', meaning: '收入' },
  { word: 'investment', phonetic: '/ɪnˈvestmənt/', meaning: '投资' },
  { word: 'liability', phonetic: '/ˌlaɪəˈbɪləti/', meaning: '负债' },
  { word: 'mortgage', phonetic: '/ˈmɔːrɡɪdʒ/', meaning: '抵押' },
  { word: 'overhead', phonetic: '/ˈoʊvərhed/', meaning: '管理费用' },
  { word: 'profit', phonetic: '/ˈprɑːfɪt/', meaning: '利润' },
  { word: 'tax', phonetic: '/tæks/', meaning: '税' },
  { word: 'turnover', phonetic: '/ˈtɜːrnoʊvər/', meaning: '营业额' },
  
  // 第 6 关：办公事务（20 个）
  { word: 'appointment', phonetic: '/əˈpɔɪntmənt/', meaning: '预约' },
  { word: 'arrangement', phonetic: '/əˈreɪndʒmənt/', meaning: '安排' },
  { word: 'briefcase', phonetic: '/ˈbriːfkeɪs/', meaning: '公文包' },
  { word: 'calendar', phonetic: '/ˈkælɪndər/', meaning: '日历' },
  { word: 'correspondence', phonetic: '/ˌkɔːrspɑːnˈdens/', meaning: '信件' },
  { word: 'document', phonetic: '/ˈdɑːkjumənt/', meaning: '文件' },
  { word: 'equipment', phonetic: '/ɪˈkwɪpmənt/', meaning: '设备' },
  { word: 'file', phonetic: '/faɪl/', meaning: '档案' },
  { word: 'itinerary', phonetic: '/aɪˈtɪnəreri/', meaning: '行程' },
  { word: 'memo', phonetic: '/ˈmemoʊ/', meaning: '备忘录' },
  { word: 'minutes', phonetic: '/ˈmɪnɪts/', meaning: '会议记录' },
  { word: 'photocopier', phonetic: '/ˈfoʊtoʊkɑːpiər/', meaning: '复印机' },
  { word: 'presentation', phonetic: '/ˌpreznˈteɪʃn/', meaning: '演示' },
  { word: 'reception', phonetic: '/rɪˈsepʃn/', meaning: '接待' },
  { word: 'stationery', phonetic: '/ˈsteɪʃənəri/', meaning: '文具' },
  { word: 'teleconference', phonetic: '/ˈtelikɑːnfərəns/', meaning: '电话会议' },
  { word: 'typing', phonetic: '/ˈtaɪpɪŋ/', meaning: '打字' },
  { word: 'urgent', phonetic: '/ˈɜːrdʒənt/', meaning: '紧急的' },
  { word: 'video conference', phonetic: '/ˈvɪdioʊ ˈkɑːnfərəns/', meaning: '视频会议' },
  { word: 'workflow', phonetic: '/ˈwɜːrkfloʊ/', meaning: '工作流程' },
  
  // 第 7 关：商务旅行（20 个）
  { word: 'accommodation', phonetic: '/əˌkɑːməˈdeɪʃn/', meaning: '住宿' },
  { word: 'boarding pass', phonetic: '/ˈbɔːrdɪŋ pæs/', meaning: '登机牌' },
  { word: 'business class', phonetic: '/ˈbɪznəs klæs/', meaning: '商务舱' },
  { word: 'check-in', phonetic: '/ˈtʃek ɪn/', meaning: '办理登机' },
  { word: 'confirmation', phonetic: '/ˌkɑːnfərˈmeɪʃn/', meaning: '确认' },
  { word: 'departure', phonetic: '/dɪˈpɑːrtʃər/', meaning: '出发' },
  { word: 'destination', phonetic: '/ˌdestɪˈneɪʃn/', meaning: '目的地' },
  { word: 'economy class', phonetic: '/ɪˈkɑːnəmi klæs/', meaning: '经济舱' },
  { word: 'excursion', phonetic: '/ɪkˈskɜːrʒn/', meaning: '短途旅行' },
  { word: 'flight', phonetic: '/flaɪt/', meaning: '航班' },
  { word: 'hospitality', phonetic: '/ˌhɑːspɪˈtæləti/', meaning: '款待' },
  { word: 'luggage', phonetic: '/ˈlʌɡɪdʒ/', meaning: '行李' },
  { word: 'reservation', phonetic: '/ˌrezərˈveɪʃn/', meaning: '预订' },
  { word: 'sightseeing', phonetic: '/ˈsaɪtsiːɪŋ/', meaning: '观光' },
  { word: 'souvenir', phonetic: '/ˌsuːvəˈnɪr/', meaning: '纪念品' },
  { word: 'tourist', phonetic: '/ˈtʊrɪst/', meaning: '游客' },
  { word: 'travel agency', phonetic: '/ˈtrævl ˈeɪdʒənsi/', meaning: '旅行社' },
  { word: 'visa', phonetic: '/ˈviːzə/', meaning: '签证' },
  { word: 'voucher', phonetic: '/ˈvaʊtʃər/', meaning: '优惠券' },
  { word: 'zone', phonetic: '/zoʊn/', meaning: '区域' },
  
  // 第 8 关：餐饮服务（20 个）
  { word: 'appetizer', phonetic: '/ˈæpɪtaɪzər/', meaning: '开胃菜' },
  { word: 'beverage', phonetic: '/ˈbevərɪdʒ/', meaning: '饮料' },
  { word: 'buffet', phonetic: '/bəˈfeɪ/', meaning: '自助餐' },
  { word: 'catering', phonetic: '/ˈkeɪtərɪŋ/', meaning: '餐饮服务' },
  { word: 'chef', phonetic: '/ʃef/', meaning: '厨师' },
  { word: 'complimentary', phonetic: '/ˌkɑːmplɪˈmentri/', meaning: '免费的' },
  { word: 'cuisine', phonetic: '/kwɪˈziːn/', meaning: '菜肴' },
  { word: 'delicious', phonetic: '/dɪˈlɪʃəs/', meaning: '美味的' },
  { word: 'dessert', phonetic: '/dɪˈzɜːrt/', meaning: '甜点' },
  { word: 'entree', phonetic: '/ˈɑːntreɪ/', meaning: '主菜' },
  { word: 'flavor', phonetic: '/ˈfleɪvər/', meaning: '味道' },
  { word: 'ingredient', phonetic: '/ɪnˈɡriːdiənt/', meaning: '原料' },
  { word: 'menu', phonetic: '/ˈmenjuː/', meaning: '菜单' },
  { word: 'nutrition', phonetic: '/nuːˈtrɪʃn/', meaning: '营养' },
  { word: 'organic', phonetic: '/ɔːrˈɡænɪk/', meaning: '有机的' },
  { word: 'portion', phonetic: '/ˈpɔːrʃn/', meaning: '份量' },
  { word: 'recipe', phonetic: '/ˈresəpi/', meaning: '食谱' },
  { word: 'reservation', phonetic: '/ˌrezərˈveɪʃn/', meaning: '预订' },
  { word: 'specialty', phonetic: '/ˈspeʃəlti/', meaning: '特色菜' },
  { word: 'vegetarian', phonetic: '/ˌvedʒəˈteriən/', meaning: '素食的' },
  
  // 第 9 关：银行业务（20 个）
  { word: 'account', phonetic: '/əˈkaʊnt/', meaning: '账户' },
  { word: 'balance', phonetic: '/ˈbæləns/', meaning: '余额' },
  { word: 'bank statement', phonetic: '/bæŋk ˈsteɪtmənt/', meaning: '银行对账单' },
  { word: 'borrow', phonetic: '/ˈbɔːroʊ/', meaning: '借款' },
  { word: 'cheque', phonetic: '/tʃek/', meaning: '支票' },
  { word: 'currency', phonetic: '/ˈkɜːrənsi/', meaning: '货币' },
  { word: 'deposit', phonetic: '/dɪˈpɑːzɪt/', meaning: '存款' },
  { word: 'exchange rate', phonetic: '/ɪksˈtʃeɪndʒ reɪt/', meaning: '汇率' },
  { word: 'fund', phonetic: '/fʌnd/', meaning: '基金' },
  { word: 'guarantor', phonetic: '/ˌɡærənˈtɔːr/', meaning: '担保人' },
  { word: 'interest', phonetic: '/ˈɪntrəst/', meaning: '利息' },
  { word: 'loan', phonetic: '/loʊn/', meaning: '贷款' },
  { word: 'minimum', phonetic: '/ˈmɪnɪməm/', meaning: '最低' },
  { word: 'overdraft', phonetic: '/ˈoʊvərdræft/', meaning: '透支' },
  { word: 'payment', phonetic: '/ˈpeɪmənt/', meaning: '付款' },
  { word: 'principal', phonetic: '/ˈprɪnsəpl/', meaning: '本金' },
  { word: 'receipt', phonetic: '/rɪˈsiːt/', meaning: '收据' },
  { word: 'savings', phonetic: '/ˈseɪvɪŋz/', meaning: '储蓄' },
  { word: 'transfer', phonetic: '/trænsˈfɜːr/', meaning: '转账' },
  { word: 'withdraw', phonetic: '/wɪðˈdrɔː/', meaning: '取款' },
  
  // 第 10 关：高级商务（20 个）
  { word: 'arbitration', phonetic: '/ˌɑːrbɪˈtreɪʃn/', meaning: '仲裁' },
  { word: 'breach', phonetic: '/briːtʃ/', meaning: '违反' },
  { word: 'clause', phonetic: '/klɔːz/', meaning: '条款' },
  { word: 'compliance', phonetic: '/kəmˈplaɪəns/', meaning: '合规' },
  { word: 'confidential', phonetic: '/ˌkɑːnfɪˈdenʃl/', meaning: '机密的' },
  { word: 'consultant', phonetic: '/kənˈsʌltənt/', meaning: '顾问' },
  { word: 'disclosure', phonetic: '/dɪsˈkloʊʒər/', meaning: '披露' },
  { word: 'endorsement', phonetic: '/enˈdɔːrsmənt/', meaning: '背书' },
  { word: 'exemption', phonetic: '/ɪɡˈzempʃn/', meaning: '豁免' },
  { word: 'fiduciary', phonetic: '/ˈfɪduːʃieri/', meaning: '信托的' },
  { word: 'governance', phonetic: '/ˈɡʌvərnəns/', meaning: '治理' },
  { word: 'indemnity', phonetic: '/ɪnˈdemnəti/', meaning: '赔偿' },
  { word: 'jurisdiction', phonetic: '/ˌdʒʊrɪsˈdɪkʃn/', meaning: '管辖权' },
  { word: 'liability', phonetic: '/ˌlaɪəˈbɪləti/', meaning: '责任' },
  { word: 'mediation', phonetic: '/ˌmiːdiˈeɪʃn/', meaning: '调解' },
  { word: 'obligation', phonetic: '/ˌɑːblɪˈɡeɪʃn/', meaning: '义务' },
  { word: 'patent', phonetic: '/ˈpætnt/', meaning: '专利' },
  { word: 'regulation', phonetic: '/ˌreɡjuˈleɪʃn/', meaning: '规章' },
  { word: 'settlement', phonetic: '/ˈsetlmənt/', meaning: '和解' },
  { word: 'warranty', phonetic: '/ˈwɔːrənti/', meaning: '保修' }
]

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
const wordsPerLevel = 10  // 每关 10 个单词
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
  
  // 创建单词和释义配对
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
  
  // 打乱卡牌
  const allCards = cardPairs.sort(() => Math.random() - 0.5)
  
  cards.value = allCards
  flippedCards.value = []
  matchedPairs.value = 0
  moves.value = 0
  timeElapsed.value = 0
  score.value = level * 100
  
  // 开始计时
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

// 初始化
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
  opacity: 0.9;
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

.star {
  color: #bdc3c7;
}

.star.active {
  color: #f39c12;
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
  background: url('/card-back.jpg') center/cover;
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-front::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
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
  color: #ddd;
}

.star.active {
  color: #ffd700;
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
</style>
