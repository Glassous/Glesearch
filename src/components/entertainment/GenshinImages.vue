<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">原神图片</h2>
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
      正在获取图片数据...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 图片数据展示 -->
    <div v-if="!loading && !error" class="image-section">
      <h3>原神精美图片</h3>
      <div class="image-grid">
        <div class="image-card">
          <div class="image-header">
            <h4 class="image-title">当前图片</h4>
            <div class="image-date">{{ lastUpdateTime || '未获取' }}</div>
          </div>
          
          <div class="image-content">
            <!-- 选择模式 -->
            <div class="mode-selector">
              <div class="mode-item">
                <span class="mode-label">图片类型</span>
                <div class="mode-buttons">
                  <button 
                    v-for="mode in modes" 
                    :key="mode.key"
                    :class="['mode-button', { active: selectedMode === mode.key }]"
                    @click="switchMode(mode.key)"
                  >
                    {{ mode.name }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="currentImage" class="image-container">
              <img 
                ref="genshinImage"
                :src="currentImage" 
                alt="原神图片"
                class="genshin-image"
                @load="handleImageLoad"
                @error="handleImageError"
              />
            </div>
            
            <div v-else class="no-image">
              <p>点击"换一张"获取随机原神图片</p>
            </div>
            
            <div class="image-actions">
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
                    下载图片
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
  name: 'GenshinImages',
  data() {
    return {
      loading: false,
      error: null,
      currentImage: null,
      selectedMode: 'all',
      showFullscreen: false,
      lastUpdateTime: null,
      modes: [
        { key: 'all', name: '全部', apis: ['https://v2.xxapi.cn/api/ys', 'https://v2.xxapi.cn/api/yscos'] },
        { key: 'ys', name: '原神图片', apis: ['https://v2.xxapi.cn/api/ys'] },
        { key: 'yscos', name: '原神Coser', apis: ['https://v2.xxapi.cn/api/yscos'] }
      ]
    }
  },
  mounted() {
    // 页面加载时自动获取一张图片
    this.fetchNewImage()
    // 监听ESC键退出全屏
    document.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    goBack() {
      const from = this.$route.query.from
      if (from === 'home') {
        this.$router.push('/')
      } else if (from === 'entertainment') {
        this.$router.push('/entertainment')
      } else {
        // 默认返回首页
        this.$router.push('/')
      }
    },
    
    switchMode(mode) {
      this.selectedMode = mode
      this.fetchNewImage()
    },

    async fetchNewImage() {
      this.loading = true
      this.error = null
      
      try {
        // 根据选择的模式获取对应的API列表
        const currentMode = this.modes.find(mode => mode.key === this.selectedMode)
        const apis = currentMode.apis
        
        // 随机选择一个API
        const baseApi = apis[Math.floor(Math.random() * apis.length)]
        console.log('使用API:', baseApi, '模式:', this.selectedMode)
        
        const requestOptions = {
          method: 'GET',
          redirect: 'follow'
        }
        
        const response = await fetch(`${baseApi}?return=json`, requestOptions)
        console.log('响应状态:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('API返回数据:', data)
        
        if (data.code === 200 && data.data) {
          console.log('设置图片URL:', data.data)
          this.currentImage = data.data
          this.lastUpdateTime = new Date().toLocaleTimeString()
        } else {
          this.error = data.msg || '图片获取失败'
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
      if (!this.currentImage || !this.$refs.genshinImage) return
      
      try {
        const imageElement = this.$refs.genshinImage
        
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
      // ESC键由浏览器原生处理，这里可以移除
    },
    
    handleImageLoad() {
      console.log('图片加载成功')
    },
    
    handleImageError(event) {
      console.error('图片加载失败:', event)
      this.error = '图片加载失败，请重试'
    },
    
    async downloadImage() {
      if (!this.currentImage) return
      
      try {
        const response = await fetch(this.currentImage)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `genshin-image-${Date.now()}.jpg`
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

/* 图片数据区域 */
.image-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.image-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.image-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.image-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.image-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.image-title {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.image-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.image-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mode-selector {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.mode-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.mode-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 1rem;
}

.mode-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.mode-button {
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--text-accent);
  background: var(--bg-secondary);
  color: var(--text-accent);
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.mode-button:hover {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transform: translateY(-1px);
}

.mode-button.active {
  background: var(--text-accent);
  color: white;
  box-shadow: 0 2px 8px var(--shadow-light);
}

.image-container {
  text-align: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
}

.genshin-image {
  max-width: 100%;
  max-height: 60vh;
  width: auto;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 16px var(--shadow-light);
  transition: all 0.3s ease;
}

.genshin-image:hover {
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

.image-actions {
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
  
  .image-card {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .image-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  
  .mode-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .mode-buttons {
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
  
  .mode-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .mode-button {
    width: 100%;
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