<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 车票查询数据
const ticketData = ref([])
const loading = ref(false)
const error = ref('')
const apiSource = ref('PearAPI')
const queryInfo = ref({
  from: '',
  to: '',
  time: ''
})

// 查询参数
const fromStation = ref('')
const toStation = ref('')
const travelDate = ref('')

// 热门城市建议
const popularCities = [
  '北京', '上海', '广州', '深圳', '杭州', '南京', '苏州', '天津',
  '重庆', '成都', '武汉', '西安', '青岛', '大连', '哈尔滨', '长沙'
]

// 获取今天日期，用作默认值
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取车票数据
const fetchTicketData = async () => {
  if (!fromStation.value || !toStation.value || !travelDate.value) {
    error.value = '请填写完整的查询信息'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.pearktrue.cn/api/highspeedticket?from=${encodeURIComponent(fromStation.value)}&to=${encodeURIComponent(toStation.value)}&time=${travelDate.value}`)
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data) {
      ticketData.value = result.data
      queryInfo.value = {
        from: result.from || fromStation.value,
        to: result.to || toStation.value,
        time: result.time || travelDate.value
      }
    } else {
      throw new Error(`API返回错误: ${result.msg || '未知错误'}`)
    }
  } catch (err) {
    error.value = '获取车票数据失败，请检查网络连接或稍后重试'
    console.error('车票API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
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

// 获取座位可订状态的样式类
const getBookableClass = (bookable) => {
  if (bookable === '有车票') return 'available'
  if (bookable === '暂无车票') return 'unavailable'
  return 'unknown'
}

// 快速填入城市
const fillCity = (city, type) => {
  if (type === 'from') {
    fromStation.value = city
  } else {
    toStation.value = city
  }
}

// 交换出发地和目的地
const swapStations = () => {
  const temp = fromStation.value
  fromStation.value = toStation.value
  toStation.value = temp
}

// 组件挂载时设置默认日期
onMounted(() => {
  travelDate.value = getTodayDate()
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
      <h2 class="page-title">高铁车票查询</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div v-if="queryInfo.from && queryInfo.to" class="query-info">
          {{ queryInfo.from }} → {{ queryInfo.to }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 查询表单 -->
    <div class="search-form">
      <div class="form-row">
        <div class="input-group">
          <label>出发地</label>
          <input 
            type="text" 
            v-model="fromStation" 
            placeholder="请输入出发城市"
            class="form-input"
          />
        </div>
        <button class="swap-button" @click="swapStations" title="交换城市">
          ⇄
        </button>
        <div class="input-group">
          <label>目的地</label>
          <input 
            type="text" 
            v-model="toStation" 
            placeholder="请输入到达城市"
            class="form-input"
          />
        </div>
      </div>
      
      <div class="form-row">
        <div class="input-group">
          <label>出行日期</label>
          <input 
            type="date" 
            v-model="travelDate" 
            class="form-input date-input"
          />
        </div>
        <button class="search-button" @click="fetchTicketData" :disabled="loading">
          {{ loading ? '查询中...' : '查询车票' }}
        </button>
      </div>

      <!-- 热门城市快速选择 -->
      <div class="popular-cities">
        <div class="cities-label">热门城市：</div>
        <div class="cities-list">
          <button 
            v-for="city in popularCities" 
            :key="city"
            class="city-tag"
            @click="fillCity(city, 'from')"
            :title="`选择${city}作为出发地`"
          >
            {{ city }}
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在查询车票信息...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 车票数据展示 -->
    <div v-if="!loading && !error && ticketData.length > 0" class="ticket-section">
      <h3>车票查询结果 ({{ ticketData.length }}趟车次)</h3>
      <div class="ticket-list">
        <div 
          v-for="(train, index) in ticketData" 
          :key="index"
          class="train-card"
        >
          <div class="train-header">
            <div class="train-info">
              <span class="train-number">{{ train.trainumber }}</span>
              <span class="train-type" :class="train.traintype">{{ train.traintype }}</span>
            </div>
            <div class="runtime">{{ train.runtime }}</div>
          </div>
          
          <div class="station-time">
            <div class="departure">
              <div class="time">{{ train.departtime }}</div>
              <div class="station">{{ train.departstation }}</div>
            </div>
            <div class="arrow">→</div>
            <div class="arrival">
              <div class="time">{{ train.arrivetime }}</div>
              <div class="station">{{ train.arrivestation }}</div>
            </div>
          </div>
          
          <div class="seat-info">
            <div 
              v-for="(seat, seatIndex) in train.ticket_info" 
              :key="seatIndex"
              class="seat-item"
              :class="getBookableClass(seat.bookable)"
            >
              <div class="seat-name">{{ seat.seatname }}</div>
              <div class="seat-price">¥{{ seat.seatprice }}</div>
              <div class="seat-status">{{ seat.bookable }}</div>
              <div v-if="seat.seatinventory > 0" class="seat-count">
                余{{ seat.seatinventory > 99 ? '99+' : seat.seatinventory }}张
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-if="!loading && !error && ticketData.length === 0 && (fromStation || toStation || travelDate)" class="no-data-message">
      未找到符合条件的车次，请调整查询条件后重试
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

.query-info {
  color: var(--text-accent);
  font-weight: 500;
}

/* 主要内容区域 */
.main-content {
  margin-top: 60px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 60px);
  width: 100%;
}

/* 查询表单 */
.search-form {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.form-row {
  display: flex;
  align-items: end;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.input-group label {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.date-input {
  font-family: inherit;
}

.swap-button {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-accent);
  font-size: 1.2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.swap-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(180deg);
}

.search-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 2rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.search-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 热门城市 */
.popular-cities {
  border-top: 1px solid var(--glass-border);
  padding-top: 1rem;
  margin-top: 1rem;
}

.cities-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.cities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.city-tag {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.city-tag:hover {
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

.no-data-message {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  background: var(--glass-bg);
  border-radius: 8px;
  margin-bottom: 2rem;
}

/* 车票数据区域 */
.ticket-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.train-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.train-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.train-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.train-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.train-number {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-accent);
}

.train-type {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.train-type.高铁 {
  background: #e3f2fd;
  color: #1976d2;
}

.train-type.动车 {
  background: #e8f5e8;
  color: #388e3c;
}

.train-type.普通 {
  background: #fff3e0;
  color: #f57c00;
}

.train-type.其他 {
  background: #fce4ec;
  color: #c2185b;
}

.runtime {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.station-time {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.departure, .arrival {
  flex: 1;
  text-align: center;
}

.departure .time, .arrival .time {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-accent);
  margin-bottom: 0.3rem;
}

.departure .station, .arrival .station {
  color: var(--text-primary);
  font-size: 0.9rem;
}

.arrow {
  margin: 0 1rem;
  font-size: 1.5rem;
  color: var(--text-accent);
}

.seat-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.8rem;
}

.seat-item {
  padding: 0.8rem;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  text-align: center;
  transition: all 0.2s ease;
}

.seat-item.available {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.seat-item.unavailable {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.1);
  opacity: 0.7;
}

.seat-name {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.3rem;
}

.seat-price {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text-accent);
  margin-bottom: 0.3rem;
}

.seat-status {
  font-size: 0.8rem;
  margin-bottom: 0.2rem;
}

.seat-item.available .seat-status {
  color: #4caf50;
}

.seat-item.unavailable .seat-status {
  color: #f44336;
}

.seat-count {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .search-form {
    padding: 1.5rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .swap-button {
    order: -1;
    align-self: center;
    transform: rotate(90deg);
  }
  
  .swap-button:hover {
    transform: rotate(270deg);
  }
  
  .station-time {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .arrow {
    transform: rotate(90deg);
    margin: 0.5rem 0;
  }
  
  .seat-info {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .cities-list {
    gap: 0.3rem;
  }
  
  .city-tag {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
  
  .seat-info {
    grid-template-columns: 1fr 1fr;
  }
}
</style>