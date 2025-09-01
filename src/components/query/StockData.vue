<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 股票数据
const stockData = ref([])
const loading = ref(false)
const error = ref('')
const apiSource = ref('api.pearktrue.cn')
const lastUpdateTime = ref('')
const stockCode = ref('')
const stockNum = ref('10')
const hasSearched = ref(false)
const stockName = ref('')

// 获取股票数据
const fetchStockData = async (secid, num = 10) => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.pearktrue.cn/api/stock/?secid=${secid}&num=${num}`)
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data) {
      stockData.value = result.data
      stockName.value = result.name || '未知股票'
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
    error.value = '获取股票数据失败，请检查网络连接'
    lastUpdateTime.value = 'Error'
    console.error('股票API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
  }
}

// 搜索股票
const searchStock = () => {
  if (!stockCode.value.trim()) {
    error.value = '请输入股票代码'
    return
  }
  
  const num = parseInt(stockNum.value)
  if (!num || num < 1 || num > 1000) {
    error.value = '请输入有效的天数（1-1000）'
    return
  }
  
  fetchStockData(stockCode.value.trim(), num)
}

// 键盘事件处理
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    searchStock()
  }
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

// 快速搜索热门股票
const quickSearchStocks = [
  { code: '000001', name: '平安银行' },
  { code: '000002', name: '万科A' },
  { code: '300033', name: '同花顺' },
  { code: '600036', name: '招商银行' },
  { code: '000858', name: '五粮液' },
  { code: '600519', name: '贵州茅台' },
  { code: '300750', name: '宁德时代' }
]

// 快速搜索
const quickSearch = (code, name) => {
  stockCode.value = code
  if (!stockNum.value || parseInt(stockNum.value) < 1 || parseInt(stockNum.value) > 1000) {
    stockNum.value = '10' // 设置默认值
  }
  searchStock()
}

// 获取涨跌幅颜色
const getInordeColor = (inorde) => {
  if (inorde.startsWith('+')) return '#f53f3f'
  if (inorde.startsWith('-')) return '#00b42a'
  return 'var(--text-secondary)'
}

// 格式化数值
const formatNumber = (value) => {
  return value || '0.00'
}

// 获取动画延迟，当卡片数量多时减少延迟
const getAnimationDelay = (index) => {
  if (stockData.value.length > 50) {
    return '0s' // 超过50个卡片时禁用动画延迟
  }
  if (stockData.value.length > 20) {
    return `${Math.min(index * 0.02, 0.2)}s` // 20-50个卡片时使用很小的延迟
  }
  return `${Math.min(index * 0.05, 0.5)}s` // 少量卡片时正常延迟
}

// 获取动画类，大量数据时使用无动画版本
const getCardClass = (index) => {
  const baseClass = 'stock-card'
  if (stockData.value.length > 100) {
    return `${baseClass} no-animation` // 超过100个时完全禁用动画
  }
  return baseClass
}

// 组件挂载时的初始化
onMounted(() => {
  // 不做预设，等待用户输入
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
      <h2 class="page-title">股票数据查询</h2>
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
    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-container">
        <div class="input-row">
          <input
            v-model="stockCode"
            type="text"
            placeholder="请输入股票代码，如：300033"
            class="search-input"
            @keypress="handleKeyPress"
          />
          <input
            v-model="stockNum"
            type="number"
            min="1"
            max="1000"
            placeholder="天数"
            class="num-input"
            @keypress="handleKeyPress"
          />
        </div>
        <button 
          class="search-button"
          @click="searchStock"
          :disabled="loading"
        >
          {{ loading ? '查询中...' : '📈 查询股票' }}
        </button>
      </div>
      
      <!-- 快速搜索建议 -->
      <div class="quick-search">
        <span class="quick-label">热门股票：</span>
        <div class="suggestion-tags">
          <button
            v-for="stock in quickSearchStocks"
            :key="stock.code"
            class="suggestion-tag"
            @click="quickSearch(stock.code, stock.name)"
          >
            {{ stock.code }} {{ stock.name }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在查询股票数据...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 股票数据展示 -->
    <div v-if="!loading && !error && hasSearched" class="stock-section">
      <div v-if="stockData.length === 0" class="no-results">
        没有找到相关股票数据，请检查股票代码
      </div>
      
      <div v-if="stockData.length > 0" class="stock-container">
        <h3>{{ stockName }}（{{ stockCode }}）近{{ stockNum }}天交易数据</h3>
        <div class="stock-grid">
          <div 
            v-for="(stock, index) in stockData" 
            :key="stock.time"
            :class="getCardClass(index)"
            :style="{ animationDelay: getAnimationDelay(index) }"
          >
            <div class="stock-header">
              <div class="date-info">
                <h4 class="trade-date">{{ stock.time }}</h4>
              </div>
              <div class="price-change" :style="{ color: getInordeColor(stock.inorde) }">
                <span class="change-rate">{{ stock.inorde }}</span>
                <span class="change-amount">{{ stock.inorde_amount }}</span>
              </div>
            </div>
            
            <div class="stock-details">
              <!-- 价格信息 -->
              <div class="price-section">
                <h5 class="section-title">💰 价格信息</h5>
                <div class="price-grid">
                  <div class="price-item">
                    <span class="price-label">开盘</span>
                    <span class="price-value">{{ formatNumber(stock.opening) }}</span>
                  </div>
                  <div class="price-item">
                    <span class="price-label">收盘</span>
                    <span class="price-value highlight">{{ formatNumber(stock.closing) }}</span>
                  </div>
                  <div class="price-item">
                    <span class="price-label">最高</span>
                    <span class="price-value up">{{ formatNumber(stock.highest) }}</span>
                  </div>
                  <div class="price-item">
                    <span class="price-label">最低</span>
                    <span class="price-value down">{{ formatNumber(stock.lowest) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 成交信息 -->
              <div class="trading-section">
                <h5 class="section-title">📊 成交信息</h5>
                <div class="trading-grid">
                  <div class="trading-item">
                    <span class="trading-label">成交量</span>
                    <span class="trading-value">{{ stock.trading_volume }}</span>
                  </div>
                  <div class="trading-item">
                    <span class="trading-label">成交额</span>
                    <span class="trading-value">{{ stock.turnover }}</span>
                  </div>
                  <div class="trading-item">
                    <span class="trading-label">振幅</span>
                    <span class="trading-value">{{ stock.amplitude }}</span>
                  </div>
                  <div class="trading-item">
                    <span class="trading-label">换手率</span>
                    <span class="trading-value">{{ stock.turnover_rate }}</span>
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
  padding-top: env(safe-area-inset-top, 20px);
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

/* 搜索区域 */
.search-section {
  margin-bottom: 2rem;
}

.search-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.input-row {
  display: flex;
  gap: 1rem;
}

.search-input {
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
}

.search-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.num-input {
  padding: 1rem;
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
  min-width: 120px;
}

.num-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.num-input::placeholder {
  color: var(--text-secondary);
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

.quick-search {
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

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.suggestion-tag {
  padding: 0.4rem 0.8rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  color: var(--text-primary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggestion-tag:hover {
  background: var(--text-accent);
  color: white;
  transform: translateY(-1px);
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

/* 股票数据区域 */
.stock-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
  text-align: center;
}

.stock-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.stock-card {
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
  animation: slideInUp 0.4s ease forwards;
  width: 100%;
}

.stock-card.no-animation {
  opacity: 1;
  transform: translateY(0);
  animation: none;
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stock-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.trade-date {
  color: var(--text-accent);
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0;
}

.price-change {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
}

.change-rate {
  font-size: 1.2rem;
  font-weight: bold;
}

.change-amount {
  font-size: 0.9rem;
}

.stock-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  color: var(--text-accent);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.price-grid, .trading-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.price-item, .trading-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.price-item:hover, .trading-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.price-label, .trading-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.price-value, .trading-value {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.price-value.highlight {
  color: var(--text-accent);
  font-size: 1.1rem;
}

.price-value.up {
  color: #f53f3f;
}

.price-value.down {
  color: #00b42a;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .stock-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stock-card {
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .input-row {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .quick-search {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .stock-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .price-change {
    align-items: flex-start;
  }
  
  .price-grid, .trading-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
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
  
  .suggestion-tags {
    gap: 0.3rem;
  }
  
  .suggestion-tag {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }
  
  .stock-card {
    padding: 1rem;
  }
}
</style>