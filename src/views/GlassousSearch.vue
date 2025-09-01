<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import GlassousLogo from '@/assets/images/Glassous-search.png'

const router = useRouter()
const route = useRoute()

// 搜索相关状态
const searchQuery = ref('')
const searchResults = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const isLoading = ref(false)
const hasSearched = ref(false)
const errorMessage = ref('')
const apiSource = ref('')
const pageHint = ref('')
const hoveredPage = ref(null)

// 从路由参数获取搜索关键词和页码
onMounted(() => {
  const query = route.query.q
  const page = parseInt(route.query.page) || 1
  if (query) {
    searchQuery.value = query
    currentPage.value = page
    performSearch(page)
  }
})

// 监听路由变化
watch(() => route.query, (newQuery) => {
  const query = newQuery.q
  const page = parseInt(newQuery.page) || 1
  if (query && (query !== searchQuery.value || page !== currentPage.value)) {
    searchQuery.value = query
    currentPage.value = page
    performSearch(page)
  }
})

// 执行搜索
const performSearch = async (page = 1) => {
  if (!searchQuery.value.trim()) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  currentPage.value = page

  try {
    const response = await fetch(`https://api.pearktrue.cn/api/universalsearch/?search=${encodeURIComponent(searchQuery.value)}&page=${page}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.code === 200) {
      searchResults.value = data.data || []
      apiSource.value = data.api_source || ''
      hasSearched.value = true
      
      // 计算总页数（假设每页10条结果）
      if (searchResults.value.length === 10) {
        // 如果当前页有10条结果，说明可能还有下一页
        totalPages.value = Math.max(currentPage.value + 1, totalPages.value)
      } else if (searchResults.value.length < 10) {
        // 如果当前页少于10条结果，说明这是最后一页
        totalPages.value = currentPage.value
      }
    } else {
      throw new Error(data.msg || '搜索失败')
    }
  } catch (error) {
    console.error('搜索错误:', error)
    errorMessage.value = error.message || '搜索失败，请稍后重试'
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

// 处理搜索表单提交
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    return
  }
  
  currentPage.value = 1
  totalPages.value = 1
  
  // 更新URL
  router.push({
    path: '/glassous-search',
    query: { q: searchQuery.value }
  })
  
  await performSearch(1)
}

// 处理分页
const goToPage = (page) => {
  if (page >= 1 && page !== currentPage.value) {
    // 更新URL参数
    router.push({
      path: '/glassous-search',
      query: { q: searchQuery.value, page: page }
    })
  }
}

// 上一页
const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

// 下一页
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

// 打开链接
const openLink = (url) => {
  window.open(url, '_blank')
}

// 返回主页
const goBack = () => {
  const from = route.query.from
  if (from === 'entertainment') {
    router.push('/entertainment')
  } else {
    router.push('/')
  }
}

// 处理回车键搜索
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    handleSearch()
  }
}

// 显示页面提示
const showPageHint = (page) => {
  pageHint.value = `第 ${page} 页`
}

// 隐藏页面提示
const hidePageHint = () => {
  pageHint.value = ''
}
</script>

<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <div class="header-spacer"></div>
    </header>
    
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-input-group">
        <div class="header-container">
          <img :src="GlassousLogo" alt="Glassous Logo" class="logo" />
          <h2 class="page-title">Glassous</h2>
        </div>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="输入搜索关键词..."
          class="search-input"
          @keypress="handleKeyPress"
          :disabled="isLoading"
        />
        <button 
          @click="handleSearch" 
          class="search-button"
          :disabled="isLoading || !searchQuery.trim()"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          <svg v-else xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 50 50" fill="white">
            <path d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 错误信息 -->
    <div v-if="errorMessage" class="error-message">
      <div class="error-icon">⚠️</div>
      <div class="error-text">
        <h3>搜索出错</h3>
        <p>{{ errorMessage }}</p>
        <button @click="performSearch(currentPage)" class="retry-button">重试</button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="isLoading" class="loading-container">
      <div class="loading-spinner large"></div>
      <p class="loading-text">正在搜索中...</p>
    </div>

    <!-- 搜索结果 -->
    <div v-else-if="hasSearched && searchResults.length > 0" class="results-container">
      <!-- 结果列表 -->
      <div class="results-grid">
        <div 
          v-for="(result, index) in searchResults" 
          :key="index"
          class="result-card"
          @click="openLink(result.href)"
        >
          <div class="result-content">
            <h4 class="result-title">{{ result.title }}</h4>
            <p class="result-url">{{ result.href }}</p>
            <p class="result-abstract">{{ result.abstract }}</p>
          </div>
          <div class="result-actions">

            <div class="result-arrow">→</div>
          </div>
        </div>
      </div>

      <!-- Glassous字母分页 -->
      <div v-if="hasSearched" class="glassous-pagination">
        <div class="glassous-letters">
          <span 
            v-for="(letter, index) in 'GLASSOUS'.split('')" 
            :key="index"
            :class="['letter-page', { 
              'active': currentPage === index + 1, 
              'hovered': hoveredPage === index + 1 
            }]"
            @click="goToPage(index + 1)"
            @mouseenter="hoveredPage = index + 1"
            @mouseleave="hoveredPage = null"
          >
            {{ letter }}
            <div 
              v-if="hoveredPage === index + 1 && hoveredPage !== currentPage" 
              class="page-hint"
            >
              第 {{ hoveredPage }} 页
            </div>
          </span>
        </div>
        <div class="page-indicator" @click="showPageInput = true" v-if="!showPageInput">
          第 {{ currentPage }} 页
        </div>
        <div class="page-input-container" v-if="showPageInput">
          <span>第</span>
          <input 
            ref="pageInput"
            v-model="inputPage" 
            type="number" 
            min="1" 
            max="8"
            class="page-input"
            @keyup.enter="jumpToPage"
            @blur="cancelPageInput"
          />
          <span>页</span>
          <button @click="jumpToPage" class="jump-button">跳转</button>
          <button @click="cancelPageInput" class="cancel-button">取消</button>
        </div>
      </div>
    </div>

    <!-- 无结果 -->
    <div v-else-if="hasSearched && searchResults.length === 0" class="no-results">
      <div class="no-results-icon">🔍</div>
      <h3>未找到相关结果</h3>
      <p>尝试使用不同的关键词或检查拼写</p>
      <button @click="searchQuery = ''; hasSearched = false" class="new-search-button">
        重新搜索
      </button>
    </div>

    <!-- 初始状态 -->
    <div v-else class="welcome-container">
      <div class="welcome-content">
        <div class="welcome-icon">🔍</div>
        <h3>Glassous 搜索引擎</h3>
        <p>输入关键词开始搜索</p>
        <div class="features">
          <div class="feature-item">
            <span class="feature-icon">⚡</span>
            <span>快速搜索</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🌐</span>
            <span>全网覆盖</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📄</span>
            <span>缓存支持</span>
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

.header-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 4px;
}

.page-title {
  margin: 0;
  color: var(--text-accent);
  font-size: 1.5rem;
  font-weight: 600;
}

.header-spacer {
  width: 40px;
}

/* 搜索栏 */
.search-bar {
  padding: 1rem 1.5rem 1.5rem;
}

.search-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
  max-width: 600px;
  margin: 0;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
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
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.search-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  background: var(--text-accent);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.search-button:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.search-button:disabled {
  background: var(--border-color);
  cursor: not-allowed;
  transform: none;
}

/* 主要内容区域 */
.main-content {
  margin-top: 140px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 140px);
  width: 100%;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--text-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.large {
  width: 40px;
  height: 40px;
  border-width: 3px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 1rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* 错误信息 */
.error-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(220, 53, 69, 0.1);
  border: 2px solid rgba(220, 53, 69, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.error-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.error-text h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.error-text p {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
}

.retry-button {
  background: var(--text-accent);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #5a6fd8;
}

/* 搜索结果 */
.results-container {
  max-width: 1200px;
  margin: 0;
  margin-left: 1.5rem;
  padding-left: calc(32px + 0.5rem + 5rem + 0.5rem);
}


.results-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.result-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px var(--glass-shadow);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  width: 100%;
  min-height: 120px;
}

.result-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow-medium);
}

.result-content {
  flex: 1;
}

.result-title {
  margin: 0 0 0.5rem 0;
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.3;
}

.result-url {
  margin: 0 0 0.75rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-family: monospace;
  word-break: break-all;
}

.result-abstract {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.5;
}

.result-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}



.result-arrow {
  font-size: 1.2rem;
  color: var(--text-accent);
  transition: transform 0.3s ease;
}

.result-card:hover .result-arrow {
  transform: translateX(4px);
}

/* 分页控件 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-button {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  color: var(--text-primary);
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-button:hover:not(:disabled) {
  border-color: var(--text-accent);
  background: var(--text-accent);
  color: white;
  transform: translateY(-1px);
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.page-info {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--text-accent);
  color: var(--text-accent);
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
}

/* 无结果 */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.no-results h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.5rem;
}

.no-results p {
  margin: 0 0 2rem 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.new-search-button {
  background: var(--text-accent);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.new-search-button:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

/* 欢迎页面 */
.welcome-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
}

.welcome-content {
  text-align: center;
  max-width: 500px;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.welcome-content h3 {
  margin: 0 0 1rem 0;
  color: var(--text-accent);
  font-size: 2rem;
  font-weight: 600;
}

.welcome-content p {
  margin: 0 0 2rem 0;
  color: var(--text-secondary);
  font-size: 1.2rem;
}

.features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 1.5rem;
}

.feature-item span:last-child {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

/* Glassous字母分页样式 */
.glassous-pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  margin-top: 2rem;
  padding: 2rem;
}

.glassous-letters {
  display: flex;
  gap: 0.2rem;
  align-items: baseline;
  position: relative;
  padding: 1rem 0;
}

.letter-page {
  display: inline-block;
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 30px rgba(102, 126, 234, 0.5);
  cursor: pointer;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  user-select: none;
  margin: 0 0.1rem;
}

.letter-page::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.6s ease;
  z-index: -1;
}

.letter-page:hover:not(.disabled) {
  transform: translateY(-8px) rotateX(5deg) rotateY(-2deg) scale(1.1);
  text-shadow: 
    0 0 40px rgba(102, 126, 234, 0.8),
    0 0 80px rgba(118, 75, 162, 0.6),
    0 10px 30px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.letter-page:hover:not(.disabled)::before {
  opacity: 1;
}

.letter-page.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  transform: translateY(-5px) scale(1.05);
  text-shadow: 
    0 0 50px rgba(102, 126, 234, 1),
    0 0 100px rgba(118, 75, 162, 0.8),
    0 15px 40px rgba(0, 0, 0, 0.4);
}

.letter-page.active::before {
  opacity: 1;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%);
}



.letter-page.hovered:not(.active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 35px rgba(102, 126, 234, 0.7);
}

.page-indicator {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 50%, 
    rgba(0, 0, 0, 0.05) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 0.8rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  text-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
  box-shadow: 
    0 8px 32px rgba(31, 38, 135, 0.37),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.page-hint {
  position: absolute;
  top: -3.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 
    0 8px 24px rgba(102, 126, 234, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 10;
  opacity: 0;
  animation: fadeInHint 0.2s ease-in-out forwards;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.page-hint::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #667eea;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

@keyframes fadeInHint {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .search-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
    margin-top: 120px;
  }
  
  .search-input-group {
    flex-direction: column;
  }
  
  .search-button {
    justify-content: center;
  }
  
  .result-card {
    flex-direction: column;
    gap: 1rem;
  }
  
  .result-actions {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .features {
    gap: 1rem;
  }
  
  .feature-item {
    flex: 1;
    min-width: 120px;
  }
  
  .glassous-letters {
    gap: 0.1rem;
  }
  
  .letter-page {
    font-size: 2rem;
    margin: 0 0.05rem;
  }
  
  .page-hint {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.2rem;
  }
  
  .welcome-content h3 {
    font-size: 1.5rem;
  }
  
  .welcome-content p {
    font-size: 1rem;
  }
  
  .result-card {
    padding: 1rem;
  }
  
  .error-message {
    flex-direction: column;
    text-align: center;
  }
}
</style>