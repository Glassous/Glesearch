<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 阅读数据
const readerData = ref({})
const loading = ref(true)
const error = ref('')
const apiSource = ref('jkyai.top')
const lastUpdateTime = ref('')

// 获取阅读内容
const fetchContent = async (href, num) => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.jkyai.top/API/fqmfxs.php?href=${href}&num=${num}`)
    const result = await response.text()
    
    console.log('阅读页面API返回数据:', result)
    
    if (result && result.trim()) {
      // 处理返回的文本内容，移除页码信息
      const cleanedContent = cleanPageInfo(result)
      readerData.value = {
        内容: cleanedContent,
        章节标题: `第${num}章`
      }
      
      // 设置更新时间
      const now = new Date()
      lastUpdateTime.value = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      throw new Error('获取阅读内容失败')
    }
  } catch (err) {
    error.value = '获取阅读内容失败，请检查网络连接'
    lastUpdateTime.value = 'Error'
    console.error('阅读页面API请求失败:', err)
  } finally {
    loading.value = false
  }
}

// 清理页码信息的函数
const cleanPageInfo = (content) => {
  if (!content) return ''
  
  // 匹配并移除"第(x/n)页"格式的文本
  // 支持多种可能的格式：第(1/3)页、第（1/3）页、第1/3页等
  const pagePattern = /第\s*[（(]\s*\d+\s*\/\s*\d+\s*[）)]\s*页[^]*/g
  const alternativePattern = /第\s*\d+\s*\/\s*\d+\s*页[^]*/g
  
  let cleanedContent = content
    .replace(pagePattern, '') // 移除带括号的页码
    .replace(alternativePattern, '') // 移除不带括号的页码
    .replace(/^\s*[]+/, '') // 移除开头的空行
    .replace(/[]+\s*$/, '') // 移除结尾的空行
    .trim()
  
  return cleanedContent
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 上一页
const prevPage = () => {
  const currentNum = parseInt(route.query.num || '1')
  if (currentNum > 1) {
    const newNum = currentNum - 1
    const href = route.query.href
    
    fetchContent(href, newNum.toString())
    
    // 更新URL但不刷新页面
    router.replace({
      path: '/novel-reader',
      query: {
        href: href,
        num: newNum.toString(),
        title: route.query.title,
        author: route.query.author
      }
    })
  }
}

// 下一页
const nextPage = () => {
  const currentNum = parseInt(route.query.num || '1')
  const newNum = currentNum + 1
  const href = route.query.href
  
  fetchContent(href, newNum.toString())
  
  // 更新URL但不刷新页面
  router.replace({
    path: '/novel-reader',
    query: {
      href: href,
      num: newNum.toString(),
      title: route.query.title,
      author: route.query.author
    }
  })
}

// 格式化内容
const formatContent = (content) => {
  if (!content) return ''
  return content.replace(/\n/g, '<br>').replace(/\s{2,}/g, '&nbsp;&nbsp;')
}

// 组件挂载时获取数据
onMounted(() => {
  const href = route.query.href
  const num = route.query.num || '1'
  
  if (href) {
    fetchContent(href, num)
  } else {
    error.value = '缺少必要的参数'
    loading.value = false
  }
})
</script>

<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">小说阅读</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div class="update-time" :class="{ 'error-status': lastUpdateTime === 'Error' }">
          {{ lastUpdateTime === 'Error' ? 'Error' : (lastUpdateTime ? '更新时间: ' + lastUpdateTime : '') }}
        </div>
      </div>
    </header>

    <!-- 小说信息 -->
    <div class="novel-header" v-if="route.query.title">
      <h3 class="novel-title">{{ route.query.title }}</h3>
      <p class="novel-author">作者：{{ route.query.author || '未知作者' }}</p>
      <p class="chapter-title">第{{ route.query.num || '1' }}页</p>
    </div>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在加载阅读内容...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 阅读内容展示 -->
    <div v-if="!loading && !error && readerData" class="reader-section">
      <!-- 页面标题 -->
      <div class="chapter-header">
        <h2 class="chapter-title">第{{ route.query.num || '1' }}页</h2>
      </div>

      <!-- 阅读内容 -->
      <div class="content-area" v-if="readerData.内容">
        <div class="content-text" v-html="formatContent(readerData.内容)"></div>
      </div>

      <!-- 页面导航 -->
      <div class="chapter-navigation">
        <button 
          class="nav-btn prev-btn"
          @click="prevPage"
          :disabled="parseInt(route.query.num || '1') <= 1"
        >
          上一页
        </button>
        <button 
          class="nav-btn next-btn"
          @click="nextPage"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 无内容数据 -->
    <div v-if="!loading && !error && !readerData.内容" class="no-content-message">
      <div class="no-content-icon">📖</div>
      <h3>暂无阅读内容</h3>
      <p>该章节的内容暂时无法获取</p>
    </div>
  </main>
</template>

<style scoped>
/* 全局样式 */
* {
  box-sizing: border-box;
}

/* 顶部区域 */
.fixed-header {
  padding-top: env(safe-area-inset-top);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--glass-border);
  width: 100%;
  z-index: 1000;
  box-shadow: 0 4px 16px var(--glass-shadow);
}

/* 顶部导航栏 */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  height: 60px;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-accent);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
}

.back-button:hover {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transform: translateY(-1px);
}

.back-icon {
  font-size: 1.5rem;
  font-weight: bold;
}

.page-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  color: var(--text-accent);
  font-size: 1.5rem;
  font-weight: 600;
}

.api-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.2;
}

.api-source {
  margin-bottom: 2px;
}

.update-time {
  color: var(--text-secondary);
}

.update-time.error-status {
  color: #d32f2f;
  font-weight: bold;
}

/* 小说信息区域 */
.novel-header {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--glass-border);
  background: var(--glass-bg);
}

.novel-title {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 0.3rem 0;
}

.novel-author {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin: 0 0 0.3rem 0;
  font-style: italic;
}

.chapter-title {
  color: var(--text-primary);
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
}

/* 主要内容区域 */
.main-content {
  margin-top: 160px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 160px);
  width: 100%;
}

/* 加载和错误状态 */
.loading-message {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.error-message {
  text-align: center;
  padding: 2rem;
  color: #d32f2f;
  background: #ffebee;
  border-radius: 8px;
  margin-bottom: 2rem;
}

/* 无内容状态 */
.no-content-message {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.no-content-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-content-message h3 {
  color: var(--text-accent);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.no-content-message p {
  font-size: 1rem;
  line-height: 1.5;
}

/* 阅读区域 */
.reader-section {
  max-width: 800px;
  margin: 0 auto;
}

.chapter-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--glass-border);
}

.chapter-header .chapter-title {
  color: var(--text-accent);
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  line-height: 1.3;
}

.content-area {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.content-text {
  color: var(--text-primary);
  font-size: 1.1rem;
  line-height: 1.8;
  text-align: justify;
  word-break: break-word;
  white-space: pre-wrap;
}

.content-text::first-letter {
  font-size: 1.5em;
  font-weight: bold;
  color: var(--text-accent);
  float: left;
  margin: 0.1em 0.1em 0 0;
}

/* 章节导航 */
.chapter-navigation {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.nav-btn {
  flex: 1;
  padding: 1rem 2rem;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px var(--glass-shadow);
}

.nav-btn:hover:not(:disabled) {
  border-color: var(--text-accent);
  background: var(--text-accent);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow-medium);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--glass-bg);
  color: var(--text-secondary);
}

.prev-btn {
  text-align: left;
}

.next-btn {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .novel-header {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
    margin-top: 150px;
  }
  
  .content-area {
    padding: 1.5rem;
  }
  
  .content-text {
    font-size: 1rem;
    line-height: 1.6;
  }
  
  .chapter-header .chapter-title {
    font-size: 1.5rem;
  }
  
  .chapter-navigation {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .nav-btn {
    padding: 0.8rem 1.5rem;
    text-align: center;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.2rem;
  }
  
  .api-info {
    font-size: 0.65rem;
  }
  
  .top-bar {
    padding: 0.8rem;
  }
  
  .novel-header {
    padding: 0.8rem;
  }
  
  .content-area {
    padding: 1rem;
  }
  
  .content-text {
    font-size: 0.95rem;
  }
  
  .chapter-header .chapter-title {
    font-size: 1.3rem;
  }
  
  .novel-title {
    font-size: 1.1rem;
  }
}
</style>