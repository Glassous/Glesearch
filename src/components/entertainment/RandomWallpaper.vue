<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">随机壁纸</h2>
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
      正在获取壁纸数据...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 壁纸数据展示 -->
    <div v-if="!loading && !error" class="wallpaper-section">
      <h3>随机精美壁纸</h3>
      <div class="wallpaper-grid">
        <div class="wallpaper-card">
          <div class="wallpaper-header">
            <h4 class="wallpaper-title">当前壁纸</h4>
            <div class="wallpaper-date">{{ lastUpdateTime || '未获取' }}</div>
          </div>
          
          <div class="wallpaper-content">
            <div v-if="currentImage" class="image-container">
              <img 
                ref="wallpaperImage"
                :src="currentImage" 
                alt="随机壁纸"
                class="wallpaper-image"
                @load="handleImageLoad"
                @error="handleImageError"
              />
            </div>
            
            <div v-else class="no-image">
              <p>点击"换一张"获取随机壁纸</p>
            </div>
            
            <div class="wallpaper-actions">
              <div class="action-item">
                <span class="action-label">操作</span>
                <div class="action-buttons">
                  <button 
                    class="action-button primary" 
                    @click="fetchNewImage"
                    :disabled="loading"
                  >
                    {{ loading ? '获取中...' : '换一张' }}
                  </button>
                  <button 
                    class="action-button secondary" 
                    @click="openFullscreen"
                    :disabled="!currentImage"
                  >
                    全屏查看
                  </button>
                  <button 
                    class="action-button secondary" 
                    @click="downloadImage"
                    :disabled="!currentImage || loading"
                  >
                    下载壁纸
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

/* 壁纸数据区域 */
.wallpaper-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.wallpaper-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.wallpaper-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.wallpaper-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.wallpaper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.wallpaper-title {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.wallpaper-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.wallpaper-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-container {
  text-align: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
}

.wallpaper-image {
  max-width: 100%;
  max-height: 60vh;
  width: auto;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 16px var(--shadow-light);
  transition: all 0.3s ease;
}

.wallpaper-image:hover {
  transform: scale(1.02);
}

.no-image {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-radius: 12px;
  font-size: 1.1rem;
}

.wallpaper-actions {
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

.button-icon {
  font-size: 0.8rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .wallpaper-card {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .wallpaper-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
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