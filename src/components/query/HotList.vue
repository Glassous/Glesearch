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
        <div class="api-source">数据来源: api.pearktrue.cn</div>
        <div class="update-time" :class="{ 'error-status': error }">
          {{ error ? 'Error' : (lastUpdateTime || '实时更新') }}
        </div>
      </div>
    </header>

    <!-- 平台选择栏 -->
    <div class="platform-selector">
      <select v-model="selectedPlatform" @change="fetchHotData" class="platform-select">
        <option v-for="platform in platforms" :key="platform.value" :value="platform.value">
          {{ platform.label }}
        </option>
      </select>
    </div>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 内容区域 -->
    <div class="content">
      <div v-if="loading" class="loading-message">正在获取{{ selectedPlatform }}热榜数据...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <template v-else>
        <!-- 平台信息展示 -->
        <div v-if="platformInfo" class="platform-info">
          <div class="platform-title">{{ platformInfo.title }}</div>
          <div class="platform-type">{{ platformInfo.type }}</div>
          <div class="platform-description">{{ platformInfo.description }}</div>
          <div class="platform-stats">
            <span>共 {{ platformInfo.total }} 条</span>
            <span v-if="lastUpdateTime" class="update-time">更新: {{ formatUpdateTime(lastUpdateTime) }}</span>
          </div>
        </div>
        
        <!-- 热榜列表 -->
        <div class="hot-list">
          <div 
            v-for="(item, index) in hotData" 
            :key="item.id || index"
            class="hot-item"
            @click="openLink(item.url || item.mobileUrl)"
          >
            <div class="rank">{{ index + 1 }}</div>
            <div class="item-content">
              <div class="item-header">
                <div class="title">{{ item.title }}</div>
                <div class="hot-value" v-if="item.hot">
                  {{ formatHotValue(item.hot) }}
                </div>
              </div>
              <div class="item-meta">
                <span v-if="item.author" class="author">{{ item.author }}</span>
                <span v-if="item.timestamp" class="timestamp">{{ formatTimestamp(item.timestamp) }}</span>
              </div>
              <div v-if="item.desc && item.desc !== '-'" class="description">
                {{ truncateText(item.desc, 100) }}
              </div>
            </div>
            <div v-if="item.cover" class="item-cover">
              <img :src="item.cover" :alt="item.title" @error="handleImageError">
            </div>
          </div>
        </div>
      </template>
    </div>
  </main>
</template>

<script>
export default {
  name: 'HotList',
  data() {
    return {
      selectedPlatform: '哔哩哔哩',
      loading: false,
      error: null,
      hotData: [],
      platformInfo: null,
      lastUpdateTime: null,
      platforms: [
        { label: '哔哩哔哩', value: '哔哩哔哩' },
        { label: '微博', value: '微博' },
        { label: '知乎', value: '知乎' },
        { label: '抖音', value: '抖音' },
        { label: '百度', value: '百度' },
        { label: '今日头条', value: '今日头条' },
        { label: '腾讯新闻', value: '腾讯新闻' },
        { label: '网易新闻', value: '网易新闻' },
        { label: '新浪新闻', value: '新浪新闻' },
        { label: 'IT之家', value: 'IT之家' },
        { label: '稀土掘金', value: '稀土掘金' },
        { label: 'CSDN', value: 'CSDN' },
        { label: '虎扑', value: '虎扑' },
        { label: '虎嗅', value: '虎嗅' },
        { label: '36氪', value: '36氪' },
        { label: '什么值得买', value: '什么值得买' },
        { label: '少数派', value: '少数派' },
        { label: '酷安', value: '酷安' },
        { label: '豆瓣讨论', value: '豆瓣讨论' },
        { label: '豆瓣电影', value: '豆瓣电影' },
        { label: '简书', value: '简书' },
        { label: '原神', value: '原神' },
        { label: '崩坏3', value: '崩坏3' },
        { label: '英雄联盟', value: '英雄联盟' },
        { label: 'HelloGitHub', value: 'HelloGitHub' },
        { label: '历史上的今天', value: '历史上的今天' }
      ]
    }
  },
  mounted() {
    this.fetchHotData()
    // 确保页面加载时滚动到顶部
    this.$nextTick(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    })
  },
  methods: {
    goBack() {
      const from = this.$route.query.from
      if (from === 'home') {
        this.$router.push('/')
      } else if (from === 'query') {
        this.$router.push('/query')
      } else {
        this.$router.push('/')
      }
    },
    async fetchHotData() {
      this.loading = true
      this.error = null
      
      try {
        const apiUrl = `https://api.pearktrue.cn/api/dailyhot/?title=${encodeURIComponent(this.selectedPlatform)}`
        const response = await fetch(apiUrl)
        const data = await response.json()
        
        if (data.code === 200) {
          this.hotData = data.data || []
          this.platformInfo = {
            name: data.name,
            title: data.title,
            type: data.type,
            description: data.description,
            total: data.total,
            link: data.link
          }
          this.lastUpdateTime = data.updateTime
        } else {
          this.error = data.msg || '数据获取失败'
        }
      } catch (err) {
        this.error = '网络请求失败，请检查网络连接'
        console.error('API请求错误:', err)
      } finally {
        this.loading = false
      }
    },
    formatHotValue(value) {
      if (typeof value === 'number') {
        if (value >= 100000000) {
          return Math.floor(value / 100000000) + '亿'
        } else if (value >= 10000000) {
          return Math.floor(value / 10000000) + '千万'
        } else if (value >= 10000) {
          return Math.floor(value / 10000) + '万'
        }
        return value.toString()
      }
      return value
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + '分钟前'
      } else if (diff < 86400000) { // 24小时内
        return Math.floor(diff / 3600000) + '小时前'
      } else {
        return date.toLocaleDateString()
      }
    },
    formatUpdateTime(updateTime) {
      if (!updateTime) return ''
      const date = new Date(updateTime)
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    truncateText(text, maxLength) {
      if (!text || text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    },
    handleImageError(event) {
      event.target.style.display = 'none'
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

/* 平台选择器 */
.platform-selector {
  display: flex;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.platform-select {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--glass-bg);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.platform-select:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
}

.platform-select:hover {
  border-color: var(--text-accent);
}

/* 主要内容区域 */
.main-content {
  margin-top: 140px;
  padding: 0;
  min-height: calc(100vh - 140px);
  width: 100%;
}

/* 平台信息 */
.platform-info {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1.5rem 1.5rem 1rem 1.5rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.platform-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-accent);
  margin-bottom: 0.5rem;
}

.platform-type {
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.platform-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.platform-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.platform-stats .update-time {
  color: var(--text-accent);
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
  margin: 0 1.5rem 1rem 1.5rem;
}

/* 内容区域 */
.content {
  padding: 0;
}

.hot-list {
  padding: 0 1.5rem;
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
  align-items: flex-start;
  box-shadow: 0 8px 32px var(--glass-shadow);
  width: 100%;
  box-sizing: border-box;
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
  margin-top: 0.2rem;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.8rem;
  gap: 1rem;
}

.hot-item .title {
  font-size: 1.1rem;
  color: var(--text-primary);
  line-height: 1.4;
  font-weight: 500;
  flex: 1;
  margin: 0;
}

.hot-value {
  font-size: 0.85rem;
  color: var(--text-accent);
  font-weight: 600;
  white-space: nowrap;
  background: rgba(var(--accent-rgb), 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
}

.item-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.author {
  font-weight: 500;
}

.timestamp {
  color: var(--text-accent);
}

.description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-top: 0.5rem;
}

.item-cover {
  width: 80px;
  height: 60px;
  margin-left: 1rem;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}

.hot-item:hover .item-cover img {
  transform: scale(1.05);
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
  
  .platform-selector {
    padding: 0.8rem 1rem;
  }
  
  .platform-select {
    font-size: 0.9rem;
    padding: 0.6rem 0.8rem;
  }
  
  .content {
    padding: 0;
  }
  
  .hot-list {
    padding: 0 1rem;
  }
  
  .platform-info {
    padding: 1rem;
    margin: 1rem 1rem 0.8rem 1rem;
  }
  
  .platform-title {
    font-size: 1.3rem;
  }
  
  .hot-item {
    padding: 1rem;
    flex-direction: column;
    align-items: stretch;
  }
  
  .rank {
    font-size: 1.2rem;
    min-width: auto;
    text-align: left;
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
  
  .item-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .hot-item .title {
    font-size: 1rem;
  }
  
  .hot-value {
    font-size: 0.8rem;
    align-self: flex-start;
  }
  
  .item-cover {
    width: 100%;
    height: 120px;
    margin-left: 0;
    margin-top: 0.8rem;
  }
  
  .item-meta {
    flex-direction: column;
    gap: 0.3rem;
  }
}

@media (max-width: 599px) {
  .main-content {
    margin-top: 130px;
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
  
  .platform-info {
    padding: 0.8rem;
    margin: 0.8rem 0.8rem 0.6rem 0.8rem;
  }
  
  .content {
    padding: 0;
  }
  
  .hot-list {
    padding: 0 0.8rem;
  }
}
</style>