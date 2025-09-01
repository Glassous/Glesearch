<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 科技资讯数据
const newsData = ref([])
const loading = ref(false)
const error = ref('')
const apiSource = ref('PearAPI')
const newsCount = ref(0)
const updateTime = ref('')

// 获取科技资讯数据
const fetchNewsData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.pearktrue.cn/api/sciencenews/`)
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data) {
      newsData.value = result.data
      newsCount.value = result.count || result.data.length
      updateTime.value = result.update || new Date().toLocaleString('zh-CN')
    } else {
      throw new Error(`API返回错误: ${result.msg || '未知错误'}`)
    }
  } catch (err) {
    error.value = '获取科技资讯失败，请检查网络连接或稍后重试'
    console.error('科技资讯API请求失败:', err)
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

// 复制标题到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // 这里可以添加一个成功提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 刷新资讯
const refreshNews = () => {
  fetchNewsData()
}

// 获取新闻分类标识
const getNewsCategory = (title) => {
  if (title.includes('苹果') || title.includes('iPhone') || title.includes('iPad') || title.includes('Mac')) return 'apple'
  if (title.includes('华为') || title.includes('鸿蒙') || title.includes('Mate') || title.includes('Pura')) return 'huawei'
  if (title.includes('小米') || title.includes('雷军') || title.includes('澎湃')) return 'xiaomi'
  if (title.includes('比亚迪') || title.includes('特斯拉') || title.includes('新能源') || title.includes('电动车')) return 'auto'
  if (title.includes('AI') || title.includes('人工智能') || title.includes('大模型') || title.includes('ChatGPT')) return 'ai'
  if (title.includes('芯片') || title.includes('CPU') || title.includes('GPU') || title.includes('显卡')) return 'chip'
  if (title.includes('游戏') || title.includes('电竞') || title.includes('Steam')) return 'game'
  return 'general'
}

// 获取新闻分类样式
const getCategoryClass = (title) => {
  return getNewsCategory(title)
}

// 获取新闻分类图标
const getCategoryIcon = (title) => {
  const category = getNewsCategory(title)
  const iconMap = {
    'apple': '🍎',
    'huawei': '📱',
    'xiaomi': '🔥', 
    'auto': '🚗',
    'ai': '🤖',
    'chip': '💻',
    'game': '🎮',
    'general': '📰'
  }
  return iconMap[category] || '📰'
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  // 提取时间部分，如 "2025年09月01日 20:40" -> "20:40"
  const timeMatch = timeStr.match(/(\d{2}:\d{2})/)
  return timeMatch ? timeMatch[1] : timeStr
}

// 格式化日期
const formatDate = (timeStr) => {
  if (!timeStr) return ''
  // 提取日期部分，如 "2025年09月01日 20:40" -> "09月01日"
  const dateMatch = timeStr.match(/(\d{2})月(\d{2})日/)
  return dateMatch ? `${dateMatch[1]}月${dateMatch[2]}日` : timeStr
}

// 组件挂载时获取数据
onMounted(() => {
  fetchNewsData()
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
      <h2 class="page-title">实时科技资讯</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div v-if="newsCount > 0" class="query-info">
          共 {{ newsCount }} 条资讯
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 更新信息栏 -->
    <div v-if="updateTime && !loading" class="update-bar">
      <div class="update-info">
        <span class="update-label">最后更新：</span>
        <span class="update-time">{{ updateTime }}</span>
      </div>
      <button class="refresh-button" @click="refreshNews" :disabled="loading">
        <span class="refresh-icon">🔄</span>
        刷新
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在获取最新科技资讯...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button class="retry-button" @click="refreshNews">重试</button>
    </div>

    <!-- 科技资讯列表 -->
    <div v-if="!loading && !error && newsData.length > 0" class="news-section">
      <h3>科技资讯列表</h3>
      
      <div class="news-list">
        <div 
          v-for="(news, index) in newsData" 
          :key="index"
          class="news-card"
          :class="getCategoryClass(news.title)"
        >
          <div class="news-header">
            <div class="news-category">
              <span class="category-icon">{{ getCategoryIcon(news.title) }}</span>
            </div>
            <div class="news-time">
              <div class="time-main">{{ formatTime(news.time) }}</div>
              <div class="time-date">{{ formatDate(news.time) }}</div>
            </div>
          </div>
          
          <div class="news-content">
            <h4 class="news-title" @click="copyToClipboard(news.title)">
              {{ news.title }}
            </h4>
          </div>
          
          <div class="news-footer">
            <div class="news-meta">
              <span class="news-index">#{{ index + 1 }}</span>
            </div>
            <button class="copy-button" @click="copyToClipboard(news.title)" title="复制标题">
              📋
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-if="!loading && !error && newsData.length === 0" class="no-data-message">
      暂无科技资讯数据
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

/* 科技资讯区域 */
.news-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.news-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.news-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.news-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

/* 新闻分类样式 */
.news-card.apple {
  border-color: rgba(0, 122, 255, 0.3);
}

.news-card.huawei {
  border-color: rgba(255, 0, 0, 0.3);
}

.news-card.xiaomi {
  border-color: rgba(255, 103, 0, 0.3);
}

.news-card.auto {
  border-color: rgba(76, 175, 80, 0.3);
}

.news-card.ai {
  border-color: rgba(156, 39, 176, 0.3);
}

.news-card.chip {
  border-color: rgba(33, 150, 243, 0.3);
}

.news-card.game {
  border-color: rgba(255, 193, 7, 0.3);
}

.news-card.general {
  border-color: var(--glass-border);
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.news-category {
  display: flex;
  align-items: center;
}

.category-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--glass-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--glass-border);
}

.news-time {
  text-align: right;
}

.time-main {
  color: var(--text-accent);
  font-size: 1.1rem;
  font-weight: bold;
  line-height: 1;
}

.time-date {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-top: 0.2rem;
}

.news-content {
  flex: 1;
  margin-bottom: 1rem;
}

.news-title {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  line-height: 1.5;
  cursor: pointer;
  transition: color 0.2s ease;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-title:hover {
  color: var(--text-accent);
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.news-meta {
  display: flex;
  align-items: center;
}

.news-index {
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
}

.copy-button {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  padding: 0.4rem;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-accent);
  transition: all 0.2s ease;
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
  }
  
  .news-list {
    grid-template-columns: 1fr;
    gap: 1rem;
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
  
  .news-card {
    padding: 1rem;
    min-height: 160px;
  }
  
  .news-title {
    font-size: 0.9rem;
  }
  
  .category-icon {
    width: 32px;
    height: 32px;
    font-size: 1.2rem;
  }
  
  .time-main {
    font-size: 1rem;
  }
}
</style>