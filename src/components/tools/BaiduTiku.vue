<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 百度题库搜索相关状态
const question = ref('')
const isLoading = ref(false)
const result = ref(null)
const error = ref('')
const searchHistory = ref([])

// 从localStorage加载搜索历史
onMounted(() => {
  const saved = localStorage.getItem('baidu-tiku-history')
  if (saved) {
    searchHistory.value = JSON.parse(saved)
  }
})

// 保存搜索历史到localStorage
const saveSearchHistory = (query) => {
  if (!query.trim()) return
  
  // 避免重复，删除已存在的相同查询
  searchHistory.value = searchHistory.value.filter(item => item !== query.trim())
  
  // 添加到开头
  searchHistory.value.unshift(query.trim())
  
  // 限制历史记录数量
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }
  
  localStorage.setItem('baidu-tiku-history', JSON.stringify(searchHistory.value))
}

// 搜索题目答案
const searchAnswer = async () => {
  if (!question.value.trim()) {
    error.value = '请输入题目内容'
    return
  }

  isLoading.value = true
  error.value = ''
  result.value = null

  try {
    const response = await fetch(`https://api.pearktrue.cn/api/baidutiku/?question=${encodeURIComponent(question.value.trim())}`)
    const data = await response.json()

    if (data.code === 200) {
      result.value = {
        question: data.data.question,
        options: data.data.options || [],
        answer: data.data.answer,
        message: data.msg
      }
      
      // 保存搜索历史
      saveSearchHistory(question.value.trim())
    } else {
      error.value = data.msg || '搜索失败，请检查题目内容'
    }
  } catch (err) {
    console.error('搜索失败:', err)
    error.value = '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 使用历史记录搜索
const useHistorySearch = (historyQuestion) => {
  question.value = historyQuestion
  searchAnswer()
}

// 清空搜索历史
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('baidu-tiku-history')
}

// 复制题目到剪贴板
const copyQuestion = async () => {
  if (result.value?.question) {
    try {
      await navigator.clipboard.writeText(result.value.question)
      // 可以添加一个简单的提示
      const button = document.querySelector('.copy-question-btn')
      const originalText = button.textContent
      button.textContent = '已复制!'
      setTimeout(() => {
        button.textContent = originalText
      }, 2000)
    } catch (err) {
      console.error('复制失败:', err)
      error.value = '复制失败，请手动选择文本复制'
    }
  }
}

// 复制答案到剪贴板
const copyAnswer = async () => {
  if (result.value?.answer) {
    try {
      const answerText = `题目：${result.value.question}\n\n选项：\n${result.value.options.map((opt, index) => `${String.fromCharCode(65 + index)}. ${opt}`).join('\n')}\n\n${result.value.answer}`
      await navigator.clipboard.writeText(answerText)
      // 可以添加一个简单的提示
      const button = document.querySelector('.copy-answer-btn')
      const originalText = button.textContent
      button.textContent = '已复制!'
      setTimeout(() => {
        button.textContent = originalText
      }, 2000)
    } catch (err) {
      console.error('复制失败:', err)
      error.value = '复制失败，请手动选择文本复制'
    }
  }
}

// 清空结果
const clearResult = () => {
  result.value = null
  error.value = ''
  question.value = ''
}

// 处理键盘事件
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    searchAnswer()
  }
}

// 获取答案选项字母
const getOptionLetter = (index) => {
  return String.fromCharCode(65 + index) // A, B, C, D...
}

// 解析答案中的正确选项
const parseCorrectAnswer = (answer) => {
  if (!answer) return ''
  
  // 提取答案中的字母（如从"[对旳答案] C"中提取"C"）
  const match = answer.match(/[A-Z]/g)
  return match ? match.join('、') : answer
}

// 返回主页
const goBack = () => {
  const from = route.query.from
  if (from === 'home') {
    router.push('/')
  } else if (from === 'tools') {
    router.push('/tools')
  } else {
    // 默认返回首页
    router.push('/')
  }
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
      <h2 class="page-title">百度题库搜索</h2>
      <button class="clear-button" @click="clearResult" v-if="result">
        <span class="clear-icon">✕</span>
      </button>
      <div v-else style="width: 40px;"></div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 搜索表单区域 -->
    <section class="search-section">
      <div class="search-form">
        <h3>🔍 百度题库搜索</h3>
        <p class="description">输入题目内容，快速获取正确答案和选项解析</p>
        
        <div class="form-group">
          <label>题目内容</label>
          <div class="input-group">
            <textarea 
              v-model="question"
              placeholder="请输入完整的题目内容，包括题干和选项..."
              class="question-input"
              @keydown.ctrl.enter="searchAnswer"
              :disabled="isLoading"
              rows="4"
            ></textarea>
          </div>
          <div class="input-hint">
            💡 提示：输入完整题目可获得更准确的答案，支持Ctrl+Enter快速搜索
          </div>
        </div>

        <div class="search-action">
          <button 
            @click="searchAnswer"
            class="search-button"
            :disabled="isLoading || !question.trim()"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <span v-else>🎯</span>
            {{ isLoading ? '搜索中...' : '搜索答案' }}
          </button>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ error }}
        </div>

        <!-- 搜索历史 -->
        <div v-if="searchHistory.length > 0" class="search-history">
          <div class="history-header">
            <h4>📚 搜索历史</h4>
            <button @click="clearHistory" class="clear-history-btn">清空</button>
          </div>
          <div class="history-list">
            <button 
              v-for="(item, index) in searchHistory" 
              :key="index"
              @click="useHistorySearch(item)"
              class="history-item"
              :disabled="isLoading"
            >
              {{ item }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 搜索结果区域 -->
    <section v-if="result" class="result-section">
      <div class="result-card">
        <h3>✅ 找到答案</h3>
        
        <!-- 题目显示 -->
        <div class="question-display">
          <div class="section-header">
            <h4>📝 题目</h4>
            <button @click="copyQuestion" class="copy-btn copy-question-btn">
              <span class="btn-icon">📋</span>
              复制题目
            </button>
          </div>
          <div class="question-content">
            {{ result.question }}
          </div>
        </div>

        <!-- 选项显示 -->
        <div v-if="result.options && result.options.length > 0" class="options-display">
          <h4>📋 选项</h4>
          <div class="options-list">
            <div 
              v-for="(option, index) in result.options" 
              :key="index"
              class="option-item"
              :class="{ 
                'correct-option': parseCorrectAnswer(result.answer).includes(getOptionLetter(index))
              }"
            >
              <span class="option-letter">{{ getOptionLetter(index) }}</span>
              <span class="option-text">{{ option }}</span>
              <span v-if="parseCorrectAnswer(result.answer).includes(getOptionLetter(index))" class="correct-mark">✓</span>
            </div>
          </div>
        </div>

        <!-- 答案显示 */
        <div class="answer-display">
          <div class="section-header">
            <h4>🎯 正确答案</h4>
            <button @click="copyAnswer" class="copy-btn copy-answer-btn">
              <span class="btn-icon">📄</span>
              复制完整答案
            </button>
          </div>
          <div class="answer-content">
            {{ result.answer }}
          </div>
        </div>

        <!-- 搜索信息 -->
        <div class="search-info">
          <p><strong>搜索状态：</strong>{{ result.message }}</p>
        </div>
      </div>
    </section>
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

.back-button, .clear-button {
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

.back-button:hover, .clear-button:hover {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transform: translateY(-1px);
}

.back-icon, .clear-icon {
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

/* 主要内容区域 */
.main-content {
  margin-top: 60px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 60px);
  width: 100%;
}

/* 搜索表单区域 */
.search-section {
  margin-bottom: 2rem;
}

.search-form {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.search-form h3 {
  color: var(--text-accent);
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

/* 表单组 */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.input-group {
  margin-bottom: 0.5rem;
}

.question-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;
}

.question-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.input-hint {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

/* 搜索按钮 */
.search-action {
  margin-bottom: 1rem;
}

.search-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: var(--text-accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
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

/* 加载动画 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误提示 */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.error-icon {
  font-size: 1rem;
}

/* 搜索历史 */
.search-history {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.history-header h4 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1rem;
}

.clear-history-btn {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-history-btn:hover {
  background: var(--glass-bg);
  color: var(--text-primary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.history-item:hover:not(:disabled) {
  background: var(--text-accent);
  color: white;
  transform: translateY(-1px);
}

.history-item:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 结果区域 */
.result-section {
  animation: slideInUp 0.5s ease;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.result-card h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.result-card h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1rem;
}

/* 题目显示 */
.question-display {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.question-content {
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 1rem;
}

/* 选项显示 */
.options-display {
  margin-bottom: 2rem;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.option-item.correct-option {
  background: rgba(40, 167, 69, 0.1);
  border-color: #28a745;
}

.option-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--text-accent);
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.correct-option .option-letter {
  background: #28a745;
}

.option-text {
  flex: 1;
  color: var(--text-primary);
  line-height: 1.4;
}

.correct-mark {
  color: #28a745;
  font-size: 1.2rem;
  font-weight: bold;
}

/* 答案显示 */
.answer-display {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(40, 167, 69, 0.1);
  border: 2px solid #28a745;
  border-radius: 12px;
}

.answer-content {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1.1rem;
  line-height: 1.4;
}

/* 复制按钮 */
.copy-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--text-accent);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1rem;
}

/* 搜索信息 */
.search-info {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.search-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.search-info strong {
  color: var(--text-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .search-form {
    padding: 1.5rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .option-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .option-letter {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.2rem;
  }
  
  .search-form {
    padding: 1rem;
  }
  
  .result-card {
    padding: 1.5rem;
  }
  
  .question-input {
    min-height: 80px;
  }
}
</style>