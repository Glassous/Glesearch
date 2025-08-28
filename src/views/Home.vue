<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const titleLetters = ref([])
const fullTitle = 'Glesearch'
const animationComplete = ref(false)

// 页面加载时直接显示所有字母，通过CSS动画实现异想天开的入场效果
onMounted(() => {
  titleLetters.value = fullTitle.split('')
  // 动画完成后设置静态状态
  setTimeout(() => {
    animationComplete.value = true
  }, 2500)
})

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
</script>

<template>
  <div class="page-container">
    <!-- 动态标题动画 -->
    <header class="header">
      <div class="animated-title" :class="{ 'animation-complete': animationComplete }">
        <span class="letter" v-for="(letter, index) in titleLetters" :key="index" :style="{animationDelay: index * 0.2 + 's'}">
          {{ letter }}
          <span class="sparkle sparkle-1" :style="{animationDelay: (index * 0.2 + 1) + 's'}"></span>
          <span class="sparkle sparkle-2" :style="{animationDelay: (index * 0.2 + 1.5) + 's'}"></span>
          <span class="sparkle sparkle-3" :style="{animationDelay: (index * 0.2 + 2) + 's'}"></span>
        </span>
      </div>
    </header>

  <!-- 功能按钮区域 -->
  <main class="main-content">
    <div class="button-grid">
      <button class="feature-button exchange-rate" @click="handleExchangeRate">
        <div class="button-icon">💱</div>
        <div class="button-text">
          <h3>汇率换算</h3>
          <p>实时汇率查询与换算</p>
        </div>
      </button>
      
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

      <button class="feature-button genshin-images" @click="handleGenshinImages">
        <div class="button-icon">⚔️</div>
        <div class="button-text">
          <h3>原神图片</h3>
          <p>精美原神角色图片</p>
        </div>
      </button>

      <button class="feature-button random-girl-video" @click="handleRandomGirlVideo">
        <div class="button-icon">🎬</div>
        <div class="button-text">
          <h3>随机小姐姐视频</h3>
          <p>随机推荐精彩视频</p>
        </div>
      </button>

      <button class="feature-button random-girl-image" @click="handleRandomGirlImage">
        <div class="button-icon">📸</div>
        <div class="button-text">
          <h3>随机小姐姐图片</h3>
          <p>随机推荐精美图片</p>
        </div>
      </button>

      <button class="feature-button random-wallpaper" @click="handleRandomWallpaper">
        <div class="button-icon">🖼️</div>
        <div class="button-text">
          <h3>随机壁纸图片</h3>
          <p>高清精美壁纸推荐</p>
        </div>
      </button>

      <button class="feature-button driving-test" @click="handleDrivingTest">
        <div class="button-icon">🚗</div>
        <div class="button-text">
          <h3>随机驾考题目</h3>
          <p>驾考练习题目推荐</p>
        </div>
      </button>

      <button class="feature-button translate" @click="handleTranslate">
        <div class="button-icon">🌐</div>
        <div class="button-text">
          <h3>翻译</h3>
          <p>多语言在线翻译</p>
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
  </main>
  </div>
</template>

<style scoped>
.page-container {
  margin-top: 5rem;
  min-height: calc(100vh - 5rem);
}

.header {
  text-align: center;
  margin-bottom: 1rem;
  padding: 4rem 0 1rem 0;
}

.animated-title {
  display: inline-block;
  font-size: 4rem;
  font-weight: 900;
  font-family: 'Arial Black', Arial, sans-serif;
  letter-spacing: 0.1em;
  perspective: 1000px;
  position: relative;
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

.main-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2rem 2rem 2rem;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 800px;
  width: 100%;
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
}
</style>