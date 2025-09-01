<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 倒数日数据
const countdownData = ref([])
const loading = ref(true)
const error = ref('')
const apiSource = ref('api.pearktrue.cn')
const lastUpdateTime = ref('')

// 处理倒数日数据
const processedCountdownData = computed(() => {
  return countdownData.value.map((item, index) => {
    const parts = item.split(' ')
    let eventName = ''
    let status = ''
    let daysLeft = 0
    
    if (parts.length >= 2) {
      // 检查是否是"进行中"状态
      if (item.includes('进行中')) {
        eventName = item.replace(' 进行中', '')
        status = '进行中'
        daysLeft = 0
      } else {
        // 提取天数
        const lastPart = parts[parts.length - 1]
        if (lastPart.includes('天')) {
          const dayMatch = lastPart.match(/(\d+)天/)
          if (dayMatch) {
            daysLeft = parseInt(dayMatch[1])
            eventName = item.replace(` ${lastPart}`, '')
            status = '倒计时'
          }
        } else {
          // 如果没有天数，可能是今天或者特殊情况
          eventName = item
          status = '今日'
          daysLeft = 0
        }
      }
    } else {
      eventName = item
      status = '未知'
      daysLeft = 0
    }
    
    return {
      id: index + 1,
      eventName,
      status,
      daysLeft,
      originalText: item
    }
  })
})

// 获取倒数日数据
const fetchCountdownDays = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch('https://api.pearktrue.cn/api/countdownday/')
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data) {
      countdownData.value = result.data
      
      // 设置更新时间
      if (result.time) {
        lastUpdateTime.value = result.time
      } else {
        const now = new Date()
        lastUpdateTime.value = now.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    } else {
      throw new Error(`API返回错误: ${result.msg || '未知错误'}`)
    }
  } catch (err) {
    error.value = '获取倒数日数据失败，请检查网络连接'
    lastUpdateTime.value = 'Error'
    console.error('倒数日API请求失败:', err)
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
  } else if (from === 'query') {
    router.push('/query')
  } else {
    // 默认返回首页
    router.push('/')
  }
}

// 获取状态样式类
const getStatusClass = (status, daysLeft) => {
  if (status === '进行中') return 'status-ongoing'
  if (status === '今日') return 'status-today'
  if (daysLeft <= 3) return 'status-urgent'
  if (daysLeft <= 7) return 'status-soon'
  return 'status-normal'
}

// 获取状态图标
const getStatusIcon = (status, daysLeft) => {
  if (status === '进行中') return '🟢'
  if (status === '今日') return '🔥'
  if (daysLeft <= 3) return '⚠️'
  if (daysLeft <= 7) return '⏰'
  return '📅'
}

// 格式化天数显示
const formatDaysLeft = (status, daysLeft) => {
  if (status === '进行中') return '进行中'
  if (status === '今日') return '今日'
  if (daysLeft === 0) return '今日'
  return `${daysLeft}天`
}

// 组件挂载时获取数据
onMounted(() => {
  fetchCountdownDays()
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
      <h2 class="page-title">倒数日获取</h2>
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
      正在获取倒数日数据...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 倒数日数据展示 -->
    <div v-if="!loading && !error" class="countdown-section">
      <h3>重要节日倒计时</h3>
      <div class="countdown-grid">
        <div 
          v-for="(event, index) in processedCountdownData" 
          :key="event.id"
          class="countdown-card"
          :class="getStatusClass(event.status, event.daysLeft)"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="event-header">
            <div class="event-icon">{{ getStatusIcon(event.status, event.daysLeft) }}</div>
            <div class="event-info">
              <h4 class="event-name">{{ event.eventName }}</h4>
              <div class="event-status">{{ event.status }}</div>
            </div>
          </div>
          
          <div class="countdown-display">
            <div class="days-container">
              <span class="days-number">{{ formatDaysLeft(event.status, event.daysLeft) }}</span>
              <span v-if="event.status === '倒计时'" class="days-label">后到达</span>
            </div>
            
            <div class="progress-bar" v-if="event.status === '倒计时' && event.daysLeft > 0">
              <div 
                class="progress-fill"
                :style="{ 
                  width: `${Math.max(10, 100 - (event.daysLeft / 30) * 100)}%`,
                  backgroundColor: event.daysLeft <= 3 ? '#ff4757' : event.daysLeft <= 7 ? '#ffa502' : '#2ed573'
                }"
              ></div>
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

/* 倒数日数据区域 */
.countdown-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.countdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.countdown-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.6s ease forwards;
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.countdown-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.countdown-card.status-ongoing {
  border-color: #2ed573;
  background: linear-gradient(135deg, rgba(46, 213, 115, 0.1), var(--glass-bg));
}

.countdown-card.status-today {
  border-color: #ff4757;
  background: linear-gradient(135deg, rgba(255, 71, 87, 0.1), var(--glass-bg));
}

.countdown-card.status-urgent {
  border-color: #ff4757;
  background: linear-gradient(135deg, rgba(255, 71, 87, 0.05), var(--glass-bg));
}

.countdown-card.status-soon {
  border-color: #ffa502;
  background: linear-gradient(135deg, rgba(255, 165, 2, 0.05), var(--glass-bg));
}

.countdown-card.status-normal {
  border-color: var(--glass-border);
}

.event-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.event-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.countdown-card:hover .event-icon {
  transform: scale(1.1) rotate(5deg);
}

.event-info {
  flex: 1;
  min-width: 0;
}

.event-name {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 0.3rem 0;
  word-wrap: break-word;
}

.event-status {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.countdown-display {
  text-align: center;
}

.days-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.days-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--text-accent);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.days-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .countdown-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .countdown-card {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .event-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.8rem;
  }
  
  .event-info {
    width: 100%;
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
  
  .days-number {
    font-size: 2rem;
  }
  
  .event-icon {
    width: 50px;
    height: 50px;
    font-size: 2rem;
  }
}
</style>