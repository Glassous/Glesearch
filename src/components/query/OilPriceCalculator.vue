<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 从路由参数获取省份信息
const regionName = ref(route.params.regionName || '')
const regionData = ref(null)

// 计算器状态
const calculatorMode = ref('volume') // 'volume': 按升数计算, 'money': 按金额计算
const selectedOilType = ref('n92') // 默认选择92号汽油
const inputVolume = ref('')
const inputMoney = ref('')

// AI车型查询状态
const carModel = ref('')
const carYear = ref('')
const carType = ref('国行') // '国行' 或 '进口'
const aiLoading = ref(false)
const aiResult = ref('')
const aiError = ref('')

// 计算结果
const calculatedMoney = computed(() => {
  if (!regionData.value || !inputVolume.value) return 0
  const price = regionData.value[selectedOilType.value] || 0
  const volume = parseFloat(String(inputVolume.value || ''))
  return isNaN(volume) ? 0 : (volume * price).toFixed(2)
})

const calculatedVolume = computed(() => {
  if (!regionData.value || !inputMoney.value) return 0
  const price = regionData.value[selectedOilType.value] || 0
  const money = parseFloat(String(inputMoney.value || ''))
  return isNaN(money) || price === 0 ? 0 : (money / price).toFixed(2)
})

// 油品类型映射
const oilTypeNames = {
  n0: '0号柴油',
  n89: '89号汽油',
  n92: '92号汽油', 
  n95: '95号汽油',
  n98: '98号汽油'
}

// 加载状态
const loading = ref(true)
const error = ref('')

// 获取油价数据
const fetchOilPrices = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch('https://v2.xxapi.cn/api/oilPrice')
    const result = await response.json()
    
    if (result.code === 200 && result.data) {
      let dataArray = []
      if (result.data.data && Array.isArray(result.data.data)) {
        dataArray = result.data.data
      } else if (Array.isArray(result.data)) {
        dataArray = result.data
      }
      
      // 查找对应省份的数据
      const targetRegion = dataArray.find(region => 
        region.regionName === regionName.value ||
        region.regionName?.replace(/省|市|自治区|壮族|维吾尔|回族/g, '') === regionName.value?.replace(/省|市|自治区|壮族|维吾尔|回族/g, '')
      )
      
      if (targetRegion) {
        regionData.value = targetRegion
      } else {
        throw new Error('未找到该省份的油价数据')
      }
    } else {
      throw new Error(`API返回错误: ${result.msg || '未知错误'}`)
    }
  } catch (err) {
    error.value = '获取油价数据失败，请检查网络连接'
    console.error('油价API请求失败:', err)
  } finally {
    loading.value = false
  }
}

// 返回油价列表页面
const goBack = () => {
  router.push({ 
    name: 'OilPrice',
    query: route.query  // 保持原有的query参数
  })
}

// 切换计算模式
const switchMode = (mode) => {
  calculatorMode.value = mode
  inputVolume.value = ''
  inputMoney.value = ''
}

// 清空输入
const clearInputs = () => {
  inputVolume.value = ''
  inputMoney.value = ''
}

// AI车型油箱查询
const queryCarTankSize = async () => {
  // 输入验证
  if (!carModel.value.trim()) {
    aiError.value = '请输入车型名称'
    return
  }
  
  if (!carYear.value.trim()) {
    aiError.value = '请输入车辆年份'
    return
  }
  
  // 验证年份格式
  const year = parseInt(carYear.value)
  if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 2) {
    aiError.value = '请输入正确的年份（例如2020）'
    return
  }
  
  try {
    aiLoading.value = true
    aiError.value = ''
    aiResult.value = ''
    
    const content = `${carModel.value.trim()} ${year}年 ${carType.value}版`
    const systemPrompt = `你是一个专业的汽车顾问。请查询指定车型的油箱容量。

要求：
1. 仅返回油箱容量的数字和单位，格式如："50升"
2. 如果不确定，请回复："未知"
3. 不要返回任何其他文字或解释

示例回复：
50升
65升
未知

请查询：${carModel.value.trim()} ${year}年 ${carType.value}版的油箱容量`
    
    const response = await fetch('https://api.jkyai.top/API/qwen3.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        content: content,
        system: systemPrompt
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.text()
    
    // 提取油箱容量数值
    const tankSizeMatch = result.match(/(\d+(?:\.\d+)?)\s*升?/)
    if (tankSizeMatch) {
      const tankSize = parseFloat(tankSizeMatch[1])
      if (tankSize > 0 && tankSize < 200) { // 合理范围内的油箱容量
        aiResult.value = `${tankSize}升`
        
        // 自动填入计算器
        if (calculatorMode.value === 'volume') {
          inputVolume.value = tankSize.toString()
        }
      } else {
        aiResult.value = result.trim() || '未知'
      }
    } else {
      // 如果没有匹配到数字，显示原始结果
      aiResult.value = result.trim() || '未知'
    }
    
  } catch (err) {
    aiError.value = 'AI查询失败，请检查网络连接或稍后重试'
    console.error('AI查询错误:', err)
  } finally {
    aiLoading.value = false
  }
}

// 清空AI查询结果
const clearAIQuery = () => {
  carModel.value = ''
  carYear.value = ''
  carType.value = '国行'
  aiResult.value = ''
  aiError.value = ''
}

// 回车键查询
const handleEnterKey = (event) => {
  if (event.key === 'Enter') {
    queryCarTankSize()
  }
}

// 获取当前油品价格
const getCurrentPrice = computed(() => {
  if (!regionData.value) return 0
  return regionData.value[selectedOilType.value] || 0
})

// 格式化价格变化
const formatPriceChange = (change) => {
  if (change > 0) {
    return `+${change.toFixed(2)}`
  } else if (change < 0) {
    return change.toFixed(2)
  }
  return '0.00'
}

// 获取价格变化的样式类
const getPriceChangeClass = (change) => {
  if (change > 0) return 'price-up'
  if (change < 0) return 'price-down'
  return 'price-stable'
}

// 组件挂载时获取数据
onMounted(() => {
  if (!regionName.value) {
    router.push('/oil-price')
    return
  }
  fetchOilPrices()
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
      <h2 class="page-title">{{ regionName }}油价计算器</h2>
      <div class="spacer"></div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在获取{{ regionName }}油价数据...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="fetchOilPrices" class="retry-button">重试</button>
    </div>

    <!-- 油价计算器 -->
    <div v-if="!loading && !error && regionData" class="calculator-section">
      <!-- 当前油价信息 -->
      <div class="current-prices">
        <h3>{{ regionName }}当前油价</h3>
        <div class="price-grid">
          <div 
            v-for="(name, type) in oilTypeNames" 
            :key="type"
            class="price-item"
            :class="{ active: selectedOilType === type }"
            @click="selectedOilType = type"
          >
            <div class="oil-type">{{ name }}</div>
            <div class="price-info">
              <span class="current-price">¥{{ regionData[type]?.toFixed(2) || '0.00' }}</span>
              <span 
                class="price-change"
                :class="getPriceChangeClass(regionData[type + 'Change'])"
              >
                {{ formatPriceChange(regionData[type + 'Change'] || 0) }}
              </span>
            </div>
          </div>
        </div>
        <div class="update-time">数据更新时间: {{ regionData.date }}</div>
      </div>

      <!-- 计算模式切换 -->
      <div class="mode-selector">
        <button 
          class="mode-button"
          :class="{ active: calculatorMode === 'volume' }"
          @click="switchMode('volume')"
        >
          按升数计算
        </button>
        <button 
          class="mode-button"
          :class="{ active: calculatorMode === 'money' }"
          @click="switchMode('money')"
        >
          按金额计算
        </button>
      </div>

      <!-- 计算器界面 -->
      <div class="calculator-card">
        <div class="selected-oil-info">
          <div class="oil-label">当前选择: {{ oilTypeNames[selectedOilType] }}</div>
          <div class="oil-price">¥{{ getCurrentPrice.toFixed(2) }}/升</div>
        </div>

        <!-- 按升数计算 -->
        <div v-if="calculatorMode === 'volume'" class="calculation-form">
          <h4>按升数计算费用</h4>
          <div class="input-group">
            <label for="volume-input">加油升数:</label>
            <div class="input-wrapper">
              <input 
                id="volume-input"
                v-model="inputVolume"
                type="number"
                placeholder="请输入升数"
                min="0"
                step="0.1"
                class="calculator-input"
              >
              <span class="input-unit">升</span>
            </div>
          </div>
          
          <div class="result-display">
            <div class="result-label">需要支付:</div>
            <div class="result-value">¥{{ calculatedMoney }}</div>
          </div>
          
          <div v-if="inputVolume" class="calculation-details">
            <div class="detail-item">
              <span>{{ inputVolume }}升 × ¥{{ getCurrentPrice.toFixed(2) }}/升 = ¥{{ calculatedMoney }}</span>
            </div>
          </div>
        </div>

        <!-- 按金额计算 -->
        <div v-if="calculatorMode === 'money'" class="calculation-form">
          <h4>按金额计算升数</h4>
          <div class="input-group">
            <label for="money-input">支付金额:</label>
            <div class="input-wrapper">
              <input 
                id="money-input"
                v-model="inputMoney"
                type="number"
                placeholder="请输入金额"
                min="0"
                step="0.01"
                class="calculator-input"
              >
              <span class="input-unit">元</span>
            </div>
          </div>
          
          <div class="result-display">
            <div class="result-label">可以加油:</div>
            <div class="result-value">{{ calculatedVolume }}升</div>
          </div>
          
          <div v-if="inputMoney" class="calculation-details">
            <div class="detail-item">
              <span>¥{{ inputMoney }} ÷ ¥{{ getCurrentPrice.toFixed(2) }}/升 = {{ calculatedVolume }}升</span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button @click="clearInputs" class="clear-button">清空</button>
        </div>
      </div>

      <!-- AI车型油箱查询 -->
      <div class="ai-query-section">
        <h3>AI车型油箱查询</h3>
        <div class="ai-query-card">
          <div class="ai-form">
            <div class="form-row">
              <div class="input-group">
                <label for="car-model">车型名称:</label>
                <input 
                  id="car-model"
                  v-model="carModel"
                  type="text"
                  placeholder="请输入车型，如：奔驰C200L"
                  class="ai-input"
                  @keydown="handleEnterKey"
                >
              </div>
              
              <div class="input-group">
                <label for="car-year">年份:</label>
                <input 
                  id="car-year"
                  v-model="carYear"
                  type="text"
                  placeholder="请输入年份，如：2022"
                  class="ai-input"
                  @keydown="handleEnterKey"
                >
              </div>
            </div>
            
            <div class="form-row">
              <div class="radio-group">
                <label class="radio-label">版本类型:</label>
                <div class="radio-options">
                  <label class="radio-option">
                    <input 
                      v-model="carType" 
                      type="radio" 
                      value="国行"
                      class="radio-input"
                    >
                    <span class="radio-text">国行</span>
                  </label>
                  <label class="radio-option">
                    <input 
                      v-model="carType" 
                      type="radio" 
                      value="进口"
                      class="radio-input"
                    >
                    <span class="radio-text">进口</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="query-actions">
              <button 
                @click="queryCarTankSize"
                :disabled="aiLoading"
                class="query-button"
              >
                <span v-if="!aiLoading">🤖 查询油箱容量</span>
                <span v-else>🔄 查询中...</span>
              </button>
              <button @click="clearAIQuery" class="clear-ai-button">清空</button>
            </div>
          </div>
          
          <!-- AI查询结果 -->
          <div v-if="aiResult || aiError" class="ai-result">
            <div v-if="aiError" class="ai-error">
              {{ aiError }}
            </div>
            <div v-if="aiResult" class="ai-success">
              <div class="result-header">
                <span class="result-icon">🤖</span>
                <span class="result-title">AI查询结果</span>
              </div>
              <div class="car-info-display">
                <div class="car-info-item">
                  <span class="info-label">车型:</span>
                  <span class="info-value">{{ carModel }}</span>
                </div>
                <div class="car-info-item">
                  <span class="info-label">年份:</span>
                  <span class="info-value">{{ carYear }}年</span>
                </div>
                <div class="car-info-item">
                  <span class="info-label">版本:</span>
                  <span class="info-value">{{ carType }}</span>
                </div>
              </div>
              <div class="tank-size-display">
                <div class="tank-size-label">油箱容量</div>
                <div class="tank-size-value">{{ aiResult }}</div>
              </div>
              <div v-if="inputVolume && calculatorMode === 'volume'" class="auto-fill-tip">
                💡 已自动填入计算器中
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

:root {
  --text-accent-rgb: 25, 118, 210;
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
  font-size: 1.3rem;
  font-weight: 600;
}

.spacer {
  width: 40px;
}

/* 主要内容区域 */
.main-content {
  margin-top: 60px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 60px);
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

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--text-accent);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.retry-button:hover {
  background: var(--text-primary);
}

/* 当前油价信息 */
.current-prices {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.current-prices h3 {
  color: var(--text-accent);
  margin-bottom: 1rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.price-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.price-item {
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-primary);
}

.price-item:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
}

.price-item.active {
  border-color: var(--text-accent);
  background: var(--glass-bg);
  box-shadow: 0 4px 16px var(--glass-shadow);
}

.oil-type {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.price-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-price {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text-accent);
}

.price-change {
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  min-width: 50px;
  text-align: center;
}

.price-change.price-up {
  color: #d32f2f;
  background: #ffebee;
}

.price-change.price-down {
  color: #388e3c;
  background: #e8f5e8;
}

.price-change.price-stable {
  color: var(--text-secondary);
  background: var(--bg-secondary);
}

.update-time {
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-align: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

/* 模式选择器 */
.mode-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.mode-button {
  padding: 1rem 2rem;
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
}

.mode-button:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
}

.mode-button.active {
  background: var(--text-accent);
  color: white;
  border-color: var(--text-accent);
}

/* 计算器卡片 */
.calculator-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.selected-oil-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.oil-label {
  font-weight: 500;
  color: var(--text-primary);
}

.oil-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-accent);
}

/* 计算表单 */
.calculation-form h4 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.input-group {
  margin-bottom: 2rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.calculator-input {
  flex: 1;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 1.1rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.3s ease;
}

.calculator-input:focus {
  outline: none;
  border-color: var(--text-accent);
}

.input-unit {
  position: absolute;
  right: 1rem;
  color: var(--text-secondary);
  font-weight: 500;
  pointer-events: none;
}

/* 结果显示 */
.result-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.result-label {
  font-size: 1.1rem;
  color: var(--text-primary);
  font-weight: 500;
}

.result-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-accent);
}

/* 计算详情 */
.calculation-details {
  padding: 1rem;
  background: var(--glass-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.detail-item {
  color: var(--text-secondary);
  font-size: 0.95rem;
  text-align: center;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.clear-button {
  padding: 0.8rem 2rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.clear-button:hover {
  border-color: var(--text-accent);
  background: var(--glass-bg);
  transform: translateY(-2px);
}

/* AI车型查询区域 */
.ai-query-section {
  margin-top: 3rem;
}

.ai-query-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-query-section h3::before {
  content: '🤖';
  font-size: 1.2rem;
}

.ai-query-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

/* AI表单样式 */
.ai-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.ai-input {
  flex: 1;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.ai-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(var(--text-accent-rgb), 0.1);
}

.ai-input::placeholder {
  color: var(--text-secondary);
}

/* 单选按钮组 */
.radio-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.radio-label {
  color: var(--text-primary);
  font-weight: 500;
  min-width: 80px;
}

.radio-options {
  display: flex;
  gap: 1rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.radio-option:hover {
  border-color: var(--text-accent);
  background: var(--glass-bg);
}

.radio-input {
  margin: 0;
}

.radio-text {
  color: var(--text-primary);
  font-size: 0.9rem;
}

.radio-option:has(.radio-input:checked) {
  border-color: var(--text-accent);
  background: var(--text-accent);
}

.radio-option:has(.radio-input:checked) .radio-text {
  color: white;
}

/* 查询按钮 */
.query-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.query-button {
  flex: 1;
  max-width: 200px;
  padding: 1rem 2rem;
  background: var(--text-accent);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
}

.query-button:hover:not(:disabled) {
  background: var(--text-primary);
  transform: translateY(-2px);
}

.query-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.clear-ai-button {
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.clear-ai-button:hover {
  border-color: var(--text-accent);
  background: var(--glass-bg);
  transform: translateY(-2px);
}

/* AI结果显示 */
.ai-result {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.ai-error {
  padding: 1rem;
  background: #ffebee;
  color: #d32f2f;
  border-radius: 8px;
  text-align: center;
}

.ai-success {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.result-icon {
  font-size: 1.2rem;
}

.result-title {
  font-weight: 600;
  color: var(--text-accent);
}

.result-content {
  color: var(--text-primary);
  line-height: 1.6;
  padding: 1rem;
  background: var(--glass-bg);
  border-radius: 8px;
  white-space: pre-wrap;
  margin-bottom: 1rem;
}

/* 车型信息显示 */
.car-info-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--glass-bg);
  border-radius: 8px;
}

.car-info-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.info-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.info-value {
  font-weight: 500;
  color: var(--text-primary);
}

/* 油箱容量显示 */
.tank-size-display {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--text-accent), #4caf50);
  border-radius: 12px;
  margin-bottom: 1rem;
  color: white;
}

.tank-size-label {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.tank-size-value {
  font-size: 2rem;
  font-weight: bold;
}

.auto-fill-tip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-accent);
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  background: rgba(var(--text-accent-rgb), 0.1);
  border-radius: 6px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.1rem;
  }
  
  .price-grid {
    grid-template-columns: 1fr;
  }
  
  .mode-selector {
    flex-direction: column;
  }
  
  .selected-oil-info {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .result-display {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  /* AI表单响应式 */
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .radio-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .query-actions {
    flex-direction: column;
  }
  
  .query-button,
  .clear-ai-button {
    max-width: none;
  }
  
  /* 车型信息响应式 */
  .car-info-display {
    grid-template-columns: 1fr;
  }
  
  .tank-size-value {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .calculator-card,
  .ai-query-card {
    padding: 1rem;
  }
  
  .mode-button {
    padding: 0.8rem 1rem;
  }
  
  .calculator-input,
  .ai-input {
    padding: 0.8rem;
  }
  
  .radio-option {
    padding: 0.5rem 0.8rem;
  }
}
</style>