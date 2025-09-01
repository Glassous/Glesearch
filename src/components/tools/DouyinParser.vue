<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 抖音解析相关状态
const douyinUrl = ref('')
const isLoading = ref(false)
const result = ref(null)
const error = ref('')

// 解析抖音视频
const parseDouyinVideo = async () => {
  if (!douyinUrl.value.trim()) {
    error.value = '请输入抖音视频链接'
    return
  }

  // 验证URL格式
  if (!douyinUrl.value.includes('douyin.com') && !douyinUrl.value.includes('v.douyin.com')) {
    error.value = '请输入有效的抖音视频链接'
    return
  }

  isLoading.value = true
  error.value = ''
  result.value = null

  try {
    const response = await fetch(`https://api.pearktrue.cn/api/video/douyin/?url=${encodeURIComponent(douyinUrl.value)}`)
    const data = await response.json()

    if (data.code === 200) {
      result.value = data.data
    } else {
      error.value = data.msg || '解析失败，请检查链接是否正确'
    }
  } catch (err) {
    console.error('解析失败:', err)
    error.value = '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 清空结果
const clearResult = () => {
  result.value = null
  error.value = ''
  douyinUrl.value = ''
}

// 下载视频
const downloadVideo = () => {
  if (result.value?.url) {
    const link = document.createElement('a')
    link.href = result.value.url
    link.download = `${result.value.title || '抖音视频'}.mp4`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// 下载音频
const downloadMusic = () => {
  if (result.value?.music_url) {
    const link = document.createElement('a')
    link.href = result.value.music_url
    link.download = `${result.value.title || '抖音音频'}.mp3`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// 格式化时长
const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString('zh-CN')
}

// 处理键盘事件
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    parseDouyinVideo()
  }
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
      <h2 class="page-title">抖音视频解析</h2>
      <button class="clear-button" @click="clearResult" v-if="result">
        <span class="clear-icon">✕</span>
      </button>
      <div v-else style="width: 40px;"></div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 解析表单区域 -->
    <section class="parse-section">
      <div class="parse-form">
        <h3>🎬 抖音视频解析</h3>
        <p class="description">输入抖音视频链接，快速解析并下载视频和音频</p>
        
        <div class="form-group">
          <label>抖音视频链接</label>
          <div class="input-group">
            <input 
              v-model="douyinUrl"
              type="text" 
              placeholder="请粘贴抖音视频链接（如：https://v.douyin.com/xxxxx/）"
              class="form-input"
              @keypress="handleKeyPress"
              :disabled="isLoading"
            />
            <button 
              @click="parseDouyinVideo"
              class="parse-button"
              :disabled="isLoading || !douyinUrl.trim()"
            >
              <span v-if="isLoading" class="loading-spinner"></span>
              <span v-else>🔍</span>
              {{ isLoading ? '解析中...' : '解析' }}
            </button>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ error }}
        </div>


      </div>
    </section>

    <!-- 解析结果区域 -->
    <section v-if="result" class="result-section">
      <div class="result-card">
        <h3>✅ 解析成功</h3>
        
        <!-- 视频信息 -->
        <div class="video-info">
          <div class="video-cover">
            <img :src="result.cover" :alt="result.title" class="cover-image" />
            <div class="video-duration">{{ formatDuration(result.video_duration) }}</div>
          </div>
          
          <div class="video-details">
            <h4 class="video-title">{{ result.title }}</h4>
            <div class="author-info">
              <img :src="result.avatar" :alt="result.author" class="author-avatar" />
              <span class="author-name">{{ result.author }}</span>
            </div>
            <div class="video-meta">
              <span class="create-time">发布时间：{{ formatTime(result.create_time) }}</span>
            </div>
          </div>
        </div>

        <!-- 下载选项 -->
        <div class="download-options">
          <h4>📥 下载选项</h4>
          <div class="download-buttons">
            <button @click="downloadVideo" class="download-btn video-btn">
              <span class="btn-icon">🎬</span>
              <div class="btn-content">
                <span class="btn-title">下载视频</span>
                <span class="btn-desc">MP4格式</span>
              </div>
            </button>
            
            <button 
              v-if="result.music_url" 
              @click="downloadMusic" 
              class="download-btn music-btn"
            >
              <span class="btn-icon">🎵</span>
              <div class="btn-content">
                <span class="btn-title">下载音频</span>
                <span class="btn-desc">MP3格式</span>
              </div>
            </button>
            
            <a 
              :href="result.cover" 
              :download="`${result.title || '抖音封面'}.jpg`"
              class="download-btn cover-btn"
              target="_blank"
            >
              <span class="btn-icon">🖼️</span>
              <div class="btn-content">
                <span class="btn-title">下载封面</span>
                <span class="btn-desc">JPG格式</span>
              </div>
            </a>
          </div>
        </div>

        <!-- 预览区域 -->
        <div class="preview-section">
          <h4>👁️ 预览</h4>
          <div class="preview-content">
            <video 
              :src="result.url" 
              :poster="result.cover"
              controls 
              preload="metadata"
              class="video-preview"
            >
              您的浏览器不支持视频播放
            </video>
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

/* 解析表单区域 */
.parse-section {
  margin-bottom: 2rem;
}

.parse-form {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.parse-form h3 {
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
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.form-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.parse-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--text-accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.parse-button:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.parse-button:disabled {
  background: var(--border-color);
  cursor: not-allowed;
  transform: none;
}

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

/* 视频信息 */
.video-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.video-cover {
  position: relative;
  flex-shrink: 0;
}

.cover-image {
  width: 120px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.video-duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.video-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.video-title {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  color: var(--text-primary);
  font-weight: 500;
}

.video-meta {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* 下载选项 */
.download-options {
  margin-bottom: 2rem;
}

.download-options h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.download-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--glass-bg);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--glass-shadow);
}

.video-btn:hover {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.1);
}

.music-btn:hover {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.1);
}

.cover-btn:hover {
  border-color: #ffc107;
  background: rgba(255, 193, 7, 0.1);
}

.btn-icon {
  font-size: 2rem;
  line-height: 1;
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.btn-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.btn-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* 预览区域 */
.preview-section h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.preview-content {
  border-radius: 12px;
  overflow: hidden;
  background: #000;
}

.video-preview {
  width: 100%;
  max-height: 500px;
  display: block;
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
  
  .parse-form {
    padding: 1.5rem;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .video-info {
    flex-direction: column;
    text-align: center;
  }
  
  .video-details {
    align-items: center;
  }
  
  .download-buttons {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.2rem;
  }
  
  .cover-image {
    width: 100px;
    height: 133px;
  }
  
  .parse-form {
    padding: 1rem;
  }
  
  .result-card {
    padding: 1.5rem;
  }
}
</style>