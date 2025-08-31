<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// IP查询相关数据
const ipAddress = ref('')
const ipData = ref(null)
const currentIP = ref('')
const loading = ref(false)
const loadingCurrentIP = ref(false)
const error = ref('')
const apiSource = ref('jkyai.top')
const lastQueryTime = ref('')
const queryHistory = ref([])
const showHistoryModal = ref(false)
const selectedRecord = ref(null)
const refreshCooldown = ref(0)
const cooldownTimer = ref(null)

// 验证IP地址格式
const isValidIP = (ip) => {
  const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipRegex.test(ip)
}

// 获取当前IP地址
const getCurrentIP = async () => {
  try {
    loadingCurrentIP.value = true
    const response = await fetch('https://api.jkyai.top/API/hqkhdip.php')
    const result = await response.text()
    
    console.log('获取当前IP返回:', result) // 调试日志
    
    // 验证IP地址格式
    const trimmedResult = result.trim()
    
    if (isValidIP(trimmedResult)) {
      currentIP.value = trimmedResult
      ipAddress.value = trimmedResult
    } else {
      throw new Error('获取IP地址格式不正确')
    }
  } catch (err) {
    console.error('获取当前IP失败:', err)
    currentIP.value = '获取失败'
  } finally {
    loadingCurrentIP.value = false
  }
}

// 查询IP地址信息
const queryIPInfo = async (ip = null) => {
  const targetIP = ip || ipAddress.value.trim()
  
  console.log('查询IP信息 - 目标IP:', targetIP, '原始输入:', ipAddress.value) // 调试日志
  
  if (!targetIP) {
    error.value = '请输入IP地址'
    return
  }

  // 验证IP地址格式
  if (!isValidIP(targetIP)) {
    console.log('IP验证失败 - IP:', targetIP, '验证结果:', isValidIP(targetIP)) // 调试日志
    error.value = 'IP地址格式不正确，请输入有效的IP地址（如：192.168.1.1）'
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.jkyai.top/API/jzipdw.php?ip=${targetIP}`)
    const result = await response.json()
    
    console.log('IP查询API返回数据:', result) // 调试日志
    
    if (result.状态 === true) {
      ipData.value = result.数据
      
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
      const existingIndex = queryHistory.value.findIndex(item => item.ip === targetIP)
      
      const historyRecord = {
        ip: targetIP,
        country: result.数据.国家,
        region: result.数据.地区,
        city: result.数据.城市,
        isp: result.数据.网络服务商,
        queryTime: lastQueryTime.value,
        fullData: result.数据 // 保存完整数据
      }
      
      if (existingIndex !== -1) {
        // 如果已存在，更新记录并移到最前面
        queryHistory.value.splice(existingIndex, 1)
      }
      
      queryHistory.value.unshift(historyRecord)
      
      // 保存到本地存储
      localStorage.setItem('ipQueryHistory', JSON.stringify(queryHistory.value))
      
    } else {
      throw new Error(result.消息 || 'IP查询失败')
    }
  } catch (err) {
    error.value = err.message || '查询IP信息失败，请检查网络连接或IP地址是否正确'
    ipData.value = null
    console.error('IP查询API请求失败:', err)
  } finally {
    loading.value = false
  }
}

// 返回主页
const goBack = () => {
  router.push('/')
}

// 清空查询历史
const clearHistory = () => {
  queryHistory.value = []
  localStorage.removeItem('ipQueryHistory')
}

// 删除单条历史记录
const deleteHistoryItem = (index) => {
  queryHistory.value.splice(index, 1)
  localStorage.setItem('ipQueryHistory', JSON.stringify(queryHistory.value))
}

// 快速填入历史IP
const fillIPAddress = (ip) => {
  ipAddress.value = ip
}

// 查询当前IP信息
const queryCurrentIP = () => {
  if (currentIP.value && currentIP.value !== '获取失败') {
    queryIPInfo(currentIP.value)
  }
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
    const saved = localStorage.getItem('ipQueryHistory')
    if (saved) {
      queryHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

// 刷新历史记录中的IP信息
const refreshRecord = async (record) => {
  if (refreshCooldown.value > 0) {
    return // 冷却中，不执行刷新
  }
  
  try {
    loading.value = true
    
    const response = await fetch(`https://api.jkyai.top/API/jzipdw.php?ip=${record.ip}`)
    const result = await response.json()
    
    if (result.状态 === true) {
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
      
      // 更新选中的记录
      selectedRecord.value = {
        ...record,
        fullData: result.数据,
        queryTime: newQueryTime,
        country: result.数据.国家,
        region: result.数据.地区,
        city: result.数据.城市,
        isp: result.数据.网络服务商
      }
      
      // 更新历史记录中的对应项
      const index = queryHistory.value.findIndex(item => item.ip === record.ip)
      if (index !== -1) {
        queryHistory.value[index] = {
          ...queryHistory.value[index],
          fullData: result.数据,
          queryTime: newQueryTime,
          country: result.数据.国家,
          region: result.数据.地区,
          city: result.数据.城市,
          isp: result.数据.网络服务商
        }
        
        // 保存到本地存储
        localStorage.setItem('ipQueryHistory', JSON.stringify(queryHistory.value))
      }
      
      // 开始60秒冷却
      startRefreshCooldown()
    } else {
      throw new Error(result.消息 || '刷新失败')
    }
  } catch (err) {
    console.error('刷新IP信息失败:', err)
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

// 格式化地理位置
const formatLocation = (data) => {
  if (!data) return '未知'
  const parts = []
  if (data.国家) parts.push(data.国家)
  if (data.地区) parts.push(data.地区)
  if (data.城市) parts.push(data.城市)
  return parts.join(' - ') || '未知'
}

// 格式化坐标
const formatCoordinates = (location) => {
  if (!location || !location.纬度 || !location.经度) return '未知'
  return `${location.纬度.toFixed(4)}, ${location.经度.toFixed(4)}`
}

// 组件挂载时获取当前IP和加载历史记录
import { onUnmounted } from 'vue'
onMounted(() => {
  getCurrentIP()
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
      <h2 class="page-title">IP地址查询</h2>
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
    <!-- IP查询器 -->
    <div class="query-section">
      <h3>IP地址查询</h3>
      
      <!-- 当前IP显示 -->
      <div class="current-ip-card">
        <div class="current-ip-header">
          <h4>当前IP地址</h4>
          <button 
            @click="getCurrentIP" 
            :disabled="loadingCurrentIP"
            class="refresh-button"
          >
            {{ loadingCurrentIP ? '获取中...' : '刷新' }}
          </button>
        </div>
        <div class="current-ip-display">
          <span class="ip-text">{{ currentIP || '获取中...' }}</span>
          <button 
            v-if="currentIP && currentIP !== '获取失败'"
            @click="queryCurrentIP"
            class="query-current-button"
          >
            查询此IP
          </button>
        </div>
      </div>
      
      <!-- 查询输入 -->
      <div class="query-card">
        <div class="input-group">
          <label for="ip-address">IP地址:</label>
          <input 
            id="ip-address"
            v-model="ipAddress" 
            type="text" 
            class="ip-input"
            placeholder="请输入IP地址，如：8.8.8.8"
            :disabled="loading"
            @keyup.enter="() => queryIPInfo(ipAddress)"
          />
        </div>

        <!-- 查询按钮 -->
        <button 
          @click="() => queryIPInfo(ipAddress)" 
          :disabled="loading || !ipAddress.trim()"
          class="query-button"
        >
          {{ loading ? '查询中...' : '查询IP信息' }}
        </button>
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- 查询结果 -->
      <div v-if="ipData && !error" class="result-section">
        <!-- IP基本信息 -->
        <div class="ip-info-card">
          <h4>IP信息详情</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">IP地址:</span>
              <span class="info-value ip-highlight">{{ ipData.IP地址 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">国家:</span>
              <span class="info-value">{{ ipData.国家 || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">国家代码:</span>
              <span class="info-value">{{ ipData.国家代码 || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">地区:</span>
              <span class="info-value">{{ ipData.地区 || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">城市:</span>
              <span class="info-value">{{ ipData.城市 || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">邮编:</span>
              <span class="info-value">{{ ipData.邮编 || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">时区:</span>
              <span class="info-value">{{ ipData.时区 || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">网络服务商:</span>
              <span class="info-value">{{ ipData.网络服务商 || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">所属组织:</span>
              <span class="info-value">{{ ipData.所属组织 || '未知' }}</span>
            </div>
          </div>
        </div>

        <!-- 地理位置信息 -->
        <div v-if="ipData.地理位置" class="location-card">
          <h4>地理位置信息</h4>
          <div class="location-grid">
            <div class="location-item">
              <span class="location-label">完整位置:</span>
              <span class="location-value">{{ formatLocation(ipData) }}</span>
            </div>
            <div class="location-item">
              <span class="location-label">坐标:</span>
              <span class="location-value coordinates">{{ formatCoordinates(ipData.地理位置) }}</span>
            </div>
            <div class="location-item">
              <span class="location-label">纬度:</span>
              <span class="location-value">{{ ipData.地理位置.纬度 || '未知' }}</span>
            </div>
            <div class="location-item">
              <span class="location-label">经度:</span>
              <span class="location-value">{{ ipData.地理位置.经度 || '未知' }}</span>
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
            <div class="history-ip">{{ record.ip }}</div>
            <div class="history-location">{{ record.country }} - {{ record.region }} - {{ record.city }}</div>
            <div class="history-isp">{{ record.isp }}</div>
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
        <h3>IP查询详情</h3>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      
      <div v-if="selectedRecord" class="modal-body">
        <!-- IP基本信息 -->
        <div class="modal-section">
          <h4>基本信息</h4>
          <div class="modal-info-grid">
            <div class="modal-info-item">
              <span class="modal-label">IP地址:</span>
              <span class="modal-value ip-highlight">{{ selectedRecord.fullData?.IP地址 || selectedRecord.ip }}</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-label">查询时间:</span>
              <span class="modal-value">{{ selectedRecord.queryTime }}</span>
            </div>
          </div>
        </div>

        <!-- 地理位置信息 -->
        <div class="modal-section">
          <h4>地理位置</h4>
          <div class="modal-info-grid">
            <div class="modal-info-item">
              <span class="modal-label">国家:</span>
              <span class="modal-value">{{ selectedRecord.fullData?.国家 || '未知' }}</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-label">国家代码:</span>
              <span class="modal-value">{{ selectedRecord.fullData?.国家代码 || '未知' }}</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-label">地区:</span>
              <span class="modal-value">{{ selectedRecord.fullData?.地区 || '未知' }}</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-label">城市:</span>
              <span class="modal-value">{{ selectedRecord.fullData?.城市 || '未知' }}</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-label">邮编:</span>
              <span class="modal-value">{{ selectedRecord.fullData?.邮编 || '未知' }}</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-label">时区:</span>
              <span class="modal-value">{{ selectedRecord.fullData?.时区 || '未知' }}</span>
            </div>
          </div>
        </div>

        <!-- 网络信息 -->
        <div class="modal-section">
          <h4>网络信息</h4>
          <div class="modal-info-grid">
            <div class="modal-info-item">
              <span class="modal-label">网络服务商:</span>
              <span class="modal-value">{{ selectedRecord.fullData?.网络服务商 || '未知' }}</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-label">所属组织:</span>
              <span class="modal-value">{{ selectedRecord.fullData?.所属组织 || '未知' }}</span>
            </div>
          </div>
        </div>

        <!-- 坐标信息 -->
        <div v-if="selectedRecord.fullData?.地理位置" class="modal-section">
          <h4>坐标信息</h4>
          <div class="modal-info-grid">
            <div class="modal-info-item">
              <span class="modal-label">纬度:</span>
              <span class="modal-value">{{ selectedRecord.fullData.地理位置.纬度 || '未知' }}</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-label">经度:</span>
              <span class="modal-value">{{ selectedRecord.fullData.地理位置.经度 || '未知' }}</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-label">坐标:</span>
              <span class="modal-value coordinates">{{ formatCoordinates(selectedRecord.fullData.地理位置) }}</span>
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
        <button class="action-button primary" @click="fillIPAddress(selectedRecord.ip); closeModal()">
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

/* 当前IP卡片 */
.current-ip-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.current-ip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.current-ip-header h4 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.1rem;
}

.refresh-button {
  padding: 0.5rem 1rem;
  background: var(--text-accent);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.refresh-button:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-1px);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.current-ip-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.ip-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-accent);
  font-family: 'Courier New', monospace;
}

.query-current-button {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.query-current-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
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

.ip-input {
  padding: 0.8rem;
  border: 2px solid var(--glass-border);
  border-radius: 8px;
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: 'Courier New', monospace;
  transition: all 0.3s ease;
}

.ip-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(var(--text-accent-rgb), 0.1);
}

.ip-input:disabled {
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

.ip-info-card, .location-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.ip-info-card h4, .location-card h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.info-grid, .location-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.8rem;
}

.info-item, .location-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--glass-border);
}

.info-item:last-child, .location-item:last-child {
  border-bottom: none;
}

.info-label, .location-label {
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 100px;
}

.info-value, .location-value {
  color: var(--text-primary);
  font-weight: 500;
  text-align: right;
  flex: 1;
}

.ip-highlight {
  color: var(--text-accent);
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.coordinates {
  font-family: 'Courier New', monospace;
  color: var(--text-accent);
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

.history-ip {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text-accent);
  margin-bottom: 0.5rem;
  font-family: 'Courier New', monospace;
}

.history-location {
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.history-isp {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-bottom: 0.3rem;
  line-height: 1.3;
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
  
  .query-card, .current-ip-card, .ip-info-card, .location-card {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .current-ip-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
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
  
  .info-item, .location-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  
  .info-value, .location-value {
    text-align: left;
  }
  
  .current-ip-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
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
}
</style>