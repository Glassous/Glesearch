<template>
  <div class="random-video-container">
    <!-- 顶部栏 -->
    <div class="header">
      <button class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="title">随机小姐姐视频</h1>
      <div class="api-info">
        <div class="api-source">xxapi.cn</div>
        <div class="update-time">{{ lastUpdateTime || '点击获取' }}</div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>正在获取视频...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="fetchNewVideo" class="retry-btn">重试</button>
      </div>

      <!-- 视频显示 -->
      <div v-else class="video-section">
        <div class="video-container" v-if="currentVideo">
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

        <!-- 自动播放开关 -->
        <div class="autoplay-control">
          <label class="autoplay-switch">
            <input 
              type="checkbox" 
              v-model="autoPlay"
              @change="handleAutoPlayChange"
            >
            <span class="slider"></span>
            <span class="switch-text">自动播放</span>
          </label>
        </div>

        <!-- 控制按钮 -->
        <div class="controls">
          <button 
            class="action-btn primary" 
            @click="fetchNewVideo"
            :disabled="loading"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ loading ? '获取中...' : '换一个' }}
          </button>

          <button 
            class="action-btn fullscreen" 
            @click="openFullscreen"
            :disabled="!currentVideo"
            title="全屏播放"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M8 3H5A2 2 0 0 0 3 5V8M21 8V5A2 2 0 0 0 19 3H16M16 21H19A2 2 0 0 0 21 19V16M8 21H5A2 2 0 0 0 3 19V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            全屏播放
          </button>
          
          <button 
            class="action-btn secondary" 
            @click="downloadVideo"
            :disabled="!currentVideo || loading"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            下载视频
          </button>
        </div>

        <!-- 提示信息 -->
        <div v-if="!currentVideo" class="no-video">
          <p>点击"换一个"获取随机视频</p>
        </div>
      </div>
    </div>
  </div>
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
.random-video-container {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-primary);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: var(--text-accent);
}

.back-btn:hover {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  transform: scale(1.05);
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--text-accent);
}

.api-info {
  text-align: right;
  font-size: 12px;
}

.api-source {
  color: var(--text-accent);
  font-weight: 500;
}

.update-time {
  color: var(--text-secondary);
  margin-top: 2px;
}

.content {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.loading, .error {
  text-align: center;
  padding: 40px 20px;
}

.loading {
  color: var(--text-secondary);
}

.error {
  color: var(--text-accent);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--text-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  background: var(--text-accent);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: var(--text-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.video-section {
  text-align: center;
}

.video-container {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--glass-shadow);
  overflow: hidden;
  position: relative;
}

.video-player {
  max-width: 100%;
  max-height: 70vh;
  width: auto;
  height: auto;
  border-radius: 8px;
  display: block;
  margin: 0 auto;
  box-shadow: var(--shadow-medium);
  transition: transform 0.2s;
}

.video-player:hover {
  transform: scale(1.02);
}

.controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
  justify-content: center;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.primary {
  background: var(--text-accent);
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: var(--text-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.action-btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-accent);
  border: 2px solid var(--text-accent);
}

.action-btn.secondary:hover:not(:disabled) {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  color: var(--text-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-light);
}

.action-btn.fullscreen {
  background: var(--text-accent);
  color: white;
}

.action-btn.fullscreen:hover:not(:disabled) {
  background: var(--text-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.no-video {
  color: var(--text-secondary);
  font-size: 16px;
  padding: 40px 20px;
}

.autoplay-control {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.autoplay-switch {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.autoplay-switch input[type="checkbox"] {
  display: none;
}

.slider {
  position: relative;
  width: 50px;
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
  transform: translateX(26px);
}

.switch-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 12px 16px;
  }
  
  .title {
    font-size: 16px;
  }
  
  .content {
    padding: 16px;
  }
  
  .video-container {
    padding: 16px;
  }
  
  .video-player {
    max-height: 60vh;
  }
  
  .controls {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 280px;
  }
}
</style>