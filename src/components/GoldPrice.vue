<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 黄金价格数据
const goldPriceData = ref({
  bank_gold_bar_price: [],
  gold_recycle_price: [],
  precious_metal_price: []
})
const loading = ref(true)
const error = ref('')
const apiSource = ref('xxapi.cn')
const lastUpdateTime = ref('')

// 获取黄金价格数据
const fetchGoldPrices = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const requestOptions = {
      method: 'GET',
      redirect: 'follow'
    }

    const response = await fetch("https://v2.xxapi.cn/api/goldprice", requestOptions)
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data) {
      goldPriceData.value = result.data
      
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
    error.value = '获取黄金价格数据失败，请检查网络连接'
    lastUpdateTime.value = 'Error'
    console.error('黄金价格API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
  }
}

// 返回主页
const goBack = () => {
  router.push('/')
}

// 组件挂载时获取数据
onMounted(() => {
  fetchGoldPrices()
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
      <h2 class="page-title">今日金价</h2>
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
      正在获取黄金价格数据...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 黄金价格数据展示 -->
    <div v-if="!loading && !error" class="gold-price-sections">
      <!-- 银行投资金条价格 -->
      <section class="price-section">
        <h3>银行投资金条价格</h3>
        <div class="price-grid">
          <div 
            v-for="item in goldPriceData.bank_gold_bar_price" 
            :key="item.bank"
            class="price-card bank-card"
          >
            <div class="card-header">
              <h4 class="bank-name">{{ item.bank }}</h4>
            </div>
            <div class="price-info">
              <span class="price-label">金条价格</span>
              <span class="current-price">¥{{ item.price }}/克</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 黄金回收价格 -->
      <section class="price-section">
        <h3>黄金回收价格</h3>
        <div class="price-grid">
          <div 
            v-for="item in goldPriceData.gold_recycle_price" 
            :key="item.gold_type + item.updated_date"
            class="price-card recycle-card"
          >
            <div class="card-header">
              <h4 class="gold-type">{{ item.gold_type }}</h4>
              <div class="update-date">{{ item.updated_date }}</div>
            </div>
            <div class="price-info">
              <span class="price-label">回收价格</span>
              <span class="current-price">¥{{ item.recycle_price }}/克</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 贵金属品牌价格 -->
      <section class="price-section">
        <h3>贵金属品牌价格</h3>
        <div class="price-grid brand-grid">
          <div 
            v-for="item in goldPriceData.precious_metal_price" 
            :key="item.brand + item.updated_date"
            class="price-card brand-card"
          >
            <div class="card-header">
              <h4 class="brand-name">{{ item.brand }}</h4>
              <div class="update-date">{{ item.updated_date }}</div>
            </div>
            <div class="brand-prices">
              <div class="price-row">
                <span class="price-label">金条价</span>
                <span class="current-price">¥{{ item.bullion_price }}/克</span>
              </div>
              <div class="price-row">
                <span class="price-label">黄金价</span>
                <span class="current-price">¥{{ item.gold_price }}/克</span>
              </div>
              <div class="price-row">
                <span class="price-label">铂金价</span>
                <span class="current-price">
                  {{ item.platinum_price === '-' ? '暂无' : '¥' + item.platinum_price + '/克' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
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

/* 黄金价格数据区域 */
.gold-price-sections {
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

.price-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.brand-grid {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.price-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.bank-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.recycle-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.brand-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.bank-name, .gold-type, .brand-name {
  color: var(--text-accent);
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
}

.update-date {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.price-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 1rem;
}

.current-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-accent);
}

.brand-prices {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0;
}

.price-row .current-price {
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
  
  .price-grid, .brand-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .price-card {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .card-header {
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
  
  .price-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  
  .current-price {
    align-self: flex-end;
  }
}
</style>