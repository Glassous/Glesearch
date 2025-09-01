<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 电影票房数据
const movieData = ref([])
const loading = ref(true)
const error = ref('')
const apiSource = ref('api.pearktrue.cn')
const lastUpdateTime = ref('')

// 获取电影票房数据
const fetchMovieBox = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch('https://api.pearktrue.cn/api/maoyan/')
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data) {
      movieData.value = result.data
      
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
    error.value = '获取电影票房数据失败，请检查网络连接'
    lastUpdateTime.value = 'Error'
    console.error('电影票房API请求失败:', err)
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

// 格式化票房数字
const formatBoxOffice = (boxDesc) => {
  return boxDesc || '暂无数据'
}

// 获取排名样式
const getRankClass = (rank) => {
  if (rank <= 3) return 'rank-top'
  if (rank <= 10) return 'rank-high'
  return 'rank-normal'
}

// 获取票房占比的颜色
const getBoxRateColor = (rate) => {
  const numRate = parseFloat(rate.replace('%', ''))
  if (numRate >= 20) return '#ff6b6b'
  if (numRate >= 10) return '#4ecdc4'
  if (numRate >= 5) return '#45b7d1'
  return '#96ceb4'
}

// 组件挂载时获取数据
onMounted(() => {
  fetchMovieBox()
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
      <h2 class="page-title">猫眼电影票房</h2>
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
      正在获取电影票房数据...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 电影票房数据展示 -->
    <div v-if="!loading && !error" class="movie-box-section">
      <h3>实时电影票房排行榜</h3>
      <div class="movie-grid">
        <div 
          v-for="movie in movieData" 
          :key="movie.top"
          class="movie-card"
        >
          <div class="movie-header">
            <div class="rank-badge" :class="getRankClass(movie.top)">
              {{ movie.top }}
            </div>
            <div class="movie-info">
              <h4 class="movie-name">{{ movie.movieName }}</h4>
              <div class="release-info">{{ movie.releaseInfo }}</div>
            </div>
          </div>
          
          <div class="box-office-info">
            <div class="main-stats">
              <div class="box-office">
                <span class="label">总票房</span>
                <span class="value primary">{{ formatBoxOffice(movie.sumBoxDesc) }}</span>
              </div>
              <div class="box-rate">
                <span class="label">票房占比</span>
                <span 
                  class="value rate"
                  :style="{ color: getBoxRateColor(movie.boxRate) }"
                >
                  {{ movie.boxRate }}
                </span>
              </div>
            </div>
            
            <div class="detail-stats">
              <div class="stat-item">
                <span class="stat-label">场次</span>
                <span class="stat-value">{{ movie.showCount?.toLocaleString() || '0' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">场次占比</span>
                <span class="stat-value">{{ movie.showCountRate }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均人次</span>
                <span class="stat-value">{{ movie.avgShowView }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">上座率</span>
                <span class="stat-value">{{ movie.avgSeatView }}</span>
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

/* 电影票房数据区域 */
.movie-box-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.movie-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.movie-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.movie-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.rank-badge.rank-top {
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.rank-badge.rank-high {
  background: linear-gradient(45deg, #4ecdc4, #6ed5d0);
  color: white;
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
}

.rank-badge.rank-normal {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.movie-info {
  flex: 1;
  min-width: 0;
}

.movie-name {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 0.3rem 0;
  word-wrap: break-word;
}

.release-info {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.box-office-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.box-office, .box-rate {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.value {
  font-size: 1.1rem;
  font-weight: bold;
}

.value.primary {
  color: var(--text-accent);
}

.value.rate {
  font-weight: bold;
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .movie-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .movie-card {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .main-stats {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .detail-stats {
    grid-template-columns: 1fr;
    gap: 0.6rem;
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
  
  .movie-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .rank-badge {
    align-self: center;
  }
  
  .movie-info {
    text-align: center;
    width: 100%;
  }
}
</style>