<script setup>
// App.vue 现在只作为路由容器
</script>

<template>
  <router-view />
</template>

<style>
/* 全局样式 */
:root {
  /* 浅色模式 */
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #e0e0e0;
  --card-bg: #ffffff;
  --shadow-color: rgba(0, 0, 0, 0.1);
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #ffffff;
    --border-color: #404040;
    --card-bg: #2d2d2d;
    --shadow-color: rgba(255, 255, 255, 0.1);
  }
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-color);
  color: var(--text-color);
  min-height: 100vh;
}

/* 通用组件样式 */
.card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px var(--shadow-color);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.btn {
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.btn:hover {
  background-color: var(--border-color);
}

input, textarea, select {
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #007bff;
}
</style>
