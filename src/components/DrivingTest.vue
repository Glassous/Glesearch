<template>
  <div class="driving-test-container">
    <!-- 顶部栏 - 复用原神图片页面的结构 -->
    <div class="top-bar">
      <button class="back-button" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="page-title">随机驾考题目</h1>
      <div class="placeholder"></div>
    </div>

    <!-- 科目选择 -->
    <div class="subject-selector">
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

    <!-- 题目内容 -->
    <div class="question-container" v-if="currentQuestion">
      <!-- 题目图片 -->
      <div class="question-image" v-if="currentQuestion.pic">
        <img :src="currentQuestion.pic" :alt="currentQuestion.question" />
      </div>

      <!-- 题目文本 -->
      <div class="question-text">
        <div class="question-type-badge" v-if="questionType === 'multiple'">多选题</div>
        <h2>{{ currentQuestion.question }}</h2>
      </div>

      <!-- 选择题选项 -->
      <div class="options-container" v-if="questionType === 'single' || questionType === 'multiple'">
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
      <div class="judge-container" v-if="questionType === 'judge'">
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
      <div class="result-container" v-if="showResult">
        <div class="result-message" :class="{ correct: isCorrect, wrong: !isCorrect }">
          <span v-if="isCorrect">✓ 回答正确！</span>
          <span v-else>✗ 回答错误！正确答案是：{{ currentQuestion.answer }}</span>
        </div>
        <div class="explanation">
          <h4>解析：</h4>
          <p>{{ currentQuestion.explain }}</p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button 
          class="submit-btn" 
          @click="submitAnswer" 
          :disabled="(questionType === 'multiple' ? selectedAnswers.length === 0 : !selectedAnswer) || showResult"
          v-if="!showResult"
        >
          提交答案
        </button>
        <button 
          class="next-btn" 
          @click="loadNextQuestion" 
          v-if="showResult"
        >
          下一题
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div class="loading-container" v-if="loading">
      <div class="loading-spinner"></div>
      <p>正在加载题目...</p>
    </div>

    <!-- 错误状态 -->
    <div class="error-container" v-if="error">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadQuestion">重新加载</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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
  router.push('/')
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
.driving-test-container {
  min-height: 100vh;
  padding: 0;
}

/* 顶部栏样式 - 复用原神图片页面 */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #f5f5f5;
  color: #333;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.placeholder {
  width: 80px;
}

/* 科目选择 */
.subject-selector {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  justify-content: center;
}

.subject-btn {
  padding: 0.75rem 2rem;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.subject-btn:hover {
  border-color: #4CAF50;
  color: #4CAF50;
}

.subject-btn.active {
  background: #4CAF50;
  border-color: #4CAF50;
  color: white;
}

/* 题目容器 */
.question-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1.5rem 2rem;
}

.question-type-badge {
  display: inline-block;
  background: #ff9800;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.question-image {
  text-align: center;
  margin-bottom: 1.5rem;
}

.question-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-text {
  margin-bottom: 2rem;
}

.question-text h2 {
  font-size: 1.25rem;
  color: #333;
  line-height: 1.6;
  margin: 0;
}

/* 选择题选项 */
.options-container {
  margin-bottom: 2rem;
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.option-item:hover {
  border-color: #4CAF50;
  background-color: #f8fff8;
}

.option-item.selected {
  border-color: #4CAF50;
  background-color: #e8f5e8;
}

.option-item.correct {
  border-color: #4CAF50;
  background-color: #e8f5e8;
}

.option-item.wrong {
  border-color: #f44336;
  background-color: #ffebee;
}

.option-item.wrong-multiple {
  border-color: #f44336;
  background-color: #ffebee;
}

.option-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 4px;
  margin-right: 0.5rem;
  transition: all 0.2s ease;
}

.option-item.selected .option-checkbox {
  border-color: #4CAF50;
  background-color: #4CAF50;
}

.checkbox-checked {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.option-label {
  font-weight: 600;
  color: #333;
  margin-right: 0.5rem;
}

.option-text {
  flex: 1;
  color: #333;
  line-height: 1.5;
}

/* 判断题选项 */
.judge-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.judge-btn {
  padding: 1rem 2rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  background: white;
  min-width: 120px;
}

.correct-btn:hover {
  border-color: #4CAF50;
  background-color: #f8fff8;
  color: #4CAF50;
}

.wrong-btn:hover {
  border-color: #f44336;
  background-color: #ffebee;
  color: #f44336;
}

.judge-btn.selected {
  border-color: #4CAF50;
  background-color: #e8f5e8;
  color: #4CAF50;
}

.judge-btn.correct {
  border-color: #4CAF50;
  background-color: #e8f5e8;
  color: #4CAF50;
}

.judge-btn.wrong {
  border-color: #f44336;
  background-color: #ffebee;
  color: #f44336;
}

/* 结果显示 */
.result-container {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.result-message {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
}

.result-message.correct {
  color: #4CAF50;
  background-color: #e8f5e8;
}

.result-message.wrong {
  color: #f44336;
  background-color: #ffebee;
}

.explanation h4 {
  color: #333;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.explanation p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* 操作按钮 */
.action-buttons {
  text-align: center;
}

.submit-btn, .next-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn {
  background: #4CAF50;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #45a049;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.next-btn {
  background: #2196F3;
  color: white;
}

.next-btn:hover {
  background: #1976D2;
}

/* 加载和错误状态 */
.loading-container, .error-container {
  text-align: center;
  padding: 3rem 1.5rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #45a049;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.1rem;
  }
  
  .subject-selector {
    padding: 1rem;
  }
  
  .subject-btn {
    padding: 0.6rem 1.5rem;
    font-size: 0.9rem;
  }
  
  .question-container {
    padding: 0 1rem 2rem;
  }
  
  .question-text h2 {
    font-size: 1.1rem;
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
</style>