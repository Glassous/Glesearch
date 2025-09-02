<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 网名数据
const nameData = ref({
  name: '',
  count: 0,
  data: []
})
const loading = ref(false)
const error = ref('')
const apiSource = ref('pearktrue.cn')
const lastUpdateTime = ref('')

// 表单数据
const formData = ref({
  name: ''
})

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

// 复制网名到剪贴板
const copyName = async (nickname) => {
  try {
    await navigator.clipboard.writeText(nickname)
    // 简单的提示反馈
    const button = event.target
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

// 复制所有网名
const copyAllNames = async () => {
  try {
    const allNames = nameData.value.data.join('\n')
    await navigator.clipboard.writeText(allNames)
    // 简单的提示反馈
    const button = document.querySelector('.copy-all-button')
    const originalText = button.textContent
    button.textContent = '已复制全部!'
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

// 获取谐音梗网名数据
const fetchNames = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // 验证输入
    if (!formData.value.name.trim()) {
      error.value = '请输入姓氏'
      return
    }
    
    // 判断是否为本地开发环境
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    
    // 构建API参数
    const params = new URLSearchParams({
      name: formData.value.name.trim()
    })
    
    // 根据环境选择API地址
    const apiUrl = isDevelopment 
      ? `/api/namexy/?${params.toString()}`
      : `https://api.pearktrue.cn/api/namexy/?${params.toString()}`
    
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
      nameData.value = {
        name: result.name || '',
        count: result.count || 0,
        data: result.data || []
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
    let errorMessage = '生成网名失败，请检查网络连接或稍后重试'
    
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
    console.error('谐音梗网名API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
  }
}

// 生成网名
const generateNames = () => {
  fetchNames()
}

// 重新生成，回到初始输入状态
const resetToInput = () => {
  // 重置数据，回到初始输入状态
  nameData.value = {
    name: '',
    count: 0,
    data: []
  }
  error.value = ''
  lastUpdateTime.value = ''
}

// 示例数据填充
const fillExample = () => {
  formData.value = {
    name: '叶'
  }
}

// 组件挂载时不自动生成，等待用户输入
onMounted(() => {
  // 不自动生成网名，等待用户操作
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
      <h2 class="page-title">姓氏谐音梗网名生成器</h2>
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
    <!-- 参数设置区域（仅在未生成网名时显示） -->
    <div v-if="!nameData.data.length" class="form-section">
      <h3>😄 姓氏谐音梗网名生成器</h3>
      
      <div class="form-card">
        <div class="intro-text">
          <p>🎯 输入您的姓氏，生成趣味谐音梗网名！</p>
          <p>💡 让您的网名更有创意和幽默感</p>
        </div>
        
        <div class="form-group">
          <label for="name">请输入姓氏：</label>
          <input 
            id="name"
            v-model="formData.name" 
            type="text" 
            placeholder="请输入您的姓氏（如：叶）"
            class="form-input"
            @keyup.enter="generateNames"
            maxlength="10"
          />
          <div class="input-hint">支持输入中文姓氏，建议输入1-2个字</div>
        </div>
        
        <div class="button-group">
          <button 
            class="example-button" 
            @click="fillExample"
          >
            📝 填充示例
          </button>
          
          <button 
            class="generate-button" 
            @click="generateNames"
            :disabled="loading || !formData.name.trim()"
          >
            {{ loading ? '生成中...' : '😄 生成网名' }}
          </button>
        </div>
        
        <div class="tips">
          <p>💡 使用提示：</p>
          <ul>
            <li>支持常见中文姓氏</li>
            <li>生成的网名充满创意和幽默感</li>
            <li>可以点击复制单个网名或全部网名</li>
            <li>每个姓氏都有多个谐音梗变化</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在为您生成谐音梗网名...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button class="retry-button" @click="generateNames" v-if="formData.name.trim()">重试</button>
    </div>

    <!-- 网名展示 -->
    <div v-if="!loading && !error && nameData.data.length" class="names-section">
      <div class="names-card">
        <div class="names-header">
          <h2 class="names-title">😄 谐音梗网名生成成功</h2>
          <div class="names-meta">
            <span class="meta-item">姓氏：{{ nameData.name }}</span>
            <span class="meta-item">共生成：{{ nameData.count }}个网名</span>
          </div>
        </div>
        
        <!-- 网名列表 -->
        <div class="names-content">
          <div class="names-grid">
            <div 
              v-for="(nickname, index) in nameData.data" 
              :key="index" 
              class="name-item"
            >
              <div class="name-text">{{ nickname }}</div>
              <button 
                class="copy-name-button" 
                @click="copyName(nickname)"
                title="复制这个网名"
              >
                📋
              </button>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="copy-all-button" @click="copyAllNames" v-if="nameData.data.length">
            📋 复制全部网名
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

.form-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid var(--glass-border);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-hint {
  margin-top: 0.3rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.example-button {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
  flex: 1;
}

.example-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
}

.generate-button {
  background: linear-gradient(135deg, #e91e63, #c2185b);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(233, 30, 99, 0.3);
  flex: 2;
}

.generate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(233, 30, 99, 0.4);
}

.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tips {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid #e91e63;
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

/* 网名展示区域 */
.names-section {
  margin-top: 2rem;
}

.names-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
  transition: all 0.3s ease;
}

.names-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.names-header {
  margin-bottom: 2rem;
  text-align: center;
  border-bottom: 2px solid var(--glass-border);
  padding-bottom: 1rem;
}

.names-title {
  color: var(--text-accent);
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
}

.names-meta {
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

.names-content {
  margin-bottom: 2rem;
}

.names-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.name-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-secondary);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.name-item:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px var(--shadow-light);
}

.name-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
  padding-right: 1rem;
}

.copy-name-button {
  background: linear-gradient(135deg, #e91e63, #c2185b);
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(233, 30, 99, 0.3);
  flex-shrink: 0;
}

.copy-name-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.4);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.copy-all-button,
.refresh-button {
  background: linear-gradient(135deg, #e91e63, #c2185b);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(233, 30, 99, 0.3);
}

.copy-all-button:hover,
.refresh-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(233, 30, 99, 0.4);
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
  .names-card {
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .names-meta {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .copy-all-button,
  .refresh-button {
    width: 100%;
    max-width: 200px;
  }
  
  .names-grid {
    grid-template-columns: 1fr;
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
  .names-card {
    padding: 1rem;
  }
  
  .names-title {
    font-size: 1.5rem;
  }
}
</style>