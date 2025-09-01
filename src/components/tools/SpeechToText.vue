<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 语音转文本相关状态
const selectedFile = ref(null)
const previewUrl = ref('')
const isLoading = ref(false)
const result = ref(null)
const error = ref('')
const isRecording = ref(false)
const mediaRecorder = ref(null)
const audioChunks = ref([])

// 支持的音频格式
const supportedFormats = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/flac']

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('audio/')) {
    error.value = '请选择有效的音频文件'
    return
  }

  // 验证文件大小 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    error.value = '音频文件大小不能超过10MB'
    return
  }

  selectedFile.value = file
  error.value = ''
  result.value = null

  // 创建音频预览URL
  const url = URL.createObjectURL(file)
  previewUrl.value = url
}

// 开始录音
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.value = new MediaRecorder(stream)
    audioChunks.value = []

    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data)
    }

    mediaRecorder.value.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' })
      const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' })
      selectedFile.value = audioFile
      
      const url = URL.createObjectURL(audioBlob)
      previewUrl.value = url
      
      // 停止所有音频轨道
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.value.start()
    isRecording.value = true
    error.value = ''
    result.value = null
  } catch (err) {
    console.error('录音失败:', err)
    error.value = '无法访问麦克风，请检查权限设置'
  }
}

// 停止录音
const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
  }
}

// 语音转文本
const convertSpeechToText = async () => {
  if (!selectedFile.value) {
    error.value = '请选择音频文件或录制语音'
    return
  }

  isLoading.value = true
  error.value = ''
  result.value = null

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    
    const response = await fetch('https://api.pearktrue.cn/api/audiocr/', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (data.code === 200) {
      result.value = {
        content: data.data.content,
        convertTime: data.data.convert_time,
        nowTime: data.data.now_time,
        message: data.msg,
        originalFile: selectedFile.value.name
      }
    } else {
      error.value = data.msg || '转换失败，请稍后重试'
    }
  } catch (err) {
    console.error('转换失败:', err)
    error.value = '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 复制文本到剪贴板
const copyToClipboard = async () => {
  if (result.value?.content) {
    try {
      await navigator.clipboard.writeText(result.value.content)
      // 可以添加一个简单的提示
      const button = document.querySelector('.copy-button')
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

// 下载文本文件
const downloadText = () => {
  if (result.value?.content) {
    const blob = new Blob([result.value.content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `语音转文本_${new Date().getTime()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// 清空结果
const clearResult = () => {
  result.value = null
  error.value = ''
  selectedFile.value = null
  previewUrl.value = ''
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
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

// 组件卸载时清理资源
onMounted(() => {
  // 检查浏览器是否支持录音
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.warn('浏览器不支持录音功能')
  }
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
      <h2 class="page-title">语音转文本</h2>
      <button class="clear-button" @click="clearResult" v-if="result">
        <span class="clear-icon">✕</span>
      </button>
      <div v-else style="width: 40px;"></div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 转换表单区域 -->
    <section class="convert-section">
      <div class="convert-form">
        <h3>🎙️ 语音转文本</h3>
        <p class="description">上传音频文件或实时录音，AI将为您识别语音内容并转换为文本</p>
        
        <!-- 录音控制 -->
        <div class="recording-section">
          <h4>🎤 实时录音</h4>
          <div class="recording-controls">
            <button 
              v-if="!isRecording"
              @click="startRecording"
              class="record-button start-record"
              :disabled="isLoading"
            >
              <span class="record-icon">🔴</span>
              开始录音
            </button>
            <button 
              v-else
              @click="stopRecording"
              class="record-button stop-record"
            >
              <span class="record-icon pulse">⏹️</span>
              停止录音
            </button>
          </div>
          <p class="recording-hint">点击开始录音，说话后点击停止即可获得音频文件</p>
        </div>

        <!-- 分隔线 -->
        <div class="divider">
          <span>或</span>
        </div>

        <!-- 文件上传 -->
        <div class="form-group">
          <label>📁 选择音频文件</label>
          <div class="file-upload-area">
            <input 
              type="file"
              accept="audio/*"
              @change="handleFileSelect"
              class="file-input"
              id="fileInput"
            />
            <label for="fileInput" class="file-upload-label">
              <span class="upload-icon">🎵</span>
              <span class="upload-text">
                {{ selectedFile ? selectedFile.name : '点击选择音频文件' }}
              </span>
              <span class="upload-hint">
                支持 MP3、WAV、OGG、M4A、AAC、FLAC，最大10MB
                {{ selectedFile ? `（${formatFileSize(selectedFile.size)}）` : '' }}
              </span>
            </label>
          </div>
        </div>

        <!-- 转换按钮 -->
        <div v-if="selectedFile" class="convert-action">
          <button 
            @click="convertSpeechToText"
            class="convert-button-large"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <span v-else>🎯</span>
            {{ isLoading ? '转换中...' : '开始语音识别' }}
          </button>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ error }}
        </div>

        <!-- 音频预览 -->
        <div v-if="previewUrl" class="preview-section">
          <h4>🎧 音频预览</h4>
          <div class="audio-preview">
            <audio :src="previewUrl" controls class="audio-player">
              您的浏览器不支持音频播放
            </audio>
            <div v-if="selectedFile" class="audio-info">
              <p><strong>文件名：</strong>{{ selectedFile.name }}</p>
              <p><strong>文件大小：</strong>{{ formatFileSize(selectedFile.size) }}</p>
              <p><strong>文件类型：</strong>{{ selectedFile.type }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 转换结果区域 -->
    <section v-if="result" class="result-section">
      <div class="result-card">
        <h3>✅ 识别完成</h3>
        
        <!-- 识别文本 -->
        <div class="text-result">
          <h4>📝 识别内容</h4>
          <div class="text-content">
            <div class="text-display">
              {{ result.content }}
            </div>
            <div class="text-actions">
              <button @click="copyToClipboard" class="action-button copy-button">
                <span class="btn-icon">📋</span>
                复制文本
              </button>
              <button @click="downloadText" class="action-button download-button">
                <span class="btn-icon">💾</span>
                下载文本
              </button>
            </div>
          </div>
        </div>

        <!-- 转换信息 -->
        <div class="convert-details">
          <h4>ℹ️ 转换详情</h4>
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">原始文件：</span>
              <span class="detail-value">{{ result.originalFile }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">转换时间：</span>
              <span class="detail-value">{{ result.convertTime }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">处理时间：</span>
              <span class="detail-value">{{ formatTime(result.nowTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">转换状态：</span>
              <span class="detail-value">{{ result.message }}</span>
            </div>
          </div>
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

/* 转换表单区域 */
.convert-section {
  margin-bottom: 2rem;
}

.convert-form {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.convert-form h3 {
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

/* 录音区域 */
.recording-section {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.recording-section h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1rem;
}

.recording-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.record-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-record {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
}

.start-record:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff5252, #ff7979);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 107, 107, 0.4);
}

.stop-record {
  background: linear-gradient(135deg, #6c757d, #868e96);
  color: white;
}

.stop-record:hover {
  background: linear-gradient(135deg, #5a6268, #747b83);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(108, 117, 125, 0.4);
}

.record-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.record-icon.pulse {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.recording-hint {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin: 0;
}

/* 分隔线 */
.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.divider span {
  padding: 0 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
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

/* 文件上传区域 */
.file-upload-area {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.file-upload-label:hover {
  border-color: var(--text-accent);
  background: var(--glass-bg);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.upload-text {
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.upload-hint {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

/* 转换按钮 */
.convert-button-large {
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

.convert-button-large:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.convert-button-large:disabled {
  background: var(--border-color);
  cursor: not-allowed;
  transform: none;
}

.convert-action {
  margin-top: 1rem;
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

/* 预览区域 */
.preview-section {
  margin-top: 1.5rem;
}

.preview-section h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1rem;
}

.audio-preview {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.audio-player {
  width: 100%;
  margin-bottom: 1rem;
}

.audio-info p {
  margin: 0.25rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.audio-info strong {
  color: var(--text-primary);
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

/* 文本结果 */
.text-result {
  margin-bottom: 2rem;
}

.text-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.text-display {
  padding: 1.5rem;
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.text-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--glass-bg);
}

.action-button {
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

.action-button:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1rem;
}

/* 转换详情 */
.convert-details {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.details-grid {
  display: grid;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-value {
  color: var(--text-primary);
  text-align: right;
  word-break: break-all;
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
  
  .convert-form {
    padding: 1.5rem;
  }
  
  .text-actions {
    flex-direction: column;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .detail-value {
    text-align: left;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.2rem;
  }
  
  .convert-form {
    padding: 1rem;
  }
  
  .result-card {
    padding: 1.5rem;
  }
  
  .record-button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}
</style>