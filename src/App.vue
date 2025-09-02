<script setup>
import { onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { App } from '@capacitor/app'

const router = useRouter()
let backButtonListener = null

// Android返回键处理
const handleBackButton = () => {
  // 如果当前不在首页，则返回上一页
  if (router.currentRoute.value.path !== '/') {
    router.back()
  } else {
    // 如果在首页，则退出应用
    App.exitApp()
  }
}

// 监听路由变化，确保滚动到顶部（主页除外）
const scrollToTop = () => {
  nextTick(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // 使用instant避免动画干扰
    })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  })
}

// 处理主页刷新时滚动到顶部
const handleHomePageRefresh = () => {
  // 如果是主页且是刷新（没有来源页面），滚动到顶部
  if (router.currentRoute.value.path === '/' && window.performance && window.performance.navigation) {
    if (window.performance.navigation.type === 1) { // 刷新
      scrollToTop()
    }
  }
}

onMounted(async () => {
  // 监听Android返回键事件
  backButtonListener = await App.addListener('backButton', handleBackButton)
  
  // 监听路由变化
  router.afterEach((to, from) => {
    // 只有非主页才滚动到顶部，主页保留原位置
    if (to.path !== '/') {
      scrollToTop()
    }
  })
  
  // 处理主页刷新情况
  handleHomePageRefresh()
  
  // 初始加载时，如果不是主页也滚动到顶部
  if (router.currentRoute.value.path !== '/') {
    scrollToTop()
  }
})

onUnmounted(() => {
  // 清理监听器
  if (backButtonListener) {
    backButtonListener.remove()
  }
})
</script>

<template> 
  <div class="safe-area">
    <router-view v-slot="{ Component }">
      <keep-alive include="TomatoNovel,NovelChapter">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<style>
/* 全局禁用按钮点击时的原生蓝色覆盖 */
button, input[type="button"], input[type="submit"], input[type="reset"] {
  outline: none !important;
  -webkit-tap-highlight-color: transparent !important;
  -webkit-focus-ring-color: transparent !important;
  -webkit-appearance: none;
}

/* 禁用所有可点击元素的蓝色覆盖 */
* {
  -webkit-tap-highlight-color: transparent !important;
  -webkit-touch-callout: none;
}

/* 全局样式 - 使用统一的主题变量 */
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
}

/* 通用组件样式 */
.card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 8px 32px var(--glass-shadow);
  transition: all 0.3s ease;
}

.btn {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-light);
}

input, textarea, select {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(30, 88, 75, 0.1);
}
</style>
