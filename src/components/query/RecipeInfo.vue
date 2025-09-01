<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 菜谱数据
const recipeData = ref([])
const loading = ref(false)
const error = ref('')
const apiSource = ref('api.pearktrue.cn')
const lastUpdateTime = ref('')
const searchKeyword = ref('')
const hasSearched = ref(false)

// 获取菜谱数据
const fetchRecipes = async (keyword) => {
  if (!keyword.trim()) {
    error.value = '请输入要搜索的菜谱名称'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.pearktrue.cn/api/cookbook/?search=${encodeURIComponent(keyword)}`)
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data) {
      recipeData.value = result.data
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
    error.value = '获取菜谱数据失败，请检查网络连接'
    lastUpdateTime.value = 'Error'
    console.error('菜谱API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
  }
}

// 搜索菜谱
const searchRecipes = () => {
  if (searchKeyword.value.trim()) {
    fetchRecipes(searchKeyword.value.trim())
  }
}

// 键盘事件处理
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    searchRecipes()
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

// 截取描述文本
const truncateDescription = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 快速搜索建议
const quickSearchSuggestions = [
  '水煮鱼', '红烧肉', '宫保鸡丁', '糖醋排骨', '麻婆豆腐',
  '回锅肉', '鱼香肉丝', '西红柿鸡蛋', '青椒肉丝', '可乐鸡翅'
]

// 快速搜索
const quickSearch = (keyword) => {
  searchKeyword.value = keyword
  searchRecipes()
}

// 组件挂载时的初始化
onMounted(() => {
  // 不自动搜索，等待用户输入
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
      <h2 class="page-title">菜谱信息大全</h2>
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
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="请输入菜谱名称，如：披萨"
          class="search-input"
          @keypress="handleKeyPress"
        />
        <button 
          class="search-button"
          @click="searchRecipes"
          :disabled="loading"
        >
          {{ loading ? '搜索中...' : '🔍 搜索' }}
        </button>
      </div>
      
      <!-- 快速搜索建议 -->
      <div class="quick-search">
        <span class="quick-label">热门搜索：</span>
        <div class="suggestion-tags">
          <button
            v-for="suggestion in quickSearchSuggestions"
            :key="suggestion"
            class="suggestion-tag"
            @click="quickSearch(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在搜索菜谱...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 菜谱数据展示 -->
    <div v-if="!loading && !error && hasSearched" class="recipe-section">
      <div v-if="recipeData.length === 0" class="no-results">
        没有找到相关菜谱，请尝试其他关键词
      </div>
      
      <div v-if="recipeData.length > 0" class="recipe-container">
        <div 
          v-for="(recipe, index) in recipeData" 
          :key="index"
          class="recipe-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="recipe-header">
            <div class="recipe-info">
              <h4 class="recipe-name">{{ recipe.name }}</h4>
              <p class="recipe-description">{{ truncateDescription(recipe.description, 120) }}</p>
            </div>
          </div>
          
          <div class="recipe-details">
            <!-- 食材列表 -->
            <div class="materials-section">
              <h5 class="section-title">🥘 所需食材</h5>
              <div class="materials-list">
                <span 
                  v-for="(material, idx) in recipe.materials" 
                  :key="idx"
                  class="material-tag"
                >
                  {{ material }}
                </span>
              </div>
            </div>
            
            <!-- 制作步骤 -->
            <div class="practice-section">
              <h5 class="section-title">📝 制作步骤</h5>
              <div class="practice-list">
                <div 
                  v-for="(step, idx) in recipe.practice" 
                  :key="idx"
                  class="practice-step"
                >
                  <span class="step-number">{{ idx + 1 }}</span>
                  <span class="step-text">{{ step }}</span>
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
  gap: 1rem;
  margin-bottom: 1.5rem;
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

/* 菜谱数据区域 */
.recipe-section {
  margin-top: 1rem;
}

.recipe-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.recipe-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.recipe-card {
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
  animation: slideInUp 0.6s ease forwards;
  width: 100%;
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.recipe-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.recipe-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.recipe-info {
  width: 100%;
}

.recipe-name {
  color: var(--text-accent);
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 0.8rem 0;
  word-wrap: break-word;
}

.recipe-description {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

.recipe-details {
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

.materials-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.material-tag {
  padding: 0.3rem 0.8rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  color: var(--text-primary);
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.material-tag:hover {
  background: var(--text-accent);
  color: white;
  transform: scale(1.05);
}

.practice-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.practice-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.practice-step:hover {
  background: rgba(255, 255, 255, 0.1);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--text-accent);
  color: white;
  border-radius: 50%;
  font-size: 0.9rem;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.step-text {
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.6;
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .recipe-card {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .search-container {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .quick-search {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .recipe-header {
    text-align: center;
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
  
  .recipe-card {
    padding: 1.5rem;
  }
}
</style>