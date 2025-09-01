<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 当前活跃的选项卡
const activeTab = ref('mobile-cpu')

// API数据状态
const mobileData = ref([])
const desktopData = ref([])
const gpuData = ref([])

const loadingStates = ref({
  'mobile-cpu': false,
  'desktop-cpu': false,
  'desktop-gpu': false
})

const errorStates = ref({
  'mobile-cpu': '',
  'desktop-cpu': '',
  'desktop-gpu': ''
})

const updateTimes = ref({
  'mobile-cpu': '',
  'desktop-cpu': '',
  'desktop-gpu': ''
})

const counts = ref({
  'mobile-cpu': 0,
  'desktop-cpu': 0,
  'desktop-gpu': 0
})

const apiSource = ref('PearAPI')

// 选项卡配置
const tabs = [
  { id: 'mobile-cpu', name: '手机CPU', icon: '📱', api: 'https://api.pearktrue.cn/api/tianti/sjcpu.php' },
  { id: 'desktop-cpu', name: '桌面CPU', icon: '💻', api: 'https://api.pearktrue.cn/api/tianti/zmcpu.php' },
  { id: 'desktop-gpu', name: '桌面显卡', icon: '🎮', api: 'https://api.pearktrue.cn/api/tianti/zmxk.php' }
]

// 获取排行数据
const fetchRankingData = async (tabId) => {
  const tab = tabs.find(t => t.id === tabId)
  if (!tab) return

  try {
    loadingStates.value[tabId] = true
    errorStates.value[tabId] = ''
    
    const response = await fetch(tab.api)
    const result = await response.json()
    
    console.log(`${tabId} API返回数据:`, result) // 调试日志
    
    if (result.code === 200 && result.data) {
      // 根据不同tab存储数据
      if (tabId === 'mobile-cpu') {
        mobileData.value = result.data
      } else if (tabId === 'desktop-cpu') {
        desktopData.value = result.data
      } else if (tabId === 'desktop-gpu') {
        gpuData.value = result.data
      }
      
      counts.value[tabId] = result.count || result.data.length
      updateTimes.value[tabId] = result.update || new Date().toLocaleString('zh-CN')
    } else {
      throw new Error(`API返回错误: ${result.msg || '未知错误'}`)
    }
  } catch (err) {
    errorStates.value[tabId] = '获取排行数据失败，请检查网络连接或稍后重试'
    console.error(`${tabId} API请求失败:`, err)
  } finally {
    loadingStates.value[tabId] = false
  }
}

// 切换选项卡
const switchTab = (tabId) => {
  activeTab.value = tabId
  // 如果该选项卡数据未加载，则加载数据
  if (getCurrentData().length === 0 && !loadingStates.value[tabId]) {
    fetchRankingData(tabId)
  }
}

// 获取当前选项卡的数据
const getCurrentData = () => {
  switch (activeTab.value) {
    case 'mobile-cpu': return mobileData.value
    case 'desktop-cpu': return desktopData.value
    case 'desktop-gpu': return gpuData.value
    default: return []
  }
}

// 刷新当前选项卡数据
const refreshCurrentData = () => {
  fetchRankingData(activeTab.value)
}

// 返回主页
const goBack = () => {
  const from = route.query.from
  if (from === 'home') {
    router.push('/')
  } else if (from === 'query') {
    router.push('/query')
  } else {
    router.push('/')
  }
}

// 复制排行信息到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 获取排名的样式类
const getRankClass = (rank) => {
  if (rank === 1) return 'rank-first'
  if (rank === 2) return 'rank-second'
  if (rank === 3) return 'rank-third'
  if (rank <= 10) return 'rank-top10'
  if (rank <= 50) return 'rank-top50'
  return 'rank-normal'
}

// 获取排名图标
const getRankIcon = (rank) => {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  if (rank <= 10) return '🏆'
  if (rank <= 50) return '⭐'
  return '📊'
}

// 获取品牌图标
const getBrandIcon = (model) => {
  const modelLower = model.toLowerCase()
  if (modelLower.includes('骁龙') || modelLower.includes('snapdragon')) return '🔥'
  if (modelLower.includes('天玑') || modelLower.includes('dimensity')) return '⚡'
  if (modelLower.includes('a18') || modelLower.includes('a17') || modelLower.includes('apple')) return '🍎'
  if (modelLower.includes('intel') || modelLower.includes('i9') || modelLower.includes('i7') || modelLower.includes('i5')) return '💙'
  if (modelLower.includes('amd') || modelLower.includes('锐龙') || modelLower.includes('线程撕裂者')) return '❤️'
  if (modelLower.includes('geforce') || modelLower.includes('rtx') || modelLower.includes('gtx')) return '💚'
  if (modelLower.includes('radeon') || modelLower.includes('rx')) return '💛'
  if (modelLower.includes('arc')) return '🔵'
  return '💻'
}

// 组件挂载时加载默认选项卡数据
onMounted(() => {
  fetchRankingData(activeTab.value)
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
      <h2 class="page-title">性能天梯排行</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div v-if="counts[activeTab] > 0" class="query-info">
          共 {{ counts[activeTab] }} 款
        </div>
      </div>
    </header>

    <!-- 选项卡导航 -->
    <nav class="tab-nav">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-button"
        :class="{ active: activeTab === tab.id }"
        @click="switchTab(tab.id)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-name">{{ tab.name }}</span>
      </button>
    </nav>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 更新信息栏 -->
    <div v-if="updateTimes[activeTab] && !loadingStates[activeTab]" class="update-bar">
      <div class="update-info">
        <span class="update-label">更新时间：</span>
        <span class="update-time">{{ updateTimes[activeTab] }}</span>
      </div>
      <button class="refresh-button" @click="refreshCurrentData" :disabled="loadingStates[activeTab]">
        <span class="refresh-icon">🔄</span>
        刷新
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loadingStates[activeTab]" class="loading-message">
      正在获取{{ tabs.find(t => t.id === activeTab)?.name }}排行数据...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="errorStates[activeTab]" class="error-message">
      {{ errorStates[activeTab] }}
      <button class="retry-button" @click="refreshCurrentData">重试</button>
    </div>

    <!-- 排行榜列表 -->
    <div v-if="!loadingStates[activeTab] && !errorStates[activeTab] && getCurrentData().length > 0" class="ranking-section">
      <h3>{{ tabs.find(t => t.id === activeTab)?.name }}排行榜</h3>
      
      <div class="ranking-list">
        <div 
          v-for="(item, index) in getCurrentData()" 
          :key="index"
          class="ranking-item"
          :class="getRankClass(item.top)"
        >
          <div class="rank-badge">
            <span class="rank-icon">{{ getRankIcon(item.top) }}</span>
            <span class="rank-number">{{ item.top }}</span>
          </div>
          
          <div class="model-info">
            <div class="model-header">
              <span class="brand-icon">{{ getBrandIcon(item.model) }}</span>
              <h4 class="model-name" @click="copyToClipboard(item.model)">
                {{ item.model }}
              </h4>
            </div>
          </div>
          
          <button 
            class="copy-button" 
            @click="copyToClipboard(`第${item.top}名：${item.model}`)"
            title="复制排名信息"
          >
            📋
          </button>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-if="!loadingStates[activeTab] && !errorStates[activeTab] && getCurrentData().length === 0" class="no-data-message">
      暂无{{ tabs.find(t => t.id === activeTab)?.name }}排行数据
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

/* 选项卡导航 */
.tab-nav {
  display: flex;
  padding: 0 1.5rem 1rem;
  gap: 0.5rem;
}

.tab-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.8rem 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-secondary);
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.tab-button.active {
  background: var(--text-accent);
  color: white;
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.tab-icon {
  font-size: 1.2rem;
}

.tab-name {
  font-size: 0.8rem;
  font-weight: 500;
}

/* 主要内容区域 */
.main-content {
  margin-top: 140px; /* 顶部栏 + 选项卡高度 */
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 140px);
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

/* 排行榜区域 */
.ranking-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.ranking-item {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px var(--glass-shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.ranking-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px var(--shadow-medium);
}

/* 排名样式 */
.ranking-item.rank-first {
  border-color: #ffd700;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), var(--glass-bg));
}

.ranking-item.rank-second {
  border-color: #c0c0c0;
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.1), var(--glass-bg));
}

.ranking-item.rank-third {
  border-color: #cd7f32;
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.1), var(--glass-bg));
}

.ranking-item.rank-top10 {
  border-color: rgba(102, 126, 234, 0.5);
}

.ranking-item.rank-top50 {
  border-color: rgba(76, 175, 80, 0.3);
}

.rank-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  min-width: 60px;
}

.rank-icon {
  font-size: 1.5rem;
}

.rank-number {
  color: var(--text-accent);
  font-weight: bold;
  font-size: 1.1rem;
}

.model-info {
  flex: 1;
}

.model-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.brand-icon {
  font-size: 1.3rem;
}

.model-name {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  cursor: pointer;
  transition: color 0.2s ease;
  line-height: 1.3;
}

.model-name:hover {
  color: var(--text-accent);
}

.copy-button {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-accent);
  transition: all 0.2s ease;
  min-width: 40px;
  height: 40px;
}

.copy-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
    margin-top: 130px;
  }
  
  .tab-nav {
    padding: 0 1rem 1rem;
    gap: 0.3rem;
  }
  
  .tab-button {
    padding: 0.6rem 0.3rem;
  }
  
  .tab-icon {
    font-size: 1rem;
  }
  
  .tab-name {
    font-size: 0.7rem;
  }
  
  .ranking-item {
    padding: 0.8rem 1rem;
    gap: 0.8rem;
  }
  
  .update-bar {
    flex-direction: column;
    gap: 1rem;
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
  
  .ranking-item {
    padding: 0.8rem;
    gap: 0.6rem;
  }
  
  .rank-badge {
    min-width: 50px;
  }
  
  .rank-icon {
    font-size: 1.2rem;
  }
  
  .rank-number {
    font-size: 1rem;
  }
  
  .model-name {
    font-size: 0.9rem;
  }
  
  .brand-icon {
    font-size: 1.1rem;
  }
}
</style>