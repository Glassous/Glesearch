<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 人口统计数据
const populationData = ref(null)
const loading = ref(false)
const error = ref('')
const apiSource = ref('PearAPI')
const country = ref('')
const lastUpdateTime = ref('')

// 获取人口统计数据
const fetchPopulationData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.pearktrue.cn/api/human/alldata.php`)
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data) {
      populationData.value = result.data
      country.value = result.country || '全世界'
      lastUpdateTime.value = new Date().toLocaleString('zh-CN')
    } else {
      throw new Error(`API返回错误: ${result.msg || '未知错误'}`)
    }
  } catch (err) {
    error.value = '获取人口统计数据失败，请检查网络连接或稍后重试'
    console.error('人口统计API请求失败:', err)
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

// 复制数据到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // 这里可以添加一个成功提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 刷新数据
const refreshData = () => {
  fetchPopulationData()
}

// 格式化数字，添加千分位分隔符
const formatNumber = (numStr) => {
  if (!numStr) return '0'
  // 移除现有的空格或其他分隔符，然后重新格式化
  const cleanNum = numStr.replace(/\s+/g, '').replace(/,/g, '')
  return cleanNum.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取统计项的图标
const getStatIcon = (type) => {
  const iconMap = {
    'population': '🌍',
    'male': '👨',
    'female': '👩',
    'birth': '👶',
    'death': '💔',
    'migration': '✈️',
    'growth': '📈'
  }
  return iconMap[type] || '📊'
}

// 获取统计项的颜色类
const getStatClass = (type) => {
  const classMap = {
    'population': 'primary',
    'male': 'male',
    'female': 'female',
    'birth': 'birth',
    'death': 'death',
    'migration': 'migration',
    'growth': 'growth'
  }
  return classMap[type] || 'default'
}

// 统计数据结构
const getStatistics = () => {
  if (!populationData.value) return []
  
  const data = populationData.value
  return [
    {
      type: 'population',
      title: '当前世界人口',
      value: data.now_population,
      subtitle: '实时人口总数',
      description: '全球当前总人口数量'
    },
    {
      type: 'male',
      title: '男性人口',
      value: data.male,
      subtitle: '男性总数',
      description: '全球男性人口统计'
    },
    {
      type: 'female',
      title: '女性人口',
      value: data.female,
      subtitle: '女性总数',
      description: '全球女性人口统计'
    },
    {
      type: 'birth',
      title: '今年出生人数',
      value: data.this_year_human,
      subtitle: '年度新生儿',
      description: `今日新增: ${data.this_day_human || '0'} 人`
    },
    {
      type: 'death',
      title: '今年死亡人数',
      value: data.this_yeardead_human,
      subtitle: '年度死亡数',
      description: `今日死亡: ${data.this_daydead_humun || '0'} 人`
    },
    {
      type: 'migration',
      title: '今年净迁移',
      value: data.this_yearnet_migration,
      subtitle: '人口迁移',
      description: `今日净迁移: ${data.this_daynet_migration || '0'} 人`
    },
    {
      type: 'growth',
      title: '今年人口增长',
      value: data.this_year_population_growth,
      subtitle: '净增长数',
      description: `今日增长: ${data.this_day_population_growth || '0'} 人`
    }
  ]
}

// 组件挂载时获取数据
onMounted(() => {
  fetchPopulationData()
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
      <h2 class="page-title">世界人口统计</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div v-if="country" class="query-info">
          {{ country }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 更新信息栏 -->
    <div v-if="lastUpdateTime && !loading" class="update-bar">
      <div class="update-info">
        <span class="update-label">最后更新：</span>
        <span class="update-time">{{ lastUpdateTime }}</span>
      </div>
      <button class="refresh-button" @click="refreshData" :disabled="loading">
        <span class="refresh-icon">🔄</span>
        刷新数据
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在获取世界人口统计数据...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button class="retry-button" @click="refreshData">重试</button>
    </div>

    <!-- 人口统计展示 -->
    <div v-if="!loading && !error && populationData" class="population-section">
      <h3>全球人口统计数据</h3>
      
      <div class="stats-grid">
        <div 
          v-for="(stat, index) in getStatistics()" 
          :key="index"
          class="stat-card"
          :class="getStatClass(stat.type)"
        >
          <div class="stat-header">
            <div class="stat-icon">
              {{ getStatIcon(stat.type) }}
            </div>
            <div class="stat-info">
              <h4 class="stat-title">{{ stat.title }}</h4>
              <p class="stat-subtitle">{{ stat.subtitle }}</p>
            </div>
          </div>
          
          <div class="stat-content">
            <div class="stat-value" @click="copyToClipboard(stat.value)">
              {{ formatNumber(stat.value) }}
            </div>
            <div class="stat-description">
              {{ stat.description }}
            </div>
          </div>
          
          <button 
            class="copy-button" 
            @click="copyToClipboard(stat.value)" 
            title="复制数据"
          >
            📋
          </button>
        </div>
      </div>

      <!-- 人口增长趋势说明 -->
      <div v-if="populationData" class="trend-info">
        <div class="trend-card">
          <h4>📊 人口增长趋势</h4>
          <div class="trend-content">
            <div class="trend-item">
              <span class="trend-label">出生率影响：</span>
              <span class="trend-value">每天约有 {{ formatNumber(populationData.this_day_human) }} 人出生</span>
            </div>
            <div class="trend-item">
              <span class="trend-label">死亡率影响：</span>
              <span class="trend-value">每天约有 {{ formatNumber(populationData.this_daydead_humun) }} 人死亡</span>
            </div>
            <div class="trend-item">
              <span class="trend-label">净增长率：</span>
              <span class="trend-value">每天净增长 {{ formatNumber(populationData.this_day_population_growth) }} 人</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-if="!loading && !error && !populationData" class="no-data-message">
      暂无人口统计数据
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

/* 更新信息栏 */
.update-bar {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.update-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.update-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.update-time {
  color: var(--text-accent);
  font-weight: 500;
  font-size: 0.9rem;
}

.refresh-button {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.refresh-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.refresh-icon {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.refresh-button:hover .refresh-icon {
  transform: rotate(180deg);
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.retry-button {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: #d32f2f;
  transform: translateY(-1px);
}

.no-data-message {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  background: var(--glass-bg);
  border-radius: 8px;
  margin-bottom: 2rem;
}

/* 人口统计区域 */
.population-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
  position: relative;
  min-height: 160px;
  display: flex;
  flex-direction: column;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

/* 统计卡片分类样式 */
.stat-card.primary {
  border-color: rgba(102, 126, 234, 0.4);
}

.stat-card.male {
  border-color: rgba(33, 150, 243, 0.4);
}

.stat-card.female {
  border-color: rgba(233, 30, 99, 0.4);
}

.stat-card.birth {
  border-color: rgba(76, 175, 80, 0.4);
}

.stat-card.death {
  border-color: rgba(244, 67, 54, 0.4);
}

.stat-card.migration {
  border-color: rgba(255, 193, 7, 0.4);
}

.stat-card.growth {
  border-color: rgba(156, 39, 176, 0.4);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--glass-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 1px solid var(--glass-border);
}

.stat-info {
  flex: 1;
}

.stat-title {
  color: var(--text-accent);
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0 0 0.3rem 0;
  line-height: 1.3;
}

.stat-subtitle {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin: 0;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-value {
  color: var(--text-primary);
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: color 0.2s ease;
  font-family: 'Courier New', monospace;
}

.stat-value:hover {
  color: var(--text-accent);
}

.stat-description {
  color: var(--text-secondary);
  font-size: 0.8rem;
  line-height: 1.4;
}

.copy-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  padding: 0.4rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-accent);
  transition: all 0.2s ease;
}

.copy-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

/* 趋势信息 */
.trend-info {
  margin-top: 2rem;
}

.trend-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.trend-card h4 {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.trend-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.trend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid var(--text-accent);
}

.trend-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.trend-value {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .update-bar {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .trend-item {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.2rem;
  }
  
  .api-info {
    font-size: 0.65rem;
  }
  
  .stat-card {
    padding: 1rem;
    min-height: 140px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
  
  .trend-card {
    padding: 1.5rem;
  }
}
</style>