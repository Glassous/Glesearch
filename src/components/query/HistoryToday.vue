<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">历史上的今天</h2>
      <div class="api-info">
        <div class="api-source">数据来源: xxapi.cn</div>
        <div class="update-time" :class="{ 'error-status': error }">
          {{ error ? 'Error' : '实时更新' }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 内容区域 -->
    <div class="content">
      <div v-if="loading" class="loading-message">正在获取历史数据...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else class="history-list">
        <div class="date-header">
          <h3>{{ currentDate }}</h3>
          <p>共 {{ historyData.length }} 条历史事件</p>
        </div>
        <div 
          v-for="(item, index) in historyData" 
          :key="index"
          class="history-item"
        >
          <div class="year">{{ extractYear(item) }}</div>
          <div class="event-info">
            <div class="event-text">{{ extractEvent(item) }}</div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  name: 'HistoryToday',
  data() {
    return {
      loading: false,
      error: null,
      historyData: [],
      currentDate: ''
    }
  },
  mounted() {
    this.setCurrentDate()
    this.fetchHistoryData()
  },
  methods: {
    goBack() {
      this.$router.push('/')
    },
    setCurrentDate() {
      const now = new Date()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      this.currentDate = `${month}月${day}日`
    },
    async fetchHistoryData() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch('https://v2.xxapi.cn/api/history')
        const data = await response.json()
        
        if (data.code === 200) {
          this.historyData = data.data || []
        } else {
          this.error = '数据获取失败'
        }
      } catch (err) {
        this.error = '网络请求失败'
        console.error('API请求错误:', err)
      } finally {
        this.loading = false
      }
    },
    extractYear(historyText) {
      // 从历史文本中提取年份，格式如："1999年03月12日 当代小提琴大师梅纽因逝世"
      const match = historyText.match(/^(\d{4})年/)
      return match ? match[1] : '未知'
    },
    extractEvent(historyText) {
      // 从历史文本中提取事件内容
      const match = historyText.match(/^\d{4}年\d{2}月\d{2}日\s+(.+)$/)
      return match ? match[1] : historyText
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
  border-bottom: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  width: 100%;
  z-index: 1000;
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
  backdrop-filter: blur(10px);
  transform: scale(1.05);
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
  color: var(--text-accent);
  font-weight: bold;
}

/* 主要内容区域 */
.main-content {
  margin-top: 60px;
  padding: 0;
  min-height: calc(100vh - 60px);
  width: 100%;
}

/* 加载和错误状态 */
.loading-message {
  text-align: center;
  padding: 2rem 1.5rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.error-message {
  text-align: center;
  padding: 2rem;
  color: var(--text-accent);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  margin: 0 1.5rem 2rem 1.5rem;
  box-shadow: var(--glass-shadow);
}

/* 内容区域 */
.content {
  padding: 2rem 1.5rem;
}

.date-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 2px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.date-header h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-accent);
  font-size: 1.8rem;
  font-weight: 600;
}

.date-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.history-list {
  max-width: 800px;
  margin: 0 auto;
}

.history-item {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: var(--glass-shadow);
}

.history-item:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-medium);
}

.year {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-accent);
  min-width: 60px;
  text-align: center;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  padding: 0.5rem;
  border-radius: 8px;
  flex-shrink: 0;
  border: 1px solid var(--glass-border);
}

.event-info {
  flex: 1;
}

.event-text {
  font-size: 1rem;
  color: var(--text-primary);
  line-height: 1.6;
  font-weight: 400;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .content {
    padding: 1rem;
  }
  
  .date-header {
    padding: 1rem;
  }
  
  .date-header h3 {
    font-size: 1.5rem;
  }
  
  .history-item {
    padding: 1rem;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .year {
    font-size: 1rem;
    min-width: auto;
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .event-text {
    font-size: 0.9rem;
  }
}

@media (max-width: 599px) {
  .page-title {
    font-size: 1.2rem;
  }
  
  .api-info {
    font-size: 0.65rem;
  }
  
  .top-bar {
    padding: 0.8rem;
  }
  
  .date-header h3 {
    font-size: 1.3rem;
  }
}
</style>