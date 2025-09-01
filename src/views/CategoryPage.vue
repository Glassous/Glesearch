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
          action: () => this.showComingSoon('油价查询')
        },
        {
          id: 'hot-ranking',
          class: 'hot-ranking',
          icon: '🔥',
          title: '热榜汇总',
          description: '各平台热门内容',
          action: () => this.showComingSoon('热榜汇总')
        },
        {
          id: 'history-today',
          class: 'history-today',
          icon: '📅',
          title: '历史上的今天',
          description: '历史事件回顾',
          action: () => this.showComingSoon('历史上的今天')
        },
        {
          id: 'gold-price',
          class: 'gold-price',
          icon: '🥇',
          title: '今日金价',
          description: '实时黄金价格',
          action: () => this.showComingSoon('今日金价')
        },
        {
          id: 'vehicle-info',
          class: 'vehicle-info',
          icon: '🚗',
          title: '车辆信息查询',
          description: '车牌号码查询',
          action: () => this.showComingSoon('车辆信息查询')
        },
        {
          id: 'movie-box-office',
          class: 'movie-box-office',
          icon: '🎬',
          title: '猫眼电影票房',
          description: '实时票房数据',
          action: () => this.showComingSoon('猫眼电影票房')
        },
        {
          id: 'countdown',
          class: 'countdown',
          icon: '⏰',
          title: '倒数日获取',
          description: '重要日期倒计时',
          action: () => this.showComingSoon('倒数日获取')
        },
        {
          id: 'recipe-info',
          class: 'recipe-info',
          icon: '🍳',
          title: '菜谱信息大全',
          description: '丰富菜谱资源',
          action: () => this.showComingSoon('菜谱信息大全')
        },
        {
          id: 'lottery-results',
          class: 'lottery-results',
          icon: '🎲',
          title: '彩票开奖查询',
          description: '最新开奖结果',
          action: () => this.showComingSoon('彩票开奖查询')
        },
        {
          id: 'stock-data',
          class: 'stock-data',
          icon: '📈',
          title: '股票数据查询',
          description: '实时股价信息',
          action: () => this.showComingSoon('股票数据查询')
        },
        {
          id: 'trademark-info',
          class: 'trademark-info',
          icon: '®️',
          title: '商标信息查询',
          description: '商标注册信息',
          action: () => this.showComingSoon('商标信息查询')
        },
        {
          id: 'route-query',
          class: 'route-query',
          icon: '🚌',
          title: '城际路线查询',
          description: '交通路线规划',
          action: () => this.showComingSoon('城际路线查询')
        },
        {
          id: 'train-tickets',
          class: 'train-tickets',
          icon: '🚄',
          title: '高铁车票查询',
          description: '车次时刻查询',
          action: () => this.showComingSoon('高铁车票查询')
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
    },
    
    getToolsFeatures() {
      return [
        {
          id: 'currency-exchange',
          class: 'currency-exchange',
          icon: '💱',
          title: '汇率换算',
          description: '实时汇率转换',
          action: () => this.showComingSoon('汇率换算')
        },
        {
          id: 'translation',
          class: 'translation',
          icon: '🌐',
          title: '翻译',
          description: '多语言翻译服务',
          action: () => this.showComingSoon('翻译')
        },
        {
          id: 'driving-test',
          class: 'driving-test',
          icon: '🚗',
          title: '驾考题目',
          description: '驾照考试练习',
          action: () => this.showComingSoon('驾考题目')
        },
        {
          id: 'ai-assistant',
          class: 'ai-assistant',
          icon: '🤖',
          title: 'AI助手',
          description: '智能对话助手',
          action: () => this.$router.push('/ai-assistant')
        },
        {
          id: 'music-parser',
          class: 'music-parser',
          icon: '🎵',
          title: '音乐解析',
          description: '音乐链接解析下载',
          action: () => this.showComingSoon('音乐解析')
        },
        {
          id: 'mv-parser',
          class: 'mv-parser',
          icon: '🎬',
          title: 'MV解析',
          description: '音乐视频解析',
          action: () => this.showComingSoon('MV解析')
        },
        {
          id: 'random-number',
          class: 'random-number',
          icon: '🎲',
          title: '随机数字生成',
          description: '生成随机数字',
          action: () => this.showComingSoon('随机数字生成')
        },
        {
          id: 'express-tracking',
          class: 'express-tracking',
          icon: '📦',
          title: '快递单号查询',
          description: '物流信息追踪',
          action: () => this.showComingSoon('快递单号查询')
        },
        {
          id: 'ip-query',
          class: 'ip-query',
          icon: '🌐',
          title: 'IP地址查询',
          description: 'IP归属地查询',
          action: () => this.showComingSoon('IP地址查询')
        },
        {
          id: 'qq-avatar',
          class: 'qq-avatar',
          icon: '👤',
          title: 'QQ头像提取',
          description: '获取QQ用户头像',
          action: () => this.showComingSoon('QQ头像提取')
        },
        {
          id: 'concert-schedule',
          class: 'concert-schedule',
          icon: '🎤',
          title: '演唱会排期表',
          description: '演出信息查询',
          action: () => this.showComingSoon('演唱会排期表')
        },
        {
          id: 'qr-generator',
          class: 'qr-generator',
          icon: '📱',
          title: '二维码生成',
          description: '文本转二维码',
          action: () => this.showComingSoon('二维码生成')
        },
        {
          id: 'github-enhance',
          class: 'github-enhance',
          icon: '🐙',
          title: 'Github增强',
          description: 'Github功能增强',
          action: () => this.showComingSoon('Github增强')
        },
        {
          id: 'markdown-reader',
          class: 'markdown-reader',
          icon: '📝',
          title: 'Markdown阅读器',
          description: 'Markdown文档预览',
          action: () => this.showComingSoon('Markdown阅读器')
        },
        {
          id: 'douyin-parser',
          class: 'douyin-parser',
          icon: '🎵',
          title: '抖音视频解析',
          description: '抖音无水印下载',
          action: () => this.showComingSoon('抖音视频解析')
        },
        {
          id: 'xiaohongshu-parser',
          class: 'xiaohongshu-parser',
          icon: '📷',
          title: '小红书图集详情',
          description: '小红书内容解析',
          action: () => this.showComingSoon('小红书图集详情')
        },
        {
          id: 'anime-avatar-ai',
          class: 'anime-avatar-ai',
          icon: '🎨',
          title: '动漫头像AI转换',
          description: 'AI生成动漫头像',
          action: () => this.showComingSoon('动漫头像AI转换')
        },
        {
          id: 'speech-to-text',
          class: 'speech-to-text',
          icon: '🎙️',
          title: '语音转文本',
          description: '语音识别转换',
          action: () => this.showComingSoon('语音转文本')
        },
        {
          id: 'baidu-question-search',
          class: 'baidu-question-search',
          icon: '🔍',
          title: '百度题库搜索',
          description: '题目答案查询',
          action: () => this.showComingSoon('百度题库搜索')
        },
        {
          id: 'ocr-text-recognition',
          class: 'ocr-text-recognition',
          icon: '📸',
          title: 'OCR文字识别',
          description: '图片文字提取',
          action: () => this.showComingSoon('OCR文字识别')
        },
        {
          id: 'text-converter',
          class: 'text-converter',
          icon: '🔄',
          title: '简繁体互转',
          description: '中文简繁转换',
          action: () => this.showComingSoon('简繁体互转')
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
          action: () => this.showComingSoon('原神图片')
        },
        {
          id: 'random-girl-images',
          class: 'random-girl-images',
          icon: '👧',
          title: '随机小姐姐图片',
          description: '随机美女图片',
          action: () => this.showComingSoon('随机小姐姐图片')
        },
        {
          id: 'random-girl-videos',
          class: 'random-girl-videos',
          icon: '🎬',
          title: '随机小姐姐视频',
          description: '随机美女视频',
          action: () => this.showComingSoon('随机小姐姐视频')
        },
        {
          id: 'random-wallpaper',
          class: 'random-wallpaper',
          icon: '🖼️',
          title: '随机壁纸图片',
          description: '高清随机壁纸',
          action: () => this.showComingSoon('随机壁纸图片')
        },
        {
          id: 'kfc-crazy-thursday',
          class: 'kfc-crazy-thursday',
          icon: '🍗',
          title: 'KFC疯狂星期四',
          description: '疯狂星期四文案',
          action: () => this.showComingSoon('KFC疯狂星期四')
        },
        {
          id: 'nonsense-article',
          class: 'nonsense-article',
          icon: '📝',
          title: '狗屁不通文章',
          description: '自动生成文章',
          action: () => this.showComingSoon('狗屁不通文章')
        },
        {
          id: 'kuaikan-comic',
          class: 'kuaikan-comic',
          icon: '📚',
          title: '快看漫画',
          description: '热门漫画推荐',
          action: () => this.showComingSoon('快看漫画')
        },
        {
          id: 'tomato-novel',
          class: 'tomato-novel',
          icon: '📖',
          title: '番茄小说',
          description: '免费小说阅读',
          action: () => this.showComingSoon('番茄小说')
        },
        {
          id: 'brain-teaser',
          class: 'brain-teaser',
          icon: '🧠',
          title: '脑筋急转弯',
          description: '趣味智力问答',
          action: () => this.showComingSoon('脑筋急转弯')
        },
        {
          id: 'food-suggestion',
          class: 'food-suggestion',
          icon: '🍽️',
          title: '今天吃什么',
          description: '随机美食推荐',
          action: () => this.showComingSoon('今天吃什么')
        }
      ]
    },
    
    showComingSoon(featureName) {
      alert(`${featureName} 功能即将上线，敬请期待！`)
    },
    
    goBack() {
      this.$router.push('/')
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