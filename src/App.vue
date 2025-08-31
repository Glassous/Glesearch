<script setup>
import { onMounted, onUnmounted } from 'vue'
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

onMounted(async () => {
  // 监听Android返回键事件
  backButtonListener = await App.addListener('backButton', handleBackButton)
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
