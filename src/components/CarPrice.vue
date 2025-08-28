<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 车辆价格数据
const carPriceData = ref([])
const loading = ref(false)
const error = ref('')
const apiSource = ref('xxapi.cn')
const lastUpdateTime = ref('')

// 搜索相关
const brand = ref('')
const model = ref('')
const searchQuery = computed(() => {
  if (brand.value && model.value) {
    return `${brand.value}${model.value}`
  }
  return brand.value || model.value
})

// 获取车辆价格数据
const fetchCarPrices = async () => {
  if (!searchQuery.value.trim()) {
    error.value = '请输入品牌或型号'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const requestOptions = {
      method: 'GET',
      redirect: 'follow'
    }

    const response = await fetch(`https://v2.xxapi.cn/api/carprice?search=${encodeURIComponent(searchQuery.value)}`, requestOptions)
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data) {
      carPriceData.value = result.data
      
      // 设置更新时间（使用当前时间）
      const now = new Date()
      lastUpdateTime.value = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      throw new Error(`API返回错误: ${result.msg || '未知错误'}`)
    }
  } catch (err) {
    error.value = '获取车辆价格数据失败，请检查网络连接或确认输入的品牌型号是否正确'
    lastUpdateTime.value = 'Error'
    console.error('车辆价格API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
  }
}

// 搜索车辆
const searchCars = () => {
  fetchCarPrices()
}

// 返回主页
const goBack = () => {
  router.push('/')
}

// 跳转到懂车帝搜索
const searchOnDongchedi = (carName) => {
  const keyword = encodeURIComponent(carName)
  const url = `https://www.dongchedi.com/search?keyword=${keyword}`
  window.open(url, '_blank')
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
      <div class="search-inputs">
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
      </div>
      <button 
        @click="searchCars" 
        :disabled="!searchQuery.trim() || loading"
        class="search-button"
      >
        {{ loading ? '查询中...' : '查询' }}
      </button>
    </div>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在获取车辆价格数据...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 车辆价格数据展示 -->
    <div v-if="!loading && !error && carPriceData.length > 0" class="car-price-sections">
      <section class="price-section">
        <h3>{{ carPriceData[0].brand_name }} 车辆价格信息 ({{ carPriceData.length }} 条结果)</h3>
        
        <!-- 车辆展示区域 -->
        <div class="car-display-container">
          <!-- 车辆图片 -->
          <div class="car-image-container">
            <img 
              :src="carPriceData[0].cover_url" 
              :alt="carPriceData[0].brand_name"
              class="main-car-image"
              @error="$event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgNjBMMTIwIDQwSDgwTDEwMCA2MFoiIGZpbGw9IiNDQ0MiLz4KPHN2Zz4K'"
            />
          </div>

          <!-- 车型卡片列表 -->
          <div class="car-cards-container">
            <div 
              v-for="(item, index) in carPriceData" 
              :key="index"
              class="car-card"
              @click="searchOnDongchedi(item.car_name)"
            >
              <div class="card-header">
                <h4 class="car-name">{{ item.car_name }}</h4>
              </div>
              <div class="price-info">
                <div class="price-row">
                  <span class="price-label">指导价</span>
                  <span class="guide-price">{{ item.price }}</span>
                </div>
                <div class="price-row">
                  <span class="price-label">经销商价</span>
                  <span class="dealer-price">{{ item.dealer_price }}</span>
                </div>
              </div>
              <div class="card-footer">
                <span class="click-hint">点击查看详情</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 无数据提示 -->
    <div v-if="!loading && !error && carPriceData.length === 0 && (brand || model)" class="no-data-message">
      未找到相关车辆信息，请尝试其他关键词
    </div>

    <!-- 初始提示 -->
    <div v-if="!loading && !error && carPriceData.length === 0 && !brand && !model" class="initial-message">
      请输入品牌或型号查询车辆价格信息
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

.search-inputs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
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
  align-self: flex-end;
  box-shadow: 0 2px 8px var(--shadow-light);
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
  margin-top: 240px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 240px);
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

/* 车辆价格数据区域 */
.car-price-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.price-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
  border-bottom: 2px solid var(--text-accent);
  padding-bottom: 0.5rem;
}

/* 车辆展示容器 */
.car-display-container {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

/* 车辆图片容器 */
.car-image-container {
  flex: 0 0 400px;
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.main-car-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
}

/* 车型卡片容器 */
.car-cards-container {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 8px;
}

/* 滚动条样式 */
.car-cards-container::-webkit-scrollbar {
  width: 6px;
}

.car-cards-container::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 3px;
}

.car-cards-container::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.car-cards-container::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

/* 车型卡片 */
.car-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
  position: relative;
}

.car-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.card-header {
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid var(--border-color);
}

.car-name {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.guide-price {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.dealer-price {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text-accent);
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
  
  .search-inputs {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .main-content {
    padding: 1rem;
    margin-top: 260px;
  }
  
  .car-display-container {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .car-image-container {
    flex: none;
    width: 100%;
  }
  
  .main-car-image {
    height: 200px;
  }
  
  .car-cards-container {
    grid-template-columns: 1fr;
    max-height: none;
    overflow-y: visible;
  }
  
  .car-card {
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
    margin-top: 280px;
  }
  
  .car-image-container {
    flex: none;
  }
  
  .main-car-image {
    height: 180px;
  }
  
  .car-card {
    padding: 0.8rem;
  }
  
  .car-name {
    font-size: 1rem;
  }
  
  .guide-price, .dealer-price {
    font-size: 0.95rem;
  }
}
</style>