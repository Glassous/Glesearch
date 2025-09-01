<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 网站信息数据
const websiteData = ref(null)
const loading = ref(false)
const error = ref('')
const apiSource = ref('PearAPI')
const inputUrl = ref('')

// 获取网站信息
const fetchWebsiteInfo = async () => {
  if (!inputUrl.value.trim()) {
    error.value = '请输入网站URL'
    return
  }

  let url = inputUrl.value.trim()
  
  // 如果没有协议，默认添加 https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.pearktrue.cn/api/website/info/?url=${encodeURIComponent(url)}`)
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data) {
      websiteData.value = {
        url: result.url,
        ...result.data
      }
    } else {
      throw new Error(`API返回错误: ${result.msg || '未知错误'}`)
    }
  } catch (err) {
    error.value = '获取网站信息失败，请检查网址是否正确或稍后重试'
    console.error('网站信息API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
  }
}

// 返回主页
const goBack = () => {
  const from = route.query.from
  if (from === 'home') {
    router.push('/')
  } else if (from === 'query') {
    router.push('/query')
  } else {
    // 默认返回首页
    router.push('/')
  }
}

// 回车键搜索
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    fetchWebsiteInfo()
  }
}

// 复制文本到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // 这里可以添加一个成功提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 快速填入示例网站
const fillExample = (exampleUrl) => {
  inputUrl.value = exampleUrl
}

// 热门网站示例
const popularWebsites = [
  { name: 'Bilibili', url: 'https://www.bilibili.com' },
  { name: 'GitHub', url: 'https://github.com' },
  { name: '知乎', url: 'https://www.zhihu.com' },
  { name: '淘宝', url: 'https://www.taobao.com' },
  { name: 'QQ', url: 'https://www.qq.com' },
  { name: '微博', url: 'https://weibo.com' },
  { name: 'CSDN', url: 'https://www.csdn.net' },
  { name: '百度', url: 'https://www.baidu.com' }
]

// 组件挂载时聚焦输入框
onMounted(() => {
  const input = document.querySelector('.url-input')
  if (input) {
    input.focus()
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
      <h2 class="page-title">网站信息获取</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div v-if="websiteData" class="query-info">
          {{ websiteData.host }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 搜索表单 -->
    <div class="search-form">
      <div class="form-row">
        <div class="input-group">
          <label>网站URL</label>
          <input 
            type="text" 
            v-model="inputUrl" 
            @keypress="handleKeyPress"
            placeholder="请输入网站地址，如：www.bilibili.com"
            class="form-input url-input"
          />
        </div>
        <button class="search-button" @click="fetchWebsiteInfo" :disabled="loading">
          {{ loading ? '查询中...' : '获取信息' }}
        </button>
      </div>

      <!-- 热门网站快速选择 -->
      <div class="popular-websites">
        <div class="websites-label">热门网站：</div>
        <div class="websites-list">
          <button 
            v-for="site in popularWebsites" 
            :key="site.name"
            class="website-tag"
            @click="fillExample(site.url)"
            :title="`查询${site.name}的网站信息`"
          >
            {{ site.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在获取网站信息...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 网站信息展示 -->
    <div v-if="!loading && !error && websiteData" class="website-section">
      <h3>网站信息详情</h3>
      
      <!-- 基本信息卡片 -->
      <div class="info-card basic-info">
        <div class="card-header">
          <div class="site-icon">
            <img 
              v-if="websiteData.icon" 
              :src="websiteData.icon" 
              :alt="websiteData.title"
              @error="$event.target.style.display='none'"
            />
            <span v-else class="default-icon">🌐</span>
          </div>
          <div class="site-basic">
            <h4 class="site-title">{{ websiteData.title }}</h4>
            <p class="site-url">{{ websiteData.url }}</p>
          </div>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">主机地址</span>
            <span class="info-value" @click="copyToClipboard(websiteData.host)">{{ websiteData.host }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">IP地址</span>
            <span class="info-value" @click="copyToClipboard(websiteData.ip)">{{ websiteData.ip }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">字符编码</span>
            <span class="info-value">{{ websiteData.charset || '未知' }}</span>
          </div>
        </div>
      </div>

      <!-- 描述信息卡片 -->
      <div v-if="websiteData.description" class="info-card description-card">
        <h4>网站描述</h4>
        <p class="description-text">{{ websiteData.description }}</p>
      </div>

      <!-- 关键词卡片 -->
      <div v-if="websiteData.keywords" class="info-card keywords-card">
        <h4>关键词</h4>
        <div class="keywords-list">
          <span 
            v-for="(keyword, index) in websiteData.keywords.split(',')" 
            :key="index"
            class="keyword-tag"
          >
            {{ keyword.trim() }}
          </span>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-if="!loading && !error && !websiteData && inputUrl" class="no-data-message">
      请输入网站地址获取信息
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
  padding-top: env(safe-area-inset-top, 20px);
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

.query-info {
  color: var(--text-accent);
  font-weight: 500;
}

/* 主要内容区域 */
.main-content {
  margin-top: 60px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 60px);
  width: 100%;
}

/* 搜索表单 */
.search-form {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.form-row {
  display: flex;
  align-items: end;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.input-group label {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 2rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.search-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 热门网站 */
.popular-websites {
  border-top: 1px solid var(--glass-border);
  padding-top: 1rem;
  margin-top: 1rem;
}

.websites-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.websites-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.website-tag {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.website-tag:hover {
  background: var(--text-accent);
  color: white;
  transform: translateY(-1px);
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

.no-data-message {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  background: var(--glass-bg);
  border-radius: 8px;
  margin-bottom: 2rem;
}

/* 网站信息区域 */
.website-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.info-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.info-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.site-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: var(--glass-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--glass-border);
}

.site-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-icon {
  font-size: 2rem;
}

.site-basic {
  flex: 1;
}

.site-title {
  color: var(--text-accent);
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.site-url {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
  word-break: break-all;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.info-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;
}

.info-value:hover {
  color: var(--text-accent);
}

.description-card h4,
.keywords-card h4 {
  color: var(--text-accent);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.description-text {
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.keyword-tag {
  background: rgba(102, 126, 234, 0.1);
  color: var(--text-accent);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.2s ease;
}

.keyword-tag:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .search-form {
    padding: 1.5rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .card-header {
    flex-direction: column;
    text-align: center;
    gap: 0.8rem;
  }
  
  .site-icon {
    width: 48px;
    height: 48px;
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
  
  .websites-list {
    gap: 0.3rem;
  }
  
  .website-tag {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
  
  .keyword-tag {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>