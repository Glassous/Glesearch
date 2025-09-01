<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 商标数据
const trademarkData = ref([])
const loading = ref(false)
const error = ref('')
const apiSource = ref('api.pearktrue.cn')
const lastUpdateTime = ref('')
const keyword = ref('')
const hasSearched = ref(false)
const resultCount = ref(0)

// 获取商标数据
const fetchTrademarkData = async (searchKeyword) => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.pearktrue.cn/api/trademark/?keyword=${encodeURIComponent(searchKeyword)}`)
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data) {
      trademarkData.value = result.data
      resultCount.value = result.count || result.data.length
      hasSearched.value = true
      
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
      throw new Error(`API返回错误: ${result.msg || '未知错误'}`)
    }
  } catch (err) {
    error.value = '获取商标数据失败，请检查网络连接'
    lastUpdateTime.value = 'Error'
    console.error('商标API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
  }
}

// 搜索商标
const searchTrademark = () => {
  if (!keyword.value.trim()) {
    error.value = '请输入商标关键词'
    return
  }
  
  fetchTrademarkData(keyword.value.trim())
}

// 键盘事件处理
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    searchTrademark()
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

// 快速搜索建议
const quickSearchKeywords = [
  '小米',
  '华为',
  '腾讯',
  '阿里巴巴',
  '百度',
  '字节跳动',
  '美团'
]

// 快速搜索
const quickSearch = (searchKeyword) => {
  keyword.value = searchKeyword
  searchTrademark()
}

// 获取状态颜色
const getStatusColor = (status) => {
  if (status.includes('已注册')) return '#00b42a'
  if (status.includes('申请中')) return '#ff7d00'
  if (status.includes('驳回')) return '#f53f3f'
  return 'var(--text-secondary)'
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '未知'
  return dateStr
}

// 格式化商标名称
const formatTmName = (name) => {
  return name || '未知商标'
}

// 获取动画延迟，当卡片数量多时减少延迟
const getAnimationDelay = (index) => {
  if (trademarkData.value.length > 50) {
    return '0s' // 超过50个卡片时禁用动画延迟
  }
  if (trademarkData.value.length > 20) {
    return `${Math.min(index * 0.02, 0.2)}s` // 20-50个卡片时使用很小的延迟
  }
  return `${Math.min(index * 0.05, 0.5)}s` // 少量卡片时正常延迟
}

// 获取动画类，大量数据时使用无动画版本
const getCardClass = (index) => {
  const baseClass = 'trademark-card'
  if (trademarkData.value.length > 100) {
    return `${baseClass} no-animation` // 超过100个时完全禁用动画
  }
  return baseClass
}

// 组件挂载时的初始化
onMounted(() => {
  // 不做预设，等待用户输入
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
      <h2 class="page-title">商标信息查询</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div class="update-time" :class="{ 'error-status': lastUpdateTime === 'Error' }">
          {{ lastUpdateTime === 'Error' ? 'Error' : (lastUpdateTime ? '更新时间: ' + lastUpdateTime : '') }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-container">
        <div class="input-row">
          <input
            v-model="keyword"
            type="text"
            placeholder="请输入商标关键词，如：小米"
            class="search-input"
            @keypress="handleKeyPress"
          />
        </div>
        <button 
          class="search-button"
          @click="searchTrademark"
          :disabled="loading"
        >
          {{ loading ? '查询中...' : '®️ 查询商标' }}
        </button>
      </div>
      
      <!-- 快速搜索建议 -->
      <div class="quick-search">
        <span class="quick-label">热门商标：</span>
        <div class="suggestion-tags">
          <button
            v-for="suggestion in quickSearchKeywords"
            :key="suggestion"
            class="suggestion-tag"
            @click="quickSearch(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在查询商标信息...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 商标数据展示 -->
    <div v-if="!loading && !error && hasSearched" class="trademark-section">
      <div v-if="trademarkData.length === 0" class="no-results">
        没有找到相关商标信息，请尝试其他关键词
      </div>
      
      <div v-if="trademarkData.length > 0" class="trademark-container">
        <h3>{{ keyword }} 相关商标信息（共{{ resultCount }}条）</h3>
        <div class="trademark-grid">
          <div 
            v-for="(trademark, index) in trademarkData" 
            :key="trademark.regNo"
            :class="getCardClass(index)"
            :style="{ animationDelay: getAnimationDelay(index) }"
          >
            <div class="trademark-header">
              <div class="trademark-info">
                <h4 class="trademark-name">{{ formatTmName(trademark.tmName) }}</h4>
                <div class="reg-number">注册号：{{ trademark.regNo }}</div>
              </div>
              <div class="trademark-image" v-if="trademark.tmImgOssPath">
                <img :src="trademark.tmImgOssPath" :alt="trademark.tmName" />
              </div>
            </div>
            
            <div class="trademark-details">
              <!-- 基本信息 -->
              <div class="basic-section">
                <h5 class="section-title">📋 基本信息</h5>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">商标分类</span>
                    <span class="info-value">{{ trademark.clsStr }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">申请人</span>
                    <span class="info-value">{{ trademark.applicantCn }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">代理机构</span>
                    <span class="info-value">{{ trademark.agent || '无' }}</span>
                  </div>
                  <div class="info-item status-item">
                    <span class="info-label">状态</span>
                    <span class="info-value status" :style="{ color: getStatusColor(trademark.statusStr) }">
                      {{ trademark.statusStr }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- 时间信息 -->
              <div class="date-section">
                <h5 class="section-title">📅 重要日期</h5>
                <div class="date-grid">
                  <div class="date-item">
                    <span class="date-label">申请日期</span>
                    <span class="date-value">{{ formatDate(trademark.appDate) }}</span>
                  </div>
                  <div class="date-item">
                    <span class="date-label">注册日期</span>
                    <span class="date-value highlight">{{ formatDate(trademark.regDate) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

.update-time {
  color: var(--text-secondary);
}

.update-time.error-status {
  color: #d32f2f;
  font-weight: bold;
}

/* 主要内容区域 */
.main-content {
  margin-top: 60px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 60px);
  width: 100%;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 2rem;
}

.search-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.input-row {
  display: flex;
  gap: 1rem;
}

.search-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.search-button {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.search-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.search-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.quick-search {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.quick-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.suggestion-tag {
  padding: 0.4rem 0.8rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  color: var(--text-primary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggestion-tag:hover {
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

.no-results {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* 商标数据区域 */
.trademark-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
  text-align: center;
}

.trademark-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.trademark-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.trademark-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
  opacity: 0;
  transform: translateY(20px);
  animation: slideInUp 0.4s ease forwards;
  width: 100%;
}

.trademark-card.no-animation {
  opacity: 1;
  transform: translateY(0);
  animation: none;
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.trademark-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.trademark-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.trademark-info {
  flex: 1;
}

.trademark-name {
  color: var(--text-accent);
  font-size: 1.4rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
}

.reg-number {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.trademark-image {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  margin-left: 1rem;
}

.trademark-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
  background: white;
  padding: 4px;
}

.trademark-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  color: var(--text-accent);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
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
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.info-label {
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
}

.info-value {
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 600;
  word-break: break-all;
}

.info-value.status {
  font-weight: bold;
}

.date-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.date-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.date-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.date-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.date-value {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.date-value.highlight {
  color: var(--text-accent);
  font-size: 1.1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .trademark-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .trademark-card {
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .input-row {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .quick-search {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .trademark-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .trademark-image {
    margin-left: 0;
    align-self: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .date-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
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
  
  .suggestion-tags {
    gap: 0.3rem;
  }
  
  .suggestion-tag {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }
  
  .trademark-card {
    padding: 1rem;
  }
  
  .date-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
}
</style>