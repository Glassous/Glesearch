<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 身份证数据
const identityData = ref(null)
const loading = ref(false)
const error = ref('')
const apiSource = ref('pearktrue.cn')
const lastUpdateTime = ref('')

// 返回主页
const goBack = () => {
  const from = route.query.from
  if (from === 'home') {
    router.push('/')
  } else if (from === 'entertainment') {
    router.push('/entertainment')
  } else {
    router.push('/')
  }
}

// 复制单个字段到剪贴板
const copyField = async (value, fieldName) => {
  try {
    await navigator.clipboard.writeText(value)
    const buttons = document.querySelectorAll('.copy-field-button')
    buttons.forEach(button => {
      if (button.textContent.includes(fieldName)) {
        const originalText = button.textContent
        button.textContent = '已复制!'
        button.style.background = '#4caf50'
        setTimeout(() => {
          button.textContent = originalText
          button.style.background = ''
        }, 2000)
      }
    })
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制文本')
  }
}

// 复制全部信息到剪贴板
const copyAllInfo = async () => {
  try {
    if (!identityData.value) return
    
    const data = identityData.value
    const fullInfo = `
姓名: ${data.allname}
性别: ${data.sex === 'male' ? '男性' : '女性'}
生日: ${data.birthday}
地址: ${data.address}, ${data.city}, ${data.stateallname} ${data.zipcode}
电话: ${data.mobile}
SSN: ${data.ssn}
身高: ${data.height}
体重: ${data.weight}
职业: ${data.position}
公司: ${data.company}
网络用户名: ${data.netuser}
密码: ${data.password}
信用卡类型: ${data.cardtype}
信用卡号: ${data.cardnumber}
CVV: ${data.cvv}
有效期: ${data.validityperiod}
    `.trim()
    
    await navigator.clipboard.writeText(fullInfo)
    const button = document.querySelector('.copy-all-button')
    const originalText = button.textContent
    button.textContent = '已复制全部信息!'
    button.style.background = '#4caf50'
    setTimeout(() => {
      button.textContent = originalText
      button.style.background = ''
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制文本')
  }
}

// 获取随机美国人身份证数据
const fetchUSAIdentity = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const apiUrl = isDevelopment 
      ? `/api/sfz/usa.php`
      : `https://api.pearktrue.cn/api/sfz/usa.php`
    
    console.log('请求URL:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    console.log('响应状态:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`HTTP请求失败: ${response.status} ${response.statusText}`)
    }
    
    const contentType = response.headers.get('content-type')
    console.log('响应Content-Type:', contentType)
    
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text()
      console.error('非JSON响应内容:', textResponse)
      throw new Error('API返回的不是JSON格式数据，可能是服务器错误')
    }
    
    const result = await response.json()
    console.log('API返回数据:', result)
    
    if (result && result.code === 200 && result.data) {
      identityData.value = result.data
      
      const now = new Date()
      lastUpdateTime.value = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      throw new Error(result.msg || result.message || 'API返回数据异常')
    }
  } catch (err) {
    let errorMessage = '获取身份证信息失败，请检查网络连接或稍后重试'
    
    if (err.message.includes('JSON.parse')) {
      errorMessage = 'API返回数据格式错误，可能是服务器问题'
    } else if (err.message.includes('Failed to fetch') || err.message.includes('网络')) {
      errorMessage = '网络连接失败，请检查网络或稍后重试'
    } else if (err.message.includes('HTTP请求失败')) {
      errorMessage = `服务器错误：${err.message}`
    } else if (err.message.includes('不是JSON格式')) {
      errorMessage = 'API服务异常，返回了错误的数据格式'
    }
    
    error.value = errorMessage
    lastUpdateTime.value = 'Error'
    console.error('美国身份证API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
  }
}

// 生成新的身份证
const generateIdentity = () => {
  fetchUSAIdentity()
}

// 格式化性别显示
const formatGender = (sex) => {
  return sex === 'male' ? '男性' : '女性'
}

// 组件挂载时不自动生成，等待用户手动点击
onMounted(() => {
  // 移除自动生成，等待用户手动操作
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
      <h2 class="page-title">随机美国人身份证</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div class="update-time" :class="{ 'error-status': lastUpdateTime === 'Error' }">
          {{ lastUpdateTime === 'Error' ? 'Error' : '更新时间: ' + lastUpdateTime }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 操作按钮区域 - 生成后隐藏 -->
    <div v-if="!identityData || loading || error" class="form-section">
      <h3>🇺🇸 随机美国人身份证生成</h3>
      
      <div class="form-card">
        <button 
          class="generate-button" 
          @click="generateIdentity"
          :disabled="loading"
        >
          {{ loading ? '生成中...' : '🎲 生成随机身份证' }}
        </button>
        
        <div class="tips">
          <p>💡 温馨提示：</p>
          <ul>
            <li>生成的身份证信息均为虚假信息，仅供测试使用</li>
            <li>请勿用于非法用途或欺诈行为</li>
            <li>所有信息都是随机生成的，不对应真实人员</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在生成随机美国人身份证...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button class="retry-button" @click="generateIdentity">重试</button>
    </div>

    <!-- 身份证信息展示 -->
    <div v-if="!loading && !error && identityData" class="identity-section">
      <div class="identity-card">
        <div class="identity-header">
          <h2 class="identity-title">🆔 美国人身份证信息</h2>
          <div class="identity-meta">
            生成时间：{{ lastUpdateTime }}
          </div>
        </div>
        
        <!-- 基本信息 -->
        <div class="info-section">
          <h4>👤 基本信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>全名：</label>
              <span class="info-value">{{ identityData.allname }}</span>
              <button class="copy-field-button" @click="copyField(identityData.allname, '全名')">📋</button>
            </div>
            <div class="info-item">
              <label>性别：</label>
              <span class="info-value">{{ formatGender(identityData.sex) }}</span>
              <button class="copy-field-button" @click="copyField(formatGender(identityData.sex), '性别')">📋</button>
            </div>
            <div class="info-item">
              <label>名字：</label>
              <span class="info-value">{{ identityData.firstname }}</span>
              <button class="copy-field-button" @click="copyField(identityData.firstname, '名字')">📋</button>
            </div>
            <div class="info-item">
              <label>姓氏：</label>
              <span class="info-value">{{ identityData.lastname }}</span>
              <button class="copy-field-button" @click="copyField(identityData.lastname, '姓氏')">📋</button>
            </div>
            <div class="info-item">
              <label>SSN：</label>
              <span class="info-value highlight">{{ identityData.ssn }}</span>
              <button class="copy-field-button" @click="copyField(identityData.ssn, 'SSN')">📋</button>
            </div>
            <div class="info-item">
              <label>生日：</label>
              <span class="info-value">{{ identityData.birthday }}</span>
              <button class="copy-field-button" @click="copyField(identityData.birthday, '生日')">📋</button>
            </div>
          </div>
        </div>

        <!-- 地址信息 -->
        <div class="info-section">
          <h4>🏠 地址信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>地址：</label>
              <span class="info-value">{{ identityData.address }}</span>
              <button class="copy-field-button" @click="copyField(identityData.address, '地址')">📋</button>
            </div>
            <div class="info-item">
              <label>城市：</label>
              <span class="info-value">{{ identityData.city }}</span>
              <button class="copy-field-button" @click="copyField(identityData.city, '城市')">📋</button>
            </div>
            <div class="info-item">
              <label>州：</label>
              <span class="info-value">{{ identityData.state }}</span>
              <button class="copy-field-button" @click="copyField(identityData.state, '州')">📋</button>
            </div>
            <div class="info-item">
              <label>邮编：</label>
              <span class="info-value">{{ identityData.zipcode }}</span>
              <button class="copy-field-button" @click="copyField(identityData.zipcode, '邮编')">📋</button>
            </div>
            <div class="info-item">
              <label>电话：</label>
              <span class="info-value">{{ identityData.mobile }}</span>
              <button class="copy-field-button" @click="copyField(identityData.mobile, '电话')">📋</button>
            </div>
          </div>
        </div>

        <!-- 信用卡信息 -->
        <div class="info-section">
          <h4>💳 信用卡信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>卡类型：</label>
              <span class="info-value">{{ identityData.cardtype }}</span>
              <button class="copy-field-button" @click="copyField(identityData.cardtype, '卡类型')">📋</button>
            </div>
            <div class="info-item">
              <label>卡号：</label>
              <span class="info-value highlight">{{ identityData.cardnumber }}</span>
              <button class="copy-field-button" @click="copyField(identityData.cardnumber, '卡号')">📋</button>
            </div>
            <div class="info-item">
              <label>CVV：</label>
              <span class="info-value highlight">{{ identityData.cvv }}</span>
              <button class="copy-field-button" @click="copyField(identityData.cvv, 'CVV')">📋</button>
            </div>
            <div class="info-item">
              <label>有效期：</label>
              <span class="info-value">{{ identityData.validityperiod }}</span>
              <button class="copy-field-button" @click="copyField(identityData.validityperiod, '有效期')">📋</button>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="copy-all-button" @click="copyAllInfo">
            📋 复制全部信息
          </button>
          <button class="refresh-button" @click="generateIdentity">
            🔄 生成新身份证
          </button>
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

/* 表单设置区域 */
.form-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
  text-align: center;
}

.form-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
  transition: all 0.3s ease;
}

.form-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.generate-button {
  width: 100%;
  background: linear-gradient(135deg, #1890ff, #52c41a);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
  margin-bottom: 1.5rem;
}

.generate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
}

.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tips {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid #1890ff;
}

.tips p {
  margin: 0 0 0.5rem 0;
  color: var(--text-accent);
  font-weight: 600;
}

.tips ul {
  margin: 0;
  padding-left: 1.2rem;
  color: var(--text-secondary);
}

.tips li {
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.retry-button {
  background: #d32f2f;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #b71c1c;
  transform: translateY(-1px);
}

/* 身份证信息展示区域 */
.identity-section {
  margin-top: 2rem;
}

.identity-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
  transition: all 0.3s ease;
}

.identity-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.identity-header {
  margin-bottom: 2rem;
  text-align: center;
  border-bottom: 2px solid var(--glass-border);
  padding-bottom: 1rem;
}

.identity-title {
  color: var(--text-accent);
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
}

.identity-meta {
  color: var(--text-secondary);
  font-size: 1rem;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section h4 {
  color: var(--text-accent);
  margin-bottom: 1rem;
  font-size: 1.2rem;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  transition: all 0.3s ease;
}

.info-item:hover {
  border-color: var(--text-accent);
  transform: translateY(-1px);
}

.info-item label {
  color: var(--text-secondary);
  font-weight: 600;
  min-width: 80px;
  font-size: 0.9rem;
}

.info-value {
  flex: 1;
  color: var(--text-primary);
  font-weight: 500;
  word-break: break-all;
}

.info-value.highlight {
  color: var(--text-accent);
  font-weight: 600;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.copy-field-button {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-accent);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.copy-field-button:hover {
  background: var(--text-accent);
  color: white;
  transform: scale(1.05);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid var(--glass-border);
}

.copy-all-button,
.refresh-button {
  background: linear-gradient(135deg, #52c41a, #389e0d);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(82, 196, 26, 0.3);
}

.copy-all-button:hover,
.refresh-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(82, 196, 26, 0.4);
}

.refresh-button {
  background: linear-gradient(135deg, #1890ff, #096dd9);
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
}

.refresh-button:hover {
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .form-card,
  .identity-card {
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .copy-all-button,
  .refresh-button {
    width: 100%;
    max-width: 250px;
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
  
  .form-card,
  .identity-card {
    padding: 1rem;
  }
  
  .identity-title {
    font-size: 1.5rem;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  
  .info-item label {
    min-width: auto;
  }
  
  .copy-field-button {
    align-self: flex-end;
  }
}
</style>