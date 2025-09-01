<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 简繁体互转相关状态
const inputText = ref('')
const conversionType = ref('jzf') // 'jzf' 简转繁, 'fzj' 繁转简
const isLoading = ref(false)
const result = ref(null)
const error = ref('')
const conversionHistory = ref([])

// 转换类型选项
const conversionTypes = [
  { value: 'jzf', label: '简体转繁体', icon: '简→繁' },
  { value: 'fzj', label: '繁体转简体', icon: '繁→简' }
]

// 从localStorage加载转换历史
onMounted(() => {
  const saved = localStorage.getItem('text-conversion-history')
  if (saved) {
    conversionHistory.value = JSON.parse(saved)
  }
})

// 保存转换历史到localStorage
const saveConversionHistory = (original, converted, type) => {
  if (!original.trim() || !converted.trim()) return
  
  const historyItem = {
    id: Date.now(),
    original: original.trim(),
    converted: converted.trim(),
    type: type,
    mode: conversionTypes.find(t => t.value === type)?.label || '',
    timestamp: new Date().toLocaleString('zh-CN')
  }
  
  // 避免重复，删除已存在的相同转换
  conversionHistory.value = conversionHistory.value.filter(
    item => !(item.original === original.trim() && item.type === type)
  )
  
  // 添加到开头
  conversionHistory.value.unshift(historyItem)
  
  // 限制历史记录数量
  if (conversionHistory.value.length > 20) {
    conversionHistory.value = conversionHistory.value.slice(0, 20)
  }
  
  localStorage.setItem('text-conversion-history', JSON.stringify(conversionHistory.value))
}

// 简繁体转换
const convertText = async () => {
  if (!inputText.value.trim()) {
    error.value = '请输入要转换的文本内容'
    return
  }

  isLoading.value = true
  error.value = ''
  result.value = null

  try {
    const response = await fetch(`https://api.pearktrue.cn/api/conversion/word.php?text=${encodeURIComponent(inputText.value.trim())}&type=${conversionType.value}`)
    const data = await response.json()

    if (data.code === 200) {
      result.value = {
        originalText: data.text,
        convertedText: data.conversion,
        mode: data.mode,
        message: data.msg,
        type: conversionType.value
      }
      
      // 保存转换历史
      saveConversionHistory(data.text, data.conversion, conversionType.value)
    } else {
      error.value = data.msg || '转换失败，请稍后重试'
    }
  } catch (err) {
    console.error('转换失败:', err)
    error.value = '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 使用历史记录
const useHistoryItem = (historyItem) => {
  inputText.value = historyItem.original
  conversionType.value = historyItem.type
  convertText()
}

// 反向转换
const reverseConvert = () => {
  if (result.value) {
    inputText.value = result.value.convertedText
    conversionType.value = conversionType.value === 'jzf' ? 'fzj' : 'jzf'
    convertText()
  }
}

// 清空转换历史
const clearHistory = () => {
  conversionHistory.value = []
  localStorage.removeItem('text-conversion-history')
}

// 复制到剪贴板
const copyToClipboard = async (text, buttonClass) => {
  try {
    await navigator.clipboard.writeText(text)
    const button = document.querySelector(`.${buttonClass}`)
    if (button) {
      const originalText = button.textContent
      button.textContent = '已复制!'
      setTimeout(() => {
        button.textContent = originalText
      }, 2000)
    }
  } catch (err) {
    console.error('复制失败:', err)
    error.value = '复制失败，请手动选择文本复制'
  }
}

// 下载转换结果
const downloadResult = () => {
  if (result.value) {
    const content = `转换模式：${result.value.mode}\n\n原文：\n${result.value.originalText}\n\n转换结果：\n${result.value.convertedText}`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `简繁体转换_${new Date().getTime()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// 清空结果
const clearResult = () => {
  result.value = null
  error.value = ''
  inputText.value = ''
}

// 处理键盘事件
const handleKeyPress = (event) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    convertText()
  }
}

// 切换转换类型
const switchConversionType = (type) => {
  conversionType.value = type
  if (inputText.value.trim()) {
    convertText()
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
    router.push('/')
  }
}
</script>

<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">简繁体互转</h2>
      <button class="clear-button" @click="clearResult" v-if="result">
        <span class="clear-icon">✕</span>
      </button>
      <div v-else style="width: 40px;"></div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 转换表单区域 -->
    <section class="convert-section">
      <div class="convert-form">
        <h3>🔄 简繁体互转</h3>
        <p class="description">输入中文文本，快速实现简体字和繁体字之间的相互转换</p>
        
        <!-- 转换类型选择 -->
        <div class="conversion-type-selector">
          <button 
            v-for="type in conversionTypes"
            :key="type.value"
            @click="switchConversionType(type.value)"
            class="type-button"
            :class="{ active: conversionType === type.value }"
          >
            <span class="type-icon">{{ type.icon }}</span>
            <span class="type-label">{{ type.label }}</span>
          </button>
        </div>

        <div class="form-group">
          <label>输入文本</label>
          <textarea 
            v-model="inputText"
            :placeholder="conversionType === 'jzf' ? '请输入简体中文文本...' : '请输入繁体中文文本...'"
            class="text-input"
            @keydown="handleKeyPress"
            :disabled="isLoading"
            rows="6"
          ></textarea>
          <div class="input-hint">
            💡 提示：支持Ctrl+Enter快速转换，文本长度建议在1000字以内
          </div>
        </div>

        <div class="convert-action">
          <button 
            @click="convertText"
            class="convert-button"
            :disabled="isLoading || !inputText.trim()"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <span v-else>🔄</span>
            {{ isLoading ? '转换中...' : `开始${conversionTypes.find(t => t.value === conversionType)?.label}` }}
          </button>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ error }}
        </div>

        <!-- 转换历史 -->
        <div v-if="conversionHistory.length > 0" class="conversion-history">
          <div class="history-header">
            <h4>📚 转换历史</h4>
            <button @click="clearHistory" class="clear-history-btn">清空历史</button>
          </div>
          <div class="history-list">
            <div 
              v-for="item in conversionHistory.slice(0, 5)" 
              :key="item.id"
              class="history-item"
              @click="useHistoryItem(item)"
            >
              <div class="history-content">
                <div class="history-mode">{{ item.mode }}</div>
                <div class="history-text">
                  <span class="history-original">{{ item.original.substring(0, 30) }}{{ item.original.length > 30 ? '...' : '' }}</span>
                  <span class="history-arrow">→</span>
                  <span class="history-converted">{{ item.converted.substring(0, 30) }}{{ item.converted.length > 30 ? '...' : '' }}</span>
                </div>
                <div class="history-time">{{ item.timestamp }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 转换结果区域 -->
    <section v-if="result" class="result-section">
      <div class="result-card">
        <h3>✅ 转换完成</h3>
        
        <!-- 转换信息 -->
        <div class="conversion-info">
          <div class="info-header">
            <h4>ℹ️ 转换信息</h4>
            <button @click="reverseConvert" class="reverse-button" :disabled="isLoading">
              <span class="btn-icon">🔄</span>
              反向转换
            </button>
          </div>
          <div class="info-content">
            <p><strong>转换模式：</strong>{{ result.mode }}</p>
            <p><strong>转换状态：</strong>{{ result.message }}</p>
            <p><strong>字符统计：</strong>{{ result.originalText.length }} 字符</p>
          </div>
        </div>

        <!-- 转换对比 -->
        <div class="conversion-comparison">
          <div class="comparison-item original">
            <div class="section-header">
              <h4>📝 原文</h4>
              <button @click="copyToClipboard(result.originalText, 'copy-original-btn')" class="copy-btn copy-original-btn">
                <span class="btn-icon">📋</span>
                复制原文
              </button>
            </div>
            <div class="text-display">
              {{ result.originalText }}
            </div>
          </div>
          
          <div class="conversion-arrow">
            <span class="arrow-icon">⬇️</span>
            <span class="arrow-text">{{ result.mode }}</span>
          </div>
          
          <div class="comparison-item converted">
            <div class="section-header">
              <h4>✨ 转换结果</h4>
              <button @click="copyToClipboard(result.convertedText, 'copy-result-btn')" class="copy-btn copy-result-btn">
                <span class="btn-icon">📄</span>
                复制结果
              </button>
            </div>
            <div class="text-display">
              {{ result.convertedText }}
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="result-actions">
          <button @click="downloadResult" class="action-button download-button">
            <span class="btn-icon">💾</span>
            下载结果
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* 基础样式 */
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

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  height: 60px;
}

.back-button, .clear-button {
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

.back-button:hover, .clear-button:hover {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transform: translateY(-1px);
}

.back-icon, .clear-icon {
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

/* 主要内容区域 */
.main-content {
  margin-top: 60px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 60px);
  width: 100%;
}

/* 表单样式 */
.convert-section {
  margin-bottom: 2rem;
}

.convert-form {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.convert-form h3 {
  color: var(--text-accent);
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

/* 转换类型选择器 */
.conversion-type-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.25rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.type-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-secondary);
  font-weight: 500;
}

.type-button.active {
  background: var(--text-accent);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.type-button:hover:not(.active) {
  background: var(--glass-bg);
  color: var(--text-primary);
}

.type-icon {
  font-size: 1.1rem;
  font-weight: bold;
}

.type-label {
  font-size: 0.95rem;
}

/* 表单组 */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.text-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;
}

.text-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.input-hint {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

/* 转换按钮 */
.convert-action {
  margin-bottom: 1rem;
}

.convert-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: var(--text-accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.convert-button:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.convert-button:disabled {
  background: var(--border-color);
  cursor: not-allowed;
  transform: none;
}

/* 加载动画 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误提示 */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.error-icon {
  font-size: 1rem;
}

/* 转换历史 */
.conversion-history {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.history-header h4 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1rem;
}

.clear-history-btn {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-history-btn:hover {
  background: var(--glass-bg);
  color: var(--text-primary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-item:hover {
  background: var(--text-accent);
  color: white;
  transform: translateY(-1px);
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.history-mode {
  font-size: 0.8rem;
  font-weight: 500;
  opacity: 0.8;
}

.history-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.history-original, .history-converted {
  flex: 1;
}

.history-arrow {
  color: var(--text-accent);
  font-weight: bold;
}

.history-item:hover .history-arrow {
  color: rgba(255, 255, 255, 0.8);
}

.history-time {
  font-size: 0.75rem;
  opacity: 0.6;
}

/* 结果区域 */
.result-section {
  animation: slideInUp 0.5s ease;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.result-card h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.result-card h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1rem;
}

/* 转换信息 */
.conversion-info {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.reverse-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--text-accent);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reverse-button:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.reverse-button:disabled {
  background: var(--border-color);
  cursor: not-allowed;
}

.info-content p {
  margin: 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.info-content strong {
  color: var(--text-primary);
}

/* 转换对比 */
.conversion-comparison {
  margin-bottom: 2rem;
}

.comparison-item {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.comparison-item.converted {
  background: rgba(40, 167, 69, 0.1);
  border-color: #28a745;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.text-display {
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 1rem;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.conversion-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
  gap: 0.5rem;
}

.arrow-icon {
  font-size: 1.5rem;
  color: var(--text-accent);
}

.arrow-text {
  color: var(--text-accent);
  font-weight: 500;
  font-size: 0.9rem;
}

/* 复制按钮 */
.copy-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--text-accent);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1rem;
}

/* 操作按钮 */
.result-actions {
  display: flex;
  justify-content: center;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--text-accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: #5a6fd8;
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
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .convert-form {
    padding: 1.5rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .copy-btn, .reverse-button {
    align-self: stretch;
    justify-content: center;
  }
  
  .info-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .history-text {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .history-arrow {
    align-self: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.2rem;
  }
  
  .convert-form {
    padding: 1rem;
  }
  
  .result-card {
    padding: 1.5rem;
  }
  
  .conversion-type-selector {
    flex-direction: column;
  }
}
</style>