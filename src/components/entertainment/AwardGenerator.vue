<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 奖状数据
const awardData = ref({
  imageUrl: ''
})
const loading = ref(false)
const error = ref('')
const apiSource = ref('pearktrue.cn')
const lastUpdateTime = ref('')

// 表单数据
const formData = ref({
  name: '',
  title: '',
  classname: ''
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

// 下载奖状图片
const downloadAward = () => {
  if (awardData.value.imageUrl) {
    const link = document.createElement('a')
    link.href = awardData.value.imageUrl
    link.download = `奖状_${formData.value.name}_${formData.value.title}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// 获取奖状生成数据
const fetchAward = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // 验证输入
    if (!formData.value.name.trim()) {
      error.value = '请输入获奖人姓名'
      return
    }
    if (!formData.value.title.trim()) {
      error.value = '请输入奖项标题'
      return
    }
    if (!formData.value.classname.trim()) {
      error.value = '请输入班级信息'
      return
    }
    
    // 判断是否为本地开发环境
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    
    // 构建API参数
    const params = new URLSearchParams({
      name: formData.value.name.trim(),
      title: formData.value.title.trim(),
      classname: formData.value.classname.trim()
    })
    
    // 根据环境选择API地址
    const apiUrl = isDevelopment 
      ? `/api/certcommend/?${params.toString()}`
      : `https://api.pearktrue.cn/api/certcommend/?${params.toString()}`
    
    console.log('请求URL:', apiUrl) // 调试日志
    
    const response = await fetch(apiUrl, {
      method: 'GET'
    })
    
    console.log('响应状态:', response.status, response.statusText) // 调试日志
    
    if (!response.ok) {
      throw new Error(`HTTP请求失败: ${response.status} ${response.statusText}`)
    }
    
    // 检查响应内容类型
    const contentType = response.headers.get('content-type')
    console.log('响应Content-Type:', contentType) // 调试日志
    
    if (contentType && contentType.includes('image')) {
      // 如果是图片响应，直接使用URL
      awardData.value = {
        imageUrl: apiUrl
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
      throw new Error('API返回的不是图片格式数据')
    }
  } catch (err) {
    // 增强错误处理
    let errorMessage = '生成奖状失败，请检查网络连接或稍后重试'
    
    if (err.message.includes('Failed to fetch') || err.message.includes('网络')) {
      errorMessage = '网络连接失败，请检查网络或稍后重试'
    } else if (err.message.includes('HTTP请求失败')) {
      errorMessage = `服务器错误：${err.message}`
    } else if (err.message.includes('不是图片格式')) {
      errorMessage = 'API服务异常，返回了错误的数据格式'
    } else if (err.message.includes('输入')) {
      errorMessage = err.message
    }
    
    error.value = errorMessage
    lastUpdateTime.value = 'Error'
    console.error('奖状生成API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
  }
}

// 生成奖状
const generateAward = () => {
  fetchAward()
}

// 重新生成，回到初始输入状态
const resetToInput = () => {
  // 重置数据，回到初始输入状态
  awardData.value = {
    imageUrl: ''
  }
  error.value = ''
  lastUpdateTime.value = ''
}

// 示例数据填充
const fillExample = () => {
  formData.value = {
    name: '皮尔诺',
    title: '三好学生',
    classname: '阳光小学9年级4班'
  }
}

// 组件挂载时不自动生成，等待用户输入
onMounted(() => {
  // 不自动生成奖状，等待用户操作
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
      <h2 class="page-title">在线奖状生成器</h2>
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
    <!-- 参数设置区域（仅在未生成奖状时显示） -->
    <div v-if="!awardData.imageUrl" class="form-section">
      <h3>🎓 在线奖状生成器</h3>
      
      <div class="form-card">
        <div class="intro-text">
          <p>🎯 制作精美的学生奖状！</p>
          <p>💡 支持自定义姓名、奖项和班级</p>
        </div>
        
        <div class="form-group">
          <label for="name">获奖人姓名：</label>
          <input 
            id="name"
            v-model="formData.name" 
            type="text" 
            placeholder="请输入获奖人姓名（如：皮尔诺）"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="title">奖项标题：</label>
          <input 
            id="title"
            v-model="formData.title" 
            type="text" 
            placeholder="请输入奖项标题（如：三好学生）"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="classname">班级信息：</label>
          <input 
            id="classname"
            v-model="formData.classname" 
            type="text" 
            placeholder="请输入班级信息（如：阳光小学9年级4班）"
            class="form-input"
          />
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
            @click="generateAward"
            :disabled="loading || !formData.name.trim() || !formData.title.trim() || !formData.classname.trim()"
          >
            {{ loading ? '生成中...' : '🎓 生成奖状' }}
          </button>
        </div>
        
        <div class="tips">
          <p>💡 使用提示：</p>
          <ul>
            <li>所有字段都是必填项</li>
            <li>奖项标题建议简洁明了</li>
            <li>班级信息格式：学校+年级+班级</li>
            <li>生成的奖状为高清图片格式</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在为您生成奖状...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button class="retry-button" @click="generateAward" v-if="formData.name.trim() && formData.title.trim() && formData.classname.trim()">重试</button>
    </div>

    <!-- 奖状展示 -->
    <div v-if="!loading && !error && awardData.imageUrl" class="award-section">
      <div class="award-card">
        <div class="award-header">
          <h2 class="award-title">🎓 奖状生成成功</h2>
          <div class="award-meta">
            <span class="meta-item">{{ formData.name }}</span>
            <span class="meta-item">{{ formData.title }}</span>
            <span class="meta-item">{{ formData.classname }}</span>
          </div>
        </div>
        
        <!-- 奖状图片展示 -->
        <div class="award-content">
          <div class="award-image-container">
            <img 
              :src="awardData.imageUrl" 
              :alt="`${formData.name}的${formData.title}奖状`"
              class="award-image"
              @error="error = '奖状图片加载失败'"
            />
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="download-button" @click="downloadAward" v-if="awardData.imageUrl">
            💾 下载奖状
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

.button-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.example-button {
  background: linear-gradient(135deg, #4caf50, #388e3c);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  flex: 1;
}

.example-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.generate-button {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
  flex: 2;
}

.generate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
}

.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tips {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid #2196f3;
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

/* 奖状展示区域 */
.award-section {
  margin-top: 2rem;
}

.award-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
  transition: all 0.3s ease;
}

.award-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.award-header {
  margin-bottom: 2rem;
  text-align: center;
  border-bottom: 2px solid var(--glass-border);
  padding-bottom: 1rem;
}

.award-title {
  color: var(--text-accent);
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
}

.award-meta {
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

.award-content {
  margin-bottom: 2rem;
}

.award-image-container {
  text-align: center;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px var(--shadow-medium);
}

.award-image {
  width: 100%;
  max-width: 800px;
  height: auto;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.award-image:hover {
  transform: scale(1.02);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.download-button,
.refresh-button {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
}

.download-button:hover,
.refresh-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
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
  .award-card {
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
  
  .award-meta {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .download-button,
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
  .award-card {
    padding: 1rem;
  }
  
  .award-title {
    font-size: 1.5rem;
  }
}
</style>