<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 演唱会数据
const concertData = ref([])
const loading = ref(true)
const error = ref('')
const apiSource = ref('jkyai.top')
const lastUpdateTime = ref('')
const count = ref(100) // 默认获取100条数据
const selectedConcert = ref(null) // 选中的演唱会详情
const showModal = ref(false) // 控制详情弹窗显示
const selectedCity = ref('') // 选中的城市筛选
const sortType = ref('time') // 排序类型：time-时间，price-票价

// 获取所有城市列表
const cityList = computed(() => {
  const cities = new Set()
  concertData.value.forEach(concert => {
    if (concert.venue_name) {
      // 提取城市名称，格式如：[深圳]xxx 或 [中国香港]xxx
      const match = concert.venue_name.match(/\[([^\]]+)\]/)
      if (match) {
        cities.add(match[1])
      }
    }
  })
  return Array.from(cities).sort()
})

// 筛选和排序后的演唱会数据
const sortedConcertData = computed(() => {
  let filteredData = [...concertData.value]
  
  // 城市筛选
  if (selectedCity.value) {
    filteredData = filteredData.filter(concert => {
      return concert.venue_name && concert.venue_name.includes(`[${selectedCity.value}]`)
    })
  }
  
  // 排序
  if (sortType.value === 'time') {
    // 按时间排序
    filteredData.sort((a, b) => {
      const dateA = parseShowTime(a.show_time)
      const dateB = parseShowTime(b.show_time)
      return dateA - dateB
    })
  } else if (sortType.value === 'price') {
    // 按票价排序，将价格为0的放到最后
    filteredData.sort((a, b) => {
      const priceA = parseFloat(a.price_min) || 0
      const priceB = parseFloat(b.price_min) || 0
      
      // 如果A价格为0，B价格不为0，A排在后面
      if (priceA === 0 && priceB > 0) return 1
      // 如果B价格为0，A价格不为0，B排在后面
      if (priceB === 0 && priceA > 0) return -1
      // 如果都为0或都不为0，按正常价格排序
      return priceA - priceB
    })
  }
  
  return filteredData
})

// 解析演出时间
const parseShowTime = (showTime) => {
  if (!showTime) return new Date(0)
  
  // 处理延期待定的情况
  if (showTime.includes('延期待定')) {
    return new Date('2099-12-31') // 延期的放到最后
  }
  
  // 提取日期部分
  let dateStr = showTime
  if (showTime.includes('(')) {
    dateStr = showTime.split('(')[0].trim()
  }
  
  // 处理不同的日期格式
  if (dateStr.includes('-')) {
    // 格式：2025.09.05-09.06 或 2025.09.13-09.14
    const startDate = dateStr.split('-')[0].trim()
    return new Date(startDate.replace(/\./g, '/'))
  } else if (dateStr.includes('  ')) {
    // 格式：2025.09.13  19:00
    const datePart = dateStr.split('  ')[0].trim()
    return new Date(datePart.replace(/\./g, '/'))
  } else {
    // 单个日期：2025.09.27
    return new Date(dateStr.replace(/\./g, '/'))
  }
}

// 格式化演出时间显示
const formatShowTime = (showTime) => {
  if (!showTime) return '时间待定'
  
  if (showTime.includes('延期待定')) {
    return '延期待定'
  }
  
  return showTime
}

// 格式化价格显示
const formatPrice = (price) => {
  if (!price) return '价格待定'
  return `¥${parseFloat(price).toFixed(0)}起`
}

// 获取演唱会数据
const fetchConcerts = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.jkyai.top/API/ychpqb.php?count=${count.value}`)
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data && Array.isArray(result.data)) {
      concertData.value = result.data
      
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
      throw new Error(`API返回错误: ${result.msg || '未知错误'}`)
    }
  } catch (err) {
    error.value = '获取演唱会数据失败，请检查网络连接'
    lastUpdateTime.value = 'Error'
    console.error('演唱会API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
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

// 刷新数据
const refreshData = () => {
  fetchConcerts()
}

// 图片代理服务 - 使用公共代理服务来获取图片
const getProxyImageUrl = (originalUrl) => {
  if (!originalUrl) return ''
  
  // 使用多个代理服务作为备选
  const proxyServices = [
    'https://images.weserv.nl/?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.allorigins.win/raw?url='
  ]
  
  // 编码原始URL
  const encodedUrl = encodeURIComponent(originalUrl)
  
  // 返回第一个代理服务的URL
  return proxyServices[0] + encodedUrl
}

// 处理图片加载错误
const handleImageError = (event) => {
  const img = event.target
  const originalSrc = img.getAttribute('data-original-src')
  const currentAttempt = parseInt(img.getAttribute('data-attempt') || '0')
  
  const proxyServices = [
    'https://images.weserv.nl/?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.allorigins.win/raw?url='
  ]
  
  if (currentAttempt < proxyServices.length - 1) {
    // 尝试下一个代理服务
    const nextAttempt = currentAttempt + 1
    const encodedUrl = encodeURIComponent(originalSrc)
    img.src = proxyServices[nextAttempt] + encodedUrl
    img.setAttribute('data-attempt', nextAttempt.toString())
  } else if (originalSrc && originalSrc.includes('?x-oss-process=style/eventface')) {
    // 尝试移除OSS处理参数
    const baseUrl = originalSrc.split('?')[0]
    const encodedUrl = encodeURIComponent(baseUrl)
    img.src = proxyServices[0] + encodedUrl
    img.setAttribute('data-attempt', '0')
    img.setAttribute('data-original-src', baseUrl)
  } else {
    // 所有尝试都失败，显示占位符
    img.style.display = 'none'
    const placeholder = img.parentElement.querySelector('.image-placeholder')
    if (placeholder) {
      placeholder.style.display = 'flex'
      placeholder.querySelector('.placeholder-text').textContent = '图片加载失败'
      placeholder.querySelector('.placeholder-icon').textContent = '🖼️'
    }
  }
}

// 处理图片加载成功
const handleImageLoad = (event) => {
  const img = event.target
  img.style.display = 'block'
  const placeholder = img.parentElement.querySelector('.image-placeholder')
  if (placeholder) {
    placeholder.style.display = 'none'
  }
}

// 预处理图片URL - 使用代理服务
const processImageUrl = (url) => {
  if (!url) return ''
  
  // 确保URL是完整的HTTP/HTTPS链接
  let fullUrl = url
  if (!url.startsWith('http')) {
    fullUrl = 'https://' + url
  }
  
  // 使用代理服务获取图片
  return getProxyImageUrl(fullUrl)
}

// 显示演唱会详情
const showConcertDetail = (concert) => {
  selectedConcert.value = concert
  showModal.value = true
}

// 关闭详情弹窗
const closeModal = () => {
  showModal.value = false
  selectedConcert.value = null
}

// 生成Bing搜索链接
const getBingSearchUrl = (concertName) => {
  const keyword = encodeURIComponent(concertName + ' 演唱会 购票')
  return `https://www.bing.com/search?q=${keyword}`
}

// 跳转到Bing搜索
const goToBingSearch = (concertName) => {
  const url = getBingSearchUrl(concertName)
  window.open(url, '_blank')
}

// 重置筛选条件
const resetFilters = () => {
  selectedCity.value = ''
  sortType.value = 'time'
}

// 组件挂载时获取数据
onMounted(() => {
  fetchConcerts()
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
      <h2 class="page-title">演唱会排期</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div class="update-time" :class="{ 'error-status': lastUpdateTime === 'Error' }">
          {{ lastUpdateTime === 'Error' ? 'Error' : '更新时间: ' + lastUpdateTime }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在获取演唱会数据...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="refreshData" class="retry-button">重试</button>
    </div>

    <!-- 演唱会数据展示 -->
    <div v-if="!loading && !error" class="concert-section">
      <div class="section-header">
        <h3>演唱会排期表</h3>
        <div class="concert-count">
          共 {{ concertData.length }} 场演出
          <span v-if="selectedCity || sortType !== 'time'" class="filter-info">
            (已筛选: {{ sortedConcertData.length }} 场)
          </span>
        </div>
      </div>
      
      <!-- 筛选和排序控件 -->
      <div class="filter-controls">
        <div class="filter-group">
          <label class="filter-label">城市筛选:</label>
          <select v-model="selectedCity" class="filter-select">
            <option value="">全部城市</option>
            <option v-for="city in cityList" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">排序方式:</label>
          <select v-model="sortType" class="filter-select">
            <option value="time">按时间排序</option>
            <option value="price">按票价排序</option>
          </select>
        </div>
        
        <button @click="resetFilters" class="reset-button">
          <span class="reset-icon">🔄</span>
          重置
        </button>
      </div>
      
      <div class="concert-grid">
        <div 
          v-for="(concert, index) in sortedConcertData" 
          :key="index"
          class="concert-card"
          @click="showConcertDetail(concert)"
        >
          <div class="concert-image">
            <img 
              :src="processImageUrl(concert.img)" 
              :alt="concert.name"
              :data-original-src="concert.img"
              data-attempt="0"
              @error="handleImageError"
              @load="handleImageLoad"
              loading="lazy"
              crossorigin="anonymous"
            />
            <div class="image-placeholder">
              <div class="placeholder-icon">🎤</div>
              <div class="placeholder-text">加载中...</div>
            </div>
          </div>
          
          <div class="concert-info">
            <div class="concert-header">
              <h4 class="concert-name">{{ concert.name }}</h4>
            </div>
            
            <div class="concert-details">
              <div class="detail-item">
                <span class="detail-label">演出时间</span>
                <span class="detail-value show-time">{{ formatShowTime(concert.show_time) }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">演出场馆</span>
                <span class="detail-value venue">{{ concert.venue_name }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">票价</span>
                <span class="detail-value price">{{ formatPrice(concert.price_min) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>演唱会详情</h2>
          <button class="close-button" @click="closeModal">×</button>
        </div>
        
        <div class="modal-body" v-if="selectedConcert">
          <div class="detail-image">
            <img 
              :src="processImageUrl(selectedConcert.img)" 
              :alt="selectedConcert.name"
              :data-original-src="selectedConcert.img"
              data-attempt="0"
              @error="handleImageError"
              @load="handleImageLoad"
              crossorigin="anonymous"
            />
            <div class="image-placeholder">
              <div class="placeholder-icon">🎤</div>
              <div class="placeholder-text">加载中...</div>
            </div>
          </div>
          
          <div class="detail-info">
            <h3 class="detail-title">{{ selectedConcert.name }}</h3>
            
            <div class="detail-grid">
              <div class="detail-row">
                <span class="detail-label">演出时间</span>
                <span class="detail-value">{{ formatShowTime(selectedConcert.show_time) }}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">演出场馆</span>
                <span class="detail-value">{{ selectedConcert.venue_name }}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">票价</span>
                <span class="detail-value price-highlight">{{ formatPrice(selectedConcert.price_min) }}</span>
              </div>
            </div>
            
            <div class="action-buttons">
              <button class="search-button" @click="goToBingSearch(selectedConcert.name)">
                <span class="button-icon">🔍</span>
                <span>Bing搜索购票</span>
              </button>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.retry-button {
  background: #d32f2f;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;
}

.retry-button:hover {
  background: #b71c1c;
}

/* 演唱会数据区域 */
.concert-section {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  color: var(--text-accent);
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.concert-count {
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-info {
  color: var(--text-accent);
  font-weight: 600;
}

/* 筛选控件样式 */
.filter-controls {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 4px 16px var(--glass-shadow);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.filter-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
  min-width: 70px;
}

.filter-select {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.filter-select:hover {
  border-color: var(--text-accent);
}

.reset-button {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reset-button:hover {
  border-color: var(--text-accent);
  color: var(--text-accent);
  transform: translateY(-1px);
}

.reset-icon {
  font-size: 1rem;
}

.concert-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.concert-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
  cursor: pointer;
}

.concert-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.concert-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
}

.concert-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  display: block;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-secondary);
  z-index: 1;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  opacity: 0.6;
}

.placeholder-text {
  font-size: 0.9rem;
  opacity: 0.8;
}

.concert-image img[style*="display: none"] + .image-placeholder {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.concert-image img[style*="display: none"] + .image-placeholder .placeholder-icon {
  font-size: 4rem;
}

.concert-image img[style*="display: none"] + .image-placeholder .placeholder-text {
  content: "图片加载失败";
}

.concert-card:hover .concert-image img {
  transform: scale(1.05);
}

.concert-info {
  padding: 1.5rem;
}

.concert-header {
  margin-bottom: 1rem;
}

.concert-name {
  color: var(--text-accent);
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.concert-details {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.detail-label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
  min-width: 60px;
  flex-shrink: 0;
}

.detail-value {
  color: var(--text-primary);
  font-size: 0.95rem;
  text-align: right;
  flex: 1;
  word-break: break-word;
}

.detail-value.show-time {
  font-weight: 600;
  color: var(--text-accent);
}

.detail-value.venue {
  font-size: 0.85rem;
  line-height: 1.3;
}

.detail-value.price {
  font-weight: bold;
  color: #d32f2f;
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .concert-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .concert-card {
    margin-bottom: 0;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1rem;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .filter-label {
    min-width: auto;
  }
  
  .filter-select {
    width: 100%;
    min-width: auto;
  }
  
  .concert-image {
    height: 180px;
  }
  
  .concert-info {
    padding: 1rem;
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
  
  .concert-image {
    height: 160px;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  
  .detail-value {
    text-align: left;
  }
  
  .detail-label {
    min-width: auto;
  }
}

/* 详情弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-content {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 2px solid var(--glass-border);
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px var(--shadow-heavy);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--glass-border);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-accent);
  font-size: 1.5rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: var(--glass-bg);
  color: var(--text-accent);
  transform: scale(1.1);
}

.modal-body {
  padding: 2rem;
}

.detail-image {
  width: 100%;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
  position: relative;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-title {
  color: var(--text-accent);
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 0 1.5rem 0;
  line-height: 1.4;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--glass-border);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .detail-label {
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 80px;
  flex-shrink: 0;
}

.detail-row .detail-value {
  color: var(--text-primary);
  text-align: right;
  flex: 1;
  word-break: break-word;
}

.price-highlight {
  font-weight: bold;
  color: #d32f2f;
  font-size: 1.1rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.search-button {
  background: linear-gradient(135deg, #0078d4 0%, #106ebe 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 120, 212, 0.3);
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 120, 212, 0.4);
  background: linear-gradient(135deg, #106ebe 0%, #0078d4 100%);
}

.search-button .button-icon {
  font-size: 1.2rem;
}

/* 响应式设计 - 弹窗 */
@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1rem 1.5rem;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .detail-image {
    height: 250px;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .detail-row .detail-value {
    text-align: left;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .detail-image {
    height: 200px;
  }
  
  .search-button {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
  }
}
</style>