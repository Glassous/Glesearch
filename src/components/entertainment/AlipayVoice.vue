<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 语音数据
const voiceData = ref({
  content: '',
  audioUrl: ''
})
const loading = ref(false)
const error = ref('')
const apiSource = ref('pearktrue.cn')
const lastUpdateTime = ref('')

// 表单数据
const formData = ref({
  amount: ''
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

// 复制语音文本到剪贴板
const copyText = async () => {
  try {
    await navigator.clipboard.writeText(voiceData.value.content)
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

// 下载语音文件
const downloadAudio = () => {
  if (voiceData.value.audioUrl) {
    const link = document.createElement('a')
    link.href = voiceData.value.audioUrl
    link.download = `支付宝收款语音_${formData.value.amount}元.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// 获取支付宝收款语音数据
const fetchAlipayVoice = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // 确保金额参数是字符串格式
    const amountParam = String(formData.value.amount || '')
    const response = await fetch(`/api/alipay/?number=${encodeURIComponent(amountParam)}&type=json`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result && result.code === 200) {
      voiceData.value = {
        content: `支付宝到账 ${result.data.number} 元`, // 生成语音文本内容
        audioUrl: result.data.audiourl || '' // 使用正确的字段名 audiourl
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
    error.value = '生成语音失败，请检查网络连接或稍后重试'
    lastUpdateTime.value = 'Error'
    console.error('支付宝收款语音API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
  }
}

// 生成收款语音
const generateVoice = () => {
  // 将数字转换为字符串再检查
  const amountStr = String(formData.value.amount || '').trim()
  if (!amountStr) {
    alert('请输入收款金额')
    return
  }
  
  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) {
    alert('请输入有效的金额数字')
    return
  }
  
  if (amount > 100000000000) { // 超过千亿
    alert('金额过大（超过千亿），可能无法生成语音')
    return
  }
  
  fetchAlipayVoice()
}

// 格式化金额显示
const formatAmount = (amount) => {
  if (!amount && amount !== 0) return ''
  const num = parseFloat(String(amount))
  if (isNaN(num)) return String(amount)
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 组件挂载时不自动生成，等待用户输入
onMounted(() => {
  // 不自动生成，等待用户输入金额后手动生成
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
      <h2 class="page-title">支付宝收款语音生成</h2>
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
    <!-- 参数设置区域 -->
    <div class="form-section">
      <h3>💰 收款语音生成设置</h3>
      
      <div class="form-card">
        <div class="form-group">
          <label for="amount">收款金额：</label>
          <input 
            id="amount"
            v-model="formData.amount" 
            type="number" 
            step="0.01"
            min="0"
            max="100000000000"
            placeholder="请输入收款金额（如：1245.32）"
            class="form-input"
            @keyup.enter="generateVoice"
          />
          <div class="amount-display" v-if="formData.amount">
            格式化金额：￥{{ formatAmount(formData.amount) }}
          </div>
        </div>
        
        <button 
          class="generate-button" 
          @click="generateVoice"
          :disabled="loading"
        >
          {{ loading ? '生成中...' : '🎤 生成收款语音' }}
        </button>
        
        <div class="tips">
          <p>💡 温馨提示：</p>
          <ul>
            <li>支持小数点，如：1245.32</li>
            <li>金额超过千亿可能无法生成</li>
            <li>生成的语音可用于支付宝收款提示</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在生成支付宝收款语音...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button class="retry-button" @click="generateVoice">重试</button>
    </div>

    <!-- 语音结果展示 -->
    <div v-if="!loading && !error && voiceData.content" class="voice-section">
      <div class="voice-card">
        <div class="voice-header">
          <h2 class="voice-title">收款语音生成成功</h2>
          <div class="voice-meta">
            金额：￥{{ formatAmount(formData.amount) }}
          </div>
        </div>
        
        <!-- 语音文本内容 -->
        <div class="voice-content" v-if="voiceData.content">
          <h4>📝 语音文本内容：</h4>
          <div class="voice-text">{{ voiceData.content }}</div>
        </div>
        
        <!-- 音频播放器 -->
        <div class="audio-content" v-if="voiceData.audioUrl">
          <h4>🎵 语音音频：</h4>
          <audio 
            :src="voiceData.audioUrl" 
            controls 
            class="audio-player"
            preload="metadata"
          >
            您的浏览器不支持音频播放
          </audio>
        </div>
        
        <div class="action-buttons">
          <button class="copy-button" @click="copyText" v-if="voiceData.content">
            📋 复制文本
          </button>
          <button class="download-button" @click="downloadAudio" v-if="voiceData.audioUrl">
            💾 下载语音
          </button>
          <button class="refresh-button" @click="generateVoice">
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
}

.form-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.amount-display {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--glass-bg);
  border-radius: 6px;
  color: var(--text-accent);
  font-weight: 600;
  font-size: 1.1rem;
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

/* 语音结果展示区域 */
.voice-section {
  margin-top: 2rem;
}

.voice-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
  transition: all 0.3s ease;
}

.voice-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.voice-header {
  margin-bottom: 2rem;
  text-align: center;
  border-bottom: 2px solid var(--glass-border);
  padding-bottom: 1rem;
}

.voice-title {
  color: var(--text-accent);
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
}

.voice-meta {
  color: var(--text-secondary);
  font-size: 1.1rem;
  font-weight: 600;
}

.voice-content,
.audio-content {
  margin-bottom: 2rem;
}

.voice-content h4,
.audio-content h4 {
  color: var(--text-accent);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.voice-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--text-primary);
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border-left: 4px solid #52c41a;
  font-weight: 500;
}

.audio-player {
  width: 100%;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 2px solid var(--glass-border);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.copy-button,
.download-button,
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
.download-button:hover,
.refresh-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(82, 196, 26, 0.4);
}

.download-button {
  background: linear-gradient(135deg, #722ed1, #531dab);
  box-shadow: 0 4px 15px rgba(114, 46, 209, 0.3);
}

.download-button:hover {
  box-shadow: 0 6px 20px rgba(114, 46, 209, 0.4);
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
  .voice-card {
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
  .voice-card {
    padding: 1rem;
  }
  
  .voice-title {
    font-size: 1.5rem;
  }
}
</style>