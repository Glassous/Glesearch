<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const titleLetters = ref([])
const fullTitle = 'Glesearch'

// 页面加载时直接显示所有字母，通过CSS动画实现从左到右入场
onMounted(() => {
  titleLetters.value = fullTitle.split('')
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
      <div class="animated-title">
        <span class="letter" v-for="(letter, index) in titleLetters" :key="index" :style="{animationDelay: index * 0.15 + 's'}">
          {{ letter }}
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
}

.letter {
  display: inline-block;
  opacity: 0;
  transform: translateX(-50px) scale(0.8);
  animation: letterReveal 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  position: relative;
}

.letter:first-child {
  font-size: 5rem;
  animation: firstLetterReveal 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.letter::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 200% 200%;
  animation: gradientShift 3s ease-in-out infinite;
  z-index: -1;
  border-radius: 8px;
  opacity: 0.1;
}

@keyframes firstLetterReveal {
  0% {
    opacity: 0;
    transform: translateX(-80px) scale(0.6);
    background-position: 0% 50%;
  }
  50% {
    opacity: 0.7;
    transform: translateX(10px) scale(1.1);
    background-position: 50% 50%;
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
    background-position: 100% 50%;
  }
}

@keyframes letterReveal {
  0% {
    opacity: 0;
    transform: translateX(-50px) scale(0.8);
    background-position: 0% 50%;
  }
  60% {
    opacity: 0.8;
    transform: translateX(5px) scale(1.05);
    background-position: 50% 50%;
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
    background-position: 100% 50%;
  }
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
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
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05);
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
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-color: rgba(255, 255, 255, 0.4);
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
  color: #2d3436;
}

.button-text p {
  margin: 0;
  color: #636e72;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .animated-title {
    font-size: 2.5rem;
  }
  
  .letter:first-child {
    font-size: 3rem;
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
  
  .header {
    padding: 1rem 0;
    margin-bottom: 2rem;
  }
}
</style>