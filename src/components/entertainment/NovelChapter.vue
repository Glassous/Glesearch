<script setup>
import { ref, onMounted, defineOptions } from 'vue'
import { useRouter, useRoute } from 'vue-router'

defineOptions({
  name: 'NovelChapter'
})

const router = useRouter()
const route = useRoute()

// 章节数据
const chapterData = ref([])
const loading = ref(true)
const error = ref('')
const novelInfo = ref({})
const apiSource = ref('jkyai.top')
const lastUpdateTime = ref('')

// 获取章节目录数据
const fetchChapters = async (href) => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.jkyai.top/API/fqmfxs.php?href=${href}`)
    const result = await response.json()
    
    console.log('章节目录API返回数据:', result)
    
    if (result.code === 200 && result.data) {
      if (result.data.directory) {
        novelInfo.value.directory = result.data.directory
      }
      if (result.data.chapters && Array.isArray(result.data.chapters)) {
        chapterData.value = result.data.chapters
      } else {
        throw new Error('章节数据格式不正确')
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
      throw new Error('获取章节目录失败')
    }
  } catch (err) {
    error.value = '获取章节目录失败，请检查网络连接'
    lastUpdateTime.value = 'Error'
    console.error('章节目录API请求失败:', err)
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 阅读章节
const readChapter = (chapter) => {
  if (chapter.开始阅读) {
    // 提取href和num参数
    const match = chapter.开始阅读.match(/href=([^&]+)&num=(\d+)/)
    if (match) {
      const href = decodeURIComponent(match[1])
      const num = match[2]
      
      // 跳转到阅读页面
      router.push({
        path: '/novel-reader',
        query: {
          href: href,
          num: num,
          title: novelInfo.value.title,
          author: novelInfo.value.author
        }
      })
    } else {
      // 如果无法解析参数，则直接打开链接
      window.open(chapter.开始阅读, '_blank')
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  const href = route.query.href
  const title = route.query.title
  const author = route.query.author
  
  if (href) {
    novelInfo.value = {
      title: title || '未知小说',
      author: author || '未知作者'
    }
    fetchChapters(href)
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
      <h2 class="page-title">章节目录</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div class="update-time" :class="{ 'error-status': lastUpdateTime === 'Error' }">
          {{ lastUpdateTime === 'Error' ? 'Error' : (lastUpdateTime ? '更新时间: ' + lastUpdateTime : '') }}
        </div>
      </div>
    </header>

    <!-- 小说信息 -->
    <div class="novel-header" v-if="novelInfo.title">
      <h3 class="novel-title">{{ novelInfo.title }}</h3>
      <p class="novel-author">作者：{{ novelInfo.author }}</p>
      <p class="novel-directory" v-if="novelInfo.directory">目录：{{ novelInfo.directory }}</p>
    </div>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在获取章节目录...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 章节目录展示 -->
    <div v-if="!loading && !error && chapterData.length > 0" class="chapter-section">
      <h3>章节列表 ({{ chapterData.length }}章)</h3>
      <div class="chapter-grid">
        <div 
          v-for="(chapter, index) in chapterData" 
          :key="index"
          class="chapter-card"
          @click="readChapter(chapter)"
        >
          <div class="chapter-number">{{ index + 1 }}</div>
          <div class="chapter-info">
            <h4 class="chapter-title">{{ chapter.章节名称 || `第${index + 1}章` }}</h4>
            <div class="chapter-meta" v-if="chapter.开始阅读">
              <span class="read-indicator">点击阅读</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无章节数据 -->
    <div v-if="!loading && !error && chapterData.length === 0" class="no-data-message">
      <div class="no-data-icon">📚</div>
      <h3>暂无章节数据</h3>
      <p>该小说的章节目录暂时无法获取</p>
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
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
}

.novel-author {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0 0 0.3rem 0;
  font-style: italic;
}

.novel-directory {
  color: var(--text-primary);
  font-size: 0.8rem;
  margin: 0;
}

/* 主要内容区域 */
.main-content {
  margin-top: 160px; /* 增加高度以适应小说信息 */
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

/* 无数据状态 */
.no-data-message {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-data-message h3 {
  color: var(--text-accent);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.no-data-message p {
  font-size: 1rem;
  line-height: 1.5;
}

/* 章节数据区域 */
.chapter-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.chapter-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px var(--glass-shadow);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chapter-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow-medium);
}

.chapter-number {
  background: var(--text-accent);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.chapter-info {
  flex: 1;
  min-width: 0;
}

.chapter-title {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.3rem 0;
  line-height: 1.3;
  word-break: break-word;
}

.chapter-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.read-indicator {
  color: var(--text-accent);
  font-size: 0.8rem;
  font-weight: 500;
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
  
  .chapter-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
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
  
  .chapter-card {
    padding: 0.8rem;
    gap: 0.8rem;
  }
  
  .chapter-number {
    width: 35px;
    height: 35px;
    font-size: 0.8rem;
  }
  
  .novel-title {
    font-size: 1.1rem;
  }
}
</style>