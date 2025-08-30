<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// MV解析数据
const mvData = ref(null)
const loading = ref(false)
const error = ref('')
const apiSource = ref('jkyai.top')
const lastUpdateTime = ref('')
const mvName = ref('')
const mvIndex = ref(1)

// 视频播放相关
const videoRef = ref(null)
const isPlaying = ref(false)

// 获取MV信息
const fetchMVInfo = async () => {
  if (!mvName.value.trim()) {
    error.value = '请输入MV名称'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.jkyai.top/API/kgmvjs.php?msg=${encodeURIComponent(mvName.value)}&n=${mvIndex.value}`)
    const result = await response.json()
    
    console.log('API返回数据:', result)
    
    if (result.code === 1 && result.data) {
      mvData.value = result.data
      lastUpdateTime.value = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      throw new Error(`API返回错误: ${result.text || '未知错误'}`)
    }
  } catch (err) {
    error.value = '获取MV信息失败，请检查网络连接或MV名称'
    lastUpdateTime.value = 'Error'
    console.error('MV解析API请求失败:', err)
  } finally {
    loading.value = false
  }
}

// 播放控制
const togglePlay = () => {
  if (!videoRef.value) return
  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play()
  }
}

const onPlay = () => { isPlaying.value = true }
const onPause = () => { isPlaying.value = false }
const onEnded = () => { isPlaying.value = false }

// 工具函数
const copyVideoUrl = () => {
  if (!mvData.value?.url) return
  navigator.clipboard.writeText(mvData.value.url).then(() => {
    alert('视频链接已复制到剪贴板')
  }).catch(() => {
    alert('复制失败，请手动复制')
  })
}

const downloadVideo = () => {
  if (!mvData.value?.url) return
  const link = document.createElement('a')
  link.href = mvData.value.url
  link.download = `${mvData.value.name || 'mv'}.mp4`
  link.click()
}

const goBack = () => { router.push('/') }

const clearForm = () => {
  mvName.value = ''
  mvIndex.value = 1
  mvData.value = null
  error.value = ''
  lastUpdateTime.value = ''
  isPlaying.value = false
}

const useExampleMV = () => {
  mvName.value = 'Shape Of You'
  mvIndex.value = 1
}

onMounted(() => {})
onUnmounted(() => {})
</script>

<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">MV解析</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div class="update-time" :class="{ 'error-status': lastUpdateTime === 'Error' }">
          {{ lastUpdateTime === 'Error' ? 'Error' : (lastUpdateTime || '输入MV名称开始搜索') }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- MV搜索输入区域 -->
    <div class="input-section">
      <h3>搜索MV</h3>
      <div class="input-card">
        <div class="input-group">
          <div class="search-inputs">
            <div class="input-item">
              <label class="input-label">MV名称</label>
              <input
                v-model="mvName"
                type="text"
                placeholder="请输入MV名称"
                class="mv-input"
                @keyup.enter="fetchMVInfo"
              />
            </div>
            <div class="input-item">
              <label class="input-label">序号（第几个结果）</label>
              <input
                v-model.number="mvIndex"
                type="number"
                min="1"
                max="50"
                placeholder="1"
                class="index-input"
                @keyup.enter="fetchMVInfo"
              />
            </div>
          </div>
          <div class="input-actions">
            <button 
              class="parse-button"
              @click="fetchMVInfo"
              :disabled="loading || !mvName.trim()"
            >
              {{ loading ? '搜索中...' : '开始搜索' }}
            </button>
            <button 
              class="example-button"
              @click="useExampleMV"
              :disabled="loading"
            >
              示例MV
            </button>
            <button 
              class="clear-button"
              @click="clearForm"
              :disabled="loading"
            >
              清空
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在搜索MV信息...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- MV信息展示 -->
    <div v-if="!loading && !error && mvData" class="mv-info-section">
      <h3>搜索结果</h3>
      
      <!-- 基本信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <h4>🎬 基本信息</h4>
        </div>
        <div class="card-content">
          <div class="mv-basic">
            <div class="cover-section">
              <img 
                v-if="mvData.cover" 
                :src="mvData.cover" 
                :alt="mvData.name"
                class="cover-image"
              />
              <div v-else class="cover-placeholder">🎬</div>
            </div>
            <div class="info-section">
              <div class="info-item">
                <span class="info-label">MV名称:</span>
                <span class="info-value">{{ mvData.name || '未知' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">歌手:</span>
                <span class="info-value">{{ mvData.singer || '未知' }}</span>
              </div>
              <div v-if="mvData._singer && mvData._singer.length > 1" class="info-item">
                <span class="info-label">参与歌手:</span>
                <span class="info-value">{{ mvData._singer.join(', ') }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">来源:</span>
                <span class="info-value">酷狗音乐</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 视频播放器卡片 -->
      <div v-if="mvData.url" class="player-card">
        <div class="card-header">
          <h4>🎥 在线播放</h4>
          <div class="player-info">
            <div class="video-notice">
              <span class="notice-icon">📱</span>
              <span class="notice-text">建议在WiFi环境下观看高清MV</span>
            </div>
            <div class="player-actions">
              <button class="action-btn" @click="copyVideoUrl" title="复制视频链接">
                📋
              </button>
              <button class="action-btn" @click="downloadVideo" title="下载视频">
                ⬇️
              </button>
            </div>
          </div>
        </div>
        <div class="card-content">
          <div class="video-player">
            <video
              ref="videoRef"
              :src="mvData.url"
              :poster="mvData.cover"
              @play="onPlay"
              @pause="onPause"
              @ended="onEnded"
              controls
              preload="metadata"
              class="video-element"
            >
              您的浏览器不支持视频播放
            </video>
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

/* 输入区域 */
.input-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.input-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-inputs {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  align-items: end;
}

.input-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.mv-input, .index-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.mv-input:focus, .index-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.index-input {
  text-align: center;
}

.input-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.parse-button, .clear-button, .example-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.parse-button {
  background: var(--text-accent);
  color: white;
}

.parse-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.parse-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-button, .example-button {
  background: var(--glass-bg);
  color: var(--text-secondary);
  border: 2px solid var(--glass-border);
}

.clear-button:hover:not(:disabled), .example-button:hover:not(:disabled) {
  background: var(--bg-secondary);
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

/* MV信息区域 */
.mv-info-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

/* 卡片通用样式 */
.info-card, .player-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
  transition: all 0.3s ease;
}

.info-card:hover, .player-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.card-header h4 {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

/* 基本信息样式 */
.mv-basic {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.cover-section {
  flex-shrink: 0;
}

.cover-image {
  width: 200px;
  height: 150px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.cover-placeholder {
  width: 200px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  font-size: 3rem;
  color: var(--text-secondary);
}

.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-label {
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 80px;
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
}

/* 播放器样式 */
.player-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.video-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #1565c0;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  border: 1px solid #bbdefb;
  box-shadow: 0 2px 8px rgba(187, 222, 251, 0.3);
}

.player-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: var(--glass-bg);
}

.video-player {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.video-element {
  width: 100%;
  border-radius: 12px;
  background: #000;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .mv-basic {
    flex-direction: column;
    align-items: center;
  }
  
  .cover-image, .cover-placeholder {
    width: 160px;
    height: 120px;
  }
  
  .search-inputs {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .input-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .player-info {
    align-items: stretch;
  }
  
  .video-notice {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.2rem;
  }
  
  .api-info {
    font-size: 0.65rem;
  }
  
  .cover-image, .cover-placeholder {
    width: 120px;
    height: 90px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-label {
    min-width: auto;
  }
}
</style>