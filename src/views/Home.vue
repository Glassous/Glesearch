<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const titleLetters = ref([])
const fullTitle = 'Glesearch'
const animationComplete = ref(false)
const isHeaderFixed = ref(false)
const searchQuery = ref('')
const selectedEngine = ref(localStorage.getItem('selectedEngine') || 'google')
const showEngineDropdown = ref(false)
const showCustomModal = ref(false)
const isLoadingIcon = ref(false)
const customEngines = ref(JSON.parse(localStorage.getItem('customEngines') || '[]'))
const customEngineForm = ref({
  name: '',
  url: '',
  icon: ''
})
const showConfirmDialog = ref(false)
const confirmDialogData = ref({
  title: '',
  message: '',
  confirmText: '确定',
  cancelText: '取消',
  onConfirm: null,
  onCancel: null
})
const showAlertDialog = ref(false)
const alertDialogData = ref({
  title: '',
  message: '',
  type: 'info', // 'success', 'error', 'warning', 'info'
  buttonText: '确定',
  onClose: null
})

// 搜索引擎SVG图标
const engineIcons = {
  google: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="240px" height="240px"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>',
  bing: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="96px" height="96px"><linearGradient id="B5r3ePYlwpc4tsqTZi2ola" x1="13.696" x2="21.1" y1=".218" y2="49.494" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3cbdf5"/><stop offset="1" stop-color="#1d49dd"/></linearGradient><path fill="url(#B5r3ePYlwpc4tsqTZi2ola)" d="M22,44V10.603c0-1.632-0.796-3.161-2.133-4.096l-4.72-3.304C13.821,2.275,12,3.223,12,4.841v28.825c0,1.515,0.491,2.988,1.4,4.2l2.2,2.933C17.111,42.814,19.482,44,22,44L22,44z"/><path d="M22,35.433c-0.149,0.086-0.305,0.173-0.475,0.265c-1.583,0.854-3.043,1.287-4.34,1.287c-2.394,0-3.678-1.508-4.12-2.156L12,33.263v0.404c0,1.515,0.491,2.988,1.4,4.2l2.2,2.933c1.511,2.014,3.882,3.2,6.4,3.2V35.433z" opacity=".07"/><path d="M15.6,40.8c1.511,2.014,3.882,3.2,6.4,3.2v-7.995c-0.079,0.044-0.152,0.086-0.237,0.132c-1.656,0.894-3.196,1.347-4.578,1.347c-2.632,0-4.047-1.661-4.533-2.375l-0.607-0.893c0.104,1.318,0.558,2.586,1.356,3.65L15.6,40.8z" opacity=".05"/><linearGradient id="B5r3ePYlwpc4tsqTZi2olb" x1="13.55" x2="43.04" y1="42.356" y2="27.547" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#55d3fd"/><stop offset=".153" stop-color="#48b8f5"/><stop offset=".488" stop-color="#2f83e5"/><stop offset=".74" stop-color="#2062dc"/><stop offset=".877" stop-color="#1a55d8"/></linearGradient><path fill="url(#B5r3ePYlwpc4tsqTZi2olb)" d="M39,26L23,36c-0.344,0.215-0.675,0.402-1,0.578c-6.039,3.258-8.957-0.005-9.761-1.187c0.226,0.888,0.605,1.734,1.161,2.476l2.2,2.933c1.302,1.736,3.244,2.852,5.368,3.128c0.092,0.01,2.12,0.072,2.12,0.072c1.902,0,3.764-0.542,5.369-1.563L37,37C40.903,31.899,39,26,39,26z"/><linearGradient id="B5r3ePYlwpc4tsqTZi2olc" x1="23.701" x2="41.063" y1="13.868" y2="34.421" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#34bffe"/><stop offset="1" stop-color="#52dbd8"/></linearGradient><path fill="url(#B5r3ePYlwpc4tsqTZi2olc)" d="M37,37c0,0,4-6-3-8l-4.343-1.737C29.223,27.089,28.83,26.83,28.5,26.5l0,0c-0.33-0.33-0.589-0.723-0.763-1.157L24.52,17.3c-0.294-0.735,0.024-1.573,0.733-1.927l0,0c0.465-0.233,1.018-0.212,1.464,0.056l7.911,4.746c1.108,0.665,2.076,1.547,2.79,2.624c0.555,0.836,1.158,1.928,1.582,3.2C40,29,40,33,37,37z"/><g><path d="M34.133,29.042l-1.061,0.663l0.557,0.223l0.047,0.019l0.049,0.014c1.748,0.499,2.835,1.294,3.231,2.362c0.686,1.85-0.775,4.102-0.79,4.124l-0.889,1.663l1.696-1.093C36.973,37.017,40.942,31.081,34.133,29.042z" opacity=".05"/></g><g><path d="M34.14,29.042l-0.536,0.335l0.218,0.087l0.024,0.01l0.025,0.007c1.912,0.546,3.111,1.446,3.564,2.673c0.773,2.094-0.827,4.545-0.843,4.569l-0.401,0.8l0.804-0.515L37.008,37C37.008,37,40.95,31.081,34.14,29.042z" opacity=".07"/></g></svg>',
  duckduckgo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#ff3d00" d="M44,24c0,11-9,20-20,20S4,35,4,24S13,4,24,4S44,13,44,24z"/><path fill="#fff" d="M26,16.2c-0.6-0.6-1.5-0.9-2.5-1.1c-0.4-0.5-1-1-1.9-1.5c-1.6-0.8-3.5-1.2-5.3-0.9h-0.4c-0.1,0-0.2,0.1-0.4,0.1c0.2,0,1,0.4,1.6,0.6c-0.3,0.2-0.8,0.2-1.1,0.4c0,0,0,0-0.1,0L15.7,14c-0.1,0.2-0.2,0.4-0.2,0.5c1.3-0.1,3.2,0,4.6,0.4C19,15,18,15.3,17.3,15.7c-0.5,0.3-1,0.6-1.3,1.1c-1.2,1.3-1.7,3.5-1.3,5.9c0.5,2.7,2.4,11.4,3.4,16.3l0.3,1.6c0,0,3.5,0.4,5.6,0.4c1.2,0,3.2,0.3,3.7-0.2c-0.1,0-0.6-0.6-0.8-1.1c-0.5-1-1-1.9-1.4-2.6c-1.2-2.5-2.5-5.9-1.9-8.1c0.1-0.4,0.1-2.1,0.4-2.3c2.6-1.7,2.4-0.1,3.5-0.8c0.5-0.4,1-0.9,1.2-1.5C29.4,22.1,27.8,18,26,16.2z"/><path fill="#fff" d="M24,42c-9.9,0-18-8.1-18-18c0-9.9,8.1-18,18-18c9.9,0,18,8.1,18,18C42,33.9,33.9,42,24,42z M24,8C15.2,8,8,15.2,8,24s7.2,16,16,16s16-7.2,16-16S32.8,8,24,8z"/><path fill="#0277bd" d="M19,21.1c-0.6,0-1.2,0.5-1.2,1.2c0,0.6,0.5,1.2,1.2,1.2c0.6,0,1.2-0.5,1.2-1.2C20.1,21.7,19.6,21.1,19,21.1z M19.5,22.2c-0.2,0-0.3-0.1-0.3-0.3c0-0.2,0.1-0.3,0.3-0.3s0.3,0.1,0.3,0.3C19.8,22.1,19.6,22.2,19.5,22.2z M26.8,20.6c-0.6,0-1,0.5-1,1c0,0.6,0.5,1,1,1c0.6,0,1-0.5,1-1S27.3,20.6,26.8,20.6z M27.2,21.5c-0.1,0-0.3-0.1-0.3-0.3c0-0.1,0.1-0.3,0.3-0.3c0.1,0,0.3,0.1,0.3,0.3S27.4,21.5,27.2,21.5z M19.3,18.9c0,0-0.9-0.4-1.7,0.1c-0.9,0.5-0.8,1.1-0.8,1.1s-0.5-1,0.8-1.5C18.7,18.1,19.3,18.9,19.3,18.9 M27.4,18.8c0,0-0.6-0.4-1.1-0.4c-1,0-1.3,0.5-1.3,0.5s0.2-1.1,1.5-0.9C27.1,18.2,27.4,18.8,27.4,18.8"/><path fill="#8bc34a" d="M23.3,35.7c0,0-4.3-2.3-4.4-1.4c-0.1,0.9,0,4.7,0.5,5s4.1-1.9,4.1-1.9L23.3,35.7z M25,35.6c0,0,2.9-2.2,3.6-2.1c0.6,0.1,0.8,4.7,0.2,4.9c-0.6,0.2-3.9-1.2-3.9-1.2L25,35.6z"/><path fill="#689f38" d="M22.5,35.7c0,1.5-0.2,2.1,0.4,2.3c0.6,0.1,1.9,0,2.3-0.3c0.4-0.3,0.1-2.2-0.1-2.6C25,34.8,22.5,35.1,22.5,35.7"/><path fill="#ffca28" d="M22.3,26.8c0.1-0.7,2-2.1,3.3-2.2c1.3-0.1,1.7-0.1,2.8-0.3c1.1-0.3,3.9-1,4.7-1.3c0.8-0.4,4.1,0.2,1.8,1.5c-1,0.6-3.7,1.6-5.7,2.2c-1.9,0.6-3.1-0.6-3.8,0.4c-0.5,0.8-0.1,1.8,2.2,2c3.1,0.3,6.2-1.4,6.5-0.5c0.3,0.9-2.7,2-4.6,2.1c-1.8,0-5.6-1.2-6.1-1.6C22.9,28.7,22.2,27.8,22.3,26.8"/></svg>',
  baidu: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#1565c0" d="M36.094 31.35c-1.695-1.5-3.754-3.225-6.66-7.35-1.865-2.647-3.512-4-5.934-4-2.664 0-4.117 1.25-5.552 3.279-2.1 2.971-2.925 3.971-5.088 5.675-.786.619-4.861 3.172-4.86 7.671C8.001 41.875 11.753 44 15.155 44c4.469 0 5.439-1 8.345-1 3.633 0 5.57 1 8.476 1C37.789 44 39 39.625 39 36.872 39 34.25 37.789 32.85 36.094 31.35zM11.389 24.885c3.124-.694 3.616-3.739 3.611-5.732-.002-.696-.064-1.263-.096-1.558-.198-1.678-2.027-4.55-4.551-4.594-.12-.002-.242.002-.365.013-3.412.314-3.911 5.412-3.911 5.412-.056.287-.082.613-.078.963.031 2.263 1.356 5.527 4.274 5.61C10.623 25.008 10.994 24.973 11.389 24.885M19.503 16C21.99 16 24 13.315 24 9.998 24 6.681 21.99 4 19.503 4 17.015 4 15 6.681 15 9.998 15 13.315 17.015 16 19.503 16M29.522 16.964c.221.031.436.041.645.033 2.696-.103 4.416-3.276 4.781-5.723.037-.241.054-.486.052-.733-.015-2.441-1.831-5.012-3.799-5.49-2.177-.532-4.893 3.173-5.138 5.59-.037.37-.059.739-.063 1.103C25.975 14.296 26.841 16.599 29.522 16.964M41.984 21.142c0-1.281-1.004-5.142-4.742-5.142C33.496 16 33 19.644 33 22.219c0 2.41.187 5.752 4.578 5.781.087.001.176 0 .267-.002 4.027-.094 4.183-4.203 4.152-6.138C41.993 21.561 41.984 21.315 41.984 21.142"/><path fill="#fff" d="M24 31v7.5c0 0 0 1.875 2.625 2.5H33V31h-2.625v7.5h-2.75c0 0-.875-.125-1-.75V31H24zM20 27v4h-3c-2.125.375-4 2.25-3.999 4.875C13.001 35.917 13 35.958 13 36c0 2.75 1.875 4.625 4 5h5.625V27H20zM20 38.75h-2.375c-.75 0-2-1.125-2-2.75s1.25-2.75 2-2.75H20V38.75z"/></svg>',
  wikipedia: '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50"><path d="M 9 4 C 6.2504839 4 4 6.2504839 4 9 L 4 41 C 4 43.749516 6.2504839 46 9 46 L 41 46 C 43.749516 46 46 43.749516 46 41 L 46 9 C 46 6.2504839 43.749516 4 41 4 L 9 4 z M 9 6 L 41 6 C 42.668484 6 44 7.3315161 44 9 L 44 41 C 44 42.668484 42.668484 44 41 44 L 9 44 C 7.3315161 44 6 42.668484 6 41 L 6 9 C 6 7.3315161 7.3315161 6 9 6 z M 18.375 15.998047 C 18.196 15.998047 18.017578 16.173656 18.017578 16.347656 L 18.017578 17.650391 C 18.017578 17.825391 18.196 18 18.375 18 L 19.810547 18 L 24.105469 26.019531 L 20.705078 32.119141 L 14.263672 18 L 15.642578 18 C 15.821578 18 16 17.826344 16 17.652344 L 16 16.349609 C 16 16.174609 15.821578 16 15.642578 16 L 8.3574219 16 C 8.1784219 16 8 16.173656 8 16.347656 L 8 17.650391 C 8 17.825391 8.1784219 18 8.3574219 18 L 10.505859 18 L 19.810547 36.826172 C 19.900547 36.913172 19.988969 37 20.167969 37 C 20.346969 37 20.437344 36.913172 20.527344 36.826172 L 25.269531 28.287109 L 29.652344 36.826172 C 29.742344 36.913172 29.832719 37 30.011719 37 C 30.189719 37 30.278187 36.913172 30.367188 36.826172 L 39.583984 17.912109 L 41.642578 17.912109 C 41.821578 17.912109 42 17.738453 42 17.564453 L 42 16.349609 C 42 16.174609 41.821578 16 41.642578 16 L 35.357422 16 C 35.178422 16 35 16.173656 35 16.347656 L 35 17.650391 C 35 17.825391 35.179422 18 35.357422 18 L 37.167969 18 L 30.457031 32.119141 L 26.96875 25.148438 L 31.263672 18 L 32.642578 18 C 32.821578 18 33 17.826344 33 17.652344 L 33 16.349609 C 33 16.174609 32.821578 16 32.642578 16 L 27.357422 16 C 27.178422 16 27 16.173656 27 16.347656 L 27 17.650391 C 27 17.825391 27.178422 18 27.357422 18 L 28.757812 18 L 25.804688 22.884766 L 23.388672 18 L 24.642578 18 C 24.821578 18 25 17.826344 25 17.652344 L 25 16.349609 C 25 16.174609 24.821578 15.999047 24.642578 15.998047 L 18.375 15.998047 z"></path></svg>',
  custom: '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 24 24"><path fill="var(--text-primary)" fill-rule="evenodd" d="M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z"></path></svg>'
}

// 搜索引擎配置
const searchEngines = [
  { id: 'google', name: 'Google' },
  { id: 'bing', name: 'Bing' },
  { id: 'duckduckgo', name: 'DuckDuckGo' },
  { id: 'baidu', name: 'Baidu' },
  { id: 'wikipedia', name: 'Wikipedia' },
  { id: 'custom', name: '自定义', isCustom: true }
]

// 当前搜索引擎
const currentEngine = computed(() => {
  // 首先在默认引擎中查找
  const defaultEngine = searchEngines.find(engine => engine.id === selectedEngine.value)
  if (defaultEngine) {
    return defaultEngine
  }
  
  // 然后在自定义引擎中查找
  const customEngine = customEngines.value.find(engine => engine.id === selectedEngine.value)
  if (customEngine) {
    return customEngine
  }
  
  return searchEngines[0]
})

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
  // 添加点击外部关闭下拉菜单监听
  document.addEventListener('click', handleClickOutside)
})

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  const dropdown = event.target.closest('.search-engine-selector')
  if (!dropdown && showEngineDropdown.value) {
    showEngineDropdown.value = false
  }
}

// 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
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

// 快看漫画按钮点击事件
const handleKuaiKanComic = () => {
  router.push('/kuaikan-comic')
}

const handleTomatoNovel = () => {
  router.push('/tomato-novel')
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

// KFC疯狂星期四按钮点击事件
const handleKFCThursday = () => {
  router.push('/kfc-thursday')
}

// 狗屁不通文章按钮点击事件
const handleNonsenseArticle = () => {
  router.push('/nonsense-article')
}

// 二维码生成按钮点击事件
const handleQRCodeGenerator = () => {
  alert('二维码生成功能即将推出，敬请期待！')
}

// Github链接增强按钮点击事件
const handleGithubEnhancer = () => {
  alert('Github链接增强功能即将推出，敬请期待！')
}

// Markdown阅读器按钮点击事件
const handleMarkdownReader = () => {
  alert('Markdown阅读器功能即将推出，敬请期待！')
}

// 显示即将推出提示
const showComingSoon = (featureName) => {
  alert(`${featureName} 功能即将推出，敬请期待！`)
}

// 搜索功能
const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    showAlert({
      title: '提示',
      message: '请输入搜索关键词',
      type: 'warning'
    })
    return
  }
  
  const defaultSearchEngines = {
    google: `https://www.google.com/search?q=${encodeURIComponent(searchQuery.value)}`,
    bing: `https://www.bing.com/search?q=${encodeURIComponent(searchQuery.value)}`,
    duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery.value)}`,
    baidu: `https://www.baidu.com/s?wd=${encodeURIComponent(searchQuery.value)}`,
    wikipedia: `https://zh.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(searchQuery.value)}`
  }
  
  let searchUrl = defaultSearchEngines[selectedEngine.value]
  
  // 如果是自定义引擎
  if (!searchUrl) {
    const customEngine = customEngines.value.find(engine => engine.id === selectedEngine.value)
    if (customEngine) {
      searchUrl = customEngine.url.replace('{query}', encodeURIComponent(searchQuery.value))
    }
  }
  
  if (searchUrl) {
    window.open(searchUrl, '_blank')
  } else {
    showAlert({
      title: '错误',
      message: '未找到对应的搜索引擎',
      type: 'error'
    })
  }
}

// performSearch方法 - 与handleSearch功能相同
const performSearch = () => {
  handleSearch()
}

// 切换搜索引擎下拉菜单
const toggleEngineDropdown = () => {
  showEngineDropdown.value = !showEngineDropdown.value
}

// 选择搜索引擎
const selectEngine = (engine) => {
  if (engine === 'custom') {
    showCustomModal.value = true
    showEngineDropdown.value = false
  } else {
    selectedEngine.value = engine
    localStorage.setItem('selectedEngine', engine)
    showEngineDropdown.value = false
  }
}

// 循环切换搜索引擎
const switchEngine = () => {
  toggleEngineDropdown()
}

// 关闭自定义引擎弹窗
const closeCustomModal = () => {
  showCustomModal.value = false
  customEngineForm.value = {
    name: '',
    url: '',
    icon: ''
  }
}

// 获取网站图标
const fetchFavicon = async () => {
  if (!customEngineForm.value.url) {
    showAlert({
      title: '提示',
      message: '请先输入搜索网址',
      type: 'warning'
    })
    return
  }
  
  isLoadingIcon.value = true
  
  try {
    // 确保URL格式正确
    let url = customEngineForm.value.url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    
    // 解析域名
    const urlObj = new URL(url)
    const domain = urlObj.hostname
    
    // 尝试多种favicon获取方式
    const faviconUrls = [
      `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      `https://${domain}/favicon.ico`,
      `https://${domain}/favicon.png`,
      `https://api.faviconkit.com/${domain}/64`
    ]
    
    // 测试第一个可用的favicon
    for (const faviconUrl of faviconUrls) {
      try {
        const response = await fetch(faviconUrl, { method: 'HEAD' })
        if (response.ok) {
          customEngineForm.value.icon = faviconUrl
          return
        }
      } catch (e) {
        continue
      }
    }
    
    // 如果都失败了，使用Google的favicon服务作为备选
    customEngineForm.value.icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    
  } catch (error) {
    console.error('获取图标失败:', error)
    showAlert({
      title: '错误',
      message: '获取图标失败，请检查网址是否正确',
      type: 'error'
    })
  } finally {
    isLoadingIcon.value = false
  }
}

// 保存自定义引擎
const saveCustomEngine = () => {
  if (!customEngineForm.value.name || !customEngineForm.value.url) {
    showAlert({
      title: '提示',
      message: '请填写完整信息',
      type: 'warning'
    })
    return
  }
  
  // 确保URL包含{query}占位符
  let searchUrl = customEngineForm.value.url
  if (!searchUrl.includes('{query}')) {
    // 如果没有占位符，尝试智能添加
    if (searchUrl.includes('?')) {
      searchUrl += '&q={query}'
    } else {
      searchUrl += '?q={query}'
    }
  }
  
  const newEngine = {
    id: `custom_${Date.now()}`,
    name: customEngineForm.value.name,
    url: searchUrl,
    icon: customEngineForm.value.icon || `https://www.google.com/s2/favicons?domain=${new URL(searchUrl).hostname}&sz=64`
  }
  
  customEngines.value.push(newEngine)
  localStorage.setItem('customEngines', JSON.stringify(customEngines.value))
  
  // 保存到本地存储
  localStorage.setItem('customSearchEngines', JSON.stringify(customEngines.value))
  
  // 选择新添加的引擎
  selectedEngine.value = newEngine.id
  
  // 重置表单并关闭弹窗
  customEngineForm.value = {
    name: '',
    url: '',
    icon: ''
  }
  closeCustomModal()
  
  showAlert({
    title: '成功',
    message: '自定义引擎添加成功！',
    type: 'success'
  })
}

// 显示确认对话框
const showConfirm = (options) => {
  confirmDialogData.value = {
    title: options.title || '确认操作',
    message: options.message || '确定要执行此操作吗？',
    confirmText: options.confirmText || '确定',
    cancelText: options.cancelText || '取消',
    onConfirm: options.onConfirm || null,
    onCancel: options.onCancel || null
  }
  showConfirmDialog.value = true
}

// 关闭确认对话框
const closeConfirmDialog = () => {
  showConfirmDialog.value = false
  confirmDialogData.value = {
    title: '',
    message: '',
    confirmText: '确定',
    cancelText: '取消',
    onConfirm: null,
    onCancel: null
  }
}

// 确认对话框 - 确定按钮
const handleConfirm = () => {
  if (confirmDialogData.value.onConfirm) {
    confirmDialogData.value.onConfirm()
  }
  closeConfirmDialog()
}

// 确认对话框 - 取消按钮
const handleCancel = () => {
  if (confirmDialogData.value.onCancel) {
    confirmDialogData.value.onCancel()
  }
  closeConfirmDialog()
}

// 显示提示框
const showAlert = (options) => {
  alertDialogData.value = {
    title: options.title || '提示',
    message: options.message || '',
    type: options.type || 'info',
    buttonText: options.buttonText || '确定',
    onClose: options.onClose || null
  }
  showAlertDialog.value = true
}

// 关闭提示框
const closeAlertDialog = () => {
  showAlertDialog.value = false
  if (alertDialogData.value.onClose) {
    alertDialogData.value.onClose()
  }
  alertDialogData.value = {
    title: '',
    message: '',
    type: 'info',
    buttonText: '确定',
    onClose: null
  }
}

// 删除自定义引擎
const deleteCustomEngine = (engineId) => {
  const engine = customEngines.value.find(e => e.id === engineId)
  const engineName = engine ? engine.name : '该引擎'
  
  showConfirm({
    title: '删除确认',
    message: `确定要删除自定义搜索引擎「${engineName}」吗？\n删除后将无法恢复。`,
    confirmText: '删除',
    cancelText: '取消',
    onConfirm: () => {
      // 从数组中移除
      const index = customEngines.value.findIndex(engine => engine.id === engineId)
      if (index > -1) {
        customEngines.value.splice(index, 1)
        
        // 更新本地存储
        localStorage.setItem('customSearchEngines', JSON.stringify(customEngines.value))
        localStorage.setItem('customEngines', JSON.stringify(customEngines.value))
        
        // 如果删除的是当前选中的引擎，切换到默认引擎
        if (selectedEngine.value === engineId) {
          selectedEngine.value = 'google'
          localStorage.setItem('selectedEngine', 'google')
        }
      }
    }
  })
}

// 组件挂载时加载本地存储的自定义引擎
onMounted(() => {
  try {
    const savedEngines = localStorage.getItem('customSearchEngines')
    if (savedEngines) {
      customEngines.value = JSON.parse(savedEngines)
    }
  } catch (error) {
    console.error('加载自定义引擎失败:', error)
  }
})
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
    <!-- 搜索框 -->
    <div class="search-container">
      <div class="search-box">
        <!-- 搜索引擎切换 -->
        <div class="search-engine-selector" @click="switchEngine">
          <div class="engine-display">
            <div v-if="engineIcons[selectedEngine]" class="engine-icon-svg" v-html="engineIcons[selectedEngine]" :title="currentEngine.name"></div>
            <div v-else-if="currentEngine.icon" class="engine-icon-svg" :title="currentEngine.name">
              <img :src="currentEngine.icon" alt="" style="width: 24px; height: 24px; border-radius: 3px;" />
            </div>
            <div v-else class="engine-icon-svg" :title="currentEngine.name">
              <span style="font-size: 20px;">🔍</span>
            </div>
          </div>
          
          <!-- 搜索引擎下拉列表 -->
          <div v-if="showEngineDropdown" class="engine-dropdown">
            <!-- 默认搜索引擎（除了自定义选项） -->
            <div 
              v-for="engine in searchEngines.filter(e => !e.isCustom)" 
              :key="engine.id"
              @click.stop="selectEngine(engine.id)"
              class="engine-option"
              :class="{ 'active': engine.id === selectedEngine }"
            >
              <div class="engine-option-icon" v-html="engineIcons[engine.id]"></div>
              <span class="engine-option-name">{{ engine.name }}</span>
            </div>
            <!-- 自定义引擎分隔线 -->
            <div class="engine-divider" v-if="customEngines.length > 0"></div>
            <!-- 自定义引擎列表 -->
            <div 
              v-for="engine in customEngines" 
              :key="engine.id"
              class="engine-option custom-engine-item"
              :class="{ 'active': engine.id === selectedEngine }"
            >
              <div @click.stop="selectEngine(engine.id)" class="engine-option-content">
                <div class="engine-option-icon">
                  <img v-if="engine.icon" :src="engine.icon" alt="" style="width: 20px; height: 20px; border-radius: 3px;" />
                  <span v-else style="font-size: 16px;">🔍</span>
                </div>
                <span class="engine-option-name">{{ engine.name }}</span>
              </div>
              <button @click.stop="deleteCustomEngine(engine.id)" class="delete-engine-btn" title="删除引擎">
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 24 24">
                  <path d="M 10.806641 2 C 10.289641 2 9.7956875 2.2043125 9.4296875 2.5703125 L 9 3 L 4 3 A 1.0001 1.0001 0 1 0 4 5 L 20 5 A 1.0001 1.0001 0 1 0 20 3 L 15 3 L 14.570312 2.5703125 C 14.205312 2.2043125 13.710359 2 13.193359 2 L 10.806641 2 z M 4.3652344 7 L 5.8925781 20.263672 C 6.0245781 21.253672 6.877 22 7.875 22 L 16.123047 22 C 17.121047 22 17.974422 21.254859 18.107422 20.255859 L 19.634766 7 L 4.3652344 7 z"></path>
                </svg>
              </button>
            </div>
            <!-- 自定义选项 -->
            <div 
              v-for="engine in searchEngines.filter(e => e.isCustom)" 
              :key="engine.id"
              @click.stop="selectEngine(engine.id)"
              class="engine-option"
              :class="{ 'active': engine.id === selectedEngine }"
            >
              <div class="engine-option-icon" v-html="engineIcons[engine.id]"></div>
              <span class="engine-option-name">{{ engine.name }}</span>
            </div>
          </div>
        </div>
        
        <!-- 搜索输入框 -->
        <input 
          type="text" 
          v-model="searchQuery"
          @keyup.enter="performSearch"
          placeholder="输入搜索关键词..."
          class="search-input"
        />
        
        <!-- 搜索按钮 -->
        <button @click="performSearch" class="search-button">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

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

        <button class="feature-button movie-box-office" @click="showComingSoon('猫眼电影实时票房排行')">
          <div class="button-icon">🎬</div>
          <div class="button-text">
            <h3>猫眼电影票房</h3>
            <p>实时票房排行榜</p>
          </div>
        </button>

        <button class="feature-button countdown" @click="showComingSoon('倒数日获取')">
          <div class="button-icon">📅</div>
          <div class="button-text">
            <h3>倒数日获取</h3>
            <p>重要日期倒计时</p>
          </div>
        </button>

        <button class="feature-button recipe" @click="showComingSoon('菜谱信息大全')">
          <div class="button-icon">🍳</div>
          <div class="button-text">
            <h3>菜谱信息大全</h3>
            <p>丰富的菜谱资源</p>
          </div>
        </button>

        <button class="feature-button lottery" @click="showComingSoon('彩票开奖查询')">
          <div class="button-icon">🎲</div>
          <div class="button-text">
            <h3>彩票开奖查询</h3>
            <p>最新开奖结果</p>
          </div>
        </button>

        <button class="feature-button stock" @click="showComingSoon('股票数据查询')">
          <div class="button-icon">📈</div>
          <div class="button-text">
            <h3>股票数据查询</h3>
            <p>实时股票行情</p>
          </div>
        </button>

        <button class="feature-button trademark" @click="showComingSoon('商标信息查询')">
          <div class="button-icon">®️</div>
          <div class="button-text">
            <h3>商标信息查询</h3>
            <p>商标注册信息</p>
          </div>
        </button>

        <button class="feature-button intercity-route" @click="showComingSoon('城际路线查询')">
          <div class="button-icon">🚇</div>
          <div class="button-text">
            <h3>城际路线查询</h3>
            <p>城际交通路线规划</p>
          </div>
        </button>

        <button class="feature-button train-ticket" @click="showComingSoon('高铁动车车票查询')">
          <div class="button-icon">🚄</div>
          <div class="button-text">
            <h3>高铁车票查询</h3>
            <p>车票信息查询</p>
          </div>
        </button>

        <button class="feature-button website-info" @click="showComingSoon('网站基础信息获取')">
          <div class="button-icon">🌐</div>
          <div class="button-text">
            <h3>网站信息获取</h3>
            <p>网站基础信息查询</p>
          </div>
        </button>

        <button class="feature-button map-search" @click="showComingSoon('百度地图地名检索')">
          <div class="button-icon">🗺️</div>
          <div class="button-text">
            <h3>地图地名检索</h3>
            <p>地理位置查询</p>
          </div>
        </button>

        <button class="feature-button steam-free" @click="showComingSoon('Steam喜加一获取')">
          <div class="button-icon">🎮</div>
          <div class="button-text">
            <h3>Steam喜加一</h3>
            <p>免费游戏推荐</p>
          </div>
        </button>

        <button class="feature-button dictionary" @click="showComingSoon('英文词典')">
          <div class="button-icon">📚</div>
          <div class="button-text">
            <h3>英文词典</h3>
            <p>英语单词查询</p>
          </div>
        </button>

        <button class="feature-button tech-news" @click="showComingSoon('实时科技资讯')">
          <div class="button-icon">📱</div>
          <div class="button-text">
            <h3>科技资讯</h3>
            <p>最新科技动态</p>
          </div>
        </button>

        <button class="feature-button world-population" @click="showComingSoon('全世界人口数量详情')">
          <div class="button-icon">🌍</div>
          <div class="button-text">
            <h3>世界人口统计</h3>
            <p>全球人口数据</p>
          </div>
        </button>

        <button class="feature-button name-duplicate" @click="showComingSoon('全国重名查询')">
          <div class="button-icon">👥</div>
          <div class="button-text">
            <h3>全国重名查询</h3>
            <p>姓名重复度查询</p>
          </div>
        </button>

        <button class="feature-button performance-ranking" @click="showComingSoon('性能天梯排行')">
          <div class="button-icon">🏆</div>
          <div class="button-text">
            <h3>性能天梯排行</h3>
            <p>硬件性能排行榜</p>
          </div>
        </button>

        <button class="feature-button movie-box-office" @click="showComingSoon('猫眼电影实时票房排行')">
          <div class="button-icon">🎬</div>
          <div class="button-text">
            <h3>猫眼电影票房</h3>
            <p>实时票房排行榜</p>
          </div>
        </button>

        <button class="feature-button countdown" @click="showComingSoon('倒数日获取')">
          <div class="button-icon">📅</div>
          <div class="button-text">
            <h3>倒数日获取</h3>
            <p>重要日期倒计时</p>
          </div>
        </button>

        <button class="feature-button recipe" @click="showComingSoon('菜谱信息大全')">
          <div class="button-icon">🍳</div>
          <div class="button-text">
            <h3>菜谱信息大全</h3>
            <p>丰富的菜谱资源</p>
          </div>
        </button>

        <button class="feature-button lottery" @click="showComingSoon('彩票开奖查询')">
          <div class="button-icon">🎲</div>
          <div class="button-text">
            <h3>彩票开奖查询</h3>
            <p>最新开奖结果</p>
          </div>
        </button>

        <button class="feature-button stock" @click="showComingSoon('股票数据查询')">
          <div class="button-icon">📈</div>
          <div class="button-text">
            <h3>股票数据查询</h3>
            <p>实时股票行情</p>
          </div>
        </button>

        <button class="feature-button trademark" @click="showComingSoon('商标信息查询')">
          <div class="button-icon">®️</div>
          <div class="button-text">
            <h3>商标信息查询</h3>
            <p>商标注册信息</p>
          </div>
        </button>

        <button class="feature-button train-ticket" @click="showComingSoon('高铁动车车票查询')">
          <div class="button-icon">🚄</div>
          <div class="button-text">
            <h3>高铁车票查询</h3>
            <p>车票信息查询</p>
          </div>
        </button>

        <button class="feature-button website-info" @click="showComingSoon('网站基础信息获取')">
          <div class="button-icon">🌐</div>
          <div class="button-text">
            <h3>网站信息获取</h3>
            <p>网站基础信息查询</p>
          </div>
        </button>

        <button class="feature-button map-search" @click="showComingSoon('百度地图地名检索')">
          <div class="button-icon">🗺️</div>
          <div class="button-text">
            <h3>地图地名检索</h3>
            <p>地理位置查询</p>
          </div>
        </button>

        <button class="feature-button steam-free" @click="showComingSoon('Steam喜加一获取')">
          <div class="button-icon">🎮</div>
          <div class="button-text">
            <h3>Steam喜加一</h3>
            <p>免费游戏推荐</p>
          </div>
        </button>

        <button class="feature-button dictionary" @click="showComingSoon('英文词典')">
          <div class="button-icon">📚</div>
          <div class="button-text">
            <h3>英文词典</h3>
            <p>英语单词查询</p>
          </div>
        </button>

        <button class="feature-button tech-news" @click="showComingSoon('实时科技资讯')">
          <div class="button-icon">📱</div>
          <div class="button-text">
            <h3>科技资讯</h3>
            <p>最新科技动态</p>
          </div>
        </button>

        <button class="feature-button world-population" @click="showComingSoon('全世界人口数量详情')">
          <div class="button-icon">🌍</div>
          <div class="button-text">
            <h3>世界人口统计</h3>
            <p>全球人口数据</p>
          </div>
        </button>

        <button class="feature-button name-duplicate" @click="showComingSoon('全国重名查询')">
          <div class="button-icon">👥</div>
          <div class="button-text">
            <h3>全国重名查询</h3>
            <p>姓名重复度查询</p>
          </div>
        </button>

        <button class="feature-button performance-ranking" @click="showComingSoon('性能天梯排行')">
          <div class="button-icon">🏆</div>
          <div class="button-text">
            <h3>性能天梯排行</h3>
            <p>硬件性能排行榜</p>
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

        <button class="feature-button qr-generator" @click="handleQRCodeGenerator">
          <div class="button-icon">📱</div>
          <div class="button-text">
            <h3>二维码生成</h3>
            <p>快速生成各种二维码</p>
          </div>
        </button>

        <button class="feature-button github-enhancer" @click="handleGithubEnhancer">
          <div class="button-icon">🔗</div>
          <div class="button-text">
            <h3>Github增强</h3>
            <p>Github下载链接增强</p>
          </div>
        </button>

        <button class="feature-button markdown-reader" @click="handleMarkdownReader">
          <div class="button-icon">📖</div>
          <div class="button-text">
            <h3>Markdown阅读器</h3>
            <p>在线Markdown文档阅读</p>
          </div>
        </button>

        <button class="feature-button douyin-parser" @click="showComingSoon('抖音单视频解析')">
          <div class="button-icon">📱</div>
          <div class="button-text">
            <h3>抖音视频解析</h3>
            <p>解析抖音单个视频</p>
          </div>
        </button>

        <button class="feature-button xiaohongshu-parser" @click="showComingSoon('小红书图集详情')">
          <div class="button-icon">📷</div>
          <div class="button-text">
            <h3>小红书图集详情</h3>
            <p>获取小红书图集信息</p>
          </div>
        </button>

        <button class="feature-button anime-avatar-ai" @click="showComingSoon('动漫头像AI一键转换')">
          <div class="button-icon">🎨</div>
          <div class="button-text">
            <h3>动漫头像AI转换</h3>
            <p>AI一键生成动漫头像</p>
          </div>
        </button>

        <button class="feature-button speech-to-text" @click="showComingSoon('视频音频识别转文本')">
          <div class="button-icon">🎙️</div>
          <div class="button-text">
            <h3>语音转文本</h3>
            <p>视频音频识别转文字</p>
          </div>
        </button>

        <button class="feature-button baidu-question-search" @click="showComingSoon('百度题库搜索')">
          <div class="button-icon">📝</div>
          <div class="button-text">
            <h3>百度题库搜索</h3>
            <p>搜索题目答案</p>
          </div>
        </button>

        <button class="feature-button ocr-recognition" @click="showComingSoon('OCR图像文字识别')">
          <div class="button-icon">🔍</div>
          <div class="button-text">
            <h3>OCR文字识别</h3>
            <p>图像文字识别提取</p>
          </div>
        </button>

        <button class="feature-button text-converter" @click="showComingSoon('简体繁体互转')">
          <div class="button-icon">🔄</div>
          <div class="button-text">
            <h3>简繁体互转</h3>
            <p>简体繁体文字转换</p>
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

        <button class="feature-button kfc-crazy" @click="handleKFCThursday">
          <div class="button-icon">🍗</div>
          <div class="button-text">
            <h3>KFC疯狂星期四</h3>
            <p>疯狂星期四文案生成</p>
          </div>
        </button>

        <button class="feature-button nonsense-article" @click="handleNonsenseArticle">
          <div class="button-icon">📝</div>
          <div class="button-text">
            <h3>狗屁不通文章</h3>
            <p>自动生成搞笑文章</p>
          </div>
        </button>

        <button class="feature-button kuaikan-comic" @click="handleKuaiKanComic">
          <div class="button-icon">📚</div>
          <div class="button-text">
            <h3>快看漫画</h3>
            <p>热门漫画推荐阅读</p>
          </div>
        </button>

        <button class="feature-button tomato-novel" @click="handleTomatoNovel">
          <div class="button-icon">🍅</div>
          <div class="button-text">
            <h3>番茄小说</h3>
            <p>精彩小说在线阅读</p>
          </div>
        </button>

        <button class="feature-button acrostic-poem" @click="showComingSoon('藏头藏尾诗词生成')">
          <div class="button-icon">📜</div>
          <div class="button-text">
            <h3>藏头藏尾诗词</h3>
            <p>生成个性化诗词</p>
          </div>
        </button>

        <button class="feature-button certificate-generator" @click="showComingSoon('在线证书生成器')">
          <div class="button-icon">🏆</div>
          <div class="button-text">
            <h3>在线证书生成</h3>
            <p>制作各种证书模板</p>
          </div>
        </button>

        <button class="feature-button brain-teaser" @click="showComingSoon('脑筋急转弯')">
          <div class="button-icon">🧠</div>
          <div class="button-text">
            <h3>脑筋急转弯</h3>
            <p>趣味智力问答</p>
          </div>
        </button>

        <button class="feature-button nickname-generator" @click="showComingSoon('姓氏谐音梗网名生成器')">
          <div class="button-icon">😄</div>
          <div class="button-text">
            <h3>谐音梗网名生成</h3>
            <p>姓氏谐音趣味网名</p>
          </div>
        </button>

        <button class="feature-button alipay-voice" @click="showComingSoon('支付宝收款语音生成')">
          <div class="button-icon">💰</div>
          <div class="button-text">
            <h3>支付宝语音生成</h3>
            <p>自定义收款语音</p>
          </div>
        </button>

        <button class="feature-button award-generator" @click="showComingSoon('在线奖状生成器')">
          <div class="button-icon">🥇</div>
          <div class="button-text">
            <h3>在线奖状生成</h3>
            <p>制作个性化奖状</p>
          </div>
        </button>

        <button class="feature-button us-identity" @click="showComingSoon('随机美国人身份证')">
          <div class="button-icon">🆔</div>
          <div class="button-text">
            <h3>随机美国身份</h3>
            <p>生成虚拟身份信息</p>
          </div>
        </button>

        <button class="feature-button food-suggestion" @click="showComingSoon('今天吃什么')">
          <div class="button-icon">🍽️</div>
          <div class="button-text">
            <h3>今天吃什么</h3>
            <p>随机美食推荐</p>
          </div>
        </button>
      </div>
    </section>
  </main>

  <!-- 版权区域 -->
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4 class="section-title">关于我</h4>
        <div class="footer-buttons">
          <button class="btn github-btn" @click="handleGitHub">
            <svg id="github" viewBox="0 0 24 24" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" fill="#0092E4" height="40" width="40">
              <path d="M12,2.2467A10.00042,10.00042,0,0,0,8.83752,21.73419c.5.08752.6875-.21247.6875-.475,0-.23749-.01251-1.025-.01251-1.86249C7,19.85919,6.35,18.78423,6.15,18.22173A3.636,3.636,0,0,0,5.125,16.8092c-.35-.1875-.85-.65-.01251-.66248A2.00117,2.00117,0,0,1,6.65,17.17169a2.13742,2.13742,0,0,0,2.91248.825A2.10376,2.10376,0,0,1,10.2,16.65923c-2.225-.25-4.55-1.11254-4.55-4.9375a3.89187,3.89187,0,0,1,1.025-2.6875,3.59373,3.59373,0,0,1,.1-2.65s.83747-.26251,2.75,1.025a9.42747,9.42747,0,0,1,5,0c1.91248-1.3,2.75-1.025,2.75-1.025a3.59323,3.59323,0,0,1,.1,2.65,3.869,3.869,0,0,1,1.025,2.6875c0,3.83747-2.33752,4.6875-4.5625,4.9375a2.36814,2.36814,0,0,1,.675,1.85c0,1.33752-.01251,2.41248-.01251,2.75,0,.26251.1875.575.6875.475A10.0053,10.0053,0,0,0,12,2.2467Z"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="footer-section">
        <h4 class="section-title">特别鸣谢</h4>
        <div class="footer-buttons">
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
      </div>
      
      <div class="copyright">
        <p>&copy; 2025 Glesearch. All rights reserved.</p>
      </div>
    </div>
  </footer>
  
  <!-- 自定义引擎弹窗 -->
  <div v-if="showCustomModal" class="modal-overlay" @click="closeCustomModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>添加自定义搜索引擎</h3>
        <button class="modal-close" @click="closeCustomModal">×</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label>引擎名称</label>
          <input 
            type="text" 
            v-model="customEngineForm.name" 
            placeholder="例如：Reddit"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>搜索网址</label>
          <input 
            type="text" 
            v-model="customEngineForm.url" 
            placeholder="例如：https://www.reddit.com/search/?q="
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>网站图标</label>
          <div class="icon-input-group">
            <button @click="fetchFavicon" class="fetch-icon-btn" :disabled="isLoadingIcon">
              <span v-if="isLoadingIcon" class="loading-spinner"></span>
              {{ isLoadingIcon ? '获取中...' : '获取图标' }}
            </button>
          </div>
          <div v-if="customEngineForm.icon" class="icon-preview">
            <img :src="customEngineForm.icon" alt="图标预览" @error="customEngineForm.icon = ''" />
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="closeCustomModal" class="btn-cancel">取消</button>
        <button @click="saveCustomEngine" class="btn-save">保存</button>
      </div>
    </div>
  </div>
  
  <!-- 确认对话框 -->
  <div v-if="showConfirmDialog" class="modal-overlay" @click="handleCancel">
    <div class="confirm-dialog" @click.stop>
      <div class="confirm-header">
        <h3>{{ confirmDialogData.title }}</h3>
      </div>
      
      <div class="confirm-body">
        <div class="confirm-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="confirm-message">{{ confirmDialogData.message }}</p>
      </div>
      
      <div class="confirm-actions">
        <button class="confirm-btn cancel-btn" @click="handleCancel">
          {{ confirmDialogData.cancelText }}
        </button>
        <button class="confirm-btn confirm-btn-primary" @click="handleConfirm">
          {{ confirmDialogData.confirmText }}
        </button>
      </div>
    </div>
  </div>
  </div>
  
  <!-- 提示框 -->
  <div v-if="showAlertDialog" class="modal-overlay" @click="closeAlertDialog">
    <div class="modal-content alert-dialog" :class="`alert-${alertDialogData.type}`" @click.stop>
      <div class="modal-header">
        <h3>{{ alertDialogData.title }}</h3>
      </div>
      
      <div class="modal-body alert-body">
        <div class="alert-icon" :class="`alert-icon-${alertDialogData.type}`">
          <svg v-if="alertDialogData.type === 'success'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
          <svg v-else-if="alertDialogData.type === 'error'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <svg v-else-if="alertDialogData.type === 'warning'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <path d="M12 9v4"></path>
            <path d="m12 17 .01 0"></path>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="m12 8 .01 0"></path>
          </svg>
        </div>
        <p class="alert-message">{{ alertDialogData.message }}</p>
      </div>
      
      <div class="modal-actions">
        <button class="confirm-btn confirm-btn-primary" @click="closeAlertDialog">
          {{ alertDialogData.buttonText }}
        </button>
      </div>
    </div>
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
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.section-title {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.footer-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
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

/* 搜索框样式 */
.search-container {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
  padding: 0 1rem;
  position: relative;
  z-index: 10000;
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 50px;
  padding: 0.5rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
  transition: all 0.3s ease;
  max-width: 600px;
  width: 100%;
  position: relative;
}

.search-box::before {
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
  border-radius: 50px;
  z-index: -1;
}

.search-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-heavy);
  border-color: var(--text-accent);
}

.search-box:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-heavy);
  border-color: #667eea;
}

.search-engine-selector {
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
}

.engine-display {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  color: var(--text-primary);
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  flex-shrink: 0;
  padding: 0;
}

.engine-display:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.engine-display:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.2);
}

.engine-icon-svg {
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.engine-icon-svg svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.engine-name {
  transition: all 0.3s ease;
}

.search-engine-selector:hover .engine-icon-svg {
  transform: rotate(360deg);
}

.engine-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: 0 8px 32px var(--glass-shadow);
  z-index: 99999;
  overflow: hidden;
  margin-top: 8px;
  min-width: 200px;
  animation: dropdownFadeIn 0.2s ease-out;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.engine-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 12px;
  color: var(--text-primary);
}

.engine-option:hover {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.engine-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0;
  pointer-events: none;
}

.engine-divider:hover {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.custom-option {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
  padding-top: 12px;
}

.engine-option.active {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.engine-option-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.engine-option-icon svg {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.engine-option-name {
  font-size: 14px;
  font-weight: 500;
}

.engine-option.active .engine-option-name {
  font-weight: 600;
}

.engine-option-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.delete-engine-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.delete-engine-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.delete-engine-btn svg {
  width: 16px;
  height: 16px;
  fill: var(--text-primary);
  transition: fill 0.2s ease;
}

.delete-engine-btn:hover svg {
  fill: #ff6b6b;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 1rem 1.5rem;
  color: var(--text-primary);
  font-size: 1.1rem;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.search-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  flex-shrink: 0;
  padding: 0;
}

.search-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.search-button:active {
  transform: scale(0.95);
}

.search-button svg {
  transition: all 0.3s ease;
}

.search-button:hover svg {
  transform: scale(1.1);
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

.qr-generator:hover {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.4) 0%, rgba(39, 174, 96, 0.4) 100%);
}

.github-enhancer:hover {
  background: linear-gradient(135deg, rgba(52, 73, 94, 0.4) 0%, rgba(44, 62, 80, 0.4) 100%);
}

.markdown-reader:hover {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.4) 0%, rgba(142, 68, 173, 0.4) 100%);
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
  
  .search-container {
    padding: 0 1rem;
    margin-bottom: 2.5rem;
  }
  
  .search-box {
    max-width: 500px;
    padding: 0.4rem;
    border-radius: 40px;
  }
  
  .engine-display {
    width: 44px;
    height: 44px;
  }
  
  .engine-icon-svg {
    width: 20px;
    height: 20px;
  }
  
  .search-input {
    padding: 0.8rem 1.2rem;
    font-size: 1rem;
  }
  
  .search-button {
    width: 44px;
    height: 44px;
  }
  
  .search-button svg {
    width: 24px;
    height: 24px;
  }
}

@media (max-width: 600px) {
  .search-container {
    padding: 0 0.8rem;
  }
  
  .search-box {
    max-width: 420px;
    padding: 0.35rem;
    border-radius: 35px;
  }
  
  .engine-display {
    width: 40px;
    height: 40px;
  }
  
  .engine-icon-svg {
    width: 18px;
    height: 18px;
  }
  
  .search-input {
    padding: 0.7rem 1rem;
    font-size: 0.95rem;
  }
  
  .search-button {
    width: 40px;
    height: 40px;
  }
  
  .search-button svg {
    width: 22px;
    height: 22px;
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
  
  .search-container {
    padding: 0 0.6rem;
    margin-bottom: 2rem;
  }
  
  .search-box {
    max-width: 360px;
    padding: 0.3rem;
    border-radius: 30px;
  }
  
  .engine-display {
    width: 36px;
    height: 36px;
  }
  
  .engine-icon-svg {
    width: 16px;
    height: 16px;
  }
  
  .search-input {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }
  
  .search-button {
    width: 36px;
    height: 36px;
  }
  
  .search-button svg {
    width: 20px;
    height: 20px;
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

@media (max-width: 360px) {
  .search-container {
    padding: 0 0.4rem;
  }
  
  .search-box {
    max-width: 320px;
    padding: 0.25rem;
    border-radius: 25px;
  }
  
  .engine-display {
    width: 32px;
    height: 32px;
  }
  
  .engine-icon-svg {
    width: 14px;
    height: 14px;
  }
  
  .search-input {
    padding: 0.5rem 0.6rem;
    font-size: 0.85rem;
  }
  
  .search-button {
    width: 32px;
    height: 32px;
  }
  
  .search-button svg {
    width: 18px;
    height: 18px;
  }
}

/* 自定义引擎弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: modalFadeIn 0.3s ease;
}

.modal-content {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  box-shadow: 0 20px 40px var(--glass-shadow);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--glass-border);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.modal-body {
  padding: 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: var(--text-secondary);
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.icon-input-group {
  display: flex;
  gap: 0.5rem;
}

.icon-input-group .form-input {
  flex: 1;
}

.fetch-icon-btn {
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.fetch-icon-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.fetch-icon-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.icon-preview {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-preview img {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--glass-border);
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.btn-save {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 确认对话框样式 */
.confirm-dialog {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 20px 40px var(--glass-shadow);
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
}

.confirm-header {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  text-align: center;
}

.confirm-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.confirm-body {
  padding: 0 1.5rem 1.5rem 1.5rem;
  text-align: center;
}

.confirm-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.confirm-message {
  color: var(--text-primary);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  white-space: pre-line;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.confirm-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  border: 1px solid var(--glass-border);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
}

.confirm-btn-primary {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.confirm-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* 提示框样式 */
.alert-dialog {
  max-width: 400px;
  width: 90%;
}

.alert-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1.5rem;
  text-align: center;
}

.alert-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.alert-icon svg {
  width: 32px;
  height: 32px;
}

.alert-icon-success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.alert-icon-error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.alert-icon-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.alert-icon-info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.alert-message {
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-color);
  margin: 0;
}

.alert-dialog .modal-actions {
  justify-content: center;
  padding: 1rem 1.5rem 1.5rem;
}

.alert-dialog .confirm-btn {
  min-width: 100px;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 成功类型按钮 */
.alert-dialog.alert-success .confirm-btn {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
}

.alert-dialog.alert-success .confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

/* 错误类型按钮 */
.alert-dialog.alert-error .confirm-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.alert-dialog.alert-error .confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* 警告类型按钮 */
.alert-dialog.alert-warning .confirm-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.alert-dialog.alert-warning .confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

/* 信息类型按钮 */
.alert-dialog.alert-info .confirm-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.alert-dialog.alert-info .confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
</style>