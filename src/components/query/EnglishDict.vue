<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 词典查询数据
const wordData = ref(null)
const loading = ref(false)
const error = ref('')
const apiSource = ref('PearAPI')
const searchWord = ref('')
const searchHistory = ref([])

// 获取词典数据
const fetchWordData = async () => {
  if (!searchWord.value.trim()) {
    error.value = '请输入要查询的英文单词'
    return
  }

  const word = searchWord.value.trim().toLowerCase()

  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch(`https://api.pearktrue.cn/api/word/english/parse.php?word=${encodeURIComponent(word)}`)
    const result = await response.json()
    
    console.log('API返回数据:', result) // 调试日志
    
    if (result.code === 200 && result.definition) {
      wordData.value = {
        word: result.word || word,
        definition: result.definition,
        api_source: result.api_source
      }
      
      // 添加到搜索历史，避免重复
      if (!searchHistory.value.includes(word)) {
        searchHistory.value.unshift(word)
        // 限制历史记录数量
        if (searchHistory.value.length > 10) {
          searchHistory.value = searchHistory.value.slice(0, 10)
        }
        // 保存到本地存储
        localStorage.setItem('englishDictHistory', JSON.stringify(searchHistory.value))
      }
    } else {
      throw new Error(`API返回错误: ${result.msg || '未知错误'}`)
    }
  } catch (err) {
    error.value = '查询单词失败，请检查单词拼写或稍后重试'
    console.error('词典API请求失败:', err)
    console.error('错误详情:', err.message)
  } finally {
    loading.value = false
  }
}

// 返回主页
const goBack = () => {
  const from = route.query.from
  if (from === 'home') {
    router.push('/')
  } else if (from === 'query') {
    router.push('/query')
  } else {
    // 默认返回首页
    router.push('/')
  }
}

// 回车键搜索
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    fetchWordData()
  }
}

// 复制内容到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // 这里可以添加一个成功提示
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 快速填入示例单词
const fillExample = (exampleWord) => {
  searchWord.value = exampleWord
}

// 从历史记录选择单词
const selectFromHistory = (word) => {
  searchWord.value = word
  fetchWordData()
}

// 清空搜索历史
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('englishDictHistory')
}

// 热门单词示例
const popularWords = [
  'hello', 'world', 'love', 'time', 'good', 'new', 
  'first', 'work', 'life', 'day', 'man', 'way'
]

// 解析词义，支持多种格式
const parseDefinition = (definition) => {
  if (!definition) return []
  
  // 按换行符分割
  const lines = definition.split('\n').filter(line => line.trim())
  if (lines.length > 1) {
    return lines.map(line => line.trim())
  }
  
  // 按分号分割词性
  const parts = definition.split(/[;，,]/g).filter(part => part.trim())
  if (parts.length > 1) {
    return parts.map(part => part.trim())
  }
  
  // 单行定义
  return [definition.trim()]
}

// 提取词性
const extractPartOfSpeech = (definition) => {
  const matches = definition.match(/\b(n\.|v\.|adj\.|adv\.|prep\.|conj\.|pron\.|int\.|num\.|art\.)\s/g)
  return matches ? matches.map(match => match.trim()) : []
}

// 获取词性的颜色类
const getPartOfSpeechClass = (pos) => {
  const posMap = {
    'n.': 'noun',
    'v.': 'verb', 
    'vi.': 'verb',
    'vt.': 'verb',
    'adj.': 'adjective',
    'adv.': 'adverb',
    'prep.': 'preposition',
    'conj.': 'conjunction',
    'pron.': 'pronoun',
    'int.': 'interjection',
    'num.': 'numeral',
    'art.': 'article'
  }
  return posMap[pos] || 'default'
}

// 组件挂载时恢复搜索历史并聚焦输入框
onMounted(() => {
  const savedHistory = localStorage.getItem('englishDictHistory')
  if (savedHistory) {
    try {
      searchHistory.value = JSON.parse(savedHistory)
    } catch (e) {
      console.error('恢复搜索历史失败:', e)
    }
  }
  
  const input = document.querySelector('.word-input')
  if (input) {
    input.focus()
  }
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
      <h2 class="page-title">英文词典</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div v-if="wordData" class="query-info">
          {{ wordData.word }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 搜索表单 -->
    <div class="search-form">
      <div class="form-row">
        <div class="input-group">
          <label>英文单词</label>
          <input 
            type="text" 
            v-model="searchWord" 
            @keypress="handleKeyPress"
            placeholder="请输入要查询的英文单词，如：hello"
            class="form-input word-input"
          />
        </div>
        <button class="search-button" @click="fetchWordData" :disabled="loading">
          {{ loading ? '查询中...' : '查词典' }}
        </button>
      </div>

      <!-- 热门单词快速选择 -->
      <div class="popular-words">
        <div class="words-label">热门单词：</div>
        <div class="words-list">
          <button 
            v-for="word in popularWords" 
            :key="word"
            class="word-tag"
            @click="fillExample(word)"
            :title="`查询单词: ${word}`"
          >
            {{ word }}
          </button>
        </div>
      </div>

      <!-- 搜索历史 -->
      <div v-if="searchHistory.length > 0" class="search-history">
        <div class="history-header">
          <span class="history-label">搜索历史：</span>
          <button class="clear-history" @click="clearHistory">清空</button>
        </div>
        <div class="history-list">
          <button 
            v-for="word in searchHistory" 
            :key="word"
            class="history-item"
            @click="selectFromHistory(word)"
            :title="`重新查询: ${word}`"
          >
            {{ word }}
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在查询词典...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 词典查询结果 -->
    <div v-if="!loading && !error && wordData" class="word-section">
      <h3>词典查询结果</h3>
      
      <div class="word-card">
        <div class="word-header">
          <div class="word-info">
            <h4 class="word-title">{{ wordData.word }}</h4>
            <div class="word-phonetic">
              /{{ wordData.word }}/
            </div>
          </div>
          <button class="copy-button" @click="copyToClipboard(wordData.word)" title="复制单词">
            📋
          </button>
        </div>
        
        <div class="definition-section">
          <h5>词义解释</h5>
          <div class="definition-content">
            <div 
              v-for="(definition, index) in parseDefinition(wordData.definition)" 
              :key="index"
              class="definition-item"
            >
              <div class="definition-text">
                {{ definition }}
              </div>
              
              <!-- 词性标签 -->
              <div v-if="extractPartOfSpeech(definition).length > 0" class="pos-tags">
                <span 
                  v-for="pos in extractPartOfSpeech(definition)" 
                  :key="pos"
                  class="pos-tag"
                  :class="getPartOfSpeechClass(pos)"
                >
                  {{ pos }}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            class="copy-definition" 
            @click="copyToClipboard(wordData.definition)"
            title="复制完整词义"
          >
            复制词义
          </button>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-if="!loading && !error && !wordData && searchWord" class="no-data-message">
      请输入英文单词进行查询
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

.query-info {
  color: var(--text-accent);
  font-weight: 500;
}

/* 主要内容区域 */
.main-content {
  margin-top: 60px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 60px);
  width: 100%;
}

/* 搜索表单 */
.search-form {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.form-row {
  display: flex;
  align-items: end;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.input-group label {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 2rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.search-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 热门单词 */
.popular-words {
  border-top: 1px solid var(--glass-border);
  padding-top: 1rem;
  margin-top: 1rem;
}

.words-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.words-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.word-tag {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.word-tag:hover {
  background: var(--text-accent);
  color: white;
  transform: translateY(-1px);
}

/* 搜索历史 */
.search-history {
  border-top: 1px solid var(--glass-border);
  padding-top: 1rem;
  margin-top: 1rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.history-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.clear-history {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.2s ease;
}

.clear-history:hover {
  background: rgba(244, 67, 54, 0.2);
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.history-item {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--text-accent);
  transition: all 0.2s ease;
}

.history-item:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
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

.no-data-message {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  background: var(--glass-bg);
  border-radius: 8px;
  margin-bottom: 2rem;
}

/* 词典查询结果区域 */
.word-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.word-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.word-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.word-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.word-info {
  flex: 1;
}

.word-title {
  color: var(--text-accent);
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.word-phonetic {
  color: var(--text-secondary);
  font-size: 1rem;
  font-style: italic;
  margin: 0;
}

.copy-button {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1.2rem;
  color: var(--text-accent);
  transition: all 0.2s ease;
}

.copy-button:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.definition-section h5 {
  color: var(--text-accent);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.definition-content {
  margin-bottom: 1.5rem;
}

.definition-item {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid var(--text-accent);
}

.definition-text {
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.pos-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.pos-tag {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid;
}

.pos-tag.noun {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border-color: rgba(76, 175, 80, 0.3);
}

.pos-tag.verb {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
  border-color: rgba(33, 150, 243, 0.3);
}

.pos-tag.adjective {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
  border-color: rgba(255, 152, 0, 0.3);
}

.pos-tag.adverb {
  background: rgba(156, 39, 176, 0.1);
  color: #9c27b0;
  border-color: rgba(156, 39, 176, 0.3);
}

.pos-tag.default {
  background: rgba(158, 158, 158, 0.1);
  color: #9e9e9e;
  border-color: rgba(158, 158, 158, 0.3);
}

.copy-definition {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.copy-definition:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .search-form {
    padding: 1.5rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .word-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .word-title {
    font-size: 1.5rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.2rem;
  }
  
  .api-info {
    font-size: 0.65rem;
  }
  
  .words-list {
    gap: 0.3rem;
  }
  
  .word-tag {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
  
  .word-title {
    font-size: 1.3rem;
  }
  
  .word-card {
    padding: 1.5rem;
  }
}
</style>