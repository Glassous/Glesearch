<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 路线数据
const routeData = ref(null)
const loading = ref(false)
const error = ref('')
const apiSource = ref('api.pearktrue.cn')
const lastUpdateTime = ref('')
const fromCity = ref('')
const toCity = ref('')
const hasSearched = ref(false)

// 获取路线数据
const fetchRouteData = async (from, to) => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.pearktrue.cn/api/citytravelroutes/?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data) {
      routeData.value = result.data
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
    error.value = '获取路线数据失败，请检查网络连接'
    lastUpdateTime.value = 'Error'
    console.error('路线API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
  }
}

// 搜索路线
const searchRoute = () => {
  if (!fromCity.value.trim()) {
    error.value = '请输入出发城市'
    return
  }
  
  if (!toCity.value.trim()) {
    error.value = '请输入目的城市'
    return
  }
  
  fetchRouteData(fromCity.value.trim(), toCity.value.trim())
}

// 键盘事件处理
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    searchRoute()
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

// 热门路线建议
const popularRoutes = [
  { from: '广州', to: '深圳' },
  { from: '北京', to: '天津' },
  { from: '上海', to: '杭州' },
  { from: '成都', to: '重庆' },
  { from: '西安', to: '咸阳' },
  { from: '南京', to: '苏州' },
  { from: '武汉', to: '长沙' }
]

// 快速搜索
const quickSearch = (from, to) => {
  fromCity.value = from
  toCity.value = to
  searchRoute()
}

// 格式化路径信息
const formatRoadConditions = (roadConditions) => {
  if (!roadConditions) return []
  return roadConditions.split('——>').map(road => road.trim()).filter(road => road)
}

// 交换出发地和目的地
const swapCities = () => {
  const temp = fromCity.value
  fromCity.value = toCity.value
  toCity.value = temp
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
      <h2 class="page-title">城际路线查询</h2>
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
            v-model="fromCity"
            type="text"
            placeholder="出发城市，如：广州"
            class="search-input"
            @keypress="handleKeyPress"
          />
          <button class="swap-button" @click="swapCities" title="交换城市">
            🔄
          </button>
          <input
            v-model="toCity"
            type="text"
            placeholder="目的城市，如：深圳"
            class="search-input"
            @keypress="handleKeyPress"
          />
        </div>
        <button 
          class="search-button"
          @click="searchRoute"
          :disabled="loading"
        >
          {{ loading ? '查询中...' : '🚌 查询路线' }}
        </button>
      </div>
      
      <!-- 快速搜索建议 -->
      <div class="quick-search">
        <span class="quick-label">热门路线：</span>
        <div class="suggestion-tags">
          <button
            v-for="route in popularRoutes"
            :key="`${route.from}-${route.to}`"
            class="suggestion-tag"
            @click="quickSearch(route.from, route.to)"
          >
            {{ route.from }} → {{ route.to }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在查询路线信息...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 路线数据展示 -->
    <div v-if="!loading && !error && hasSearched" class="route-section">
      <div v-if="!routeData" class="no-results">
        没有找到相关路线信息，请检查城市名称
      </div>
      
      <div v-if="routeData" class="route-container">
        <h3>{{ routeData.corese }} 路线详情</h3>
        <div class="route-card">
          <div class="route-header">
            <div class="route-info">
              <h4 class="route-title">{{ routeData.corese }}</h4>
              <div class="basic-stats">
                <div class="stat-item distance">
                  <span class="stat-icon">📏</span>
                  <span class="stat-value">{{ routeData.distance }}</span>
                </div>
                <div class="stat-item time">
                  <span class="stat-icon">⏱️</span>
                  <span class="stat-value">{{ routeData.time }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="route-details">
            <!-- 费用信息 -->
            <div class="cost-section">
              <h5 class="section-title">💰 费用明细</h5>
              <div class="cost-grid">
                <div class="cost-item fuel">
                  <div class="cost-label">
                    <span class="cost-icon">⛽</span>
                    <span>燃油费</span>
                  </div>
                  <span class="cost-value">{{ routeData.fuelcosts }}</span>
                </div>
                <div class="cost-item toll">
                  <div class="cost-label">
                    <span class="cost-icon">🛣️</span>
                    <span>过路费</span>
                  </div>
                  <span class="cost-value">{{ routeData.bridgetoll }}</span>
                </div>
                <div class="cost-item total">
                  <div class="cost-label">
                    <span class="cost-icon">💳</span>
                    <span>总费用</span>
                  </div>
                  <span class="cost-value highlight">{{ routeData.totalcost }}</span>
                </div>
              </div>
            </div>
            
            <!-- 路线详情 -->
            <div class="road-section">
              <h5 class="section-title">🛣️ 详细路线</h5>
              <div class="road-conditions">
                <div 
                  v-for="(road, index) in formatRoadConditions(routeData.roadconditions)"
                  :key="index"
                  class="road-step"
                  :class="{ 'start-point': index === 0, 'end-point': index === formatRoadConditions(routeData.roadconditions).length - 1 }"
                >
                  <div class="step-number">{{ index + 1 }}</div>
                  <div class="step-content">
                    <div class="road-name">{{ road }}</div>
                    <div v-if="index < formatRoadConditions(routeData.roadconditions).length - 1" class="arrow">↓</div>
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
  gap: 0.5rem;
  align-items: center;
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

.swap-button {
  padding: 1rem;
  background: var(--glass-bg);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 50px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.swap-button:hover {
  background: var(--text-accent);
  color: white;
  transform: rotate(180deg);
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

/* 路线数据区域 */
.route-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
  text-align: center;
}

.route-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.route-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
  width: 100%;
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.4s ease forwards;
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.route-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.route-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.route-title {
  color: var(--text-accent);
  font-size: 1.4rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
}

.basic-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-value {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.route-details {
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

.cost-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.cost-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.cost-item.total {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.cost-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.cost-icon {
  font-size: 1.1rem;
}

.cost-value {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.cost-value.highlight {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: bold;
}

.road-conditions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.road-step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.road-step:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.road-step.start-point {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(129, 199, 132, 0.1) 100%);
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.road-step.end-point {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(229, 115, 115, 0.1) 100%);
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: var(--text-accent);
  color: white;
  border-radius: 50%;
  font-size: 0.85rem;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.road-name {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.4;
}

.arrow {
  color: var(--text-accent);
  font-size: 1.2rem;
  margin-top: 0.5rem;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .route-card {
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
  
  .swap-button {
    order: -1;
    align-self: center;
    transform: rotate(90deg);
  }
  
  .swap-button:hover {
    transform: rotate(270deg);
  }
  
  .quick-search {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .basic-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .cost-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .road-step {
    padding: 0.8rem;
  }
  
  .step-number {
    width: 25px;
    height: 25px;
    font-size: 0.8rem;
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
  
  .route-card {
    padding: 1rem;
  }
  
  .cost-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .cost-value {
    align-self: flex-end;
  }
}
</style>