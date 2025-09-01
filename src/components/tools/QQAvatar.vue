<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// QQ头像查询相关数据
const qqNumber = ref('')
const avatarUrl = ref('')
const loading = ref(false)
const imageLoading = ref(false)
const error = ref('')
const apiSource = ref('jkyai.top')
const lastQueryTime = ref('')
const queryHistory = ref([])
const showHistoryModal = ref(false)
const selectedRecord = ref(null)
const refreshCooldown = ref(0)
const cooldownTimer = ref(null)

// 图片加载处理
const handleImageLoad = () => {
  imageLoading.value = false
}

const handleImageError = () => {
  imageLoading.value = false
  error.value = '头像加载失败，请检查QQ号是否正确'
}

// 查询QQ头像
const queryAvatar = async (qq = null) => {
  const targetQQ = qq || qqNumber.value.trim()
  
  if (!targetQQ) {
    error.value = '请输入QQ号'
    return
  }

  // 验证QQ号格式（5-11位数字）
  if (!/^\d{5,11}$/.test(targetQQ)) {
    error.value = 'QQ号格式不正确，请输入5-11位数字'
    return
  }

  try {
    loading.value = true
    imageLoading.value = true
    error.value = ''
    
    // 添加时间戳确保每次都是新请求，获取最新头像
    const timestamp = Date.now()
    const apiUrl = `https://api.jkyai.top/API/QQhqtx.php?qq=${targetQQ}&t=${timestamp}`
    
    // 直接设置图片URL，因为API返回的是图片
    avatarUrl.value = apiUrl
    
    // 记录查询时间
    const now = new Date()
    lastQueryTime.value = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    // 添加到查询历史（检查是否已存在）
    const existingIndex = queryHistory.value.findIndex(item => item.qq === targetQQ)
    
    // 保存干净的URL（不带时间戳）用于历史记录显示
    const cleanUrl = `https://api.jkyai.top/API/QQhqtx.php?qq=${targetQQ}`
    
    const historyRecord = {
      qq: targetQQ,
      avatarUrl: cleanUrl,
      queryTime: lastQueryTime.value
    }
    
    if (existingIndex !== -1) {
      // 如果已存在，更新记录并移到最前面
      queryHistory.value.splice(existingIndex, 1)
    }
    
    queryHistory.value.unshift(historyRecord)
    
    // 保存到本地存储
    localStorage.setItem('qqAvatarHistory', JSON.stringify(queryHistory.value))
    
  } catch (err) {
    error.value = err.message || '查询QQ头像失败，请检查网络连接或QQ号是否正确'
    avatarUrl.value = ''
    console.error('QQ头像查询失败:', err)
  } finally {
    loading.value = false
  }
}

// 返回主页
const goBack = () => {
  const from = route.query.from
  if (from === 'home') {
    router.push('/')
  } else if (from === 'tools') {
    router.push('/tools')
  } else {
    // 默认返回首页
    router.push('/')
  }
}

// 清空查询历史
const clearHistory = () => {
  queryHistory.value = []
  localStorage.removeItem('qqAvatarHistory')
}

// 删除单条历史记录
const deleteHistoryItem = (index) => {
  queryHistory.value.splice(index, 1)
  localStorage.setItem('qqAvatarHistory', JSON.stringify(queryHistory.value))
}

// 快速填入历史QQ号
const fillQQNumber = (qq) => {
  qqNumber.value = qq
}

// 显示历史记录详情
const showRecordDetail = (record) => {
  selectedRecord.value = record
  showHistoryModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showHistoryModal.value = false
  selectedRecord.value = null
  clearCooldownTimer()
}

// 刷新历史记录中的QQ头像
const refreshRecord = async (record) => {
  if (refreshCooldown.value > 0) {
    return // 冷却中，不执行刷新
  }
  
  try {
    loading.value = true
    
    // 添加时间戳确保获取最新头像
    const timestamp = Date.now()
    const apiUrl = `https://api.jkyai.top/API/QQhqtx.php?qq=${record.qq}&t=${timestamp}`
    
    // 记录查询时间
    const now = new Date()
    const newQueryTime = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    // 保存干净的URL用于历史记录
    const cleanUrl = `https://api.jkyai.top/API/QQhqtx.php?qq=${record.qq}`
    
    // 更新选中的记录
    selectedRecord.value = {
      ...record,
      avatarUrl: cleanUrl,
      queryTime: newQueryTime
    }
    
    // 更新历史记录中的对应项
    const index = queryHistory.value.findIndex(item => item.qq === record.qq)
    if (index !== -1) {
      // 更新现有记录
      queryHistory.value[index] = {
        ...queryHistory.value[index],
        avatarUrl: cleanUrl,
        queryTime: newQueryTime
      }
      
      // 将更新的记录移到最前面
      const updatedRecord = queryHistory.value.splice(index, 1)[0]
      queryHistory.value.unshift(updatedRecord)
      
      // 保存到本地存储
      localStorage.setItem('qqAvatarHistory', JSON.stringify(queryHistory.value))
    }
    
    // 开始60秒冷却
    startRefreshCooldown()
  } catch (err) {
    console.error('刷新QQ头像失败:', err)
  } finally {
    loading.value = false
  }
}

// 开始刷新冷却
const startRefreshCooldown = () => {
  refreshCooldown.value = 60
  
  cooldownTimer.value = setInterval(() => {
    refreshCooldown.value--
    if (refreshCooldown.value <= 0) {
      clearInterval(cooldownTimer.value)
      cooldownTimer.value = null
    }
  }, 1000)
}

// 清理定时器
const clearCooldownTimer = () => {
  if (cooldownTimer.value) {
    clearInterval(cooldownTimer.value)
    cooldownTimer.value = null
    refreshCooldown.value = 0
  }
}

// 从本地存储加载历史记录
const loadHistory = () => {
  try {
    const saved = localStorage.getItem('qqAvatarHistory')
    if (saved) {
      queryHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

// 下载头像
const downloadAvatar = (url, qq) => {
  const link = document.createElement('a')
  link.href = url
  link.download = `QQ头像_${qq}.jpg`
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 复制头像链接
const copyAvatarUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url)
    // 可以添加成功提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 组件挂载时加载历史记录
onMounted(() => {
  loadHistory()
})

onUnmounted(() => {
  clearCooldownTimer()
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
      <h2 class="page-title">QQ头像提取</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div class="update-time" :class="{ 'error-status': error }">
          {{ error ? 'Error' : (lastQueryTime ? '查询时间: ' + lastQueryTime : '未查询') }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- QQ头像查询器 -->
    <div class="query-section">
      <h3>QQ头像提取</h3>
      
      <!-- 查询输入 -->
      <div class="query-card">
        <div class="input-group">
          <label for="qq-number">QQ号:</label>
          <input 
            id="qq-number"
            v-model="qqNumber" 
            type="text" 
            class="qq-input"
            placeholder="请输入QQ号"
            :disabled="loading"
            @keyup.enter="() => queryAvatar(qqNumber)"
          />
        </div>

        <!-- 查询按钮 -->
        <button 
          @click="() => queryAvatar(qqNumber)" 
          :disabled="loading || !qqNumber.trim()"
          class="query-button"
        >
          {{ loading ? '查询中...' : '提取头像' }}
        </button>
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- 查询结果 -->
      <div v-if="avatarUrl && !error" class="result-section">
        <!-- 头像显示卡片 -->
        <div class="avatar-card">
          <h4>QQ头像</h4>
          <div class="avatar-container">
            <!-- 加载动画 -->
            <div v-if="imageLoading" class="avatar-loading">
              <div class="loading-spinner"></div>
              <div class="loading-text">头像加载中...</div>
            </div>
            <!-- 头像图片 -->
            <img 
              v-show="!imageLoading"
              :src="avatarUrl" 
              :alt="`QQ${qqNumber}的头像`"
              class="avatar-image"
              @load="handleImageLoad"
              @error="handleImageError"
            />
          </div>
          <div class="avatar-info">
            <div class="info-item">
              <span class="info-label">QQ号:</span>
              <span class="info-value qq-highlight">{{ qqNumber }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">头像链接:</span>
              <span class="info-value avatar-url">{{ avatarUrl }}</span>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="avatar-actions">
            <button 
              class="action-btn download-btn" 
              @click="downloadAvatar(avatarUrl, qqNumber)"
            >
              下载头像
            </button>
            <button 
              class="action-btn copy-btn" 
              @click="copyAvatarUrl(avatarUrl)"
            >
              复制链接
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 查询历史 -->
    <div v-if="queryHistory.length > 0" class="history-section">
      <div class="history-header">
        <h3>查询历史</h3>
        <button @click="clearHistory" class="clear-button">清空</button>
      </div>
      
      <div class="history-grid">
        <div 
          v-for="(record, index) in queryHistory" 
          :key="index"
          class="history-card"
        >
          <button 
            class="delete-btn" 
            @click.stop="deleteHistoryItem(index)"
            title="删除此记录"
          >
            ×
          </button>
          <div class="history-content" @click="showRecordDetail(record)">
            <div class="history-avatar">
              <img :src="`${record.avatarUrl}&t=${Date.now()}`" :alt="`QQ${record.qq}的头像`" />
            </div>
            <div class="history-info">
              <div class="history-qq">QQ: {{ record.qq }}</div>
              <div class="history-time">{{ record.queryTime }}</div>
              <div class="history-hint">点击查看详情</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- 历史记录详情弹窗 -->
  <div v-if="showHistoryModal" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>QQ头像详情</h3>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      
      <div v-if="selectedRecord" class="modal-body">
        <!-- 头像显示 -->
        <div class="modal-section">
          <h4>头像预览</h4>
          <div class="modal-avatar-container">
            <!-- 弹窗加载动画 -->
            <div v-if="loading" class="modal-avatar-loading">
              <div class="loading-spinner"></div>
              <div class="loading-text">刷新中...</div>
            </div>
            <!-- 弹窗头像图片 -->
            <img 
              v-show="!loading"
              :src="`${selectedRecord.avatarUrl}&t=${Date.now()}`" 
              :alt="`QQ${selectedRecord.qq}的头像`"
              class="modal-avatar-image"
            />
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="modal-section">
          <h4>基本信息</h4>
          <div class="modal-info-grid">
            <div class="modal-info-item">
              <span class="modal-label">QQ号:</span>
              <span class="modal-value qq-highlight">{{ selectedRecord.qq }}</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-label">查询时间:</span>
              <span class="modal-value">{{ selectedRecord.queryTime }}</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-label">头像链接:</span>
              <span class="modal-value avatar-url">{{ selectedRecord.avatarUrl }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 固定在底部的操作按钮 -->
      <div class="modal-footer">
        <button 
          class="action-button refresh" 
          @click="refreshRecord(selectedRecord)"
          :disabled="loading || refreshCooldown > 0"
        >
          {{ loading ? '刷新中...' : refreshCooldown > 0 ? `冷却中 ${refreshCooldown}s` : '刷新头像' }}
        </button>
        <button class="action-button download" @click="downloadAvatar(selectedRecord.avatarUrl, selectedRecord.qq)">
          下载头像
        </button>
        <button class="action-button primary" @click="fillQQNumber(selectedRecord.qq); closeModal()">
          填入查询框
        </button>
        <button class="action-button secondary" @click="closeModal">
          关闭
        </button>
      </div>
    </div>
  </div>
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

/* 主要内容区域 */
.main-content {
  margin-top: 60px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 60px);
  width: 100%;
}

/* 查询区域 */
.query-section {
  margin-bottom: 2rem;
}

.query-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

/* 查询卡片 */
.query-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.input-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 1rem;
}

.qq-input {
  padding: 0.8rem;
  border: 2px solid var(--glass-border);
  border-radius: 8px;
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.qq-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(var(--text-accent-rgb), 0.1);
}

.qq-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 查询按钮 */
.query-button {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--text-accent), #667eea);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(var(--text-accent-rgb), 0.3);
}

.query-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--text-accent-rgb), 0.4);
}

.query-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 错误信息 */
.error-message {
  text-align: center;
  padding: 1rem;
  color: #d32f2f;
  background: #ffebee;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #ffcdd2;
}

/* 结果区域 */
.result-section {
  margin-bottom: 2rem;
}

.avatar-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.avatar-card h4 {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  text-align: center;
}

.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  min-height: 200px;
  position: relative;
}

.avatar-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  border-radius: 16px;
  border: 3px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--glass-border);
  border-top: 4px solid var(--text-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.avatar-image {
  width: 200px;
  height: 200px;
  border-radius: 16px;
  border: 3px solid var(--glass-border);
  box-shadow: 0 8px 24px var(--glass-shadow);
  transition: all 0.3s ease;
}

.avatar-image:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 32px var(--shadow-medium);
}

.avatar-info {
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--glass-border);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 80px;
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
  text-align: right;
  flex: 1;
  word-break: break-all;
}

.qq-highlight {
  color: var(--text-accent);
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.avatar-url {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.avatar-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  flex: 1;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-btn {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.download-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.copy-btn {
  background: var(--glass-bg);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
}

.copy-btn:hover {
  background: var(--glass-border);
}

/* 历史记录 */
.history-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.clear-button {
  padding: 0.5rem 1rem;
  background: #d32f2f;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.clear-button:hover {
  background: #b71c1c;
  transform: translateY(-1px);
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.history-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px var(--glass-shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.history-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow-medium);
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(211, 47, 47, 0.8);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.delete-btn:hover {
  background: rgba(211, 47, 47, 1);
  transform: scale(1.1);
}

.history-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.history-avatar {
  margin-bottom: 1rem;
}

.history-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  border: 2px solid var(--glass-border);
}

.history-info {
  text-align: center;
  width: 100%;
}

.history-qq {
  font-size: 1rem;
  font-weight: bold;
  color: var(--text-accent);
  margin-bottom: 0.3rem;
}

.history-time {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-bottom: 0.3rem;
}

.history-hint {
  color: var(--text-accent);
  font-size: 0.75rem;
  font-style: italic;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-content {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--glass-border);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.3rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: var(--glass-bg);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.modal-section {
  margin-bottom: 2rem;
}

.modal-section:last-child {
  margin-bottom: 0;
}

.modal-section h4 {
  color: var(--text-accent);
  margin-bottom: 1rem;
  font-size: 1.1rem;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 0.5rem;
}

.modal-avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  min-height: 150px;
  position: relative;
}

.modal-avatar-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 150px;
  border-radius: 12px;
  border: 2px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.modal-avatar-loading .loading-spinner {
  width: 30px;
  height: 30px;
  border-width: 3px;
  margin-bottom: 0.8rem;
}

.modal-avatar-loading .loading-text {
  font-size: 0.8rem;
}

.modal-avatar-image {
  width: 150px;
  height: 150px;
  border-radius: 12px;
  border: 2px solid var(--glass-border);
  box-shadow: 0 4px 16px var(--glass-shadow);
}

.modal-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.8rem;
}

.modal-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.modal-label {
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 80px;
}

.modal-value {
  color: var(--text-primary);
  font-weight: 500;
  text-align: right;
  flex: 1;
  word-break: break-all;
}

.modal-footer {
  display: flex;
  gap: 0.8rem;
  padding: 1.5rem;
  border-top: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 0 0 16px 16px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.action-button {
  flex: 1;
  min-width: 100px;
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button.refresh {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.action-button.refresh:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.action-button.refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.action-button.download {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
}

.action-button.download:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.action-button.primary {
  background: linear-gradient(135deg, var(--text-accent), #667eea);
  color: white;
}

.action-button.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--text-accent-rgb), 0.3);
}

.action-button.secondary {
  background: var(--glass-bg);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
}

.action-button.secondary:hover {
  background: var(--glass-border);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .query-card, .avatar-card {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .avatar-image {
    width: 150px;
    height: 150px;
  }
  
  .avatar-actions {
    flex-direction: column;
  }
  
  .history-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
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
  
  .info-item, .modal-info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  
  .info-value, .modal-value {
    text-align: left;
  }
  
  .modal-content {
    margin: 0.5rem;
    max-height: 90vh;
  }
  
  .modal-header, .modal-body {
    padding: 1rem;
  }
  
  .modal-footer {
    padding: 1rem;
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .action-button {
    min-width: auto;
  }
}
</style>