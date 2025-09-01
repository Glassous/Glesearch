<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 重名查询数据
const nameData = ref(null)
const loading = ref(false)
const error = ref('')
const apiSource = ref('PearAPI')
const searchName = ref('')
const searchHistory = ref([])

// 获取重名查询数据
const fetchNameData = async () => {
  if (!searchName.value.trim()) {
    error.value = '请输入要查询的姓名'
    return
  }

  const name = searchName.value.trim()

  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.pearktrue.cn/api/name/check.php?name=${encodeURIComponent(name)}`)
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.data) {
      nameData.value = {
        name: result.data.name || name,
        count: result.data.count,
        male: result.data.male,
        female: result.data.female,
        msg: result.msg
      }
      
      // 添加到搜索历史，避免重复
      if (!searchHistory.value.includes(name)) {
        searchHistory.value.unshift(name)
        // 限制历史记录数量
        if (searchHistory.value.length > 8) {
          searchHistory.value = searchHistory.value.slice(0, 8)
        }
        // 保存到本地存储
        localStorage.setItem('nameDuplicateHistory', JSON.stringify(searchHistory.value))
      }
    } else {
      throw new Error(`API返回错误: ${result.msg || '未知错误'}`)
    }
  } catch (err) {
    error.value = '查询姓名失败，请检查网络连接或稍后重试'
    console.error('重名查询API请求失败:', err)
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
    fetchNameData()
  }
}

// 复制内容到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // 这里可以添加一个成功提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 快速填入示例姓名
const fillExample = (exampleName) => {
  searchName.value = exampleName
}

// 从历史记录选择姓名
const selectFromHistory = (name) => {
  searchName.value = name
  fetchNameData()
}

// 清空搜索历史
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('nameDuplicateHistory')
}

// 热门姓名示例
const popularNames = [
  '张伟', '王伟', '李娜', '王芳', '李伟', '张敏', 
  '李静', '王静', '刘伟', '张丽', '王丽', '李强'
]

// 获取性别比例的进度条宽度
const getMaleWidth = () => {
  if (!nameData.value || !nameData.value.male) return '0%'
  return nameData.value.male
}

const getFemaleWidth = () => {
  if (!nameData.value || !nameData.value.female) return '0%'
  return nameData.value.female
}

// 获取重名等级描述
const getDuplicateLevel = (count) => {
  const num = parseInt(count)
  if (num >= 10000) return { level: '超高重名', class: 'ultra-high', icon: '🔥' }
  if (num >= 5000) return { level: '很高重名', class: 'very-high', icon: '⚡' }
  if (num >= 1000) return { level: '较高重名', class: 'high', icon: '📈' }
  if (num >= 100) return { level: '中等重名', class: 'medium', icon: '📊' }
  if (num >= 10) return { level: '较低重名', class: 'low', icon: '📉' }
  return { level: '极少重名', class: 'rare', icon: '⭐' }
}

// 格式化数字
const formatNumber = (numStr) => {
  if (!numStr) return '0'
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 组件挂载时恢复搜索历史并聚焦输入框
onMounted(() => {
  const savedHistory = localStorage.getItem('nameDuplicateHistory')
  if (savedHistory) {
    try {
      searchHistory.value = JSON.parse(savedHistory)
    } catch (e) {
      console.error('恢复搜索历史失败:', e)
    }
  }
  
  const input = document.querySelector('.name-input')
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
      <h2 class="page-title">全国重名查询</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div v-if="nameData" class="query-info">
          {{ nameData.name }}
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
          <label>姓名查询</label>
          <input 
            type="text" 
            v-model="searchName" 
            @keypress="handleKeyPress"
            placeholder="请输入要查询的姓名，如：张三"
            class="form-input name-input"
          />
        </div>
        <button class="search-button" @click="fetchNameData" :disabled="loading">
          {{ loading ? '查询中...' : '查重名' }}
        </button>
      </div>

      <!-- 热门姓名快速选择 -->
      <div class="popular-names">
        <div class="names-label">热门姓名：</div>
        <div class="names-list">
          <button 
            v-for="name in popularNames" 
            :key="name"
            class="name-tag"
            @click="fillExample(name)"
            :title="`查询姓名: ${name}`"
          >
            {{ name }}
          </button>
        </div>
      </div>

      <!-- 搜索历史 -->
      <div v-if="searchHistory.length > 0" class="search-history">
        <div class="history-header">
          <span class="history-label">搜索历史：</span>
          <button class="clear-history" @click="clearHistory">清空</button>
        </div>
        <div class="history-list">
          <button 
            v-for="name in searchHistory" 
            :key="name"
            class="history-item"
            @click="selectFromHistory(name)"
            :title="`重新查询: ${name}`"
          >
            {{ name }}
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在查询重名信息...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 重名查询结果 -->
    <div v-if="!loading && !error && nameData" class="name-section">
      <h3>重名查询结果</h3>
      
      <div class="name-card">
        <div class="name-header">
          <div class="name-info">
            <h4 class="name-title">{{ nameData.name }}</h4>
            <div v-if="nameData.msg" class="name-note">{{ nameData.msg }}</div>
          </div>
          <div class="duplicate-level" :class="getDuplicateLevel(nameData.count).class">
            <span class="level-icon">{{ getDuplicateLevel(nameData.count).icon }}</span>
            <span class="level-text">{{ getDuplicateLevel(nameData.count).level }}</span>
          </div>
        </div>
        
        <div class="statistics-section">
          <!-- 重名数量统计 -->
          <div class="count-card">
            <div class="count-header">
              <span class="count-icon">👥</span>
              <span class="count-label">全国重名人数</span>
            </div>
            <div class="count-value" @click="copyToClipboard(nameData.count)">
              {{ formatNumber(nameData.count) }}
            </div>
            <div class="count-description">
              全国范围内同名人数统计
            </div>
          </div>

          <!-- 性别比例统计 -->
          <div class="gender-card">
            <div class="gender-header">
              <span class="gender-icon">⚖️</span>
              <span class="gender-label">性别比例分布</span>
            </div>
            
            <div class="gender-stats">
              <div class="gender-item male">
                <div class="gender-info">
                  <span class="gender-symbol">👨</span>
                  <span class="gender-name">男性</span>
                  <span class="gender-percent">{{ nameData.male }}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill male-fill" :style="{ width: getMaleWidth() }"></div>
                </div>
              </div>
              
              <div class="gender-item female">
                <div class="gender-info">
                  <span class="gender-symbol">👩</span>
                  <span class="gender-name">女性</span>
                  <span class="gender-percent">{{ nameData.female }}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill female-fill" :style="{ width: getFemaleWidth() }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <button 
            class="copy-button" 
            @click="copyToClipboard(`${nameData.name}: 全国重名${nameData.count}人，男性${nameData.male}，女性${nameData.female}`)"
            title="复制查询结果"
          >
            📋 复制结果
          </button>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-if="!loading && !error && !nameData && searchName" class="no-data-message">
      请输入姓名进行重名查询
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

/* 热门姓名 */
.popular-names {
  border-top: 1px solid var(--glass-border);
  padding-top: 1rem;
  margin-top: 1rem;
}

.names-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.names-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.name-tag {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.name-tag:hover {
  background: var(--text-accent);
  color: white;
  transform: translateY(-1px);
}

/* 搜索历史 */
.search-history {
  border-top: 1px solid var(--glass-border);
  padding-top: 1rem;
  margin-top: 1rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.history-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.clear-history {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.2s ease;
}

.clear-history:hover {
  background: rgba(244, 67, 54, 0.2);
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.history-item {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--text-accent);
  transition: all 0.2s ease;
}

.history-item:hover {
  background: rgba(102, 126, 234, 0.2);
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

/* 重名查询结果区域 */
.name-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.name-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.name-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.name-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.name-info {
  flex: 1;
}

.name-title {
  color: var(--text-accent);
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.name-note {
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-style: italic;
  margin: 0;
}

.duplicate-level {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid;
}

.duplicate-level.ultra-high {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.duplicate-level.very-high {
  border-color: #ff9800;
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.duplicate-level.high {
  border-color: #ffeb3b;
  background: rgba(255, 235, 59, 0.1);
  color: #f57f17;
}

.duplicate-level.medium {
  border-color: #2196f3;
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.duplicate-level.low {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.duplicate-level.rare {
  border-color: #9c27b0;
  background: rgba(156, 39, 176, 0.1);
  color: #9c27b0;
}

.level-icon {
  font-size: 1.5rem;
}

.level-text {
  font-size: 0.8rem;
  font-weight: 500;
}

.statistics-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.count-card, .gender-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--glass-border);
}

.count-header, .gender-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.count-icon, .gender-icon {
  font-size: 1.2rem;
}

.count-label, .gender-label {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

.count-value {
  color: var(--text-accent);
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: color 0.2s ease;
  font-family: 'Courier New', monospace;
}

.count-value:hover {
  color: var(--text-primary);
}

.count-description {
  color: var(--text-secondary);
  font-size: 0.8rem;
  line-height: 1.4;
}

.gender-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.gender-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gender-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gender-symbol {
  font-size: 1.1rem;
}

.gender-name {
  color: var(--text-primary);
  font-size: 0.9rem;
}

.gender-percent {
  color: var(--text-accent);
  font-weight: bold;
  font-size: 1rem;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.8s ease;
  border-radius: 4px;
}

.male-fill {
  background: linear-gradient(90deg, #2196f3, #64b5f6);
}

.female-fill {
  background: linear-gradient(90deg, #e91e63, #f48fb1);
}

.action-buttons {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.copy-button {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.copy-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
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
  
  .name-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .statistics-section {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .name-title {
    font-size: 1.5rem;
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
  
  .names-list {
    gap: 0.3rem;
  }
  
  .name-tag {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
  
  .name-title {
    font-size: 1.3rem;
  }
  
  .count-value {
    font-size: 2rem;
  }
  
  .name-card {
    padding: 1.5rem;
  }
}
</style>