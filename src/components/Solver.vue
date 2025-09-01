<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">AI解题助手</h2>
      <div class="api-info">
        <div class="api-source">数据来源: jkyai.top</div>
        <div class="update-time" :class="{ 'error-status': error }">
          {{ error ? 'Error' : (lastUpdateTime || '输入题目开始解题') }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button class="retry-button" @click="solveQuestion">重试</button>
    </div>

    <!-- 解题功能展示 -->
    <div class="solver-section">
      <h3>AI智能解题</h3>

      <div class="solver-grid">
        <div class="solver-card">
          <div class="solver-header">
            <h4 class="solver-title">题目解析</h4>
            <div class="char-count">{{ question.length }}/1000</div>
          </div>

          <div class="solver-content">
            <!-- 输入区域 -->
            <div class="input-section">
              <div class="section-label">题目内容</div>
              <textarea
                v-model="question"
                class="input-textarea"
                placeholder="请输入需要解答的题目..."
                rows="4"
                maxlength="1000"
              ></textarea>
            </div>

            <!-- 解题箭头/加载状态 -->
            <div class="solver-arrow">
              <div v-if="loading" class="loading-animation">
                <div class="loading-spinner"></div>
                <span class="loading-text">正在解题中...</span>
              </div>
              <div v-else class="arrow-icon">🧠</div>
            </div>

            <!-- 输出区域 -->
            <div class="output-section">
              <div class="section-label">解题答案</div>
              <div class="result-textarea" :class="{ empty: !answer }">
                <span v-if="!answer" class="placeholder-text">解题结果将显示在这里...</span>
                <div v-else class="math-content" v-html="renderAnswerWithMath(answer)"></div>
              </div>
            </div>
          </div>

          <div class="solver-actions">
            <div class="action-item">
              <span class="action-label">操作</span>
              <div class="action-buttons">
                <button
                  class="action-button primary"
                  @click="solveQuestion"
                  :disabled="!question.trim() || loading"
                >
                  {{ loading ? '解题中...' : '开始解题' }}
                </button>
                <button
                  class="action-button secondary"
                  @click="clearContent"
                  :disabled="loading"
                >
                  清空内容
                </button>
                <button
                  class="action-button secondary"
                  @click="copyAnswer"
                  :disabled="!answer || loading"
                >
                  复制答案
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 思考过程卡片 -->
        <div v-if="thinkContent" class="think-card">
          <div class="think-header">
            <h4 class="think-title">💭 思考过程</h4>
            <button
              class="copy-think-btn"
              @click="copyThink"
              title="复制思考过程"
            >
              📋
            </button>
          </div>
          <div class="think-content">
            <div class="think-text" v-html="renderAnswerWithMath(thinkContent)"></div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const question = ref('')
const answer = ref('')
const thinkContent = ref('')
const loading = ref(false)
const error = ref('')
const lastUpdateTime = ref('')

// 返回上一页
function goBack() {
  const urlParams = new URLSearchParams(window.location.search)
  const from = urlParams.get('from')
  if (from === 'home') {
    window.location.href = '/'
  } else if (from === 'tools') {
    window.location.href = '/tools'
  } else {
    // 默认返回首页
    window.location.href = '/'
  }
}

// 解题函数
async function solveQuestion() {
  if (!question.value.trim()) {
    error.value = '请输入题目'
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    const url = `https://api.jkyai.top/API/wnjtzs.php?question=${encodeURIComponent(question.value)}&type=json`
    console.log('解题请求URL:', url)

    const response = await fetch(url)
    const data = await response.json()
    
    console.log('API返回数据:', data)

    if (data.status === 'success' && data.data && data.data.answer) {
      const fullAnswer = data.data.answer
      
      // 提取Think标签内的内容
      const thinkMatch = fullAnswer.match(/<Think>(.*?)<\/Think>/s)
      if (thinkMatch) {
        thinkContent.value = thinkMatch[1].trim()
        // 移除Think标签，保留答案部分
        let answerText = fullAnswer.replace(/<Think>.*?<\/Think>/s, '').trim()
        
        // 处理【解题答案：】格式
        const answerMatch = answerText.match(/【解题答案：(.+?)】/)
        if (answerMatch) {
          answer.value = answerMatch[1].trim()
        } else {
          answer.value = answerText
        }
      } else {
        thinkContent.value = ''
        // 处理没有Think标签的情况
        const answerMatch = fullAnswer.match(/【解题答案：(.+?)】/)
        if (answerMatch) {
          answer.value = answerMatch[1].trim()
        } else {
          answer.value = fullAnswer
        }
      }
      
      lastUpdateTime.value = new Date().toLocaleTimeString()
    } else {
      error.value = data.message || '解题失败'
      console.error('API返回错误:', data)
    }
  } catch (err) {
    error.value = `网络请求失败: ${err.message}`
    console.error('解题请求错误:', err)
  } finally {
    loading.value = false
  }
}

// 清空内容
function clearContent() {
  question.value = ''
  answer.value = ''
  thinkContent.value = ''
  error.value = ''
}


// 复制答案
async function copyAnswer() {
  if (!answer.value) return

  try {
    await navigator.clipboard.writeText(answer.value)
    console.log('答案已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 复制思考过程
async function copyThink() {
  if (!thinkContent.value) return

  try {
    await navigator.clipboard.writeText(thinkContent.value)
    console.log('思考过程已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 渲染带数学公式的文本
function renderAnswerWithMath(text) {
  if (!text) return ''
  
  try {
    let content = text
    
    // 处理行内数学公式 \(...\)
    const inlineRegex = /\\\\?\((.*?)\\\\?\)/g
    content = content.replace(inlineRegex, (match, formula) => {
      try {
        return katex.renderToString(formula, { displayMode: false })
      } catch (e) {
        console.warn('KaTeX行内公式渲染失败:', e)
        return match
      }
    })
    
    // 处理块级数学公式 \[...\]
    const blockRegex = /\\\\?\[(.*?)\\\\?\]/g
    content = content.replace(blockRegex, (match, formula) => {
      try {
        return katex.renderToString(formula, { displayMode: true })
      } catch (e) {
        console.warn('KaTeX块级公式渲染失败:', e)
        return match
      }
    })
    
    // 处理换行符
    const newlineRegex = /\n/g
    content = content.replace(newlineRegex, '<br>')
    
    return content
  } catch (e) {
    console.warn('数学公式渲染失败:', e)
    return text
  }
}
</script>

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
  transition: all 0.2s ease;
}

.retry-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-medium);
}

/* 解题数据区域 */
.solver-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.solver-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.solver-card, .think-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.solver-card:hover, .think-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.solver-header, .think-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.solver-title, .think-title {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.char-count {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.solver-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-section, .output-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.input-textarea {
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
  background: var(--bg-secondary);
  color: var(--text-primary);
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input-textarea:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(30, 88, 75, 0.1);
}

.result-textarea {
  min-height: 120px;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  line-height: 1.5;
  background: var(--bg-secondary);
  color: var(--text-primary);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.result-textarea.empty {
  color: var(--text-secondary);
  font-style: italic;
}

.solver-arrow {
  text-align: center;
  padding: 0.5rem 0;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon {
  font-size: 1.5rem;
  color: var(--text-accent);
  font-weight: bold;
}

.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--text-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 0.9rem;
  color: var(--text-accent);
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.solver-actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.action-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 1rem;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
  justify-content: center;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-button.primary {
  background: var(--text-accent);
  color: white;
  box-shadow: 0 2px 8px var(--shadow-light);
}

.action-button.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-medium);
}

.action-button.secondary {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--text-accent);
  border: 1px solid var(--text-accent);
  box-shadow: 0 2px 8px var(--shadow-light);
}

.action-button.secondary:hover:not(:disabled) {
  background: var(--text-accent);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-medium);
}

/* 思考过程卡片样式 */
.think-card {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.1) 0%, rgba(142, 68, 173, 0.1) 100%);
}

.copy-think-btn {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.copy-think-btn:hover {
  border-color: var(--text-accent);
  transform: scale(1.1);
}

.think-content {
  max-height: 400px;
  overflow-y: auto;
}

.think-text {
  color: var(--text-primary);
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  background: var(--glass-bg);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
}

/* 数学公式样式 */
.math-content {
  line-height: 1.6;
}

.placeholder-text {
  color: var(--text-secondary);
  font-style: italic;
}

/* KaTeX 样式覆盖 */
.katex {
  font-size: 1.1em;
}

.katex-display {
  margin: 1em 0;
  text-align: center;
}

/* 确保数学公式在深色主题下正确显示 */
.katex .mord,
.katex .mop,
.katex .mbin,
.katex .mrel,
.katex .mopen,
.katex .mclose,
.katex .mpunct {
  color: var(--text-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .solver-card, .think-card {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .solver-header, .think-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
  
  .action-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .action-buttons {
    align-self: stretch;
    justify-content: center;
  }
  
  .solver-arrow {
    transform: rotate(90deg);
  }
  
  .loading-animation {
    transform: rotate(-90deg);
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
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .action-button {
    width: 100%;
  }
}
</style>