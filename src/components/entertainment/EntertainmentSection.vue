<template>
  <section class="category-section">
    <div class="section-header">
      <h2 class="section-title">娱乐类</h2>
      <p class="section-description">轻松有趣的娱乐功能</p>
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
      <button class="feature-button view-all-button" @click="viewAllEntertainment">
        <div class="button-icon">🎉</div>
        <div class="button-text">
          <h3>查看全部</h3>
          <p>浏览所有娱乐功能</p>
        </div>
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'EntertainmentSection',
  props: {
    maxDisplay: {
      type: Number,
      default: 8
    }
  },
  data() {
    return {
      entertainmentFeatures: [
        {
          id: 'genshin-images',
          class: 'genshin-images',
          icon: '⚔️',
          title: '原神图片',
          description: '精美原神壁纸',
          action: () => this.$router.push({ path: '/genshin-images', query: { from: 'home' } })
        },
        {
          id: 'random-girl-images',
          class: 'random-girl-images',
          icon: '👧',
          title: '随机小姐姐图片',
          description: '随机美女图片',
          action: () => this.$router.push({ path: '/random-girl-images', query: { from: 'home' } })
        },
        {
          id: 'random-girl-videos',
          class: 'random-girl-videos',
          icon: '🎬',
          title: '随机小姐姐视频',
          description: '随机美女视频',
          action: () => this.$router.push({ path: '/random-girl-video', query: { from: 'home' } })
        },
        {
          id: 'random-wallpaper',
          class: 'random-wallpaper',
          icon: '🖼️',
          title: '随机壁纸图片',
          description: '高清随机壁纸',
          action: () => this.$router.push({ path: '/random-wallpaper', query: { from: 'home' } })
        },
        {
          id: 'kfc-crazy-thursday',
          class: 'kfc-crazy-thursday',
          icon: '🍗',
          title: 'KFC疯狂星期四',
          description: '疯狂星期四文案',
          action: () => this.$router.push({ path: '/kfc-thursday', query: { from: 'home' } })
        },
        {
          id: 'nonsense-article',
          class: 'nonsense-article',
          icon: '📝',
          title: '狗屁不通文章',
          description: '自动生成文章',
          action: () => this.$router.push({ path: '/nonsense-article', query: { from: 'home' } })
        },
        {
          id: 'kuaikan-comic',
          class: 'kuaikan-comic',
          icon: '📚',
          title: '快看漫画',
          description: '热门漫画推荐',
          action: () => this.$router.push({ path: '/kuaikan-comic', query: { from: 'home' } })
        },
        {
          id: 'tomato-novel',
          class: 'tomato-novel',
          icon: '📖',
          title: '番茄小说',
          description: '免费小说阅读',
          action: () => this.$router.push({ path: '/tomato-novel', query: { from: 'home' } })
        },
        {
          id: 'brain-teaser',
          class: 'brain-teaser',
          icon: '🧠',
          title: '脑筋急转弯',
          description: '趣味智力问答',
          action: () => this.$router.push({ path: '/brain-teaser', query: { from: 'home' } })
        },
        {
          id: 'food-suggestion',
          class: 'food-suggestion',
          icon: '🍽️',
          title: '今天吃什么',
          description: '随机美食推荐',
          action: () => this.$router.push({ path: '/today-food', query: { from: 'home' } })
        },
        {
          id: 'hidden-poem',
          class: 'hidden-poem',
          icon: '📜',
          title: '藏头藏尾诗词生成',
          description: '创作藏头藏尾诗',
          action: () => this.$router.push({ path: '/hidden-poem', query: { from: 'home' } })
        },
        {
          id: 'certificate-generator',
          class: 'certificate-generator',
          icon: '🏆',
          title: '在线证书生成器',
          description: '制作专属荣誉证书',
          action: () => this.$router.push({ path: '/certificate-generator', query: { from: 'home' } })
        },
        {
          id: 'award-generator',
          class: 'award-generator',
          icon: '🎖️',
          title: '在线奖状生成器',
          description: '制作精美学生奖状',
          action: () => this.$router.push({ path: '/award-generator', query: { from: 'home' } })
        },
        {
          id: 'homophone-name-generator',
          class: 'homophone-name-generator',
          icon: '😄',
          title: '姓氏谐音梅网名生成器',
          description: '趣味谐音梅网名',
          action: () => this.$router.push({ path: '/homophone-name-generator', query: { from: 'home' } })
        },
        {
          id: 'joke-generator',
          class: 'joke-generator',
          icon: '😂',
          title: '笑话大全',
          description: '每日一笑',
          action: () => this.showComingSoon('笑话大全')
        },
        {
          id: 'fortune-telling',
          class: 'fortune-telling',
          icon: '🔮',
          title: '每日运势',
          description: '星座运势查询',
          action: () => this.showComingSoon('每日运势')
        },
        {
          id: 'random-poetry',
          class: 'random-poetry',
          icon: '📜',
          title: '随机诗词',
          description: '古诗词欣赏',
          action: () => this.showComingSoon('随机诗词')
        },
        {
          id: 'emoji-generator',
          class: 'emoji-generator',
          icon: '😀',
          title: '表情包生成',
          description: '自制表情包',
          action: () => this.showComingSoon('表情包生成')
        },
        {
          id: 'color-palette',
          class: 'color-palette',
          icon: '🎨',
          title: '随机配色',
          description: '设计配色方案',
          action: () => this.showComingSoon('随机配色')
        },
        {
          id: 'music-recommendation',
          class: 'music-recommendation',
          icon: '🎵',
          title: '音乐推荐',
          description: '发现好音乐',
          action: () => this.showComingSoon('音乐推荐')
        },
        {
          id: 'movie-recommendation',
          class: 'movie-recommendation',
          icon: '🎬',
          title: '电影推荐',
          description: '精选电影推荐',
          action: () => this.showComingSoon('电影推荐')
        },
        {
          id: 'game-recommendation',
          class: 'game-recommendation',
          icon: '🎮',
          title: '游戏推荐',
          description: '热门游戏推荐',
          action: () => this.showComingSoon('游戏推荐')
        },
        {
          id: 'random-fact',
          class: 'random-fact',
          icon: '💡',
          title: '冷知识',
          description: '有趣的冷知识',
          action: () => this.showComingSoon('冷知识')
        },
        {
          id: 'pet-photos',
          class: 'pet-photos',
          icon: '🐱',
          title: '萌宠图片',
          description: '可爱宠物照片',
          action: () => this.showComingSoon('萌宠图片')
        }
      ]
    }
  },
  computed: {
    displayedFeatures() {
      return this.entertainmentFeatures.slice(0, this.maxDisplay)
    }
  },
  methods: {
    showComingSoon(featureName) {
      this.$emit('show-coming-soon', featureName)
    },
    viewAllEntertainment() {
      this.$router.push('/entertainment')
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
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
}

.view-all-button .button-text h3,
.view-all-button .button-text p {
  color: white;
}

.view-all-button:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 15px 45px rgba(79, 172, 254, 0.4);
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