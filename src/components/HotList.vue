<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">热榜汇总</h2>
      <div class="api-info">
        <div class="api-source">数据来源: xxapi.cn</div>
        <div class="update-time" :class="{ 'error-status': error }">
          {{ error ? 'Error' : '实时更新' }}
        </div>
      </div>
    </header>

    <!-- 切换栏 -->
    <div class="tab-bar">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="switchTab(tab.key)"
      >
        {{ tab.name }}
      </button>
    </div>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 内容区域 -->
    <div class="content">
      <div v-if="loading" class="loading-message">正在获取热榜数据...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else class="hot-list">
        <div 
          v-for="item in hotData" 
          :key="item.index || item.position || item.title"
          class="hot-item"
          @click="openLink(item.url)"
        >
          <div class="rank">{{ item.index || item.position }}</div>
          <div class="content-info">
            <div class="title">{{ item.title || item.word }}</div>
            <div class="hot-value" v-if="item.hot || item.hot_value">
              {{ formatHotValue(item.hot || item.hot_value) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
export default {
  name: 'HotList',
  data() {
    return {
      activeTab: 'weibo',
      loading: false,
      error: null,
      hotData: [],
      tabs: [
        { key: 'weibo', name: '微博热榜', api: 'https://v2.xxapi.cn/api/weibohot' },
        { key: 'douyin', name: '抖音热榜', api: 'https://v2.xxapi.cn/api/douyinhot' },
        { key: 'baidu', name: '百度热搜', api: 'https://v2.xxapi.cn/api/baiduhot' },
        { key: 'bilibili', name: '哔哩哔哩热度榜', api: 'https://v2.xxapi.cn/api/bilibilihot' }
      ]
    }
  },
  mounted() {
    this.fetchHotData()
  },
  methods: {
    goBack() {
      this.$router.push('/')
    },
    switchTab(tabKey) {
      this.activeTab = tabKey
      this.fetchHotData()
    },
    async fetchHotData() {
      this.loading = true
      this.error = null
      
      try {
        const currentTab = this.tabs.find(tab => tab.key === this.activeTab)
        const response = await fetch(currentTab.api)
        const data = await response.json()
        
        if (data.code === 200) {
          this.hotData = this.formatData(data.data, this.activeTab)
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
    formatData(data, type) {
      if (type === 'bilibili') {
        // 哔哩哔哩返回的是字符串数组
        return data.map((title, index) => ({
          index: index + 1,
          title: title,
          url: `https://search.bilibili.com/all?keyword=${encodeURIComponent(title)}`
        }))
      } else if (type === 'douyin') {
        // 抖音热榜返回的是对象数组，需要特殊处理
        return data.map((item, index) => ({
          index: item.position || index + 1,
          title: item.word,
          hot_value: item.hot_value,
          url: `https://www.douyin.com/search/${encodeURIComponent(item.word)}`
        }))
      }
      // 其他平台返回对象数组
      return data
    },
    formatHotValue(value) {
      if (typeof value === 'number') {
        if (value >= 10000000) {
          return Math.floor(value / 10000000) + '千万'
        } else if (value >= 10000) {
          return Math.floor(value / 10000) + '万'
        }
        return value.toString()
      }
      return value
    },
    openLink(url) {
      if (url) {
        window.open(url, '_blank')
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
  transition: background-color 0.2s;
  width: 40px;
  height: 40px;
}

.back-button:hover {
  background-color: var(--glass-bg);
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

/* 切换栏 */
.tab-bar {
  display: flex;
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--glass-border);
  overflow-x: auto;
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.tab-btn {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn.active {
  color: var(--text-accent);
  border-bottom-color: var(--text-accent);
}

.tab-btn:hover {
  color: var(--text-accent);
}

/* 主要内容区域 */
.main-content {
  margin-top: 120px;
  padding: 0;
  min-height: calc(100vh - 120px);
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
  color: #d32f2f;
  background: #ffebee;
  border-radius: 8px;
  margin: 0 1.5rem 2rem 1.5rem;
}

/* 内容区域 */
.content {
  padding: 2rem 1.5rem;
}

.hot-list {
  max-width: 800px;
  margin: 0 auto;
}

.hot-item {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.hot-item:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.rank {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-accent);
  min-width: 50px;
  text-align: center;
  margin-right: 1rem;
}

.content-info {
  flex: 1;
}

.hot-item .title {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.4;
  font-weight: 500;
}

.hot-value {
  font-size: 0.9rem;
  color: var(--text-accent);
  font-weight: 600;
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
  
  .tab-bar {
    padding: 0 1rem;
  }
  
  .tab-btn {
    padding: 0.8rem 1rem;
    font-size: 0.8rem;
  }
  
  .content {
    padding: 1rem;
  }
  
  .hot-item {
    padding: 1rem;
  }
  
  .rank {
    font-size: 1.2rem;
    min-width: 40px;
    margin-right: 0.8rem;
  }
  
  .hot-item .title {
    font-size: 1rem;
  }
  
  .hot-value {
    font-size: 0.8rem;
  }
}

@media (max-width: 599px) {
  .main-content {
    margin-top: 110px;
  }
  
  .page-title {
    font-size: 1.2rem;
  }
  
  .api-info {
    font-size: 0.65rem;
  }
  
  .top-bar {
    padding: 0.8rem;
  }
}
</style>
