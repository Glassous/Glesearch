<template>
  <section class="category-section">
    <div class="section-header">
      <h2 class="section-title">工具类</h2>
      <p class="section-description">实用便民工具集合</p>
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
      <button class="feature-button view-all-button" @click="viewAllTools">
        <div class="button-icon">🔧</div>
        <div class="button-text">
          <h3>查看全部</h3>
          <p>浏览所有工具功能</p>
        </div>
      </button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ToolsSection',
  props: {
    maxDisplay: {
      type: Number,
      default: 8
    }
  },
  data() {
    return {
      toolsFeatures: [
        {
          id: 'currency-exchange',
          class: 'currency-exchange',
          icon: '💱',
          title: '汇率换算',
          description: '实时汇率转换',
          action: () => this.$router.push({ path: '/exchange-rate', query: { from: 'home' } })
        },
        {
          id: 'translation',
          class: 'translation',
          icon: '🌐',
          title: '翻译',
          description: '多语言翻译服务',
          action: () => this.$router.push({ path: '/translate', query: { from: 'home' } })
        },
        {
          id: 'driving-test',
          class: 'driving-test',
          icon: '🚗',
          title: '驾考题目',
          description: '驾照考试练习',
          action: () => this.$router.push({ path: '/driving-test', query: { from: 'home' } })
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
          action: () => this.$router.push({ path: '/music-parser', query: { from: 'home' } })
        },
        {
          id: 'mv-parser',
          class: 'mv-parser',
          icon: '🎬',
          title: 'MV解析',
          description: '音乐视频解析',
          action: () => this.$router.push({ path: '/mv-parser', query: { from: 'home' } })
        },
        {
          id: 'random-number',
          class: 'random-number',
          icon: '🎲',
          title: '随机数字生成',
          description: '生成随机数字',
          action: () => this.$router.push({ path: '/random-number', query: { from: 'home' } })
        },
        {
          id: 'express-tracking',
          class: 'express-tracking',
          icon: '📦',
          title: '快递单号查询',
          description: '物流信息追踪',
          action: () => this.$router.push({ path: '/express-query', query: { from: 'home' } })
        },
        {
          id: 'ip-query',
          class: 'ip-query',
          icon: '🌐',
          title: 'IP地址查询',
          description: 'IP归属地查询',
          action: () => this.$router.push({ path: '/ip-query', query: { from: 'home' } })
        },
        {
          id: 'qq-avatar',
          class: 'qq-avatar',
          icon: '👤',
          title: 'QQ头像提取',
          description: '获取QQ用户头像',
          action: () => this.$router.push({ path: '/qq-avatar', query: { from: 'home' } })
        },
        {
          id: 'concert-schedule',
          class: 'concert-schedule',
          icon: '🎤',
          title: '演唱会排期表',
          description: '演出信息查询',
          action: () => this.$router.push({ path: '/concert-schedule', query: { from: 'home' } })
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
          action: () => this.$router.push({ path: '/text-converter', query: { from: 'home' } })
        },
        {
          id: 'acrostic-poem',
          class: 'acrostic-poem',
          icon: '📜',
          title: '藏头藏尾诗词',
          description: '生成个性化诗词',
          action: () => this.showComingSoon('藏头藏尾诗词生成')
        },
        {
          id: 'certificate-generator',
          class: 'certificate-generator',
          icon: '🏆',
          title: '在线证书生成',
          description: '制作各种证书模板',
          action: () => this.showComingSoon('在线证书生成器')
        },
        {
          id: 'nickname-generator',
          class: 'nickname-generator',
          icon: '😄',
          title: '谐音梗网名生成',
          description: '姓氏谐音趣味网名',
          action: () => this.showComingSoon('姓氏谐音梗网名生成器')
        },
        {
          id: 'alipay-voice',
          class: 'alipay-voice',
          icon: '💰',
          title: '支付宝语音生成',
          description: '自定义收款语音',
          action: () => this.showComingSoon('支付宝收款语音生成')
        },
        {
          id: 'award-generator',
          class: 'award-generator',
          icon: '🥇',
          title: '在线奖状生成',
          description: '制作个性化奖状',
          action: () => this.showComingSoon('在线奖状生成器')
        },
        {
          id: 'us-identity',
          class: 'us-identity',
          icon: '🆔',
          title: '随机美国身份',
          description: '生成虚拟身份信息',
          action: () => this.$router.push({ path: '/usa-identity', query: { from: 'home' } })
        }
      ]
    }
  },
  computed: {
    displayedFeatures() {
      return this.toolsFeatures.slice(0, this.maxDisplay)
    }
  },
  methods: {
    showComingSoon(featureName) {
      this.$emit('show-coming-soon', featureName)
    },
    viewAllTools() {
      this.$router.push('/tools')
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
}

.view-all-button .button-text h3,
.view-all-button .button-text p {
  color: white;
}

.view-all-button:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 15px 45px rgba(240, 147, 251, 0.4);
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