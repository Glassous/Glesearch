<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 漫画数据
const comicData = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const apiSource = ref('jkyai.top')
const lastUpdateTime = ref('')
const showSuggestions = ref(false)

// 搜索建议
const searchSuggestions = [
  '恋爱', '校园', '古风', '玄幻', '都市', '悬疑',
  '搞笑', '治愈', '热血', '科幻', '穿越', '重生',
  '总裁', '甜宠', '虐恋', '青春', '奇幻', '武侠'
]

// 获取漫画数据
const fetchComics = async (searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) {
    error.value = '请输入搜索关键词'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.jkyai.top/API/kkmhss.php?search=${encodeURIComponent(searchTerm)}&type=json`)
    const result = await response.json()
    
    console.log('API返回数据:', result)
    
    if (result.success && result.data && Array.isArray(result.data)) {
      comicData.value = result.data
      
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
      throw new Error('数据格式不正确或API返回失败')
    }
  } catch (err) {
    error.value = '获取漫画数据失败，请检查网络连接'
    lastUpdateTime.value = 'Error'
    console.error('快看漫画API请求失败:', err)
  } finally {
    loading.value = false
  }
}

// 搜索漫画
const searchComics = () => {
  if (searchQuery.value.trim()) {
    showSuggestions.value = false
    fetchComics(searchQuery.value.trim())
  } else {
    error.value = '请输入搜索关键词'
  }
}

// 选择搜索建议
const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion
  showSuggestions.value = false
  fetchComics(suggestion)
}

// 显示搜索建议
const showSearchSuggestions = () => {
  if (!searchQuery.value.trim()) {
    showSuggestions.value = true
  }
}

// 隐藏搜索建议
const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// 返回主页
const goBack = () => {
  router.push('/')
}

// 跳转到必应搜索
const searchOnBing = (title) => {
  const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(title + ' 快看漫画')}`
  window.open(searchUrl, '_blank')
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return dateString
  }
}

// 截取描述文本
const truncateDescription = (text, maxLength = 100) => {
  if (!text) return '暂无描述'
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// 组件挂载时不自动获取数据
onMounted(() => {
  // 不自动加载数据，等待用户搜索
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
      <h2 class="page-title">快看漫画</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div class="update-time" :class="{ 'error-status': lastUpdateTime === 'Error' }">
          {{ lastUpdateTime === 'Error' ? 'Error' : (lastUpdateTime ? '更新时间: ' + lastUpdateTime : '') }}
        </div>
      </div>
    </header>

    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-container">
        <div class="search-input-wrapper">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索漫画名称..." 
            class="search-input"
            @keyup.enter="searchComics"
            @focus="showSearchSuggestions"
            @blur="hideSuggestions"
          >
          <button class="search-button" @click="searchComics">搜索</button>
          
          <!-- 搜索建议 -->
          <div v-if="showSuggestions" class="search-suggestions">
            <div class="suggestions-title">热门搜索</div>
            <div class="suggestions-grid">
              <button 
                v-for="suggestion in searchSuggestions" 
                :key="suggestion"
                class="suggestion-item"
                @click="selectSuggestion(suggestion)"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 初始状态提示 -->
    <div v-if="!loading && !error && comicData.length === 0 && !searchQuery" class="welcome-message">
      <div class="welcome-icon">📚</div>
      <h3>欢迎使用快看漫画搜索</h3>
      <p>请在上方搜索框输入漫画名称，或点击热门搜索标签开始探索</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在获取漫画数据...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 漫画数据展示 -->
    <div v-if="!loading && !error && comicData.length > 0" class="comic-section">
      <h3>搜索结果 ({{ comicData.length }}部)</h3>
      <div class="comic-grid">
        <div 
          v-for="comic in comicData" 
          :key="comic.url"
          class="comic-card"
          @click="searchOnBing(comic.title)"
        >
          <!-- 漫画封面 -->
          <div class="comic-cover">
            <img 
              :src="comic.vertical_image_url || comic.cover_image_url" 
              :alt="comic.title"
              class="cover-image"
              loading="lazy"
              @error="$event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2MCIgdmlld0JveD0iMCAwIDIwMCAyNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgMTMwQzEwNS41MjMgMTMwIDExMCAxMjUuNTIzIDExMCAxMjBDMTEwIDExNC40NzcgMTA1LjUyMyAxMTAgMTAwIDExMEM5NC40NzcgMTEwIDkwIDExNC40NzcgOTAgMTIwQzkwIDEyNS41MjMgOTQuNDc3IDEzMCAxMDAgMTMwWiIgZmlsbD0iI0NDQ0NDQyIvPgo8L3N2Zz4K'"
            >
          </div>
          
          <!-- 漫画信息 -->
          <div class="comic-info">
            <h4 class="comic-title">{{ comic.title }}</h4>
            <p class="comic-author">{{ comic.author || '未知作者' }}</p>
            <p class="comic-description">{{ truncateDescription(comic.description) }}</p>
            
            <div class="comic-meta">
              <div class="meta-item">
                <span class="meta-label">最新:</span>
                <span class="meta-value">{{ comic.latest_comic_title || '未知' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">创建:</span>
                <span class="meta-value">{{ formatDate(comic.created_at) }}</span>
              </div>
              <div class="meta-item" v-if="comic.recommend_text">
                <span class="meta-label">推荐:</span>
                <span class="meta-value recommend-text">{{ comic.recommend_text }}</span>
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

/* 搜索区域 */
.search-section {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--glass-border);
}

.search-container {
  max-width: 500px;
  margin: 0 auto;
  position: relative;
}

.search-input-wrapper {
  display: flex;
  gap: 0.5rem;
  position: relative;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--glass-border);
  border-radius: 25px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.search-button {
  padding: 0.75rem 1.5rem;
  background: var(--text-accent);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.search-button:hover {
  background: var(--text-accent);
  opacity: 0.9;
  transform: translateY(-1px);
}

/* 搜索建议样式 */
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1rem;
  margin-top: 0.5rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
  z-index: 1000;
}

.suggestions-title {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.8rem;
  font-weight: 500;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 0.5rem;
}

.suggestion-item {
  padding: 0.5rem 0.8rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  color: var(--text-primary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  text-align: center;
}

.suggestion-item:hover {
  background: var(--text-accent);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 主要内容区域 */
.main-content {
  margin-top: 140px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 140px);
  width: 100%;
}

/* 欢迎消息 */
.welcome-message {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.welcome-message h3 {
  color: var(--text-accent);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.welcome-message p {
  font-size: 1rem;
  line-height: 1.5;
  max-width: 400px;
  margin: 0 auto;
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

/* 漫画数据区域 */
.comic-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.comic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.comic-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.comic-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.comic-cover {
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.comic-card:hover .cover-image {
  transform: scale(1.05);
}

.comic-info {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comic-title {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
  line-height: 1.3;
}

.comic-author {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
  font-style: italic;
}

.comic-description {
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0.5rem 0;
  flex: 1;
}

.comic-meta {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
}

.meta-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.meta-label {
  color: var(--text-secondary);
  font-weight: 500;
  min-width: 35px;
  flex-shrink: 0;
}

.meta-value {
  color: var(--text-primary);
  line-height: 1.3;
  word-break: break-word;
}

.recommend-text {
  color: var(--text-accent);
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .search-section {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
    margin-top: 130px;
  }
  
  .comic-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .comic-card {
    flex-direction: row;
    height: 180px;
  }
  
  .comic-cover {
    width: 120px;
    height: 100%;
    flex-shrink: 0;
  }
  
  .comic-info {
    padding: 1rem;
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
  
  .top-bar {
    padding: 0.8rem;
  }
  
  .search-input-wrapper {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .search-button {
    align-self: stretch;
  }
  
  .comic-card {
    flex-direction: column;
    height: auto;
  }
  
  .comic-cover {
    width: 100%;
    height: 160px;
  }
  
  .comic-info {
    padding: 1rem;
  }
}
</style>