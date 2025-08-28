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

.feature-button {
  background: white;
  border: none;
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  text-align: left;
}

.feature-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.exchange-rate:hover {
  background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
}

.oil-price:hover {
  background: linear-gradient(135deg, #a8e6cf 0%, #88d8c0 100%);
}

.hot-ranking:hover {
  background: linear-gradient(135deg, #ff7675 0%, #fd79a8 100%);
}

.history-today:hover {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
}

.genshin-images:hover {
  background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
}

.random-girl-video:hover {
  background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
}

.random-girl-image:hover {
  background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%);
}

.random-wallpaper:hover {
  background: linear-gradient(135deg, #55a3ff 0%, #003d82 100%);
}

.driving-test:hover {
  background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
}

.translate:hover {
  background: linear-gradient(135deg, #e17055 0%, #d63031 100%);
}

.gold-price:hover {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
}

.vehicle-price:hover {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
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