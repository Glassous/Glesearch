<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 音乐解析数据
const musicData = ref(null)
const loading = ref(false)
const error = ref('')
const apiSource = ref('jkyai.top')
const lastUpdateTime = ref('')
const songName = ref('')
const songIndex = ref(1)

// 音频播放相关
const audioRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isDragging = ref(false)

// 获取音乐信息
const fetchMusicInfo = async () => {
  if (!songName.value.trim()) {
    error.value = '请输入歌曲名称'
    return
  }

  if (songIndex.value < 1) {
    error.value = '序号必须大于0'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    // 使用真实API调用
    const response = await fetch(`https://api.jkyai.top/API/wyyyjs.php?msg=${encodeURIComponent(songName.value)}&n=${songIndex.value}`)
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data) {
      musicData.value = result.data
      
      // 设置更新时间
      lastUpdateTime.value = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      throw new Error(`API返回错误: ${result.message || '未知错误'}`)
    }
  } catch (err) {
    error.value = '获取音乐信息失败，请检查网络连接或歌曲名称'
    lastUpdateTime.value = 'Error'
    console.error('音乐解析API请求失败:', err)
  } finally {
    loading.value = false
  }
}

// 播放/暂停音频
const togglePlay = () => {
  if (!audioRef.value || !musicData.value?.media?.audio_url) return
  
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

// 音频时间更新
const onTimeUpdate = () => {
  if (audioRef.value && !isDragging.value) {
    currentTime.value = audioRef.value.currentTime
  }
}

// 音频加载完成
const onLoadedMetadata = () => {
  if (audioRef.value) {
    duration.value = audioRef.value.duration
  }
}

// 音频播放结束
const onEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
}

// 格式化时间
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 进度条拖拽相关函数
const getProgressBarElement = (event) => {
  return event.currentTarget
}

const calculateProgress = (event, progressBar) => {
  const rect = progressBar.getBoundingClientRect()
  const offsetX = event.clientX - rect.left
  const progress = Math.max(0, Math.min(1, offsetX / rect.width))
  return progress
}

const updateAudioTime = (progress) => {
  if (audioRef.value && duration.value) {
    const newTime = progress * duration.value
    audioRef.value.currentTime = newTime
    currentTime.value = newTime
  }
}

// 鼠标事件
const onProgressMouseDown = (event) => {
  if (!audioRef.value || !duration.value) return
  
  isDragging.value = true
  const progressBar = getProgressBarElement(event)
  const progress = calculateProgress(event, progressBar)
  updateAudioTime(progress)
  
  const handleMouseMove = (e) => {
    if (isDragging.value) {
      const progress = calculateProgress(e, progressBar)
      currentTime.value = progress * duration.value
    }
  }
  
  const handleMouseUp = () => {
    if (isDragging.value) {
      const progress = currentTime.value / duration.value
      updateAudioTime(progress)
      isDragging.value = false
    }
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 触摸事件
const onProgressTouchStart = (event) => {
  if (!audioRef.value || !duration.value) return
  
  event.preventDefault()
  isDragging.value = true
  const progressBar = getProgressBarElement(event)
  const touch = event.touches[0]
  const progress = calculateProgress(touch, progressBar)
  updateAudioTime(progress)
  
  const handleTouchMove = (e) => {
    if (isDragging.value && e.touches[0]) {
      e.preventDefault()
      const progress = calculateProgress(e.touches[0], progressBar)
      currentTime.value = progress * duration.value
    }
  }
  
  const handleTouchEnd = () => {
    if (isDragging.value) {
      const progress = currentTime.value / duration.value
      updateAudioTime(progress)
      isDragging.value = false
    }
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }
  
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
}

// 格式化歌词
const formatLyrics = (lyrics) => {
  if (!lyrics) return '暂无歌词'
  return lyrics.split('\n').filter(line => line.trim())
}

// 复制音频链接
const copyAudioUrl = () => {
  if (!musicData.value?.media?.audio_url) return
  
  navigator.clipboard.writeText(musicData.value.media.audio_url).then(() => {
    alert('音频链接已复制到剪贴板')
  }).catch(() => {
    alert('复制失败，请手动复制')
  })
}

// 下载音频
const downloadAudio = () => {
  if (!musicData.value?.media?.audio_url) return
  
  const link = document.createElement('a')
  link.href = musicData.value.media.audio_url
  link.download = `${musicData.value.basic_info?.title || 'music'}.mp3`
  link.click()
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

// 清空表单
const clearForm = () => {
  songName.value = ''
  songIndex.value = 1
  musicData.value = null
  error.value = ''
  lastUpdateTime.value = ''
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
  isDragging.value = false
}

// 使用示例歌曲
const useExampleSong = () => {
  songName.value = 'Shape of You'
  songIndex.value = 1
}

// 组件挂载时的操作
onMounted(() => {
  // 可以在这里添加初始化逻辑
})

// 组件卸载时清理事件监听器
onUnmounted(() => {
  // 清理可能残留的事件监听器
  document.removeEventListener('mousemove', () => {})
  document.removeEventListener('mouseup', () => {})
  document.removeEventListener('touchmove', () => {})
  document.removeEventListener('touchend', () => {})
  isDragging.value = false
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
      <h2 class="page-title">音乐解析</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div class="update-time" :class="{ 'error-status': lastUpdateTime === 'Error' }">
          {{ lastUpdateTime === 'Error' ? 'Error' : (lastUpdateTime || '输入歌名开始搜索') }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 音乐搜索输入区域 -->
    <div class="input-section">
      <h3>搜索音乐</h3>
      <div class="input-card">
        <div class="input-group">
          <div class="search-inputs">
            <div class="input-item">
              <label class="input-label">歌曲名称</label>
              <input
                v-model="songName"
                type="text"
                placeholder="请输入歌曲名称"
                class="song-input"
                @keyup.enter="fetchMusicInfo"
              />
            </div>
            <div class="input-item">
              <label class="input-label">序号（第几个结果）</label>
              <input
                v-model.number="songIndex"
                type="number"
                min="1"
                max="50"
                placeholder="1"
                class="index-input"
                @keyup.enter="fetchMusicInfo"
              />
            </div>
          </div>
          <div class="input-actions">
            <button 
              class="parse-button"
              @click="fetchMusicInfo"
              :disabled="loading || !songName.trim()"
            >
              {{ loading ? '搜索中...' : '开始搜索' }}
            </button>
            <button 
              class="example-button"
              @click="useExampleSong"
              :disabled="loading"
            >
              示例歌曲
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
      正在搜索音乐信息...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 音乐信息展示 -->
    <div v-if="!loading && !error && musicData" class="music-info-section">
      <h3>搜索结果</h3>
      
      <!-- 基本信息卡片 -->
      <div class="info-card">
        <div class="card-header">
          <h4>🎵 基本信息</h4>
        </div>
        <div class="card-content">
          <div class="music-basic">
            <div class="cover-section">
              <img 
                v-if="musicData.media?.cover_image" 
                :src="musicData.media.cover_image" 
                :alt="musicData.basic_info?.title"
                class="cover-image"
              />
              <div v-else class="cover-placeholder">🎵</div>
            </div>
            <div class="info-section">
              <div class="info-item">
                <span class="info-label">歌曲名称:</span>
                <span class="info-value">{{ musicData.basic_info?.title || '未知' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">艺术家:</span>
                <span class="info-value">{{ musicData.basic_info?.artist || '未知' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">专辑:</span>
                <span class="info-value">{{ musicData.basic_info?.album || '未知' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">时长:</span>
                <span class="info-value">{{ musicData.basic_info?.duration || '未知' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">来源:</span>
                <span class="info-value">{{ musicData.platform?.source || '未知' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 播放器卡片 -->
      <div v-if="musicData.media?.audio_url" class="player-card">
        <div class="card-header">
          <h4>🎧 在线播放</h4>
          <div class="player-info">
            <div class="vip-notice">
              <span class="notice-icon">💡</span>
              <span class="notice-text">时长较短的歌曲通常为VIP歌曲</span>
            </div>
            <div class="player-actions">
              <button class="action-btn" @click="copyAudioUrl" title="复制音频链接">
                📋
              </button>
              <button class="action-btn" @click="downloadAudio" title="下载音频">
                ⬇️
              </button>
            </div>
          </div>
        </div>
        <div class="card-content">
          <div class="audio-player">
            <audio
              ref="audioRef"
              :src="musicData.media.audio_url"
              @timeupdate="onTimeUpdate"
              @loadedmetadata="onLoadedMetadata"
              @ended="onEnded"
              @play="isPlaying = true"
              @pause="isPlaying = false"
              preload="metadata"
            ></audio>
            
            <div class="player-controls">
              <button class="play-button" @click="togglePlay">
                {{ isPlaying ? '⏸️' : '▶️' }}
              </button>
              <div class="time-info">
                <span class="current-time">{{ formatTime(currentTime) }}</span>
                <span class="separator">/</span>
                <span class="total-time">{{ formatTime(duration) }}</span>
              </div>
            </div>
            
            <div 
              class="progress-bar"
              @mousedown="onProgressMouseDown"
              @touchstart="onProgressTouchStart"
            >
              <div 
                class="progress-fill"
                :style="{ width: duration ? (currentTime / duration * 100) + '%' : '0%' }"
              ></div>
              <div 
                class="progress-handle"
                :style="{ left: duration ? (currentTime / duration * 100) + '%' : '0%' }"
                :class="{ 'dragging': isDragging }"
              ></div>
            </div>

            <div class="audio-info">
              <div class="audio-item">
                <span class="audio-label">音质:</span>
                <span class="audio-value">{{ musicData.media?.audio_quality || '未知' }}</span>
              </div>
              <div class="audio-item">
                <span class="audio-label">文件大小:</span>
                <span class="audio-value">{{ musicData.media?.file_size || '未知' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 歌词卡片 -->
      <div v-if="musicData.lyrics" class="lyrics-card">
        <div class="card-header">
          <h4>📝 歌词</h4>
        </div>
        <div class="card-content">
          <div class="lyrics-content">
            <div 
              v-for="(line, index) in formatLyrics(musicData.lyrics)" 
              :key="index"
              class="lyrics-line"
            >
              {{ line }}
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

.song-input, .index-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.song-input:focus, .index-input:focus {
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

/* 音乐信息区域 */
.music-info-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

/* 卡片通用样式 */
.info-card, .player-card, .lyrics-card {
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

.info-card:hover, .player-card:hover, .lyrics-card:hover {
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
.music-basic {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.cover-section {
  flex-shrink: 0;
}

.cover-image {
  width: 150px;
  height: 150px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.cover-placeholder {
  width: 150px;
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

.vip-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  color: #856404;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  border: 1px solid #ffeaa7;
  box-shadow: 0 2px 8px rgba(255, 234, 167, 0.3);
}

.notice-icon {
  font-size: 1rem;
  animation: pulse 2s infinite;
}

.notice-text {
  font-weight: 500;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
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

.audio-player {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.play-button {
  background: var(--text-accent);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  color: white;
  transition: all 0.3s ease;
}

.play-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.time-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 8px;
  background: var(--glass-border);
  border-radius: 4px;
  overflow: visible;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 4px 0;
}

.progress-bar:hover {
  height: 12px;
  padding: 2px 0;
}

.progress-bar:hover .progress-handle {
  transform: translateX(-50%) translateY(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--text-accent), #8b5cf6);
  border-radius: 4px;
  transition: width 0.1s ease;
  position: relative;
}

.progress-handle {
  position: absolute;
  top: 50%;
  width: 16px;
  height: 16px;
  background: var(--text-accent);
  border: 2px solid white;
  border-radius: 50%;
  transform: translateX(-50%) translateY(-50%) scale(1);
  cursor: grab;
  opacity: 1;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  z-index: 10;
}

.progress-handle:hover {
  background: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.progress-handle.dragging {
  cursor: grabbing;
  transform: translateX(-50%) translateY(-50%) scale(1.2);
  opacity: 1;
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
}

.audio-info {
  display: flex;
  gap: 2rem;
}

.audio-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.audio-label {
  font-weight: 500;
  color: var(--text-secondary);
}

.audio-value {
  color: var(--text-primary);
}

/* 歌词样式 */
.lyrics-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.lyrics-line {
  padding: 0.3rem 0;
  color: var(--text-primary);
  line-height: 1.6;
  border-bottom: 1px solid transparent;
}

.lyrics-line:hover {
  background: var(--glass-bg);
  border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .music-basic {
    flex-direction: column;
    align-items: center;
  }
  
  .cover-image, .cover-placeholder {
    width: 120px;
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
  
  .progress-bar {
    height: 12px;
    padding: 6px 0;
  }
  
  .progress-bar:hover {
    height: 12px;
    padding: 6px 0;
  }
  
  .progress-handle {
    opacity: 1;
    transform: translateX(-50%) translateY(-50%) scale(1);
    width: 20px;
    height: 20px;
  }
  
  .audio-info {
    flex-direction: column;
    gap: 0.5rem;
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
    width: 100px;
    height: 100px;
  }
  
  .search-inputs {
    grid-template-columns: 1fr;
  }
  
  .input-actions {
    flex-direction: column;
    gap: 0.3rem;
  }
  
  .info-label {
    min-width: auto;
  }
}
</style>