<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">AI翻译</h2>
      <div class="api-info">
        <div class="api-source">数据来源: xxapi.cn</div>
        <div class="update-time" :class="{ 'error-status': error }">
          {{ error ? 'Error' : (lastUpdateTime || '输入文本开始翻译') }}
        </div>
      </div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在翻译中...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button class="retry-button" @click="translate">重试</button>
    </div>

    <!-- 翻译功能展示 -->
    <div v-if="!loading" class="translate-section">
      <h3>AI智能翻译</h3>
      
      <!-- 语言选择器 -->
      <div class="language-selector">
        <div class="language-card">
          <div class="language-header">
            <h4 class="language-title">语言设置</h4>
          </div>
          <div class="language-content">
            <div class="language-options">
              <div class="language-option">
                <label class="language-label">源语言:</label>
                <select v-model="fromLanguage" class="language-select">
                  <option value="auto">自动检测</option>
                  <option v-for="(name, code) in languages" :key="code" :value="code">
                    {{ name }}
                  </option>
                </select>
              </div>
              <div class="language-option">
                <label class="language-label">目标语言:</label>
                <select v-model="toLanguage" class="language-select">
                  <option v-for="(name, code) in languages" :key="code" :value="code">
                    {{ name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="translate-grid">
        <div class="translate-card">
          <div class="translate-header">
            <h4 class="translate-title">文本翻译</h4>
            <div class="char-count">{{ inputText.length }}/5000</div>
          </div>
          
          <div class="translate-content">
            <!-- 输入区域 -->
            <div class="input-section">
              <div class="section-label">输入文本</div>
              <textarea 
                v-model="inputText" 
                class="input-textarea"
                placeholder="请输入要翻译的文本..."
                rows="6"
                maxlength="5000"
              ></textarea>
            </div>
            
            <!-- 翻译箭头 -->
            <div class="translate-arrow">
              <span class="arrow-icon">→</span>
            </div>
            
            <!-- 输出区域 -->
            <div class="output-section">
              <div class="section-label">翻译结果</div>
              <div class="result-textarea" :class="{ empty: !translatedText }">
                {{ translatedText || '翻译结果将显示在这里...' }}
              </div>
            </div>
            
            <div class="translate-actions">
              <div class="action-item">
                <span class="action-label">操作</span>
                <div class="action-buttons">
                  <button 
                    class="action-button primary" 
                    @click="translate"
                    :disabled="!inputText.trim() || loading"
                  >
                    {{ loading ? '翻译中...' : '开始翻译' }}
                  </button>
                  <button 
                    class="action-button secondary" 
                    @click="clearAll"
                    :disabled="loading"
                  >
                    清空内容
                  </button>
                  <button 
                    class="action-button secondary" 
                    @click="copyResult"
                    :disabled="!translatedText || loading"
                  >
                    复制结果
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

<script>
export default {
  name: 'Translate',
  data() {
    return {
      loading: false,
      error: null,
      inputText: '',
      translatedText: '',
      fromLanguage: 'auto',
      toLanguage: 'en',
      lastUpdateTime: null,
      apiKey: '798844718608371c',
      languages: {
        'ar': '阿拉伯语',
        'az': '阿塞拜疆语',
        'bg': '保加利亚语',
        'bn': '孟加拉语',
        'ca': '加泰罗尼亚语',
        'cs': '捷克语',
        'da': '丹麦语',
        'de': '德语',
        'el': '希腊语',
        'en': '英语',
        'eo': '世界语',
        'es': '西班牙语',
        'et': '爱沙尼亚语',
        'eu': '巴斯克语',
        'fa': '波斯语',
        'fi': '芬兰语',
        'fr': '法语',
        'ga': '爱尔兰语',
        'gl': '加利西亚语',
        'he': '希伯来语',
        'hi': '印地语',
        'hu': '匈牙利语',
        'id': '印度尼西亚语',
        'it': '意大利语',
        'ja': '日语',
        'ko': '韩语',
        'lt': '立陶宛语',
        'lv': '拉脱维亚语',
        'ms': '马来语',
        'nb': '挪威博克马尔语',
        'nl': '荷兰语',
        'pb': '巴西葡萄牙语',
        'pl': '波兰语',
        'pt': '葡萄牙语',
        'ro': '罗马尼亚语',
        'ru': '俄语',
        'sk': '斯洛伐克语',
        'sl': '斯洛文尼亚语',
        'sq': '阿尔巴尼亚语',
        'sv': '瑞典语',
        'th': '泰语',
        'tl': '塔加洛语（菲律宾语）',
        'tr': '土耳其语',
        'uk': '乌克兰语',
        'ur': '乌尔都语',
        'zh': '简体中文',
        'zt': '繁体中文'
      }
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    
    async translate() {
      if (!this.inputText.trim()) {
        this.error = '请输入要翻译的文本'
        return
      }
      
      this.loading = true
      this.error = null
      
      try {
        const requestOptions = {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          redirect: 'follow'
        }
        
        const url = `/api/AIAutoTranslate?text=${encodeURIComponent(this.inputText)}&to=${this.toLanguage}&key=${this.apiKey}`
        console.log('翻译请求URL:', url)
        
        const response = await fetch(url, requestOptions)
        console.log('响应状态:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('API返回数据:', data)
        
        if (data.code === 200 && data.data) {
          this.translatedText = data.data
          this.lastUpdateTime = new Date().toLocaleTimeString()
        } else {
          this.error = data.msg || '翻译失败'
          console.error('API返回错误:', data)
        }
      } catch (err) {
        this.error = `网络请求失败: ${err.message}`
        console.error('翻译请求错误:', err)
      } finally {
        this.loading = false
      }
    },
    
    clearAll() {
      this.inputText = ''
      this.translatedText = ''
      this.error = null
      this.lastUpdateTime = null
    },
    
    async copyResult() {
      if (!this.translatedText) return
      
      try {
        await navigator.clipboard.writeText(this.translatedText)
        // 简单的成功提示
        const originalText = this.lastUpdateTime
        this.lastUpdateTime = '已复制到剪贴板'
        setTimeout(() => {
          this.lastUpdateTime = originalText
        }, 2000)
      } catch (err) {
        console.error('复制失败:', err)
        alert('复制失败，请手动复制')
      }
    }
  },
  
  watch: {
    // 监听输入文本变化，自动清除错误状态
    inputText() {
      if (this.error) {
        this.error = null
      }
    }
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

/* 翻译数据区域 */
.translate-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

/* 语言选择器 */
.language-selector {
  margin-bottom: 1.5rem;
}

.language-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.language-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.language-title {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.language-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.language-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.language-option {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.language-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.language-select {
  padding: 0.5rem;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: border-color 0.2s;
}

.language-select:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(30, 88, 75, 0.1);
}

.translate-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.translate-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.translate-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.translate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.translate-title {
  color: var(--text-accent);
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.char-count {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.translate-content {
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

.translate-arrow {
  text-align: center;
  padding: 0.5rem 0;
}

.arrow-icon {
  font-size: 1.5rem;
  color: var(--text-accent);
  font-weight: bold;
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

.translate-actions {
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
  
  .translate-card, .language-card {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
  
  .translate-header, .language-header {
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
  
  .language-options {
    grid-template-columns: 1fr;
  }
  
  .translate-arrow {
    transform: rotate(90deg);
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