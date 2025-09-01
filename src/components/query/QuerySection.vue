<template>
  <section class="category-section">
    <div class="section-header">
      <h2 class="section-title">查询类</h2>
      <p class="section-description">各种实用信息查询工具</p>
    </div>
    
    <div class="feature-grid">
      <!-- 显示前8个功能按钮 -->
      <button 
        v-for="(feature, index) in displayedFeatures" 
        :key="feature.id"
        class="feature-button" 
        :class="feature.class"
        @click="feature.action"
      >
        <div class="button-icon">{{ feature.icon }}</div>
        <div class="button-text">
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </button>
      
      <!-- 查看全部按钮 -->
      <button class="feature-button view-all-button" @click="viewAllQuery">
        <div class="button-icon">📋</div>
        <div class="button-text">
          <h3>查看全部</h3>
          <p>浏览所有查询功能</p>
        </div>
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'QuerySection',
  props: {
    maxDisplay: {
      type: Number,
      default: 8
    }
  },
  data() {
    return {
      queryFeatures: [
        {
          id: 'oil-price',
          class: 'oil-price',
          icon: '⛽',
          title: '油价查询',
          description: '实时油价信息',
          action: () => this.$router.push({ path: '/oil-price', query: { from: 'home' } })
        },
        {
          id: 'hot-ranking',
          class: 'hot-ranking',
          icon: '🔥',
          title: '热榜汇总',
          description: '各平台热门内容',
          action: () => this.$router.push({ path: '/hot-list', query: { from: 'home' } })
        },
        {
          id: 'history-today',
          class: 'history-today',
          icon: '📅',
          title: '历史上的今天',
          description: '历史事件回顾',
          action: () => this.$router.push({ path: '/history-today', query: { from: 'home' } })
        },
        {
          id: 'gold-price',
          class: 'gold-price',
          icon: '🥇',
          title: '今日金价',
          description: '实时黄金价格',
          action: () => this.$router.push({ path: '/gold-price', query: { from: 'home' } })
        },
        {
          id: 'vehicle-info',
          class: 'vehicle-info',
          icon: '🚗',
          title: '车辆信息查询',
          description: '车牌号码查询',
          action: () => this.$router.push({ path: '/car-price', query: { from: 'home' } })
        },
        {
          id: 'movie-box-office',
          class: 'movie-box-office',
          icon: '🎬',
          title: '猫眼电影票房',
          description: '实时票房数据',
          action: () => this.$router.push({ path: '/movie-box', query: { from: 'home' } })
        },
        {
          id: 'countdown',
          class: 'countdown',
          icon: '⏰',
          title: '倒数日获取',
          description: '重要日期倒计时',
          action: () => this.$router.push({ path: '/countdown-day', query: { from: 'home' } })
        },
        {
          id: 'recipe-info',
          class: 'recipe-info',
          icon: '🍳',
          title: '菜谱信息大全',
          description: '丰富菜谱资源',
          action: () => this.$router.push({ path: '/recipe-info', query: { from: 'home' } })
        },
        {
          id: 'lottery-results',
          class: 'lottery-results',
          icon: '🎲',
          title: '彩票开奖查询',
          description: '最新开奖结果',
          action: () => this.$router.push({ path: '/lottery-results', query: { from: 'home' } })
        },
        {
          id: 'stock-data',
          class: 'stock-data',
          icon: '📈',
          title: '股票数据查询',
          description: '实时股价信息',
          action: () => this.$router.push({ path: '/stock-data', query: { from: 'home' } })
        },
        {
          id: 'trademark-info',
          class: 'trademark-info',
          icon: '®️',
          title: '商标信息查询',
          description: '商标注册信息',
          action: () => this.$router.push({ path: '/trademark-info', query: { from: 'home' } })
        },
        {
          id: 'route-query',
          class: 'route-query',
          icon: '🚌',
          title: '城际路线查询',
          description: '交通路线规划',
          action: () => this.$router.push({ path: '/city-routes', query: { from: 'home' } })
        },
        {
          id: 'train-tickets',
          class: 'train-tickets',
          icon: '🚄',
          title: '高铁车票查询',
          description: '车次时刻查询',
          action: () => this.$router.push({ path: '/high-speed-ticket', query: { from: 'query' } })
        },
        {
          id: 'website-info',
          class: 'website-info',
          icon: '🌐',
          title: '网站信息获取',
          description: '网站详细信息',
          action: () => this.showComingSoon('网站信息获取')
        },
        {
          id: 'map-search',
          class: 'map-search',
          icon: '🗺️',
          title: '地图地名检索',
          description: '地理位置查询',
          action: () => this.showComingSoon('地图地名检索')
        },
        {
          id: 'steam-free',
          class: 'steam-free',
          icon: '🎮',
          title: 'Steam喜加一',
          description: '免费游戏推荐',
          action: () => this.showComingSoon('Steam喜加一')
        },
        {
          id: 'english-dict',
          class: 'english-dict',
          icon: '📖',
          title: '英文词典',
          description: '单词释义查询',
          action: () => this.showComingSoon('英文词典')
        },
        {
          id: 'tech-news',
          class: 'tech-news',
          icon: '📱',
          title: '实时科技资讯',
          description: '最新科技动态',
          action: () => this.showComingSoon('实时科技资讯')
        },
        {
          id: 'world-population',
          class: 'world-population',
          icon: '🌍',
          title: '世界人口统计',
          description: '全球人口数据',
          action: () => this.showComingSoon('世界人口统计')
        },
        {
          id: 'name-duplicate',
          class: 'name-duplicate',
          icon: '👥',
          title: '全国重名查询',
          description: '姓名重复统计',
          action: () => this.showComingSoon('全国重名查询')
        },
        {
          id: 'performance-ranking',
          class: 'performance-ranking',
          icon: '🏆',
          title: '性能天梯排行',
          description: '硬件性能对比',
          action: () => this.showComingSoon('性能天梯排行')
        }
      ]
    }
  },
  computed: {
    displayedFeatures() {
      return this.queryFeatures.slice(0, this.maxDisplay)
    }
  },
  methods: {
    showComingSoon(featureName) {
      this.$emit('show-coming-soon', featureName)
    },
    viewAllQuery() {
      this.$router.push('/query')
    }
  }
}
</script>

<style scoped>
.category-section {
  margin-bottom: 4rem;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 0 1rem;
}

.feature-button {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 8px 32px var(--glass-shadow);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
}

.feature-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 50%, 
    rgba(0, 0, 0, 0.02) 100%);
  border-radius: 16px;
  z-index: -1;
}

.feature-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-heavy);
  border-color: var(--text-accent);
}

.feature-button:active {
  transform: translateY(-2px);
}

.button-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.feature-button:hover .button-icon {
  transform: scale(1.1) rotate(5deg);
  background: rgba(255, 255, 255, 0.15);
}

.button-text {
  flex: 1;
}

.button-text h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.button-text p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.view-all-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.view-all-button .button-text h3,
.view-all-button .button-text p {
  color: white;
}

.view-all-button:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 15px 45px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .feature-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0;
  }
  
  .feature-button {
    padding: 1.2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
}
</style>