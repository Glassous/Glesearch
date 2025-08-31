<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 随机数生成相关数据
const minValue = ref(1)
const maxValue = ref(100)
const generatedNumber = ref(null)
const loading = ref(false)
const error = ref('')
const apiSource = ref('jkyai.top')
const lastGenerateTime = ref('')
const history = ref([])

// 生成随机数
const generateRandomNumber = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // 验证输入范围
    if (minValue.value >= maxValue.value) {
      throw new Error('起始范围必须小于终点范围')
    }
    
    const response = await fetch(`https://api.jkyai.top/API/sjszsc.php?min=${minValue.value}&max=${maxValue.value}`)
    const result = await response.text()
    
    console.log('API返回数据:', result) // 调试日志
    
    // 解析返回的数字
    const number = parseInt(result.trim())
    if (isNaN(number)) {
      throw new Error('API返回的数据格式不正确')
    }
    
    generatedNumber.value = number
    
    // 记录生成时间
    const now = new Date()
    lastGenerateTime.value = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    // 添加到历史记录
    history.value.unshift({
      number: number,
      min: minValue.value,
      max: maxValue.value,
      time: lastGenerateTime.value
    })
    
    // 限制历史记录数量
    if (history.value.length > 10) {
      history.value = history.value.slice(0, 10)
    }
    
  } catch (err) {
    error.value = err.message || '生成随机数失败，请检查网络连接'
    console.error('随机数API请求失败:', err)
  } finally {
    loading.value = false
  }
}

// 返回主页
const goBack = () => {
  router.push('/')
}

// 清空历史记录
const clearHistory = () => {
  history.value = []
}

// 快速设置范围
const setQuickRange = (min, max) => {
  minValue.value = min
  maxValue.value = max
}
</script>

<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">随机数生成</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div class="update-time" :class="{ 'error-status': error }">
          {{ error ? 'Error' : (lastGenerateTime ? '生成时间: ' + lastGenerateTime : '未生成') }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 随机数生成器 -->
    <div class="generator-section">
      <h3>随机数生成器</h3>
      
      <!-- 参数设置 -->
      <div class="params-card">
        <div class="param-group">
          <label for="min-value">起始范围:</label>
          <input 
            id="min-value"
            v-model.number="minValue" 
            type="number" 
            class="param-input"
            :disabled="loading"
          />
        </div>
        <div class="param-group">
          <label for="max-value">终点范围:</label>
          <input 
            id="max-value"
            v-model.number="maxValue" 
            type="number" 
            class="param-input"
            :disabled="loading"
          />
        </div>
      </div>

      <!-- 快速设置按钮 -->
      <div class="quick-settings">
        <h4>快速设置:</h4>
        <div class="quick-buttons">
          <button @click="setQuickRange(1, 10)" class="quick-btn">1-10</button>
          <button @click="setQuickRange(1, 100)" class="quick-btn">1-100</button>
          <button @click="setQuickRange(1, 1000)" class="quick-btn">1-1000</button>
          <button @click="setQuickRange(0, 1)" class="quick-btn">0-1</button>
        </div>
      </div>

      <!-- 生成按钮 -->
      <button 
        @click="generateRandomNumber" 
        :disabled="loading"
        class="generate-button"
      >
        {{ loading ? '生成中...' : '生成随机数' }}
      </button>

      <!-- 错误信息 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- 结果显示 -->
      <div v-if="generatedNumber !== null && !error" class="result-card">
        <h4>生成结果</h4>
        <div class="result-number">{{ generatedNumber }}</div>
        <div class="result-info">
          范围: {{ minValue }} - {{ maxValue }}
        </div>
      </div>
    </div>

    <!-- 历史记录 -->
    <div v-if="history.length > 0" class="history-section">
      <div class="history-header">
        <h3>历史记录</h3>
        <button @click="clearHistory" class="clear-button">清空</button>
      </div>
      
      <div class="history-grid">
        <div 
          v-for="(record, index) in history" 
          :key="index"
          class="history-card"
        >
          <div class="history-number">{{ record.number }}</div>
          <div class="history-range">{{ record.min }} - {{ record.max }}</div>
          <div class="history-time">{{ record.time }}</div>
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

/* 生成器区域 */
.generator-section {
  margin-bottom: 2rem;
}

.generator-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.params-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.param-group {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.param-group label {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 1rem;
}

.param-input {
  padding: 0.8rem;
  border: 2px solid var(--glass-border);
  border-radius: 8px;
  background: var(--glass-bg);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.param-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(var(--text-accent-rgb), 0.1);
}

.param-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 快速设置 */
.quick-settings {
  margin-bottom: 1.5rem;
}

.quick-settings h4 {
  color: var(--text-primary);
  margin-bottom: 0.8rem;
  font-size: 1rem;
}

.quick-buttons {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.quick-btn {
  padding: 0.5rem 1rem;
  border: 2px solid var(--glass-border);
  border-radius: 8px;
  background: var(--glass-bg);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.quick-btn:hover {
  border-color: var(--text-accent);
  background: var(--text-accent);
  color: white;
  transform: translateY(-1px);
}

/* 生成按钮 */
.generate-button {
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
  margin-bottom: 1rem;
  box-shadow: 0 4px 16px rgba(var(--text-accent-rgb), 0.3);
}

.generate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--text-accent-rgb), 0.4);
}

.generate-button:disabled {
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

/* 结果显示 */
.result-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 8px 32px var(--glass-shadow);
  margin-bottom: 2rem;
}

.result-card h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.result-number {
  font-size: 3rem;
  font-weight: bold;
  color: var(--text-accent);
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-info {
  color: var(--text-secondary);
  font-size: 1rem;
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
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px var(--glass-shadow);
}

.history-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow-medium);
}

.history-number {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--text-accent);
  margin-bottom: 0.5rem;
}

.history-range {
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.history-time {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .params-card {
    flex-direction: column;
    padding: 1rem;
  }
  
  .param-group {
    min-width: auto;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .result-number {
    font-size: 2.5rem;
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
  
  .quick-buttons {
    justify-content: center;
  }
  
  .result-number {
    font-size: 2rem;
  }
  
  .history-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>