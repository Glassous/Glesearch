<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 快递查询相关数据
const trackingNumber = ref('')
const expressData = ref(null)
const loading = ref(false)
const error = ref('')
const apiSource = ref('jkyai.top')
const lastQueryTime = ref('')
const queryHistory = ref([])
const showHistoryModal = ref(false)
const selectedRecord = ref(null)
const refreshCooldown = ref(0)
const cooldownTimer = ref(null)

// 快递公司代码映射
const companyNames = {
  'jd': '京东快递',
  'sf': '顺丰速运',
  'yt': '圆通速递',
  'zt': '中通快递',
  'st': '申通快递',
  'yd': '韵达速递',
  'ems': '中国邮政EMS',
  'db': '德邦快递',
  'zjs': '宅急送',
  'yto': '圆通速递',
  'sto': '申通快递',
  'ttkdex': '天天快递',
  'qfkd': '全峰快递',
  'fast': '快捷快递',
  'postb': '邮政快递包裹',
  'gto': 'GTO快递',
  'amazon': '亚马逊物流',
  'other': '其他快递'
}

// 查询快递信息
const queryExpress = async () => {
  if (!trackingNumber.value.trim()) {
    error.value = '请输入快递单号'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.jkyai.top/API/kddhcx.php?id=${trackingNumber.value.trim()}`)
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 1) {
      expressData.value = result
      
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
      
      // 添加到查询历史
      const historyRecord = {
        trackingNumber: trackingNumber.value.trim(),
        companyCode: result.company_code,
        companyName: getCompanyName(result.company_code),
        updateTime: result.update_time,
        queryTime: lastQueryTime.value,
        status: result.data && result.data.length > 0 ? result.data[0].context : '暂无物流信息',
        fullData: result // 保存完整数据
      }
      
      // 检查是否已存在相同单号的记录
      const existingIndex = queryHistory.value.findIndex(item => item.trackingNumber === historyRecord.trackingNumber)
      
      if (existingIndex !== -1) {
        // 如果已存在，删除旧记录
        queryHistory.value.splice(existingIndex, 1)
      }
      
      queryHistory.value.unshift(historyRecord)
      
      // 保存到本地存储
      localStorage.setItem('expressQueryHistory', JSON.stringify(queryHistory.value))
      
    } else {
      throw new Error(result.message || '查询失败')
    }
  } catch (err) {
    error.value = err.message || '查询快递信息失败，请检查网络连接或单号是否正确'
    expressData.value = null
    console.error('快递查询API请求失败:', err)
  } finally {
    loading.value = false
  }
}

// 获取快递公司名称
const getCompanyName = (code) => {
  return companyNames[code] || code.toUpperCase()
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
  localStorage.removeItem('expressQueryHistory')
}

// 删除单条历史记录
const deleteHistoryItem = (index) => {
  queryHistory.value.splice(index, 1)
  localStorage.setItem('expressQueryHistory', JSON.stringify(queryHistory.value))
}

// 快速填入历史单号
const fillTrackingNumber = (number) => {
  trackingNumber.value = number
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

// 从本地存储加载历史记录
const loadHistory = () => {
  try {
    const saved = localStorage.getItem('expressQueryHistory')
    if (saved) {
      queryHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

// 刷新历史记录中的快递信息
const refreshRecord = async (record) => {
  if (refreshCooldown.value > 0) {
    return // 冷却中，不执行刷新
  }
  
  try {
    loading.value = true
    
    const response = await fetch(`https://api.jkyai.top/API/kddhcx.php?id=${record.trackingNumber}`)
    const result = await response.json()
    
    if (result.code === 1) {
      // 更新选中的记录
      selectedRecord.value = {
        ...record,
        fullData: result,
        updateTime: result.update_time,
        status: result.data && result.data.length > 0 ? result.data[0].context : '暂无物流信息'
      }
      
      // 更新历史记录中的对应项
      const index = queryHistory.value.findIndex(item => item.trackingNumber === record.trackingNumber)
      if (index !== -1) {
        queryHistory.value[index] = {
          ...queryHistory.value[index],
          fullData: result,
          updateTime: result.update_time,
          status: result.data && result.data.length > 0 ? result.data[0].context : '暂无物流信息'
        }
        
        // 保存到本地存储
        localStorage.setItem('expressQueryHistory', JSON.stringify(queryHistory.value))
      }
      
      // 开始60秒冷却
      startRefreshCooldown()
    } else {
      throw new Error(result.message || '刷新失败')
    }
  } catch (err) {
    console.error('刷新快递信息失败:', err)
    // 可以添加错误提示
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

// 获取物流状态的样式类
const getStatusClass = (index, total) => {
  if (index === 0) return 'status-current'
  if (index < 3) return 'status-recent'
  return 'status-old'
}

// 格式化时间显示
const formatTime = (timeStr) => {
  try {
    const date = new Date(timeStr)
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return timeStr
  }
}

// 组件挂载时加载历史记录
import { onMounted, onUnmounted } from 'vue'
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
      <h2 class="page-title">快递查询</h2>
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
    <!-- 快递查询器 -->
    <div class="query-section">
      <h3>快递单号查询</h3>
      
      <!-- 查询输入 -->
      <div class="query-card">
        <div class="input-group">
          <label for="tracking-number">快递单号:</label>
          <input 
            id="tracking-number"
            v-model="trackingNumber" 
            type="text" 
            class="tracking-input"
            placeholder="请输入快递单号"
            :disabled="loading"
            @keyup.enter="queryExpress"
          />
        </div>

        <!-- 查询按钮 -->
        <button 
          @click="queryExpress" 
          :disabled="loading || !trackingNumber.trim()"
          class="query-button"
        >
          {{ loading ? '查询中...' : '查询快递' }}
        </button>
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- 查询结果 -->
      <div v-if="expressData && !error" class="result-section">
        <!-- 快递基本信息 -->
        <div class="express-info-card">
          <h4>快递信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">快递单号:</span>
              <span class="info-value">{{ expressData.express_no }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">快递公司:</span>
              <span class="info-value">{{ getCompanyName(expressData.company_code) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">更新时间:</span>
              <span class="info-value">{{ expressData.update_time }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">当前状态:</span>
              <span class="info-value status-current">
                {{ expressData.data && expressData.data.length > 0 ? expressData.data[0].context : '暂无物流信息' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 物流轨迹 -->
        <div v-if="expressData.data && expressData.data.length > 0" class="tracking-section">
          <h4>物流轨迹</h4>
          <div class="tracking-timeline">
            <div 
              v-for="(item, index) in expressData.data" 
              :key="index"
              class="timeline-item"
              :class="getStatusClass(index, expressData.data.length)"
            >
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-time">{{ formatTime(item.time) }}</div>
                <div class="timeline-context">{{ item.context }}</div>
                <div class="timeline-location">{{ item.location }}</div>
              </div>
            </div>
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
            <div class="history-number">{{ record.trackingNumber }}</div>
            <div class="history-company">{{ record.companyName }}</div>
            <div class="history-status">{{ record.status }}</div>
            <div class="history-time">{{ record.queryTime }}</div>
            <div class="history-hint">点击查看详情</div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- 历史记录详情弹窗 -->
  <div v-if="showHistoryModal" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>快递查询详情</h3>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      
      <div v-if="selectedRecord" class="modal-body">
        <!-- 快递基本信息 -->
        <div class="modal-section">
          <h4>基本信息</h4>
          <div class="modal-info-grid">
            <div class="modal-info-item">
              <span class="modal-label">快递单号:</span>
              <span class="modal-value tracking-highlight">{{ selectedRecord.trackingNumber }}</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-label">快递公司:</span>
              <span class="modal-value">{{ selectedRecord.companyName }}</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-label">查询时间:</span>
              <span class="modal-value">{{ selectedRecord.queryTime }}</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-label">更新时间:</span>
              <span class="modal-value">{{ selectedRecord.updateTime }}</span>
            </div>
          </div>
        </div>

        <!-- 物流轨迹 -->
        <div v-if="selectedRecord.fullData?.data && selectedRecord.fullData.data.length > 0" class="modal-section">
          <h4>物流轨迹</h4>
          <div class="modal-tracking-timeline">
            <div 
              v-for="(item, index) in selectedRecord.fullData.data" 
              :key="index"
              class="modal-timeline-item"
              :class="getStatusClass(index, selectedRecord.fullData.data.length)"
            >
              <div class="modal-timeline-dot"></div>
              <div class="modal-timeline-content">
                <div class="modal-timeline-time">{{ formatTime(item.time) }}</div>
                <div class="modal-timeline-context">{{ item.context }}</div>
                <div class="modal-timeline-location">{{ item.location }}</div>
              </div>
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
          {{ loading ? '刷新中...' : refreshCooldown > 0 ? `冷却中 ${refreshCooldown}s` : '刷新信息' }}
        </button>
        <button class="action-button primary" @click="fillTrackingNumber(selectedRecord.trackingNumber); closeModal()">
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

.tracking-input {
  padding: 0.8rem;
  border: 2px solid var(--glass-border);
  border-radius: 8px;
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.tracking-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(var(--text-accent-rgb), 0.1);
}

.tracking-input:disabled {
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

.express-info-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.express-info-card h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.8rem;
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
}

.info-value.status-current {
  color: var(--text-accent);
  font-weight: 600;
}

/* 物流轨迹 */
.tracking-section {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.tracking-section h4 {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.tracking-timeline {
  position: relative;
  padding-left: 2rem;
}

.tracking-timeline::before {
  content: '';
  position: absolute;
  left: 0.75rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--text-accent), var(--glass-border));
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
  padding-left: 1rem;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -1.25rem;
  top: 0.2rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--glass-border);
  background: var(--bg-primary);
  transition: all 0.3s ease;
}

.timeline-item.status-current .timeline-dot {
  background: var(--text-accent);
  border-color: var(--text-accent);
  box-shadow: 0 0 10px rgba(var(--text-accent-rgb), 0.5);
}

.timeline-item.status-recent .timeline-dot {
  background: #4caf50;
  border-color: #4caf50;
}

.timeline-content {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.timeline-item:hover .timeline-content {
  border-color: var(--text-accent);
  transform: translateX(4px);
}

.timeline-time {
  color: var(--text-accent);
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.timeline-context {
  color: var(--text-primary);
  font-size: 1rem;
  margin-bottom: 0.3rem;
  line-height: 1.4;
}

.timeline-location {
  color: var(--text-secondary);
  font-size: 0.9rem;
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
  cursor: pointer;
}

.history-number {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text-accent);
  margin-bottom: 0.5rem;
  word-break: break-all;
}

.history-company {
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.history-status {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-bottom: 0.3rem;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.history-time {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.history-hint {
  color: var(--text-accent);
  font-size: 0.75rem;
  margin-top: 0.3rem;
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
  max-width: 600px;
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
  min-width: 100px;
}

.modal-value {
  color: var(--text-primary);
  font-weight: 500;
  text-align: right;
  flex: 1;
}

.tracking-highlight {
  color: var(--text-accent);
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

/* 弹窗物流轨迹 */
.modal-tracking-timeline {
  position: relative;
  padding-left: 2rem;
}

.modal-tracking-timeline::before {
  content: '';
  position: absolute;
  left: 0.75rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--text-accent), var(--glass-border));
}

.modal-timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
  padding-left: 1rem;
}

.modal-timeline-item:last-child {
  margin-bottom: 0;
}

.modal-timeline-dot {
  position: absolute;
  left: -1.25rem;
  top: 0.2rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--glass-border);
  background: var(--bg-primary);
  transition: all 0.3s ease;
}

.modal-timeline-item.status-current .modal-timeline-dot {
  background: var(--text-accent);
  border-color: var(--text-accent);
  box-shadow: 0 0 10px rgba(var(--text-accent-rgb), 0.5);
}

.modal-timeline-item.status-recent .modal-timeline-dot {
  background: #4caf50;
  border-color: #4caf50;
}

.modal-timeline-content {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 1rem;
}

.modal-timeline-time {
  color: var(--text-accent);
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.modal-timeline-context {
  color: var(--text-primary);
  font-size: 1rem;
  margin-bottom: 0.3rem;
  line-height: 1.4;
}

.modal-timeline-location {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 0 0 16px 16px;
  flex-shrink: 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--glass-border);
}

.action-button {
  flex: 1;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .query-card {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .tracking-timeline {
    padding-left: 1.5rem;
  }
  
  .timeline-dot {
    left: -1rem;
  }
  
  .history-grid {
    grid-template-columns: 1fr;
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
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  
  .info-value {
    text-align: left;
  }
  
  .timeline-content {
    padding: 0.8rem;
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
  
  .modal-info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  
  .modal-value {
    text-align: left;
  }
  
  .modal-tracking-timeline {
    padding-left: 1.5rem;
  }
  
  .modal-timeline-dot {
    left: -1rem;
  }
}
</style>