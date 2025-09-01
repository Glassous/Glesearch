<script setup>
import { ref, onMounted, defineOptions } from 'vue'
import { useRouter, useRoute } from 'vue-router'

defineOptions({
  name: 'TomatoNovel'
})

const router = useRouter()
const route = useRoute()

// 小说数据
const novelData = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const apiSource = ref('jkyai.top')
const lastUpdateTime = ref('')
const showSuggestions = ref(false)

// 搜索建议
const searchSuggestions = [
  '霸道总裁', '都市言情', '穿越重生', '玄幻修仙', '武侠江湖', '科幻未来',
  '悬疑推理', '青春校园', '历史军事', '游戏竞技', '娱乐明星', '商战职场',
  '豪门世家', '甜宠文', '虐恋情深', '快穿系统', '末世重生', '古代言情'
]

// 获取小说数据
const fetchNovels = async (searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) {
    error.value = '请输入搜索关键词'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.jkyai.top/API/fqmfxs.php?name=${encodeURIComponent(searchTerm)}`)
    const result = await response.json()
    
    console.log('API返回数据:', result)
    
    if (result.code === 200 && result.data && Array.isArray(result.data)) {
      novelData.value = result.data
      
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
    error.value = '获取小说数据失败，请检查网络连接'
    lastUpdateTime.value = 'Error'
    console.error('番茄小说API请求失败:', err)
  } finally {
    loading.value = false
  }
}

// 搜索小说
const searchNovels = () => {
  if (searchQuery.value.trim()) {
    showSuggestions.value = false
    fetchNovels(searchQuery.value.trim())
  } else {
    error.value = '请输入搜索关键词'
  }
}

// 选择搜索建议
const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion
  showSuggestions.value = false
  fetchNovels(suggestion)
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
  const from = route.query.from
  if (from === 'home') {
    router.push('/')
  } else if (from === 'entertainment') {
    router.push('/entertainment')
  } else {
    // 默认返回首页
    router.push('/')
  }
}

// 跳转到必应搜索
const searchOnBing = (title) => {
  const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(title + ' 番茄小说')}`
  window.open(searchUrl, '_blank')
}

// 提取小说类型
const extractGenre = (title) => {
  const match = title.match(/^\[([^\]]+)\]/)
  return match ? match[1] : '未分类'
}

// 清理小说标题
const cleanTitle = (title) => {
  return title.replace(/^\[[^\]]+\]/, '').trim()
}

// 格式化更新时间
const formatUpdateTime = (content) => {
  if (!content) return '未知'
  const match = content.match(/更新时间：(.+)/)
  return match ? match[1] : content
}

// 截取文本
const truncateText = (text, maxLength = 50) => {
  if (!text) return '暂无信息'
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// 验证URL是否有效
const isValidUrl = (url) => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 处理章节目录点击
const handleCatalogClick = (novel) => {
  console.log('章节目录链接:', novel.章节目录)
  
  // 提取href参数
  const match = novel.章节目录?.match(/href=([^&]+)/)
  if (match) {
    const href = decodeURIComponent(match[1])
    const title = cleanTitle(novel.小说名称)
    const author = novel.原创作者
    
    // 跳转到章节目录页面
    router.push({
      path: '/novel-chapter',
      query: {
        href: href,
        title: title,
        author: author
      }
    })
  } else {
    alert('章节目录链接格式不正确')
  }
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
      <h2 class="page-title">番茄小说</h2>
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
            placeholder="搜索小说名称..." 
            class="search-input"
            @keyup.enter="searchNovels"
            @focus="showSearchSuggestions"
            @blur="hideSuggestions"
          >
          <button class="search-button" @click="searchNovels">搜索</button>
          
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
    <div v-if="!loading && !error && novelData.length === 0 && !searchQuery" class="welcome-message">
      <div class="welcome-icon">📖</div>
      <h3>欢迎使用番茄小说搜索</h3>
      <p>请在上方搜索框输入小说名称，或点击热门搜索标签开始探索</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在获取小说数据...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 小说数据展示 -->
    <div v-if="!loading && !error && novelData.length > 0" class="novel-section">
      <h3>搜索结果 ({{ novelData.length }}部)</h3>
      <div class="novel-grid">
        <div 
          v-for="novel in novelData" 
          :key="novel.章节目录"
          class="novel-card"
          @click="searchOnBing(cleanTitle(novel.小说名称))"
        >
          <!-- 小说类型标签 -->
          <div class="novel-genre">{{ extractGenre(novel.小说名称) }}</div>
          
          <!-- 小说信息 -->
          <div class="novel-info">
            <h4 class="novel-title">{{ cleanTitle(novel.小说名称) }}</h4>
            <p class="novel-author">作者：{{ novel.原创作者 || '未知作者' }}</p>
            
            <div class="novel-meta">
              <div class="meta-item">
                <span class="meta-label">状态:</span>
                <span class="meta-value" :class="{ 'completed': novel.是否完结?.includes('完本') }">
                  {{ novel.是否完结?.replace('状态：', '') || '未知' }}
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">更新:</span>
                <span class="meta-value">{{ formatUpdateTime(novel.内容) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">最新:</span>
                <span class="meta-value latest-chapter">{{ truncateText(novel.最近更新) }}</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="novel-actions" :class="{ 'single-button': !novel.章节目录 || !novel.章节目录.includes('href=') }">
              <button 
                class="action-btn read-btn"
                @click.stop="window.open(novel.立即阅读, '_blank')"
                v-if="novel.立即阅读"
              >
                立即阅读
              </button>
              <button 
                class="action-btn catalog-btn"
                @click.stop="handleCatalogClick(novel)"
                v-if="novel.章节目录 && novel.章节目录.includes('href=')"
              >
                章节目录
              </button>
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
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
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

/* 小说数据区域 */
.novel-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.novel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.novel-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
  cursor: pointer;
  position: relative;
}

.novel-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.novel-genre {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--text-accent);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  z-index: 1;
}

.novel-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.novel-title {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
  line-height: 1.3;
  padding-right: 4rem; /* 为类型标签留空间 */
}

.novel-author {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
  font-style: italic;
}

.novel-meta {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin: 0.5rem 0;
  padding: 0.5rem 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
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

.meta-value.completed {
  color: #4caf50;
  font-weight: 500;
}

.latest-chapter {
  color: var(--text-accent);
  font-weight: 500;
}

.novel-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.novel-actions.single-button .action-btn {
  flex: 1;
}

.action-btn {
  flex: 1;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.read-btn {
  background: var(--text-accent);
  color: white;
}

.read-btn:hover {
  background: var(--text-accent);
  opacity: 0.9;
  transform: translateY(-1px);
}

.catalog-btn {
  background: var(--glass-bg);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
}

.catalog-btn:hover {
  background: var(--glass-border);
  transform: translateY(-1px);
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
  
  .novel-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
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
  
  .novel-info {
    padding: 1rem;
  }
  
  .novel-title {
    padding-right: 3rem;
  }
  
  .novel-actions {
    flex-direction: column;
  }
}
</style>