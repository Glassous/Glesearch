<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 响应式数据
const cars = ref([])
const loading = ref(false)
const error = ref('')
const brand = ref('')
const model = ref('')
const apiSource = ref('jkyai.top')
const lastUpdateTime = ref('')

// 搜索车辆
const searchCars = async () => {
  const searchQuery = `${brand.value}${model.value}`.trim()
  if (!searchQuery) {
    cars.value = []
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch(`https://api.jkyai.top/API/clxxcx.php?msg=${encodeURIComponent(searchQuery)}`)
    const data = await response.json()
    
    console.log('API返回数据:', data) // 调试日志
    
    if (data.code === 201 && data.data) {
      cars.value = data.data.map(car => ({
        brand: car.brand_name,
        model: car.series_name,
        price: car.official_price,
        level: car.level,
        image: car.white_pic_url || 'https://via.placeholder.com/300x200?text=暂无图片'
      }))
      
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
      cars.value = []
      error.value = '未找到相关车辆信息'
    }
  } catch (err) {
    console.error('搜索失败:', err)
    error.value = '搜索失败，请检查网络连接'
    cars.value = []
  } finally {
    loading.value = false
  }
}

// 返回主页
const goBack = () => {
  const from = route.query.from
  if (from === 'home') {
    router.push('/')
  } else if (from === 'query') {
    router.push('/query')
  } else {
    // 默认返回首页
    router.push('/')
  }
}

// 跳转到懂车帝搜索
const searchOnDongchedi = (carName) => {
  const keyword = encodeURIComponent(carName)
  const url = `https://www.dongchedi.com/search?keyword=${keyword}`
  window.open(url, '_blank')
}

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZmlsbD0iIzk5OSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij7mmoLml6Dlm77niYc8L3RleHQ+Cjwvc3ZnPgo='
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
      <h2 class="page-title">车辆信息查询</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div class="update-time" :class="{ 'error-status': lastUpdateTime === 'Error' }">
          {{ lastUpdateTime === 'Error' ? 'Error' : (lastUpdateTime ? '更新时间: ' + lastUpdateTime : '') }}
        </div>
      </div>
    </header>

    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-row">
        <div class="input-group">
          <label for="brand">品牌</label>
          <input 
            id="brand"
            v-model="brand" 
            type="text" 
            placeholder="请输入品牌，如：奥迪"
            class="search-input"
            @keyup.enter="searchCars"
          />
        </div>
        <div class="input-group">
          <label for="model">型号</label>
          <input 
            id="model"
            v-model="model" 
            type="text" 
            placeholder="请输入型号，如：A6L"
            class="search-input"
            @keyup.enter="searchCars"
          />
        </div>
        <button 
          @click="searchCars" 
          :disabled="(!brand.trim() && !model.trim()) || loading"
          class="search-button"
        >
          {{ loading ? '查询中...' : '查询' }}
        </button>
      </div>
    </div>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在搜索车辆信息...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 车辆信息展示 -->
    <div v-if="!loading && !error && cars.length > 0" class="cars-container">
      <h3 class="results-title">找到 {{ cars.length }} 个相关车型</h3>
      
      <div class="car-grid">
        <div 
          v-for="(car, index) in cars" 
          :key="index"
          class="car-card"
          @click="searchOnDongchedi(`${car.brand} ${car.model}`)"
        >
          <!-- 车辆图片 -->
          <div class="car-image-container">
            <img 
              :src="car.image" 
              :alt="`${car.brand} ${car.model}`"
              class="car-image"
              @error="handleImageError"
            />
          </div>
          
          <!-- 车辆信息 -->
          <div class="car-info">
            <div class="car-header">
              <h4 class="car-brand">{{ car.brand }}</h4>
              <h5 class="car-model">{{ car.model }}</h5>
            </div>
            
            <div class="car-details">
              <div class="price-info">
                <span class="price-label">官方指导价</span>
                <span class="price-value">{{ car.price }}</span>
              </div>
              
              <div class="level-info">
                <span class="level-label">车型级别</span>
                <span class="level-value">{{ car.level }}</span>
              </div>
            </div>
            
            <div class="card-footer">
              <span class="click-hint">点击查看详情</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-if="!loading && !error && cars.length === 0 && (brand || model)" class="no-data-message">
      未找到相关车辆信息，请尝试其他关键词
    </div>

    <!-- 初始提示 -->
    <div v-if="!loading && !error && cars.length === 0 && !brand && !model" class="initial-message">
      请输入车辆品牌或型号进行搜索
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

/* 搜索区域 */
.search-section {
  padding: 1rem 1.5rem;
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--glass-border);
}

.search-row {
  display: flex;
  gap: 1rem;
  align-items: end;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
}

.search-input {
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(30, 88, 75, 0.1);
}

.search-button {
  background: var(--text-accent);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--shadow-light);
  flex-shrink: 0;
  height: fit-content;
}

.search-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-medium);
}

.search-button:disabled {
  background: var(--border-color);
  cursor: not-allowed;
  box-shadow: none;
}

/* 主要内容区域 */
.main-content {
  margin-top: 200px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 200px);
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
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(211, 47, 47, 0.2);
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px var(--glass-shadow);
}

.no-data-message, .initial-message {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: 0 4px 16px var(--glass-shadow);
}

/* 车辆信息展示区域 */
.cars-container {
  width: 100%;
}

.results-title {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
  border-bottom: 2px solid var(--text-accent);
  padding-bottom: 0.5rem;
}

.car-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* 车辆卡片 */
.car-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.car-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

/* 车辆图片 */
.car-image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
}

.car-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.car-card:hover .car-image {
  transform: scale(1.05);
}

/* 车辆信息 */
.car-info {
  padding: 1.2rem;
}

.car-header {
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid var(--border-color);
}

.car-brand {
  color: var(--text-accent);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.3rem 0;
}

.car-model {
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
}

.car-details {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.price-info, .level-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-label, .level-label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.price-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text-accent);
}

.level-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  background: var(--bg-secondary);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.card-footer {
  text-align: center;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
}

.click-hint {
  font-size: 0.85rem;
  color: var(--text-accent);
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .search-section {
    padding: 1rem;
  }
  
  .search-row {
    flex-direction: column;
    gap: 0.8rem;
    align-items: stretch;
  }
  
  .search-button {
    width: 100%;
  }
  
  .main-content {
    padding: 1rem;
    margin-top: 200px;
  }
  
  .car-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .car-image-container {
    height: 180px;
  }
  
  .car-info {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
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
  
  .search-section {
    padding: 0.8rem;
  }
  
  .main-content {
    margin-top: 160px;
  }
  
  .car-image-container {
    height: 160px;
  }
  
  .car-info {
    padding: 0.8rem;
  }
  
  .car-model {
    font-size: 1.1rem;
  }
  
  .price-value {
    font-size: 1rem;
  }
}
</style>