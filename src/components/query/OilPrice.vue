<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 油价数据
const oilPriceData = ref([])
const loading = ref(true)
const error = ref('')
const apiSource = ref('xxapi.cn')
const lastUpdateTime = ref('')

// 按GDP排序的油价数据
const sortedOilPriceData = computed(() => {
  return [...oilPriceData.value].sort((a, b) => {
    const rankA = provinceGDPRanking[a.regionName] || provinceGDPRanking[a.regionName?.replace(/省|市|自治区|壮族|维吾尔|回族/g, '')] || 999
    const rankB = provinceGDPRanking[b.regionName] || provinceGDPRanking[b.regionName?.replace(/省|市|自治区|壮族|维吾尔|回族/g, '')] || 999
    return rankA - rankB
  })
})

// 油品类型映射
const oilTypeNames = {
  n0: '0号柴油',
  n89: '89号汽油',
  n92: '92号汽油', 
  n95: '95号汽油',
  n98: '98号汽油'
}

// 省份GDP排序（2023年数据，从高到低）
const provinceGDPRanking = {
  '广东省': 1,
  '江苏省': 2,
  '山东省': 3,
  '浙江省': 4,
  '河南省': 5,
  '四川省': 6,
  '湖北省': 7,
  '福建省': 8,
  '湖南省': 9,
  '安徽省': 10,
  '上海市': 11,
  '河北省': 12,
  '北京市': 13,
  '陕西省': 14,
  '江西省': 15,
  '重庆市': 16,
  '辽宁省': 17,
  '云南省': 18,
  '广西壮族自治区': 19,
  '山西省': 20,
  '内蒙古自治区': 21,
  '贵州省': 22,
  '新疆维吾尔自治区': 23,
  '天津市': 24,
  '黑龙江省': 25,
  '吉林省': 26,
  '甘肃省': 27,
  '海南省': 28,
  '宁夏回族自治区': 29,
  '青海省': 30,
  '西藏自治区': 31,
  // 处理可能的简称或变体
  '广东': 1,
  '江苏': 2,
  '山东': 3,
  '浙江': 4,
  '河南': 5,
  '四川': 6,
  '湖北': 7,
  '福建': 8,
  '湖南': 9,
  '安徽': 10,
  '上海': 11,
  '河北': 12,
  '北京': 13,
  '陕西': 14,
  '江西': 15,
  '重庆': 16,
  '辽宁': 17,
  '云南': 18,
  '广西': 19,
  '山西': 20,
  '内蒙古': 21,
  '贵州': 22,
  '新疆': 23,
  '天津': 24,
  '黑龙江': 25,
  '吉林': 26,
  '甘肃': 27,
  '海南': 28,
  '宁夏': 29,
  '青海': 30,
  '西藏': 31
}

// 获取油价数据
const fetchOilPrices = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch('https://v2.xxapi.cn/api/oilPrice')
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data) {
      // 处理不同的数据结构
      let dataArray = []
      if (result.data.data && Array.isArray(result.data.data)) {
        dataArray = result.data.data
      } else if (Array.isArray(result.data)) {
        dataArray = result.data
      } else {
        throw new Error('数据格式不正确')
      }
      
      oilPriceData.value = dataArray
      
      // 设置更新时间（使用第一条数据的时间）
      if (dataArray.length > 0 && dataArray[0].time) {
        const updateDate = new Date(dataArray[0].time)
        lastUpdateTime.value = updateDate.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } else if (dataArray.length > 0 && dataArray[0].date) {
        // 如果没有time字段，使用date字段
        lastUpdateTime.value = dataArray[0].date
      }
    } else {
      throw new Error(`API返回错误: ${result.msg || '未知错误'}`)
    }
  } catch (err) {
    error.value = '获取油价数据失败，请检查网络连接'
    lastUpdateTime.value = 'Error'
    console.error('油价API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
  }
}

// 跳转到油价计算器
const goToCalculator = (region) => {
  router.push({
    name: 'OilPriceCalculator',
    params: {
      regionName: region.regionName
    },
    query: {
      from: route.query.from || 'oil-price'
    }
  })
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

// 格式化价格变化
const formatPriceChange = (change) => {
  if (change > 0) {
    return `+${change.toFixed(2)}`
  } else if (change < 0) {
    return change.toFixed(2)
  }
  return '0.00'
}

// 获取价格变化的样式类
const getPriceChangeClass = (change) => {
  if (change > 0) return 'price-up'
  if (change < 0) return 'price-down'
  return 'price-stable'
}

// 组件挂载时获取数据
onMounted(() => {
  fetchOilPrices()
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
      <h2 class="page-title">油价查询</h2>
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
      正在获取油价数据...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 油价数据展示 -->
    <div v-if="!loading && !error" class="oil-price-section">
      <h3>全国油价信息</h3>
      <div class="tip-message">
        <span class="tip-icon">💡</span>
        点击省份卡片进入油价计算器
      </div>
      <div class="region-grid">
        <div 
          v-for="region in sortedOilPriceData" 
          :key="region.id"
          class="region-card clickable"
          @click="goToCalculator(region)"
        >
          <div class="region-header">
            <h4 class="region-name">{{ region.regionName }}</h4>
            <div class="region-date">{{ region.date }}</div>
          </div>
          
          <div class="oil-prices">
            <div 
              v-for="(name, type) in oilTypeNames" 
              :key="type"
              class="oil-price-item"
            >
              <div class="oil-type">{{ name }}</div>
              <div class="price-info">
                <span class="current-price">¥{{ region[type]?.toFixed(2) || '0.00' }}</span>
                <span 
                  class="price-change"
                  :class="getPriceChangeClass(region[type + 'Change'])"
                >
                  {{ formatPriceChange(region[type + 'Change'] || 0) }}
                </span>
              </div>
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
}

/* 油价数据区域 */
.oil-price-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

/* 提示信息 */
.tip-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.tip-icon {
  font-size: 1rem;
}

.region-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.region-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.region-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.region-card.clickable {
  cursor: pointer;
  position: relative;
}

.region-card.clickable::after {
  content: '点击计算';
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--text-accent);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.region-card.clickable:hover::after {
  opacity: 1;
}

.region-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.region-name {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.region-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.oil-prices {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.oil-price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.oil-type {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 1rem;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.current-price {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text-accent);
}

.price-change {
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  min-width: 50px;
  text-align: center;
}

.price-change.price-up {
  color: #d32f2f;
  background: #ffebee;
}

.price-change.price-down {
  color: #388e3c;
  background: #e8f5e8;
}

.price-change.price-stable {
  color: var(--text-secondary);
  background: var(--bg-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .region-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .region-card {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .region-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
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
  
  .oil-price-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  
  .price-info {
    align-self: flex-end;
  }
}
</style>