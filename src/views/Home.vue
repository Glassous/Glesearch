<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const titleLetters = ref([])
const fullTitle = 'Glesearch'
const animationComplete = ref(false)
const isHeaderFixed = ref(false)

// 滚动监听函数
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  isHeaderFixed.value = scrollTop > 100
}

// 页面加载时直接显示所有字母，通过CSS动画实现异想天开的入场效果
onMounted(() => {
  titleLetters.value = fullTitle.split('')
  // 动画完成后设置静态状态
  setTimeout(() => {
    animationComplete.value = true
  }, 2500)
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)
})

// 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// GitHub跳转函数
const handleGitHub = () => {
  window.open('https://github.com/Glassous/Glesearch', '_blank')
}

// API网站跳转函数
const handleAPI = () => {
  window.open('https://xxapi.cn/', '_blank')
}

// 云智API网站跳转函数
const handleCloudAPI = () => {
  window.open('https://api.jkyai.top/', '_blank')
}

// 汇率换算按钮点击事件
const handleExchangeRate = () => {
  router.push('/exchange-rate')
}

// 油价查询按钮点击事件
const handleOilPrice = () => {
  router.push('/oil-price')
}

// 新功能按钮点击事件
const handleHotRanking = () => {
  router.push('/hot-list')
}

const handleHistoryToday = () => {
  router.push('/history-today')
}

const handleGenshinImages = () => {
  router.push('/genshin-images')
}

const handleRandomGirlVideo = () => {
  router.push('/random-girl-video')
}

const handleRandomGirlImage = () => {
  router.push('/random-girl-images')
}

const handleRandomWallpaper = () => {
  router.push('/random-wallpaper')
}

const handleDrivingTest = () => {
  router.push('/driving-test')
}

const handleTranslate = () => {
  router.push('/translate')
}

const handleGoldPrice = () => {
  router.push('/gold-price')
}

const handleVehiclePrice = () => {
  router.push('/car-price')
}

const handleSolver = () => {
  router.push('/solver')
}

const handleMusicParser = () => {
  router.push('/music-parser')
}

const handleMVParser = () => {
  router.push('/mv-parser')
}

// 随机数生成按钮点击事件
const handleRandomNumber = () => {
  router.push('/random-number')
}

// 快递查询按钮点击事件
const handleExpressQuery = () => {
  router.push('/express-query')
}

// IP查询按钮点击事件
const handleIPQuery = () => {
  router.push('/ip-query')
}

const handleAIAssistant = () => {
  router.push('/ai-assistant')
}

const handleQQAvatar = () => {
  router.push('/qq-avatar')
}

const handleConcertSchedule = () => {
  router.push('/concert-schedule')
}

// 显示即将推出提示
const showComingSoon = (featureName) => {
  alert(`${featureName} 功能即将推出，敬请期待！`)
}
</script>

<template>
  <div class="page-container">
    <!-- 动态标题动画 -->
    <header class="header" :class="{ 'header-fixed': isHeaderFixed }">
      <div class="header-content">
        <div class="animated-title" :class="{ 'animation-complete': animationComplete, 'title-small': isHeaderFixed }">
          <span class="letter" v-for="(letter, index) in titleLetters" :key="index" :style="{animationDelay: index * 0.2 + 's'}">
            {{ letter }}
            <span class="sparkle sparkle-1" :style="{animationDelay: (index * 0.2 + 1) + 's'}"></span>
            <span class="sparkle sparkle-2" :style="{animationDelay: (index * 0.2 + 1.5) + 's'}"></span>
            <span class="sparkle sparkle-3" :style="{animationDelay: (index * 0.2 + 2) + 's'}"></span>
          </span>
        </div>
        

      </div>
    </header>

  <!-- 功能按钮区域 -->
  <main class="main-content">
    <!-- 查询类 -->
    <section class="category-section">
      <h2 class="category-title">🔍 查询类</h2>
      <div class="button-grid">
        <button class="feature-button oil-price" @click="handleOilPrice">
          <div class="button-icon">⛽</div>
          <div class="button-text">
            <h3>油价查询</h3>
            <p>全国各地油价信息</p>
          </div>
        </button>

        <button class="feature-button hot-ranking" @click="handleHotRanking">
          <div class="button-icon">🔥</div>
          <div class="button-text">
            <h3>热榜汇总</h3>
            <p>各大平台热门内容汇总</p>
          </div>
        </button>

        <button class="feature-button history-today" @click="handleHistoryToday">
          <div class="button-icon">📅</div>
          <div class="button-text">
            <h3>历史上的今天</h3>
            <p>回顾历史上的重要事件</p>
          </div>
        </button>

        <button class="feature-button gold-price" @click="handleGoldPrice">
          <div class="button-icon">🥇</div>
          <div class="button-text">
            <h3>今日金价</h3>
            <p>实时黄金价格查询</p>
          </div>
        </button>

        <button class="feature-button vehicle-price" @click="handleVehiclePrice">
          <div class="button-icon">🚙</div>
          <div class="button-text">
            <h3>车辆信息查询</h3>
            <p>汽车价格信息查询</p>
          </div>
        </button>
      </div>
    </section>

    <!-- 工具类 -->
    <section class="category-section">
      <h2 class="category-title">🔧 工具类</h2>
      <div class="button-grid">
        <button class="feature-button exchange-rate" @click="handleExchangeRate">
          <div class="button-icon">💱</div>
          <div class="button-text">
            <h3>汇率换算</h3>
            <p>实时汇率查询与换算</p>
          </div>
        </button>

        <button class="feature-button translate" @click="handleTranslate">
          <div class="button-icon">🌐</div>
          <div class="button-text">
            <h3>翻译</h3>
            <p>多语言在线翻译</p>
          </div>
        </button>

        <button class="feature-button driving-test" @click="handleDrivingTest">
          <div class="button-icon">🚗</div>
          <div class="button-text">
            <h3>随机驾考题目</h3>
            <p>驾考练习题目推荐</p>
          </div>
        </button>

        <button class="feature-button solver" @click="handleSolver">
          <div class="button-icon">🧠</div>
          <div class="button-text">
            <h3>解题助手</h3>
            <p>AI智能解题分析</p>
          </div>
        </button>

        <button class="feature-button ai-assistant" @click="handleAIAssistant">
          <div class="button-icon">🤖</div>
          <div class="button-text">
            <h3>AI助手</h3>
            <p>快速访问各种AI助手服务</p>
          </div>
        </button>

        <button class="feature-button music-parser" @click="handleMusicParser">
          <div class="button-icon">🎵</div>
          <div class="button-text">
            <h3>音乐解析</h3>
            <p>音乐链接解析下载</p>
          </div>
        </button>

        <button class="feature-button mv-parser" @click="handleMVParser">
          <div class="button-icon">🎬</div>
          <div class="button-text">
            <h3>MV解析</h3>
            <p>MV视频解析下载</p>
          </div>
        </button>

        <button class="feature-button random-number" @click="handleRandomNumber">
          <div class="button-icon">🎲</div>
          <div class="button-text">
            <h3>随机数字生成</h3>
            <p>生成指定范围内的随机数字</p>
          </div>
        </button>

        <button class="feature-button express-query" @click="handleExpressQuery">
          <div class="button-icon">📦</div>
          <div class="button-text">
            <h3>快递单号查询</h3>
            <p>快递物流信息查询</p>
          </div>
        </button>

        <button class="feature-button ip-query" @click="handleIPQuery">
          <div class="button-icon">🌐</div>
          <div class="button-text">
            <h3>IP地址查询</h3>
            <p>IP地址归属地查询</p>
          </div>
        </button>

        <button class="feature-button qq-avatar" @click="handleQQAvatar">
          <div class="button-icon">👤</div>
          <div class="button-text">
            <h3>QQ头像提取</h3>
            <p>获取QQ用户头像</p>
          </div>
        </button>

        <button class="feature-button concert-schedule" @click="handleConcertSchedule">
          <div class="button-icon">🎤</div>
          <div class="button-text">
            <h3>演唱会排期表</h3>
            <p>查看最新演唱会排期表</p>
          </div>
        </button>
      </div>
    </section>

    <!-- 娱乐类 -->
    <section class="category-section">
      <h2 class="category-title">🎮 娱乐类</h2>
      <div class="button-grid">
        <button class="feature-button genshin-images" @click="handleGenshinImages">
          <div class="button-icon">⚔️</div>
          <div class="button-text">
            <h3>原神图片</h3>
            <p>精美原神角色图片</p>
          </div>
        </button>

        <button class="feature-button random-girl-image" @click="handleRandomGirlImage">
          <div class="button-icon">📸</div>
          <div class="button-text">
            <h3>随机小姐姐图片</h3>
            <p>随机推荐精美图片</p>
          </div>
        </button>

        <button class="feature-button random-girl-video" @click="handleRandomGirlVideo">
          <div class="button-icon">📹</div>
          <div class="button-text">
            <h3>随机小姐姐视频</h3>
            <p>随机推荐精彩视频</p>
          </div>
        </button>

        <button class="feature-button random-wallpaper" @click="handleRandomWallpaper">
          <div class="button-icon">🖼️</div>
          <div class="button-text">
            <h3>随机壁纸图片</h3>
            <p>高清精美壁纸推荐</p>
          </div>
        </button>

        <button class="feature-button kfc-crazy" @click="showComingSoon('KFC疯狂星期四')">
          <div class="button-icon">🍗</div>
          <div class="button-text">
            <h3>KFC疯狂星期四</h3>
            <p>疯狂星期四文案生成</p>
          </div>
        </button>

        <button class="feature-button nonsense-article" @click="showComingSoon('狗屁不通文章')">
          <div class="button-icon">📝</div>
          <div class="button-text">
            <h3>狗屁不通文章</h3>
            <p>自动生成搞笑文章</p>
          </div>
        </button>

        <button class="feature-button kuaikan-comic" @click="showComingSoon('快看漫画')">
          <div class="button-icon">📚</div>
          <div class="button-text">
            <h3>快看漫画</h3>
            <p>热门漫画推荐阅读</p>
          </div>
        </button>

        <button class="feature-button tomato-novel" @click="showComingSoon('番茄小说')">
          <div class="button-icon">🍅</div>
          <div class="button-text">
            <h3>番茄小说</h3>
            <p>精彩小说在线阅读</p>
          </div>
        </button>
      </div>
    </section>
  </main>

  <!-- 版权区域 -->
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-buttons">
        <button class="btn github-btn" @click="handleGitHub">
          <svg id="github" viewBox="0 0 24 24" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" fill="#0092E4" height="40" width="40">
            <path d="M12,2.2467A10.00042,10.00042,0,0,0,8.83752,21.73419c.5.08752.6875-.21247.6875-.475,0-.23749-.01251-1.025-.01251-1.86249C7,19.85919,6.35,18.78423,6.15,18.22173A3.636,3.636,0,0,0,5.125,16.8092c-.35-.1875-.85-.65-.01251-.66248A2.00117,2.00117,0,0,1,6.65,17.17169a2.13742,2.13742,0,0,0,2.91248.825A2.10376,2.10376,0,0,1,10.2,16.65923c-2.225-.25-4.55-1.11254-4.55-4.9375a3.89187,3.89187,0,0,1,1.025-2.6875,3.59373,3.59373,0,0,1,.1-2.65s.83747-.26251,2.75,1.025a9.42747,9.42747,0,0,1,5,0c1.91248-1.3,2.75-1.025,2.75-1.025a3.59323,3.59323,0,0,1,.1,2.65,3.869,3.869,0,0,1,1.025,2.6875c0,3.83747-2.33752,4.6875-4.5625,4.9375a2.36814,2.36814,0,0,1,.675,1.85c0,1.33752-.01251,2.41248-.01251,2.75,0,.26251.1875.575.6875.475A10.0053,10.0053,0,0,0,12,2.2467Z"></path>
          </svg>
        </button>
        
        <button class="btn api-btn" @click="handleAPI">
          <span class="api-text">
            <img src="/src/assets/images/小小api.ico" alt="小小api" class="favicon-icon" />
          </span>
        </button>
        
        <button class="btn api-btn" @click="handleCloudAPI">
          <span class="api-text">
            <img src="/src/assets/images/云智api.ico" alt="云智api" class="favicon-icon" />
          </span>
        </button>
      </div>
      
      <div class="copyright">
        <p>&copy; 2025 Glesearch. All rights reserved.</p>
      </div>
    </div>
  </footer>
  </div>
</template>

<style scoped>
.page-container {
  margin-top: 5rem;
  min-height: calc(100vh - 5rem);
}

/* 当header固定时，为页面内容添加顶部间距 */
.header-fixed + * {
  margin-top: 120px;
}

.header {
  text-align: center;
  margin-bottom: 1rem;
  padding: 4rem 0 1rem 0;
  transition: all 0.3s ease;
  z-index: 1000;
}

.header-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
  padding: 1rem 0;
  margin-bottom: 0;
  box-shadow: 0 4px 20px var(--glass-shadow);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.animated-title {
  display: inline-block;
  font-size: 4rem;
  font-weight: 900;
  font-family: 'Arial Black', Arial, sans-serif;
  letter-spacing: 0.1em;
  perspective: 1000px;
  position: relative;
  transition: all 0.3s ease;
}

.title-small {
  font-size: 2.5rem !important;
}

.title-small .letter:first-child {
  font-size: 3rem !important;
}

.title-small .sparkle {
  width: 3px !important;
  height: 3px !important;
}

.letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(-200px) rotateZ(360deg) scale(0.3);
  animation: magicalEntrance 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  filter: drop-shadow(0 0 10px rgba(102, 126, 234, 0.3));
}

.letter:first-child {
  font-size: 5rem;
  animation: firstLetterMagicalEntrance 1.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

/* 动画完成后的静态状态 */
.animation-complete .letter {
  animation: none;
  opacity: 1;
  transform: translateY(0) rotateZ(0deg) scale(1);
}

/* Hover效果 - 放大字母 */
.animation-complete .letter:hover {
  transform: scale(1.2) translateY(-5px);
  filter: drop-shadow(0 0 20px rgba(102, 126, 234, 0.6));
  text-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}

/* 星点装饰 */
.sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, #fff 0%, #667eea 70%, transparent 100%);
  border-radius: 50%;
  opacity: 0;
  animation: sparkleAnimation 2s ease-in-out infinite;
  pointer-events: none;
}

.sparkle-1 {
  top: -10px;
  right: -5px;
  animation-delay: 0s;
}

.sparkle-2 {
  top: 50%;
  left: -8px;
  animation-delay: 0.7s;
}

.sparkle-3 {
  bottom: -8px;
  right: 20%;
  animation-delay: 1.4s;
}

/* 动画完成后显示星点 */
.animation-complete .sparkle {
  animation: sparkleGlow 3s ease-in-out infinite;
}

.animation-complete .letter:hover .sparkle {
  animation: sparkleHover 0.6s ease-in-out infinite;
}

@keyframes firstLetterMagicalEntrance {
  0% {
    opacity: 0;
    transform: translateY(-300px) rotateZ(720deg) scale(0.1);
    background-position: 0% 50%;
    filter: drop-shadow(0 0 30px rgba(102, 126, 234, 0.8)) blur(5px);
  }
  25% {
    opacity: 0.2;
    transform: translateY(-100px) rotateZ(540deg) scale(0.5);
    background-position: 25% 50%;
    filter: drop-shadow(0 0 25px rgba(102, 126, 234, 0.7)) blur(3px);
  }
  50% {
    opacity: 0.6;
    transform: translateY(-20px) rotateZ(270deg) scale(0.9);
    background-position: 50% 50%;
    filter: drop-shadow(0 0 18px rgba(102, 126, 234, 0.5)) blur(2px);
  }
  75% {
    opacity: 0.85;
    transform: translateY(8px) rotateZ(90deg) scale(1.05);
    background-position: 75% 50%;
    filter: drop-shadow(0 0 15px rgba(102, 126, 234, 0.4)) blur(1px);
  }
  90% {
    opacity: 0.95;
    transform: translateY(2px) rotateZ(20deg) scale(1.02);
    background-position: 90% 50%;
    filter: drop-shadow(0 0 12px rgba(102, 126, 234, 0.35)) blur(0.5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotateZ(0deg) scale(1);
    background-position: 100% 50%;
    filter: drop-shadow(0 0 10px rgba(102, 126, 234, 0.3));
  }
}

@keyframes magicalEntrance {
  0% {
    opacity: 0;
    transform: translateY(-200px) rotateZ(360deg) scale(0.3);
    background-position: 0% 50%;
    filter: drop-shadow(0 0 20px rgba(118, 75, 162, 0.6)) blur(3px);
  }
  30% {
    opacity: 0.4;
    transform: translateY(-60px) rotateZ(270deg) scale(0.7);
    background-position: 30% 50%;
    filter: drop-shadow(0 0 18px rgba(118, 75, 162, 0.5)) blur(2px);
  }
  60% {
    opacity: 0.75;
    transform: translateY(-10px) rotateZ(135deg) scale(0.95);
    background-position: 60% 50%;
    filter: drop-shadow(0 0 15px rgba(118, 75, 162, 0.4)) blur(1px);
  }
  80% {
    opacity: 0.9;
    transform: translateY(5px) rotateZ(45deg) scale(1.03);
    background-position: 80% 50%;
    filter: drop-shadow(0 0 12px rgba(118, 75, 162, 0.35)) blur(0.5px);
  }
  95% {
    opacity: 0.98;
    transform: translateY(1px) rotateZ(10deg) scale(1.01);
    background-position: 95% 50%;
    filter: drop-shadow(0 0 11px rgba(118, 75, 162, 0.32)) blur(0.2px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotateZ(0deg) scale(1);
    background-position: 100% 50%;
    filter: drop-shadow(0 0 10px rgba(118, 75, 162, 0.3));
  }
}

@keyframes sparkleAnimation {
  0%, 100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
}

@keyframes sparkleGlow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
    box-shadow: 0 0 15px rgba(102, 126, 234, 0.8);
  }
}

@keyframes sparkleHover {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.5) rotate(180deg);
    box-shadow: 0 0 20px rgba(240, 147, 251, 0.9);
  }
}

/* GitHub按钮样式 */
.btn {
  display: grid;
  place-items: center;
  background: #e3edf7;
  padding: 1.4em;
  border-radius: 10px;
  box-shadow: 6px 6px 10px -1px rgba(0,0,0,0.15),
              -6px -6px 10px -1px rgba(255,255,255,0.7);
  border: 1px solid rgba(0,0,0,0);
  cursor: pointer;
  transition: transform 0.5s;
  width: 80px;
  height: 80px;
}

.btn:hover {
  box-shadow: inset 4px 4px 6px -1px rgba(0,0,0,0.2),
              inset -4px -4px 6px -1px rgba(255,255,255,0.7),
              -0.5px -0.5px 0px rgba(255,255,255,1),
              0.5px 0.5px 0px rgba(0,0,0,0.15),
              0px 12px 10px -10px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.1);
  transform: translateY(0.5em);
}

.btn svg {
  transition: transform 0.5s;
}

.btn:hover svg {
  transform: scale(0.9) rotate(360deg);
  fill: #333333;
}

/* Footer版权区域样式 */
.footer {
  margin-top: 4rem;
  padding: 2rem 0;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--glass-border);
  box-shadow: 0 -4px 20px var(--glass-shadow);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.footer-buttons {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.api-btn {
  display: grid;
  place-items: center;
  background: #e3edf7;
  padding: 1.4em;
  border-radius: 10px;
  box-shadow: 6px 6px 10px -1px rgba(0,0,0,0.15),
              -6px -6px 10px -1px rgba(255,255,255,0.7);
  border: 1px solid rgba(0,0,0,0);
  cursor: pointer;
  transition: transform 0.5s;
  width: 80px;
  height: 80px;
}

.api-btn:hover {
  box-shadow: inset 4px 4px 6px -1px rgba(0,0,0,0.2),
              inset -4px -4px 6px -1px rgba(255,255,255,0.7),
              -0.5px -0.5px 0px rgba(255,255,255,1),
              0.5px 0.5px 0px rgba(0,0,0,0.15),
              0px 12px 10px -10px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.1);
  transform: translateY(0.5em);
}

.api-text {
  font-size: 16px;
  font-weight: bold;
  color: #0092E4;
  transition: all 0.5s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.favicon-icon {
  width: 40px;
  height: 40px;
  transition: all 0.5s;
}

.api-btn:hover .api-text {
  color: #333333;
  transform: scale(0.9);
}

.api-btn:hover .favicon-icon {
  transform: scale(0.9) rotate(360deg);
}

.copyright {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.copyright p {
  margin: 0;
}

.main-content {
  padding: 0 2rem 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.category-section {
  margin-bottom: 4rem;
}

.category-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.category-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  justify-items: center;
}

/* 毛玻璃效果和曲面屏效果按钮样式 */
.feature-button {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 8px 32px var(--glass-shadow);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  text-align: left;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  perspective: 1000px;
  width: 320px;
  min-height: 120px;
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
  border-radius: 24px;
  z-index: -1;
  transition: all 0.4s ease;
}

.feature-button:hover {
  transform: translateY(-8px) rotateX(5deg) rotateY(-2deg);
  box-shadow: 0 20px 60px var(--shadow-heavy);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-color: var(--text-accent);
}

.feature-button:hover::before {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.2) 0%, 
    rgba(255, 255, 255, 0.1) 50%, 
    rgba(0, 0, 0, 0.05) 100%);
}

.feature-button:active {
  transform: translateY(-4px) rotateX(2deg) rotateY(-1deg);
  transition: all 0.1s ease;
}

/* 各按钮的特色渐变背景 */
.exchange-rate:hover {
  background: linear-gradient(135deg, rgba(255, 234, 167, 0.4) 0%, rgba(250, 177, 160, 0.4) 100%);
}

.oil-price:hover {
  background: linear-gradient(135deg, rgba(168, 230, 207, 0.4) 0%, rgba(136, 216, 192, 0.4) 100%);
}

.hot-ranking:hover {
  background: linear-gradient(135deg, rgba(255, 118, 117, 0.4) 0%, rgba(253, 121, 168, 0.4) 100%);
}

.history-today:hover {
  background: linear-gradient(135deg, rgba(116, 185, 255, 0.4) 0%, rgba(9, 132, 227, 0.4) 100%);
}

.genshin-images:hover {
  background: linear-gradient(135deg, rgba(162, 155, 254, 0.4) 0%, rgba(108, 92, 231, 0.4) 100%);
}

.random-girl-video:hover {
  background: linear-gradient(135deg, rgba(253, 121, 168, 0.4) 0%, rgba(232, 67, 147, 0.4) 100%);
}

.random-girl-image:hover {
  background: linear-gradient(135deg, rgba(253, 203, 110, 0.4) 0%, rgba(225, 112, 85, 0.4) 100%);
}

.random-wallpaper:hover {
  background: linear-gradient(135deg, rgba(85, 163, 255, 0.4) 0%, rgba(0, 61, 130, 0.4) 100%);
}

.driving-test:hover {
  background: linear-gradient(135deg, rgba(0, 184, 148, 0.4) 0%, rgba(0, 160, 133, 0.4) 100%);
}

.translate:hover {
  background: linear-gradient(135deg, rgba(225, 112, 85, 0.4) 0%, rgba(214, 48, 49, 0.4) 100%);
}

.gold-price:hover {
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.4) 0%, rgba(230, 126, 34, 0.4) 100%);
}

.vehicle-price:hover {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.4) 0%, rgba(41, 128, 185, 0.4) 100%);
}

.solver:hover {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.4) 0%, rgba(142, 68, 173, 0.4) 100%);
}

.ai-assistant:hover {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.4) 0%, rgba(41, 128, 185, 0.4) 100%);
}

.music-parser:hover {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.4) 0%, rgba(39, 174, 96, 0.4) 100%);
}

.mv-parser:hover {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.4) 0%, rgba(192, 57, 43, 0.4) 100%);
}

.random-number:hover {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.4) 0%, rgba(142, 68, 173, 0.4) 100%);
}

.express-query:hover {
  background: linear-gradient(135deg, rgba(230, 126, 34, 0.4) 0%, rgba(211, 84, 0, 0.4) 100%);
}

.ip-query:hover {
  background: linear-gradient(135deg, rgba(26, 188, 156, 0.4) 0%, rgba(22, 160, 133, 0.4) 100%);
}

.qq-avatar:hover {
  background: linear-gradient(135deg, rgba(253, 121, 168, 0.4) 0%, rgba(232, 67, 147, 0.4) 100%);
}

.concert-schedule:hover {
  background: linear-gradient(135deg, rgba(142, 68, 173, 0.4) 0%, rgba(109, 40, 217, 0.4) 100%);
}

.kfc-crazy:hover {
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.4) 0%, rgba(230, 126, 34, 0.4) 100%);
}

.nonsense-article:hover {
  background: linear-gradient(135deg, rgba(52, 73, 94, 0.4) 0%, rgba(44, 62, 80, 0.4) 100%);
}

.kuaikan-comic:hover {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.4) 0%, rgba(142, 68, 173, 0.4) 100%);
}

.tomato-novel:hover {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.4) 0%, rgba(192, 57, 43, 0.4) 100%);
}

.button-icon {
  font-size: 3rem;
  min-width: 60px;
  text-align: center;
}

.button-text h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.button-text p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1rem;
}

@media (max-width: 768px) {
  .animated-title {
    font-size: 2.5rem;
  }
  
  .letter:first-child {
    font-size: 3rem;
  }
  
  .sparkle {
    width: 3px;
    height: 3px;
  }
  
  .button-grid {
    grid-template-columns: 1fr;
  }
  
  .feature-button {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .animated-title {
    font-size: 2rem;
  }
  
  .letter:first-child {
    font-size: 2.5rem;
  }
  
  .sparkle {
    width: 2px;
    height: 2px;
  }
  
  .animation-complete .letter:hover {
    transform: scale(1.1) translateY(-3px);
  }
  
  .header {
    padding: 1rem 0;
    margin-bottom: 2rem;
  }
  
  .footer-buttons {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .btn {
    padding: 1rem;
  }
  
  .api-text {
    font-size: 14px;
  }
}
</style>