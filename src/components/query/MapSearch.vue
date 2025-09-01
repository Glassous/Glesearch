<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 地名检索数据
const mapData = ref([])
const loading = ref(false)
const error = ref('')
const apiSource = ref('PearAPI')
const searchKeyword = ref('')
const resultCount = ref(0)

// 获取地名检索数据
const fetchMapData = async () => {
  if (!searchKeyword.value.trim()) {
    error.value = '请输入要检索的地名关键词'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.pearktrue.cn/api/baidumap/?keyword=${encodeURIComponent(searchKeyword.value.trim())}`)
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data) {
      mapData.value = result.data
      resultCount.value = result.count || result.data.length
    } else {
      throw new Error(`API返回错误: ${result.msg || '未知错误'}`)
    }
  } catch (err) {
    error.value = '检索地名信息失败，请检查网络连接或稍后重试'
    console.error('地图API请求失败:', err)
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

// 回车键搜索
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    fetchMapData()
  }
}

// 复制地址到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // 这里可以添加一个成功提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 快速填入示例关键词
const fillExample = (exampleKeyword) => {
  searchKeyword.value = exampleKeyword
}

// 热门地点示例
const popularPlaces = [
  '天安门广场', '北京故宫', '长城', '西湖', '黄山', '泰山', 
  '上海外滩', '广州塔', '深圳湾', '西安兵马俑', '成都宽窄巷子', '杭州雷峰塔'
]

// 获取地点类型的图标
const getLocationIcon = (type) => {
  const iconMap = {
    '旅游景点': '🏛️',
    '文物古迹': '🏛️',
    '古建筑': '🏯',
    '名人纪念馆': '🎭',
    '纪念馆': '🎭',
    '酒店': '🏨',
    '舒适型': '🏨',
    '经济型': '🏨',
    '高档型': '🏨',
    '美食': '🍽️',
    '中餐馆': '🍽️',
    '火锅店': '🍽️',
    '生活服务': '🏪',
    '购物': '🛍️',
    '医疗': '🏥',
    '教育': '🏫',
    '交通': '🚗'
  }
  return iconMap[type] || '📍'
}

// 获取地点类型的颜色样式
const getTypeClass = (type) => {
  if (type.includes('旅游') || type.includes('景点') || type.includes('古迹') || type.includes('古建筑')) {
    return 'tourist'
  }
  if (type.includes('酒店') || type.includes('型')) {
    return 'hotel'
  }
  if (type.includes('美食') || type.includes('餐馆') || type.includes('店')) {
    return 'food'
  }
  if (type.includes('服务')) {
    return 'service'
  }
  return 'default'
}

// 组件挂载时聚焦输入框
onMounted(() => {
  const input = document.querySelector('.keyword-input')
  if (input) {
    input.focus()
  }
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
      <h2 class="page-title">地图地名检索</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div v-if="resultCount > 0" class="query-info">
          找到 {{ resultCount }} 个结果
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 搜索表单 -->
    <div class="search-form">
      <div class="form-row">
        <div class="input-group">
          <label>地名关键词</label>
          <input 
            type="text" 
            v-model="searchKeyword" 
            @keypress="handleKeyPress"
            placeholder="请输入要检索的地名，如：天安门广场"
            class="form-input keyword-input"
          />
        </div>
        <button class="search-button" @click="fetchMapData" :disabled="loading">
          {{ loading ? '检索中...' : '开始检索' }}
        </button>
      </div>

      <!-- 热门地点快速选择 -->
      <div class="popular-places">
        <div class="places-label">热门地点：</div>
        <div class="places-list">
          <button 
            v-for="place in popularPlaces" 
            :key="place"
            class="place-tag"
            @click="fillExample(place)"
            :title="`检索${place}`"
          >
            {{ place }}
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在检索地名信息...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 地名检索结果 -->
    <div v-if="!loading && !error && mapData.length > 0" class="map-section">
      <h3>地名检索结果 ({{ resultCount }}条)</h3>
      
      <div class="location-list">
        <div 
          v-for="(location, index) in mapData" 
          :key="index"
          class="location-card"
          :class="getTypeClass(location.type)"
        >
          <div class="location-header">
            <div class="location-icon">
              {{ getLocationIcon(location.type) }}
            </div>
            <div class="location-basic">
              <h4 class="location-name">{{ location.name }}</h4>
              <p class="location-type">{{ location.type }}</p>
            </div>
            <div class="location-category">
              <span class="category-badge" :class="getTypeClass(location.type)">
                {{ location.type }}
              </span>
            </div>
          </div>
          
          <div class="location-details">
            <div class="detail-item">
              <span class="detail-label">地址</span>
              <span class="detail-value" @click="copyToClipboard(location.address)">
                {{ location.address }}
              </span>
            </div>
            
            <div v-if="location.tag" class="detail-item">
              <span class="detail-label">标签</span>
              <div class="tags-container">
                <span 
                  v-for="(tag, tagIndex) in location.tag.split(';')" 
                  :key="tagIndex"
                  class="tag-item"
                >
                  {{ tag.trim() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-if="!loading && !error && mapData.length === 0 && searchKeyword" class="no-data-message">
      未找到相关地名信息，请尝试其他关键词
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

/* 搜索表单 */
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

/* 热门地点 */
.popular-places {
  border-top: 1px solid var(--glass-border);
  padding-top: 1rem;
  margin-top: 1rem;
}

.places-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.places-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.place-tag {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.place-tag:hover {
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

/* 地名检索结果区域 */
.map-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.location-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.location-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.location-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.location-card.tourist {
  border-color: rgba(76, 175, 80, 0.3);
}

.location-card.hotel {
  border-color: rgba(33, 150, 243, 0.3);
}

.location-card.food {
  border-color: rgba(255, 152, 0, 0.3);
}

.location-card.service {
  border-color: rgba(156, 39, 176, 0.3);
}

.location-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.location-icon {
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

.location-basic {
  flex: 1;
}

.location-name {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 0.3rem 0;
  line-height: 1.3;
}

.location-type {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.location-category {
  display: flex;
  align-items: center;
}

.category-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid;
}

.category-badge.tourist {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border-color: rgba(76, 175, 80, 0.3);
}

.category-badge.hotel {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
  border-color: rgba(33, 150, 243, 0.3);
}

.category-badge.food {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
  border-color: rgba(255, 152, 0, 0.3);
}

.category-badge.service {
  background: rgba(156, 39, 176, 0.1);
  color: #9c27b0;
  border-color: rgba(156, 39, 176, 0.3);
}

.category-badge.default {
  background: rgba(158, 158, 158, 0.1);
  color: #9e9e9e;
  border-color: rgba(158, 158, 158, 0.3);
}

.location-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-value {
  font-size: 1rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: color 0.2s ease;
  line-height: 1.4;
}

.detail-value:hover {
  color: var(--text-accent);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  background: rgba(102, 126, 234, 0.1);
  color: var(--text-accent);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.2s ease;
}

.tag-item:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
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
  
  .location-header {
    flex-direction: column;
    text-align: center;
    gap: 0.8rem;
  }
  
  .location-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
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
  
  .places-list {
    gap: 0.3rem;
  }
  
  .place-tag {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
  
  .tag-item {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>