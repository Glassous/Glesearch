<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 脑筋急转弯数据
const brainTeaserData = ref({
  question: '',
  answer: ''
})
const loading = ref(false)
const error = ref('')
const apiSource = ref('pearktrue.cn')
const lastUpdateTime = ref('')
const showAnswer = ref(false)

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

// 复制问题到剪贴板
const copyQuestion = async () => {
  try {
    await navigator.clipboard.writeText(brainTeaserData.value.question)
    // 简单的提示反馈
    const button = document.querySelector('.copy-button')
    const originalText = button.textContent
    button.textContent = '已复制!'
    button.style.background = '#4caf50'
    setTimeout(() => {
      button.textContent = originalText
      button.style.background = ''
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制文本')
  }
}

// 复制答案到剪贴板
const copyAnswer = async () => {
  try {
    await navigator.clipboard.writeText(brainTeaserData.value.answer)
    // 简单的提示反馈
    const button = document.querySelector('.copy-answer-button')
    const originalText = button.textContent
    button.textContent = '已复制!'
    button.style.background = '#4caf50'
    setTimeout(() => {
      button.textContent = originalText
      button.style.background = ''
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制文本')
  }
}

// 获取脑筋急转弯数据
const fetchBrainTeaser = async () => {
  try {
    loading.value = true
    error.value = ''
    showAnswer.value = false
    
    // 判断是否为本地开发环境
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    
    // 根据环境选择API地址
    const apiUrl = isDevelopment 
      ? `/api/brainteasers/`
      : `https://api.pearktrue.cn/api/brainteasers/`
    
    console.log('请求URL:', apiUrl) // 调试日志
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    console.log('响应状态:', response.status, response.statusText) // 调试日志
    
    if (!response.ok) {
      throw new Error(`HTTP请求失败: ${response.status} ${response.statusText}`)
    }
    
    // 检查响应内容类型
    const contentType = response.headers.get('content-type')
    console.log('响应Content-Type:', contentType) // 调试日志
    
    if (!contentType || !contentType.includes('application/json')) {
      // 如果不是JSON响应，获取文本内容用于调试
      const textResponse = await response.text()
      console.error('非JSON响应内容:', textResponse)
      throw new Error('API返回的不是JSON格式数据，可能是服务器错误')
    }
    
    const result = await response.json()
    console.log('API返回数据:', result) // 调试日志
    
    if (result && result.code === 200) {
      brainTeaserData.value = {
        question: result.data.question || '',
        answer: result.data.answer || ''
      }
      
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
      throw new Error(result.msg || result.message || 'API返回数据异常')
    }
  } catch (err) {
    // 增强错误处理
    let errorMessage = '获取脑筋急转弯失败，请检查网络连接或稍后重试'
    
    if (err.message.includes('JSON.parse')) {
      errorMessage = 'API返回数据格式错误，可能是服务器问题'
    } else if (err.message.includes('Failed to fetch') || err.message.includes('网络')) {
      errorMessage = '网络连接失败，请检查网络或稍后重试'
    } else if (err.message.includes('HTTP请求失败')) {
      errorMessage = `服务器错误：${err.message}`
    } else if (err.message.includes('不是JSON格式')) {
      errorMessage = 'API服务异常，返回了错误的数据格式'
    }
    
    error.value = errorMessage
    lastUpdateTime.value = 'Error'
    console.error('脑筋急转弯API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
  }
}

// 获取新的脑筋急转弯
const getNewBrainTeaser = () => {
  fetchBrainTeaser()
}

// 显示答案
const toggleAnswer = () => {
  showAnswer.value = !showAnswer.value
}

// 组件挂载时不自动获取，等待用户点击
onMounted(() => {
  // 不自动获取脑筋急转弯，等待用户操作
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
      <h2 class="page-title">脑筋急转弯</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div class="update-time" :class="{ 'error-status': lastUpdateTime === 'Error' }">
          {{ lastUpdateTime === 'Error' ? 'Error' : '更新时间: ' + lastUpdateTime }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 功能介绍区域（仅在未获取题目时显示） -->
    <div v-if="!brainTeaserData.question" class="form-section">
      <h3>🧠 脑筋急转弯挑战</h3>
      
      <div class="form-card">
        <div class="intro-text">
          <p>🎯 挑战你的思维，锻炼你的大脑！</p>
          <p>💡 每道题都有出人意料的答案</p>
        </div>
        
        <button 
          class="generate-button" 
          @click="getNewBrainTeaser"
          :disabled="loading"
        >
          {{ loading ? '获取中...' : '🎲 来一道新题目' }}
        </button>
        
        <div class="tips">
          <p>💡 游戏提示：</p>
          <ul>
            <li>仔细思考问题的关键词</li>
            <li>跳出常规思维模式</li>
            <li>答案往往出人意料</li>
            <li>享受思考的乐趣！</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在获取脑筋急转弯题目...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button class="retry-button" @click="getNewBrainTeaser">重试</button>
    </div>

    <!-- 脑筋急转弯展示 -->
    <div v-if="!loading && !error && brainTeaserData.question" class="brain-teaser-section">
      <div class="brain-teaser-card">
        <div class="brain-teaser-header">
          <h2 class="brain-teaser-title">🤔 思考时间</h2>
        </div>
        
        <!-- 问题内容 -->
        <div class="question-content">
          <h4>❓ 题目：</h4>
          <div class="question-text">{{ brainTeaserData.question }}</div>
        </div>
        
        <!-- 答案区域 -->
        <div class="answer-section">
          <button 
            class="reveal-answer-button" 
            @click="toggleAnswer"
            :class="{ 'answer-revealed': showAnswer }"
          >
            {{ showAnswer ? '🙈 隐藏答案' : '👁️ 查看答案' }}
          </button>
          
          <div v-if="showAnswer" class="answer-content">
            <h4>💡 答案：</h4>
            <div class="answer-text">{{ brainTeaserData.answer }}</div>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="copy-button" @click="copyQuestion" v-if="brainTeaserData.question">
            📋 复制题目
          </button>
          <button class="copy-answer-button" @click="copyAnswer" v-if="showAnswer && brainTeaserData.answer">
            📋 复制答案
          </button>
          <button class="refresh-button" @click="getNewBrainTeaser">
            🔄 换一题
          </button>
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

/* 表单设置区域 */
.form-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
  text-align: center;
}

.form-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
  transition: all 0.3s ease;
}

.form-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.intro-text {
  text-align: center;
  margin-bottom: 1.5rem;
}

.intro-text p {
  margin: 0.5rem 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
}

.generate-button {
  width: 100%;
  background: linear-gradient(135deg, #1890ff, #52c41a);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
  margin-bottom: 1.5rem;
}

.generate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
}

.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tips {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid #1890ff;
}

.tips p {
  margin: 0 0 0.5rem 0;
  color: var(--text-accent);
  font-weight: 600;
}

.tips ul {
  margin: 0;
  padding-left: 1.2rem;
  color: var(--text-secondary);
}

.tips li {
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
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
  gap: 1rem;
  align-items: center;
}

.retry-button {
  background: #d32f2f;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #b71c1c;
  transform: translateY(-1px);
}

/* 脑筋急转弯展示区域 */
.brain-teaser-section {
  margin-top: 2rem;
}

.brain-teaser-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
  transition: all 0.3s ease;
}

.brain-teaser-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.brain-teaser-header {
  margin-bottom: 2rem;
  text-align: center;
  border-bottom: 2px solid var(--glass-border);
  padding-bottom: 1rem;
}

.brain-teaser-title {
  color: var(--text-accent);
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
}

.question-content {
  margin-bottom: 2rem;
}

.question-content h4 {
  color: var(--text-accent);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.question-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 1.2rem;
  line-height: 1.6;
  color: var(--text-primary);
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border-left: 4px solid #1890ff;
  font-weight: 500;
}

.answer-section {
  margin-bottom: 2rem;
  text-align: center;
}

.reveal-answer-button {
  background: linear-gradient(135deg, #722ed1, #531dab);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(114, 46, 209, 0.3);
  margin-bottom: 1rem;
}

.reveal-answer-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(114, 46, 209, 0.4);
}

.reveal-answer-button.answer-revealed {
  background: linear-gradient(135deg, #52c41a, #389e0d);
  box-shadow: 0 4px 15px rgba(82, 196, 26, 0.3);
}

.reveal-answer-button.answer-revealed:hover {
  box-shadow: 0 6px 20px rgba(82, 196, 26, 0.4);
}

.answer-content {
  animation: fadeInUp 0.5s ease;
}

.answer-content h4 {
  color: var(--text-accent);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.answer-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 1.2rem;
  line-height: 1.6;
  color: var(--text-primary);
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border-left: 4px solid #52c41a;
  font-weight: 600;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.copy-button,
.copy-answer-button,
.refresh-button {
  background: linear-gradient(135deg, #52c41a, #389e0d);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(82, 196, 26, 0.3);
}

.copy-button:hover,
.copy-answer-button:hover,
.refresh-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(82, 196, 26, 0.4);
}

.refresh-button {
  background: linear-gradient(135deg, #1890ff, #096dd9);
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
}

.refresh-button:hover {
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .form-card,
  .brain-teaser-card {
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .copy-button,
  .copy-answer-button,
  .refresh-button {
    width: 100%;
    max-width: 200px;
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
  
  .form-card,
  .brain-teaser-card {
    padding: 1rem;
  }
  
  .brain-teaser-title {
    font-size: 1.5rem;
  }
  
  .question-text,
  .answer-text {
    font-size: 1.1rem;
  }
}
</style>