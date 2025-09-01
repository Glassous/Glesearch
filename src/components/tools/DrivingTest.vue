<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">随机驾考题目</h2>
      <div class="api-info">
        <div class="api-source">数据来源: xxapi.cn</div>
        <div class="update-time" :class="{ 'error-status': error }">
          {{ error ? 'Error' : '科目' + selectedSubject }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在获取题目数据...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button class="retry-button" @click="loadQuestion">重新加载</button>
    </div>

    <!-- 驾考题目展示 -->
    <div v-if="!loading && !error" class="question-section">
      <h3>驾考练习题目</h3>
      
      <!-- 科目选择器 -->
      <div class="subject-selector">
        <div class="subject-card">
          <div class="subject-header">
            <h4 class="subject-title">选择科目</h4>
          </div>
          <div class="subject-content">
            <div class="subject-buttons">
              <button 
                class="subject-btn" 
                :class="{ active: selectedSubject === 1 }" 
                @click="selectSubject(1)"
              >
                科目一
              </button>
              <button 
                class="subject-btn" 
                :class="{ active: selectedSubject === 4 }" 
                @click="selectSubject(4)"
              >
                科目四
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 题目内容 -->
      <div v-if="currentQuestion" class="question-grid">
        <div class="question-card">
          <div class="question-header">
            <h4 class="question-title">
              {{ questionType === 'multiple' ? '多选题' : questionType === 'judge' ? '判断题' : '单选题' }}
            </h4>
            <div class="question-type-badge" v-if="questionType === 'multiple'">多选</div>
          </div>
          
          <div class="question-content">
            <!-- 题目图片 -->
            <div v-if="currentQuestion.pic" class="question-image">
              <img :src="currentQuestion.pic" :alt="currentQuestion.question" />
            </div>
            
            <!-- 题目文本 -->
            <div class="question-text">
              <h5>{{ currentQuestion.question }}</h5>
            </div>
            
            <!-- 选择题选项 -->
            <div v-if="questionType === 'single' || questionType === 'multiple'" class="options-container">
              <div 
                v-for="(option, index) in options" 
                :key="index"
                class="option-item"
                :class="{ 
                  selected: questionType === 'multiple' ? selectedAnswers.includes(option.key) : selectedAnswer === option.key,
                  correct: showResult && isCorrectOption(option.key),
                  wrong: showResult && questionType === 'single' && selectedAnswer === option.key && option.key !== currentQuestion.answer,
                  'wrong-multiple': showResult && questionType === 'multiple' && selectedAnswers.includes(option.key) && !isCorrectOption(option.key)
                }"
                @click="selectAnswer(option.key)"
              >
                <span class="option-checkbox" v-if="questionType === 'multiple'">
                  <span v-if="selectedAnswers.includes(option.key)" class="checkbox-checked">✓</span>
                </span>
                <span class="option-label">{{ option.key }}、</span>
                <span class="option-text">{{ option.text }}</span>
              </div>
            </div>

            <!-- 判断题选项 -->
            <div v-if="questionType === 'judge'" class="judge-container">
              <button 
                class="judge-btn correct-btn"
                :class="{ 
                  selected: selectedAnswer === '对',
                  correct: showResult && currentQuestion.answer === '对',
                  wrong: showResult && selectedAnswer === '对' && currentQuestion.answer !== '对'
                }"
                @click="selectAnswer('对')"
              >
                ✓ 正确
              </button>
              <button 
                class="judge-btn wrong-btn"
                :class="{ 
                  selected: selectedAnswer === '错',
                  correct: showResult && currentQuestion.answer === '错',
                  wrong: showResult && selectedAnswer === '错' && currentQuestion.answer !== '错'
                }"
                @click="selectAnswer('错')"
              >
                ✗ 错误
              </button>
            </div>

            <!-- 结果显示 -->
            <div v-if="showResult" class="result-container">
              <div class="result-message" :class="{ correct: isCorrect, wrong: !isCorrect }">
                <span v-if="isCorrect">✓ 回答正确！</span>
                <span v-else>✗ 回答错误！正确答案是：{{ currentQuestion.answer }}</span>
              </div>
              <div class="explanation">
                <h6>解析：</h6>
                <p>{{ currentQuestion.explain }}</p>
              </div>
            </div>
            
            <div class="question-actions">
              <div class="action-item">
                <span class="action-label">操作</span>
                <div class="action-buttons">
                  <button 
                    v-if="!showResult"
                    class="action-button primary" 
                    @click="submitAnswer"
                    :disabled="(questionType === 'multiple' ? selectedAnswers.length === 0 : !selectedAnswer)"
                  >
                    提交答案
                  </button>
                  <button 
                    v-if="showResult"
                    class="action-button primary" 
                    @click="loadNextQuestion"
                  >
                    下一题
                  </button>
                  <button 
                    class="action-button secondary" 
                    @click="loadQuestion"
                  >
                    换一题
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 响应式数据
const selectedSubject = ref(1)
const currentQuestion = ref(null)
const selectedAnswer = ref('')
const selectedAnswers = ref([]) // 多选题答案数组
const showResult = ref(false)
const loading = ref(false)
const error = ref('')

// 计算属性
const questionType = computed(() => {
  if (!currentQuestion.value) return 'choice'
  
  // 判断题：答案是"对"或"错"
  if (currentQuestion.value.answer === '对' || currentQuestion.value.answer === '错') {
    return 'judge'
  }
  
  // 多选题：答案包含逗号分隔的多个字母（如"A,B,C"）或连续字母（如"ABC"）
  if (currentQuestion.value.answer && (
    currentQuestion.value.answer.includes(',') || 
    (currentQuestion.value.answer.length > 1 && /^[A-Z]+$/.test(currentQuestion.value.answer))
  )) {
    return 'multiple'
  }
  
  // 单选题：答案是单个字母A、B、C、D等
  return 'single'
})

const options = computed(() => {
  if (!currentQuestion.value || questionType.value === 'judge') return []
  
  const opts = []
  if (currentQuestion.value.option1) opts.push({ key: 'A', text: currentQuestion.value.option1.substring(2) })
  if (currentQuestion.value.option2) opts.push({ key: 'B', text: currentQuestion.value.option2.substring(2) })
  if (currentQuestion.value.option3) opts.push({ key: 'C', text: currentQuestion.value.option3.substring(2) })
  if (currentQuestion.value.option4) opts.push({ key: 'D', text: currentQuestion.value.option4.substring(2) })
  
  return opts
})

const isCorrect = computed(() => {
  if (questionType.value === 'multiple') {
    // 多选题：处理逗号分隔或连续字母格式
    let correctAnswers
    if (currentQuestion.value?.answer.includes(',')) {
      // 处理 "A,B,C" 格式
      correctAnswers = currentQuestion.value.answer.split(',').map(a => a.trim()).sort()
    } else {
      // 处理 "ABC" 格式
      correctAnswers = currentQuestion.value?.answer.split('').sort()
    }
    const userAnswers = selectedAnswers.value.sort()
    return JSON.stringify(correctAnswers) === JSON.stringify(userAnswers)
  } else {
    // 单选题和判断题
    return selectedAnswer.value === currentQuestion.value?.answer
  }
})

// 方法
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

const isCorrectOption = (optionKey) => {
  if (!currentQuestion.value?.answer) return false
  
  if (currentQuestion.value.answer.includes(',')) {
    // 处理 "A,B,C" 格式
    return currentQuestion.value.answer.split(',').map(a => a.trim()).includes(optionKey)
  } else {
    // 处理单选题或 "ABC" 格式
    return currentQuestion.value.answer.includes(optionKey)
  }
}

const selectSubject = (subject) => {
  selectedSubject.value = subject
  resetQuestion()
  loadQuestion()
}

const selectAnswer = (answer) => {
  if (showResult.value) return
  
  if (questionType.value === 'multiple') {
    // 多选题逻辑
    const index = selectedAnswers.value.indexOf(answer)
    if (index > -1) {
      // 如果已选中，则取消选择
      selectedAnswers.value.splice(index, 1)
    } else {
      // 如果未选中，则添加到选择列表
      selectedAnswers.value.push(answer)
    }
  } else {
    // 单选题和判断题
    selectedAnswer.value = answer
  }
}

const submitAnswer = () => {
  if (questionType.value === 'multiple') {
    if (selectedAnswers.value.length === 0) return
  } else {
    if (!selectedAnswer.value) return
  }
  showResult.value = true
}

const resetQuestion = () => {
  currentQuestion.value = null
  selectedAnswer.value = ''
  selectedAnswers.value = []
  showResult.value = false
  error.value = ''
}

const loadNextQuestion = () => {
  resetQuestion()
  loadQuestion()
}

const loadQuestion = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await fetch(`https://v2.xxapi.cn/api/jiakao?subject=${selectedSubject.value}`)
    const data = await response.json()
    
    if (data.code === 200) {
      currentQuestion.value = data.data
    } else {
      error.value = data.msg || '获取题目失败'
    }
  } catch (err) {
    error.value = '网络请求失败，请检查网络连接'
    console.error('API请求失败:', err)
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadQuestion()
})
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
  transition: all 0.2s ease;
}

.retry-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-medium);
}

/* 题目数据区域 */
.question-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

/* 科目选择器 */
.subject-selector {
  margin-bottom: 1.5rem;
}

.subject-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.subject-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.subject-title {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.subject-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subject-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.subject-btn {
  padding: 0.75rem 2rem;
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px var(--glass-shadow);
}

.subject-btn:hover {
  border-color: var(--text-accent);
  color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow-medium);
}

.subject-btn.active {
  background: var(--text-accent);
  border-color: var(--text-accent);
  color: white;
  box-shadow: 0 8px 24px var(--shadow-medium);
}

.question-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.question-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.question-title {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.question-type-badge {
  background: var(--text-accent);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.question-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-image {
  text-align: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.question-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 16px var(--shadow-light);
}

.question-text h5 {
  color: var(--text-primary);
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

/* 选择题选项 */
.options-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-item:hover {
  border-color: var(--text-accent);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--shadow-light);
}

.option-item.selected {
  border-color: var(--text-accent);
  background: rgba(30, 88, 75, 0.1);
}

.option-item.correct {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.option-item.wrong, .option-item.wrong-multiple {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

.option-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  margin-right: 0.5rem;
  transition: all 0.2s ease;
}

.option-item.selected .option-checkbox {
  border-color: var(--text-accent);
  background-color: var(--text-accent);
}

.checkbox-checked {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.option-label {
  font-weight: 600;
  color: var(--text-primary);
  margin-right: 0.5rem;
}

.option-text {
  flex: 1;
  color: var(--text-primary);
  line-height: 1.5;
}

/* 判断题选项 */
.judge-container {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.judge-btn {
  padding: 1rem 2rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary);
  transition: all 0.3s ease;
  min-width: 120px;
}

.judge-btn:hover {
  border-color: var(--text-accent);
  color: var(--text-accent);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--shadow-light);
}

.judge-btn.selected {
  border-color: var(--text-accent);
  background: rgba(30, 88, 75, 0.1);
  color: var(--text-accent);
}

.judge-btn.correct {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.judge-btn.wrong {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

/* 结果显示 */
.result-container {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.result-message {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
}

.result-message.correct {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.result-message.wrong {
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

.explanation h6 {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.explanation p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.question-actions {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .question-card, .subject-card {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .question-header, .subject-header {
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
  
  .subject-buttons {
    gap: 0.5rem;
  }
  
  .judge-container {
    flex-direction: column;
    align-items: center;
  }
  
  .judge-btn {
    width: 100%;
    max-width: 200px;
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
  
  .subject-buttons {
    flex-direction: column;
  }
  
  .subject-btn {
    width: 100%;
  }
}
</style>