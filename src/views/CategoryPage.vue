<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">{{ pageTitle }}</h2>
      <div class="placeholder"></div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 功能按钮网格 -->
    <section class="features-section">
      <div class="feature-grid">
        <button 
          v-for="(feature, index) in features" 
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
      </div>
    </section>
  </main>
</template>

<script>
export default {
  name: 'CategoryPage',
  data() {
    return {
      pageTitle: '',
      features: [],
      categoryType: ''
    }
  },
  created() {
    this.initializePage()
  },
  methods: {
    initializePage() {
      const route = this.$route.path
      
      if (route === '/query') {
        this.categoryType = 'query'
        this.pageTitle = '查询类功能'
        this.features = this.getQueryFeatures()
      } else if (route === '/tools') {
        this.categoryType = 'tools'
        this.pageTitle = '工具类功能'
        this.features = this.getToolsFeatures()
      } else if (route === '/entertainment') {
        this.categoryType = 'entertainment'
        this.pageTitle = '娱乐类功能'
        this.features = this.getEntertainmentFeatures()
      }
    },
    
    getQueryFeatures() {
      return [
        {
          id: 'oil-price',
          class: 'oil-price',
          icon: '⛽',
          title: '油价查询',
          description: '实时油价信息',
          action: () => this.$router.push({ path: '/oil-price', query: { from: 'query' } })
        },
        {
          id: 'hot-ranking',
          class: 'hot-ranking',
          icon: '🔥',
          title: '热榜汇总',
          description: '各平台热门内容',
          action: () => this.$router.push({ path: '/hot-list', query: { from: 'query' } })
        },
        {
          id: 'history-today',
          class: 'history-today',
          icon: '📅',
          title: '历史上的今天',
          description: '历史事件回顾',
          action: () => this.$router.push({ path: '/history-today', query: { from: 'query' } })
        },
        {
          id: 'gold-price',
          class: 'gold-price',
          icon: '🥇',
          title: '今日金价',
          description: '实时黄金价格',
          action: () => this.$router.push({ path: '/gold-price', query: { from: 'query' } })
        },
        {
          id: 'vehicle-info',
          class: 'vehicle-info',
          icon: '🚗',
          title: '车辆信息查询',
          description: '车牌号码查询',
          action: () => this.$router.push({ path: '/car-price', query: { from: 'query' } })
        },
        {
          id: 'movie-box-office',
          class: 'movie-box-office',
          icon: '🎬',
          title: '猫眼电影票房',
          description: '实时票房数据',
          action: () => this.$router.push({ path: '/movie-box', query: { from: 'query' } })
        },
        {
          id: 'countdown',
          class: 'countdown',
          icon: '⏰',
          title: '倒数日获取',
          description: '重要日期倒计时',
          action: () => this.$router.push({ path: '/countdown-day', query: { from: 'query' } })
        },
        {
          id: 'recipe-info',
          class: 'recipe-info',
          icon: '🍳',
          title: '菜谱信息大全',
          description: '丰富菜谱资源',
          action: () => this.$router.push({ path: '/recipe-info', query: { from: 'query' } })
        },
        {
          id: 'lottery-results',
          class: 'lottery-results',
          icon: '🎲',
          title: '彩票开奖查询',
          description: '最新开奖结果',
          action: () => this.$router.push({ path: '/lottery-results', query: { from: 'query' } })
        },
        {
          id: 'stock-data',
          class: 'stock-data',
          icon: '📈',
          title: '股票数据查询',
          description: '实时股价信息',
          action: () => this.$router.push({ path: '/stock-data', query: { from: 'query' } })
        },
        {
          id: 'trademark-info',
          class: 'trademark-info',
          icon: '®️',
          title: '商标信息查询',
          description: '商标注册信息',
          action: () => this.$router.push({ path: '/trademark-info', query: { from: 'query' } })
        },
        {
          id: 'route-query',
          class: 'route-query',
          icon: '🚌',
          title: '城际路线查询',
          description: '交通路线规划',
          action: () => this.$router.push({ path: '/city-routes', query: { from: 'query' } })
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
          action: () => this.$router.push({ path: '/website-info', query: { from: 'query' } })
        },
        {
          id: 'map-search',
          class: 'map-search',
          icon: '🗺️',
          title: '地图地名检索',
          description: '地理位置查询',
          action: () => this.$router.push({ path: '/map-search', query: { from: 'query' } })
        },
        {
          id: 'english-dict',
          class: 'english-dict',
          icon: '📖',
          title: '英文词典',
          description: '单词释义查询',
          action: () => this.$router.push({ path: '/english-dict', query: { from: 'query' } })
        },
        {
          id: 'tech-news',
          class: 'tech-news',
          icon: '📱',
          title: '实时科技资讯',
          description: '最新科技动态',
          action: () => this.$router.push({ path: '/tech-news', query: { from: 'query' } })
        },
        {
          id: 'world-population',
          class: 'world-population',
          icon: '🌍',
          title: '世界人口统计',
          description: '全球人口数据',
          action: () => this.$router.push({ path: '/world-population', query: { from: 'query' } })
        },
        {
          id: 'name-duplicate',
          class: 'name-duplicate',
          icon: '👥',
          title: '全国重名查询',
          description: '姓名重复统计',
          action: () => this.$router.push({ path: '/name-duplicate', query: { from: 'query' } })
        },
        {
          id: 'performance-ranking',
          class: 'performance-ranking',
          icon: '🏆',
          title: '性能天梯排行',
          description: '硬件性能对比',
          action: () => this.$router.push({ path: '/performance-ranking', query: { from: 'query' } })
        }
      ]
    },
    
    getToolsFeatures() {
      return [
        {
          id: 'currency-exchange',
          class: 'currency-exchange',
          icon: '💱',
          title: '汇率换算',
          description: '实时汇率转换',
          action: () => this.$router.push({ path: '/exchange-rate', query: { from: 'tools' } })
        },
        {
          id: 'translation',
          class: 'translation',
          icon: '🌐',
          title: '翻译',
          description: '多语言翻译服务',
          action: () => this.$router.push({ path: '/translate', query: { from: 'tools' } })
        },
        {
          id: 'driving-test',
          class: 'driving-test',
          icon: '🚗',
          title: '驾考题目',
          description: '驾照考试练习',
          action: () => this.$router.push({ path: '/driving-test', query: { from: 'tools' } })
        },
        {
          id: 'ai-assistant',
          class: 'ai-assistant',
          icon: '🤖',
          title: 'AI助手',
          description: '智能对话助手',
          action: () => this.$router.push({ path: '/ai-assistant', query: { from: 'tools' } })
        },
        {
          id: 'music-parser',
          class: 'music-parser',
          icon: '🎵',
          title: '音乐解析',
          description: '音乐链接解析下载',
          action: () => this.$router.push({ path: '/music-parser', query: { from: 'tools' } })
        },
        {
          id: 'mv-parser',
          class: 'mv-parser',
          icon: '🎬',
          title: 'MV解析',
          description: '音乐视频解析',
          action: () => this.$router.push({ path: '/mv-parser', query: { from: 'tools' } })
        },
        {
          id: 'random-number',
          class: 'random-number',
          icon: '🎲',
          title: '随机数字生成',
          description: '生成随机数字',
          action: () => this.$router.push({ path: '/random-number', query: { from: 'tools' } })
        },
        {
          id: 'express-tracking',
          class: 'express-tracking',
          icon: '📦',
          title: '快递单号查询',
          description: '物流信息追踪',
          action: () => this.$router.push({ path: '/express-query', query: { from: 'tools' } })
        },
        {
          id: 'ip-query',
          class: 'ip-query',
          icon: '🌐',
          title: 'IP地址查询',
          description: 'IP归属地查询',
          action: () => this.$router.push({ path: '/ip-query', query: { from: 'tools' } })
        },
        {
          id: 'qq-avatar',
          class: 'qq-avatar',
          icon: '👤',
          title: 'QQ头像提取',
          description: '获取QQ用户头像',
          action: () => this.$router.push({ path: '/qq-avatar', query: { from: 'tools' } })
        },
        {
          id: 'concert-schedule',
          class: 'concert-schedule',
          icon: '🎤',
          title: '演唱会排期表',
          description: '演出信息查询',
          action: () => this.$router.push({ path: '/concert-schedule', query: { from: 'tools' } })
        },
        {
          id: 'qr-generator',
          class: 'qr-generator',
          icon: '📱',
          title: '二维码生成',
          description: '文本转二维码',
          action: () => this.$router.push({ path: '/qr-generator', query: { from: 'tools' } })
        },
        {
          id: 'markdown-reader',
          class: 'markdown-reader',
          icon: '📝',
          title: 'Markdown阅读器',
          description: 'Markdown文档预览',
          action: () => this.$router.push({ path: '/markdown-reader', query: { from: 'tools' } })
        },
        {
          id: 'ai-prompt-generator',
          class: 'ai-prompt-generator',
          icon: '🧠',
          title: 'AI提示词生成器',
          description: '智能生成AI提示词',
          action: () => this.$router.push({ path: '/ai-prompt-generator', query: { from: 'tools' } })
        },
        {
          id: 'douyin-parser',
          class: 'douyin-parser',
          icon: '🎵',
          title: '抖音视频解析',
          description: '抖音无水印下载',
          action: () => this.$router.push({ path: '/douyin-parser', query: { from: 'tools' } })
        },
        {
          id: 'anime-avatar-ai',
          class: 'anime-avatar-ai',
          icon: '🎨',
          title: '动漫头像AI转换',
          description: 'AI生成动漫头像',
          action: () => this.$router.push({ path: '/anime-avatar-ai', query: { from: 'tools' } })
        },
        {
          id: 'speech-to-text',
          class: 'speech-to-text',
          icon: '🎙️',
          title: '语音转文本',
          description: '语音识别转换',
          action: () => this.$router.push({ path: '/speech-to-text', query: { from: 'tools' } })
        },
        {
          id: 'baidu-question-search',
          class: 'baidu-question-search',
          icon: '🔍',
          title: '百度题库搜索',
          description: '题目答案查询',
          action: () => this.$router.push({ path: '/baidu-tiku', query: { from: 'tools' } })
        },
        {
          id: 'ocr-text-recognition',
          class: 'ocr-text-recognition',
          icon: '📸',
          title: 'OCR文字识别',
          description: '图片文字提取',
          action: () => this.$router.push({ path: '/ocr-text-recognition', query: { from: 'tools' } })
        },
        {
          id: 'text-converter',
          class: 'text-converter',
          icon: '🔄',
          title: '简繁体互转',
          description: '中文简繁转换',
          action: () => this.$router.push({ path: '/text-converter', query: { from: 'tools' } })
        }
      ]
    },
    
    getEntertainmentFeatures() {
      return [
        {
          id: 'genshin-images',
          class: 'genshin-images',
          icon: '⚔️',
          title: '原神图片',
          description: '精美原神壁纸',
          action: () => this.$router.push({ path: '/genshin-images', query: { from: 'entertainment' } })
        },
        {
          id: 'random-girl-images',
          class: 'random-girl-images',
          icon: '👧',
          title: '随机小姐姐图片',
          description: '随机美女图片',
          action: () => this.$router.push({ path: '/random-girl-images', query: { from: 'entertainment' } })
        },
        {
          id: 'random-girl-videos',
          class: 'random-girl-videos',
          icon: '🎬',
          title: '随机小姐姐视频',
          description: '随机美女视频',
          action: () => this.$router.push({ path: '/random-girl-video', query: { from: 'entertainment' } })
        },
        {
          id: 'random-wallpaper',
          class: 'random-wallpaper',
          icon: '🖼️',
          title: '随机壁纸图片',
          description: '高清随机壁纸',
          action: () => this.$router.push({ path: '/random-wallpaper', query: { from: 'entertainment' } })
        },
        {
          id: 'kfc-crazy-thursday',
          class: 'kfc-crazy-thursday',
          icon: '🍗',
          title: 'KFC疯狂星期四',
          description: '疯狂星期四文案',
          action: () => this.$router.push({ path: '/kfc-thursday', query: { from: 'entertainment' } })
        },
        {
          id: 'nonsense-article',
          class: 'nonsense-article',
          icon: '📝',
          title: '狗屁不通文章',
          description: '自动生成文章',
          action: () => this.$router.push({ path: '/nonsense-article', query: { from: 'entertainment' } })
        },
        {
          id: 'kuaikan-comic',
          class: 'kuaikan-comic',
          icon: '📚',
          title: '快看漫画',
          description: '热门漫画推荐',
          action: () => this.$router.push({ path: '/kuaikan-comic', query: { from: 'entertainment' } })
        },
        {
          id: 'tomato-novel',
          class: 'tomato-novel',
          icon: '📖',
          title: '番茄小说',
          description: '免费小说阅读',
          action: () => this.$router.push({ path: '/tomato-novel', query: { from: 'entertainment' } })
        },
        {
          id: 'brain-teaser',
          class: 'brain-teaser',
          icon: '🧠',
          title: '脑筋急转弯',
          description: '趣味智力问答',
          action: () => this.$router.push({ path: '/brain-teaser', query: { from: 'entertainment' } })
        },
        {
          id: 'food-suggestion',
          class: 'food-suggestion',
          icon: '🍽️',
          title: '今天吃什么',
          description: '随机美食推荐',
          action: () => this.$router.push({ path: '/today-food', query: { from: 'entertainment' } })
        },
        {
          id: 'alipay-voice',
          class: 'alipay-voice',
          icon: '💰',
          title: '支付宝收款语音生成',
          description: '自定义收款语音',
          action: () => this.$router.push({ path: '/alipay-voice', query: { from: 'entertainment' } })
        },
        {
          id: 'hidden-poem',
          class: 'hidden-poem',
          icon: '📜',
          title: '藏头藏尾诗词生成',
          description: '创作藏头藏尾诗',
          action: () => this.$router.push({ path: '/hidden-poem', query: { from: 'entertainment' } })
        },
        {
          id: 'certificate-generator',
          class: 'certificate-generator',
          icon: '🏆',
          title: '在线证书生成器',
          description: '制作专属荣誉证书',
          action: () => this.$router.push({ path: '/certificate-generator', query: { from: 'entertainment' } })
        },
        {
          id: 'homophone-name',
          class: 'homophone-name',
          icon: '😄',
          title: '姓氏谐音梗网名生成器',
          description: '趣味谐音梗网名',
          action: () => this.$router.push({ path: '/homophone-name-generator', query: { from: 'entertainment' } })
        },
        {
          id: 'diploma-generator',
          class: 'diploma-generator',
          icon: '🎖️',
          title: '在线奖状生成器',
          description: '制作精美学生奖状',
          action: () => this.$router.push({ path: '/award-generator', query: { from: 'entertainment' } })
        },
        {
          id: 'us-identity',
          class: 'us-identity',
          icon: '🇺🇸',
          title: '随机美国人身份证',
          description: '生成虚拟身份信息',
          action: () => this.$router.push({ path: '/usa-identity', query: { from: 'entertainment' } })
        }
      ]
    },
    
    showComingSoon(featureName) {
      alert(`${featureName} 功能即将上线，敬请期待！`)
    },
    
    goBack() {
      const from = this.$route.query.from
      if (from === 'entertainment') {
        this.$router.push('/entertainment')
      } else {
        this.$router.push('/')
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

.placeholder {
  width: 40px;
  height: 40px;
}

/* 主要内容区域 */
.main-content {
  margin-top: 60px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 60px);
  width: 100%;
}

/* 功能区域 */
.features-section {
  margin-bottom: 2rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 0;
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

@media (max-width: 768px) {
  .feature-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .feature-button {
    padding: 1.2rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
}
</style>