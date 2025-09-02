<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 诗词数据
const poemData = ref({
  text: '',
  type: '',
  model: '',
  result: [],
  pinyin: []
})
const loading = ref(false)
const error = ref('')
const apiSource = ref('pearktrue.cn')
const lastUpdateTime = ref('')

// 表单数据
const formData = ref({
  text: '',
  type: 'wuyan',
  model: 'head'
})

// 选项配置
const typeOptions = [
  { value: 'wuyan', label: '五言诗' },
  { value: 'qiyan', label: '七言诗' }
]

const modelOptions = [
  { value: 'head', label: '藏头诗' },
  { value: 'trail', label: '藏尾诗' }
]

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

// 复制诗词到剪贴板
const copyPoem = async () => {
  try {
    const poemText = poemData.value.result.join('\n')
    await navigator.clipboard.writeText(poemText)
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

// 获取诗词生成数据
const fetchPoem = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // 验证输入
    if (!formData.value.text.trim()) {
      error.value = '请输入要生成诗词的文字内容'
      return
    }
    
    // 判断是否为本地开发环境
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    
    // 构建API参数
    const params = new URLSearchParams({
      type: formData.value.type,
      model: formData.value.model,
      text: formData.value.text.trim()
    })
    
    // 根据环境选择API地址
    const apiUrl = isDevelopment 
      ? `/api/poem_generate/?${params.toString()}`
      : `https://api.pearktrue.cn/api/poem_generate/?${params.toString()}`
    
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
      poemData.value = {
        text: result.text || '',
        type: result.type || '',
        model: result.model || '',
        result: result.data?.result || [],
        pinyin: result.data?.pinyin || []
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
    let errorMessage = '生成诗词失败，请检查网络连接或稍后重试'
    
    if (err.message.includes('JSON.parse')) {
      errorMessage = 'API返回数据格式错误，可能是服务器问题'
    } else if (err.message.includes('Failed to fetch') || err.message.includes('网络')) {
      errorMessage = '网络连接失败，请检查网络或稍后重试'
    } else if (err.message.includes('HTTP请求失败')) {
      errorMessage = `服务器错误：${err.message}`
    } else if (err.message.includes('不是JSON格式')) {
      errorMessage = 'API服务异常，返回了错误的数据格式'
    } else if (err.message.includes('输入')) {
      errorMessage = err.message
    }
    
    error.value = errorMessage
    lastUpdateTime.value = 'Error'
    console.error('诗词生成API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
  }
}

// 生成诗词
const generatePoem = () => {
  fetchPoem()
}

// 重新生成，回到初始输入状态
const resetToInput = () => {
  // 重置数据，回到初始输入状态
  poemData.value = {
    text: '',
    type: '',
    model: '',
    result: [],
    pinyin: []
  }
  error.value = ''
  lastUpdateTime.value = ''
}

// 获取类型标签
const getTypeLabel = (type) => {
  const option = typeOptions.find(opt => opt.value === type)
  return option ? option.label : type
}

// 获取模式标签
const getModelLabel = (model) => {
  const option = modelOptions.find(opt => opt.value === model)
  return option ? option.label : model
}

// 组件挂载时不自动获取，等待用户输入
onMounted(() => {
  // 不自动生成诗词，等待用户操作
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
      <h2 class="page-title">藏头藏尾诗词生成</h2>
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
    <!-- 参数设置区域（仅在未生成诗词时显示） -->
    <div v-if="!poemData.result.length" class="form-section">
      <h3>📜 藏头藏尾诗词生成</h3>
      
      <div class="form-card">
        <div class="intro-text">
          <p>🎯 根据您的文字创作优美诗词！</p>
          <p>💡 支持藏头诗和藏尾诗生成</p>
        </div>
        
        <div class="form-group">
          <label for="text">诗词内容：</label>
          <input 
            id="text"
            v-model="formData.text" 
            type="text" 
            placeholder="请输入要生成诗词的文字（如：我爱你）"
            class="form-input"
            @keyup.enter="generatePoem"
          />
          <div class="input-hint">支持任意长度的文字内容</div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="type">诗词类型：</label>
            <select id="type" v-model="formData.type" class="form-select">
              <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="model">生成模式：</label>
            <select id="model" v-model="formData.model" class="form-select">
              <option v-for="option in modelOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
        
        <button 
          class="generate-button" 
          @click="generatePoem"
          :disabled="loading || !formData.text.trim()"
        >
          {{ loading ? '生成中...' : '🎲 生成诗词' }}
        </button>
        
        <div class="tips">
          <p>💡 创作提示：</p>
          <ul>
            <li>输入有意义的文字效果更佳</li>
            <li>五言：每句5个字，七言：每句7个字</li>
            <li>藏头：将文字藏在每句开头</li>
            <li>藏尾：将文字藏在每句结尾</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在为您创作诗词...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button class="retry-button" @click="generatePoem" v-if="formData.text.trim()">重试</button>
    </div>

    <!-- 诗词展示 -->
    <div v-if="!loading && !error && poemData.result.length" class="poem-section">
      <div class="poem-card">
        <div class="poem-header">
          <h2 class="poem-title">📜 诗词作品</h2>
          <div class="poem-meta">
            <span class="meta-item">{{ getTypeLabel(poemData.type) }}</span>
            <span class="meta-item">{{ getModelLabel(poemData.model) }}</span>
            <span class="meta-item">{{ poemData.text }}</span>
          </div>
        </div>
        
        <!-- 诗词内容 -->
        <div class="poem-content">
          <div class="poem-verses">
            <div 
              v-for="(verse, index) in poemData.result" 
              :key="index" 
              class="verse-container"
            >
              <!-- 显示拼音（在字的上方） -->
              <div v-if="poemData.pinyin[index]" class="verse-pinyin">
                <span 
                  v-for="(pinyin, pinyinIndex) in poemData.pinyin[index].split(',')"
                  :key="pinyinIndex"
                  class="pinyin-char"
                >
                  {{ pinyin.trim() }}
                </span>
              </div>
              <!-- 显示汉字 -->
              <div class="verse-line">
                <span 
                  v-for="(char, charIndex) in verse.split('')"
                  :key="charIndex"
                  class="chinese-char"
                >
                  {{ char }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="copy-button" @click="copyPoem" v-if="poemData.result.length">
            📋 复制诗词
          </button>
          <button class="refresh-button" @click="resetToInput">
            🔄 重新生成
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

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 1rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid var(--glass-border);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-hint {
  margin-top: 0.3rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.generate-button {
  width: 100%;
  background: linear-gradient(135deg, #9c27b0, #673ab7);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(156, 39, 176, 0.3);
  margin-bottom: 1.5rem;
}

.generate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(156, 39, 176, 0.4);
}

.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tips {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid #9c27b0;
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

/* 诗词展示区域 */
.poem-section {
  margin-top: 2rem;
}

.poem-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
  transition: all 0.3s ease;
}

.poem-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.poem-header {
  margin-bottom: 2rem;
  text-align: center;
  border-bottom: 2px solid var(--glass-border);
  padding-bottom: 1rem;
}

.poem-title {
  color: var(--text-accent);
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
}

.poem-meta {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 500;
}

.poem-content {
  margin-bottom: 2rem;
}

.poem-verses {
  text-align: center;
  margin-bottom: 2rem;
}

.verse-container {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.verse-pinyin {
  display: flex;
  justify-content: center;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
}

.pinyin-char {
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--text-secondary);
  min-width: 2.5rem;
  text-align: center;
  line-height: 1.2;
}

.verse-line {
  display: flex;
  justify-content: center;
  gap: 0.3rem;
}

.chinese-char {
  font-family: 'Microsoft YaHei', '微软雅黑', serif;
  font-size: 1.8rem;
  color: var(--text-primary);
  font-weight: 500;
  letter-spacing: 0.1em;
  min-width: 2.5rem;
  text-align: center;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.copy-button,
.refresh-button {
  background: linear-gradient(135deg, #9c27b0, #673ab7);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(156, 39, 176, 0.3);
}

.copy-button:hover,
.refresh-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(156, 39, 176, 0.4);
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
  .poem-card {
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .poem-meta {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .copy-button,
  .refresh-button {
    width: 100%;
    max-width: 200px;
  }
  
  .chinese-char {
    font-size: 1.5rem;
    min-width: 2rem;
  }
  
  .pinyin-char {
    font-size: 0.7rem;
    min-width: 2rem;
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
  .poem-card {
    padding: 1rem;
  }
  
  .poem-title {
    font-size: 1.5rem;
  }
  
  .chinese-char {
    font-size: 1.3rem;
    min-width: 1.8rem;
  }
  
  .pinyin-char {
    font-size: 0.65rem;
    min-width: 1.8rem;
  }
}
</style>