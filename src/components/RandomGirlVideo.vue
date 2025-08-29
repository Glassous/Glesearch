<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">随机小姐姐视频</h2>
      <div class="api-info">
        <div class="api-source">数据来源: xxapi.cn</div>
        <div class="update-time" :class="{ 'error-status': error }">
          {{ error ? 'Error' : '更新时间: ' + (lastUpdateTime || '点击获取') }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在获取视频数据...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 视频数据展示 -->
    <div v-if="!loading && !error" class="video-section">
      <h3>随机精美视频</h3>
      <div class="video-grid">
        <div class="video-card">
          <div class="video-header">
            <h4 class="video-title">当前视频</h4>
            <div class="video-date">{{ lastUpdateTime || '未获取' }}</div>
          </div>
          
          <div class="video-content">
            <div v-if="currentVideo" class="video-container">
              <video 
                ref="videoPlayer"
                :src="currentVideo" 
                class="video-player"
                controls
                preload="metadata"
                :autoplay="autoPlay"
                @loadeddata="handleVideoLoad"
                @error="handleVideoError"
              >
                您的浏览器不支持视频播放
              </video>
            </div>
            
            <div v-else class="no-video">
              <p>点击"换一个"获取随机视频</p>
            </div>
            
            <!-- 自动播放开关 -->
            <div class="video-settings">
              <div class="setting-item">
                <span class="setting-label">自动播放</span>
                <label class="autoplay-switch">
                  <input 
                    type="checkbox" 
                    v-model="autoPlay"
                    @change="handleAutoPlayChange"
                  >
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            
            <div class="video-actions">
              <div class="action-item">
                <span class="action-label">操作</span>
                <div class="action-buttons">
                  <button 
                    class="action-button primary" 
                    @click="fetchNewVideo"
                    :disabled="loading"
                  >
                    {{ loading ? '获取中...' : '换一个' }}
                  </button>
                  <button 
                    class="action-button secondary" 
                    @click="openFullscreen"
                    :disabled="!currentVideo"
                  >
                    全屏播放
                  </button>
                  <button 
                    class="action-button secondary" 
                    @click="downloadVideo"
                    :disabled="!currentVideo || loading"
                  >
                    下载视频
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  name: 'RandomGirlVideo',
  data() {
    return {
      loading: false,
      error: null,
      currentVideo: null,
      lastUpdateTime: null,
      apiUrl: 'https://v2.xxapi.cn/api/meinv',
      autoPlay: false
    }
  },
  mounted() {
    // 页面加载时自动获取一个视频
    this.fetchNewVideo()
    // 监听ESC键退出全屏
    document.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },

    async fetchNewVideo() {
      this.loading = true
      this.error = null
      
      try {
        console.log('使用API:', this.apiUrl)
        
        const requestOptions = {
          method: 'GET',
          redirect: 'follow'
        }
        
        const response = await fetch(this.apiUrl, requestOptions)
        console.log('响应状态:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('API返回数据:', data)
        
        if (data.code === 200 && data.data) {
          console.log('设置视频URL:', data.data)
          this.currentVideo = data.data
          this.lastUpdateTime = new Date().toLocaleTimeString()
          
          // 如果开启了自动播放，等待视频加载后自动播放
          if (this.autoPlay) {
            this.$nextTick(() => {
              if (this.$refs.videoPlayer) {
                this.$refs.videoPlayer.play().catch(err => {
                  console.warn('自动播放失败:', err)
                })
              }
            })
          }
        } else {
          this.error = data.msg || '视频获取失败'
          console.error('API返回错误:', data)
        }
      } catch (err) {
        this.error = `网络请求失败: ${err.message}`
        console.error('API请求错误:', err)
      } finally {
        this.loading = false
      }
    },

    async openFullscreen() {
      if (!this.currentVideo || !this.$refs.videoPlayer) return
      
      try {
        const videoElement = this.$refs.videoPlayer
        
        if (videoElement.requestFullscreen) {
          await videoElement.requestFullscreen()
        } else if (videoElement.webkitRequestFullscreen) {
          await videoElement.webkitRequestFullscreen()
        } else if (videoElement.mozRequestFullScreen) {
          await videoElement.mozRequestFullScreen()
        } else if (videoElement.msRequestFullscreen) {
          await videoElement.msRequestFullscreen()
        } else {
          console.warn('浏览器不支持全屏API')
          alert('您的浏览器不支持全屏功能')
        }
      } catch (err) {
        console.error('全屏失败:', err)
        alert('全屏失败，请重试')
      }
    },

    handleKeydown(event) {
      // ESC键由浏览器原生处理
    },
    
    handleVideoLoad() {
      console.log('视频加载成功')
    },
    
    handleVideoError(event) {
      console.error('视频加载失败:', event)
      this.error = '视频加载失败，请重试'
    },
    
    handleAutoPlayChange() {
      console.log('自动播放状态:', this.autoPlay)
      if (this.autoPlay && this.$refs.videoPlayer && this.currentVideo) {
        // 如果开启自动播放且有视频，尝试播放当前视频
        this.$refs.videoPlayer.play().catch(err => {
          console.warn('自动播放失败:', err)
        })
      }
    },
    
    async downloadVideo() {
      if (!this.currentVideo) return
      
      try {
        const response = await fetch(this.currentVideo)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `video-${Date.now()}.mp4`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        window.URL.revokeObjectURL(url)
      } catch (err) {
        console.error('下载失败:', err)
        alert('下载失败，请重试')
      }
    }
  }
}
</script>

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

/* 视频数据区域 */
.video-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.video-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.video-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.video-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.video-title {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.video-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.video-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.video-container {
  text-align: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
}

.video-player {
  max-width: 100%;
  max-height: 60vh;
  width: auto;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 16px var(--shadow-light);
  transition: all 0.3s ease;
}

.video-player:hover {
  transform: scale(1.02);
}

.no-video {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-radius: 12px;
  font-size: 1.1rem;
}

.video-settings {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.setting-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 1rem;
}

.autoplay-switch {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.autoplay-switch input[type="checkbox"] {
  display: none;
}

.slider {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: var(--border-color);
  border-radius: 24px;
  transition: background-color 0.3s;
}

.slider:before {
  content: "";
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  top: 3px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.autoplay-switch input:checked + .slider {
  background-color: var(--text-accent);
}

.autoplay-switch input:checked + .slider:before {
  transform: translateX(20px);
}

.video-actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.action-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 1rem;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
  justify-content: center;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-button.primary {
  background: var(--text-accent);
  color: white;
  box-shadow: 0 2px 8px var(--shadow-light);
}

.action-button.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-medium);
}

.action-button.secondary {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--text-accent);
  border: 1px solid var(--text-accent);
  box-shadow: 0 2px 8px var(--shadow-light);
}

.action-button.secondary:hover:not(:disabled) {
  background: var(--text-accent);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-medium);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .video-card {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .video-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .autoplay-switch {
    align-self: stretch;
    justify-content: center;
  }
  
  .action-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .action-buttons {
    align-self: stretch;
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
  
  .top-bar {
    padding: 0.8rem;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .action-button {
    width: 100%;
  }
}
</style>