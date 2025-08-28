<template>
  <div class="random-wallpaper-container">
    <!-- 顶部栏 -->
    <div class="header">
      <button class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="title">随机壁纸图片</h1>
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
        <p>正在获取壁纸...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="fetchNewImage" class="retry-btn">重试</button>
      </div>

      <!-- 图片显示 -->
      <div v-else class="image-section">
        <div class="image-container" v-if="currentImage">
          <img 
            ref="wallpaperImage"
            :src="currentImage" 
            alt="随机壁纸"
            class="wallpaper-image"
            @load="handleImageLoad"
            @error="handleImageError"
          />
        </div>

        <!-- 控制按钮 -->
        <div class="controls">
          <button 
            class="action-btn primary" 
            @click="fetchNewImage"
            :disabled="loading"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ loading ? '获取中...' : '换一张' }}
          </button>

          <button 
            class="action-btn fullscreen" 
            @click="openFullscreen"
            :disabled="!currentImage"
            title="全屏查看"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M8 3H5A2 2 0 0 0 3 5V8M21 8V5A2 2 0 0 0 19 3H16M16 21H19A2 2 0 0 0 21 19V16M8 21H5A2 2 0 0 0 3 19V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            全屏查看
          </button>
          
          <button 
            class="action-btn secondary" 
            @click="downloadImage"
            :disabled="!currentImage || loading"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            下载壁纸
          </button>
        </div>

        <!-- 提示信息 -->
        <div v-if="!currentImage" class="no-image">
          <p>点击"换一张"获取随机壁纸</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RandomWallpaper',
  data() {
    return {
      loading: false,
      error: null,
      currentImage: null,
      lastUpdateTime: null,
      apiUrl: 'https://v2.xxapi.cn/api/wallpaper'
    }
  },
  mounted() {
    // 页面加载时自动获取一张壁纸
    this.fetchNewImage()
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

    async fetchNewImage() {
      this.loading = true
      this.error = null
      
      try {
        console.log('使用API:', this.apiUrl)
        
        const requestOptions = {
          method: 'GET',
          redirect: 'follow'
        }
        
        const response = await fetch(`${this.apiUrl}?return=json`, requestOptions)
        console.log('响应状态:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('API返回数据:', data)
        
        if (data.code === 200 && data.data) {
          console.log('设置壁纸URL:', data.data)
          this.currentImage = data.data
          this.lastUpdateTime = new Date().toLocaleTimeString()
        } else {
          this.error = data.msg || '壁纸获取失败'
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
      if (!this.currentImage || !this.$refs.wallpaperImage) return
      
      try {
        const imageElement = this.$refs.wallpaperImage
        
        if (imageElement.requestFullscreen) {
          await imageElement.requestFullscreen()
        } else if (imageElement.webkitRequestFullscreen) {
          await imageElement.webkitRequestFullscreen()
        } else if (imageElement.mozRequestFullScreen) {
          await imageElement.mozRequestFullScreen()
        } else if (imageElement.msRequestFullscreen) {
          await imageElement.msRequestFullscreen()
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
    
    handleImageLoad() {
      console.log('壁纸加载成功')
    },
    
    handleImageError(event) {
      console.error('壁纸加载失败:', event)
      this.error = '壁纸加载失败，请重试'
    },
    
    async downloadImage() {
      if (!this.currentImage) return
      
      try {
        const response = await fetch(this.currentImage)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `wallpaper-${Date.now()}.jpg`
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
.random-wallpaper-container {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8f9fa;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e5e5e5;
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
  transition: background-color 0.2s;
  color: #3b82f6;
}

.back-btn:hover {
  background-color: #f5f5f5;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #3b82f6;
}

.api-info {
  text-align: right;
  font-size: 12px;
}

.api-source {
  color: #10b981;
  font-weight: 500;
}

.update-time {
  color: #666;
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
  color: #666;
}

.error {
  color: #dc3545;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 16px;
}

.retry-btn:hover {
  background: #2563eb;
}

.image-section {
  text-align: center;
}

.image-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.wallpaper-image {
  max-width: 100%;
  max-height: 70vh;
  width: auto;
  height: auto;
  border-radius: 8px;
  display: block;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}

.wallpaper-image:hover {
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
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.action-btn.secondary:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
}

.action-btn.fullscreen {
  background: #6366f1;
  color: white;
}

.action-btn.fullscreen:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-1px);
}

.no-image {
  color: #666;
  font-size: 16px;
  padding: 40px 20px;
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
  
  .image-container {
    padding: 16px;
  }
  
  .wallpaper-image {
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