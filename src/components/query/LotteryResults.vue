<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 彩票数据
const lotteryData = ref([])
const loading = ref(false)
const error = ref('')
const apiSource = ref('api.pearktrue.cn')
const lastUpdateTime = ref('')
const selectedLottery = ref('ssq')
const hasSearched = ref(false)
const lotteryName = ref('')

// 彩票类型映射
const lotteryTypes = {
  'kl8': '快乐8',
  'ssq': '双色球',
  'dlt': '大乐透',
  'fc3d': '福彩3D',
  'pl3': '排列3',
  'pl5': '排列5',
  'qlc': '七乐彩',
  'qxc': '7星彩',
  'sfc': '胜负彩',
  'jqc': '进球彩',
  'bqc': '半全场'
}

// 获取彩票开奖数据
const fetchLotteryResults = async (lotteryType) => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.pearktrue.cn/api/lottery/?get=${lotteryType}`)
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data) {
      lotteryData.value = result.data
      lotteryName.value = result.name || lotteryTypes[lotteryType] || '未知彩票'
      hasSearched.value = true
      
      // 设置更新时间
      const now = new Date()
      lastUpdateTime.value = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      throw new Error(`API返回错误: ${result.msg || '未知错误'}`)
    }
  } catch (err) {
    error.value = '获取彩票开奖数据失败，请检查网络连接'
    lastUpdateTime.value = 'Error'
    console.error('彩票开奖API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
  }
}

// 查询彩票开奖
const searchLottery = () => {
  fetchLotteryResults(selectedLottery.value)
}

// 返回主页
const goBack = () => {
  const from = route.query.from
  if (from === 'home') {
    router.push('/')
  } else if (from === 'query') {
    router.push('/query')
  } else {
    // 默认返回首页
    router.push('/')
  }
}

// 快速选择彩票类型
const quickSelect = (type) => {
  selectedLottery.value = type
  searchLottery()
}

// 解析开奖号码，分离主号码和特号码
const parseDrawNumber = (drawnumber, trailnumber) => {
  const mainNumbers = drawnumber ? drawnumber.split(' ') : []
  const trailNumbers = trailnumber ? trailnumber.split(' ') : []
  return { mainNumbers, trailNumbers }
}

// 组件挂载时自动查询双色球
onMounted(() => {
  searchLottery()
})
</script>

<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">彩票开奖查询</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div class="update-time" :class="{ 'error-status': lastUpdateTime === 'Error' }">
          {{ lastUpdateTime === 'Error' ? 'Error' : (lastUpdateTime ? '更新时间: ' + lastUpdateTime : '') }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 彩票类型选择区域 -->
    <div class="lottery-select-section">
      <div class="select-container">
        <select
          v-model="selectedLottery"
          class="lottery-select"
        >
          <option
            v-for="(name, code) in lotteryTypes"
            :key="code"
            :value="code"
          >
            {{ name }}
          </option>
        </select>
        <button 
          class="search-button"
          @click="searchLottery"
          :disabled="loading"
        >
          {{ loading ? '查询中...' : '🔍 查询开奖' }}
        </button>
      </div>
      
      <!-- 快速选择热门彩票 -->
      <div class="quick-select">
        <span class="quick-label">热门彩票：</span>
        <div class="lottery-tags">
          <button
            v-for="(name, code) in { ssq: '双色球', dlt: '大乐透', fc3d: '福彩3D', pl3: '排列3', pl5: '排列5' }"
            :key="code"
            class="lottery-tag"
            :class="{ active: selectedLottery === code }"
            @click="quickSelect(code)"
          >
            {{ name }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在查询开奖结果...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 彩票开奖数据展示 -->
    <div v-if="!loading && !error && hasSearched" class="lottery-section">
      <div v-if="lotteryData.length === 0" class="no-results">
        没有找到相关开奖信息
      </div>
      
      <div v-if="lotteryData.length > 0" class="lottery-container">
        <h3>{{ lotteryName }} 开奖结果</h3>
        <div class="lottery-grid">
          <div 
            v-for="(lottery, index) in lotteryData" 
            :key="lottery.issue"
            class="lottery-card"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="lottery-header">
              <div class="issue-info">
                <h4 class="issue-number">第{{ lottery.issue }}期</h4>
                <div class="open-time">{{ lottery.opentime }}</div>
              </div>
              <div class="sale-money">
                <span class="money-label">销售额</span>
                <span class="money-value">{{ lottery.salemoney }}</span>
              </div>
            </div>
            
            <div class="lottery-details">
              <!-- 开奖号码 -->
              <div class="numbers-section">
                <h5 class="section-title">🎱 开奖号码</h5>
                <div class="numbers-display">
                  <div class="main-numbers">
                    <span 
                      v-for="(number, idx) in parseDrawNumber(lottery.drawnumber, lottery.trailnumber).mainNumbers" 
                      :key="idx"
                      class="number-ball main"
                    >
                      {{ number }}
                    </span>
                  </div>
                  <div v-if="lottery.trailnumber" class="trail-numbers">
                    <span class="separator">+</span>
                    <span 
                      v-for="(number, idx) in parseDrawNumber(lottery.drawnumber, lottery.trailnumber).trailNumbers" 
                      :key="idx"
                      class="number-ball trail"
                    >
                      {{ number }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* 全局样式 */
* {
  box-sizing: border-box;
}

/* 顶部区域 */
.fixed-header {
  padding-top: env(safe-area-inset-top);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--glass-border);
  width: 100%;
  z-index: 1000;
  box-shadow: 0 4px 16px var(--glass-shadow);
}

/* 顶部导航栏 */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  height: 60px;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-accent);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
}

.back-button:hover {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transform: translateY(-1px);
}

.back-icon {
  font-size: 1.5rem;
  font-weight: bold;
}

.page-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  color: var(--text-accent);
  font-size: 1.5rem;
  font-weight: 600;
}

.api-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.2;
}

.api-source {
  margin-bottom: 2px;
}

.update-time {
  color: var(--text-secondary);
}

.update-time.error-status {
  color: #d32f2f;
  font-weight: bold;
}

/* 主要内容区域 */
.main-content {
  margin-top: 60px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 60px);
  width: 100%;
}

/* 彩票选择区域 */
.lottery-select-section {
  margin-bottom: 2rem;
}

.select-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.lottery-select {
  flex: 1;
  padding: 1rem 1.5rem;
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.lottery-select:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-button {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.search-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.search-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.quick-select {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.quick-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

.lottery-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.lottery-tag {
  padding: 0.4rem 0.8rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  color: var(--text-primary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.lottery-tag:hover {
  background: var(--text-accent);
  color: white;
  transform: translateY(-1px);
}

.lottery-tag.active {
  background: var(--text-accent);
  color: white;
  border-color: var(--text-accent);
}

/* 加载和错误状态 */
.loading-message {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.error-message {
  text-align: center;
  padding: 2rem;
  color: #d32f2f;
  background: #ffebee;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* 彩票数据区域 */
.lottery-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
  text-align: center;
}

.lottery-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.lottery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.lottery-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.6s ease forwards;
  width: 100%;
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lottery-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.lottery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.issue-info {
  flex: 1;
}

.issue-number {
  color: var(--text-accent);
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
}

.open-time {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.sale-money {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
}

.money-label {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.money-value {
  color: var(--text-accent);
  font-size: 1.1rem;
  font-weight: bold;
}

.lottery-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  color: var(--text-accent);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.numbers-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.main-numbers, .trail-numbers {
  display: flex;
  gap: 0.5rem;
}

.number-ball {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.number-ball.main {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.number-ball.trail {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.lottery-card:hover .number-ball {
  transform: scale(1.1);
}

.separator {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-secondary);
  margin: 0 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .lottery-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .lottery-card {
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .select-container {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .quick-select {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .lottery-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .sale-money {
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.2rem;
  }
  
  .api-info {
    font-size: 0.65rem;
  }
  
  .top-bar {
    padding: 0.8rem;
  }
  
  .lottery-tags {
    gap: 0.3rem;
  }
  
  .lottery-tag {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }
  
  .lottery-card {
    padding: 1rem;
  }
  
  .number-ball {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }
}
</style>