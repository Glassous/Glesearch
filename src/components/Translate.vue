<template>
  <div class="translate-container">
    <!-- 顶部栏 -->
    <div class="header">
      <button class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="title">AI翻译</h1>
      <div class="api-info">
        <div class="api-source">xxapi.cn</div>
        <div class="update-time">{{ lastUpdateTime || '输入文本开始翻译' }}</div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 翻译输入区 -->
      <div class="translate-section">
        <div class="input-section">
          <div class="language-selector">
            <label>源语言:</label>
            <select v-model="fromLanguage" class="language-select">
              <option value="auto">自动检测</option>
              <option v-for="(name, code) in languages" :key="code" :value="code">
                {{ name }}
              </option>
            </select>
          </div>
          
          <textarea 
            v-model="inputText" 
            class="input-textarea"
            placeholder="请输入要翻译的文本..."
            rows="6"
            maxlength="5000"
          ></textarea>
          
          <div class="char-count">{{ inputText.length }}/5000</div>
        </div>

        <div class="translate-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <div class="output-section">
          <div class="language-selector">
            <label>目标语言:</label>
            <select v-model="toLanguage" class="language-select">
              <option v-for="(name, code) in languages" :key="code" :value="code">
                {{ name }}
              </option>
            </select>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>正在翻译中...</p>
          </div>
          
          <!-- 错误状态 -->
          <div v-else-if="error" class="error">
            <p>{{ error }}</p>
            <button @click="translate" class="retry-btn">重试</button>
          </div>
          
          <!-- 翻译结果 -->
          <div v-else class="result-textarea" :class="{ empty: !translatedText }">
            {{ translatedText || '翻译结果将显示在这里...' }}
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="controls">
        <button 
          class="action-btn primary" 
          @click="translate"
          :disabled="!inputText.trim() || loading"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 5H15M9 3V5M10.048 12.317L12.713 9.652C14.146 8.219 14.146 5.781 12.713 4.348C11.28 2.915 8.842 2.915 7.409 4.348L4.743 7.014" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.317 17.952L10.652 15.287C9.219 13.854 9.219 11.416 10.652 9.983C12.085 8.55 14.523 8.55 15.956 9.983L18.622 12.649" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 15L15 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ loading ? '翻译中...' : '开始翻译' }}
        </button>

        <button 
          class="action-btn secondary" 
          @click="clearAll"
          :disabled="loading"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          清空内容
        </button>
        
        <button 
          class="action-btn secondary" 
          @click="copyResult"
          :disabled="!translatedText || loading"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          复制结果
        </button>
      </div>
    </div>
  </div>
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
.translate-container {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-primary);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: var(--text-accent);
}

.back-btn:hover {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  transform: scale(1.05);
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--text-accent);
}

.api-info {
  text-align: right;
  font-size: 12px;
}

.api-source {
  color: var(--text-accent);
  font-weight: 500;
}

.update-time {
  color: var(--text-secondary);
  margin-top: 2px;
}

.content {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.translate-section {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  margin-bottom: 30px;
  align-items: start;
}

.input-section, .output-section {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--glass-shadow);
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.language-selector label {
  font-weight: 500;
  color: var(--text-accent);
  min-width: 70px;
}

.language-select {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
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

.input-textarea {
  width: 100%;
  max-width: 100%;
  min-height: 150px;
  padding: 15px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
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

.char-count {
  text-align: right;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 5px;
}

.translate-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-accent);
  margin-top: 60px;
}

.result-textarea {
  min-height: 150px;
  padding: 15px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
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

.loading, .error {
  text-align: center;
  padding: 40px 20px;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading {
  color: var(--text-secondary);
}

.error {
  color: var(--text-accent);
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--text-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  background: var(--text-accent);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: var(--text-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
  justify-content: center;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.primary {
  background: var(--text-accent);
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: var(--text-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

.action-btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-accent);
  border: 2px solid var(--text-accent);
}

.action-btn.secondary:hover:not(:disabled) {
  background: var(--text-accent);
  color: white;
  transform: translateY(-1px);
  box-shadow: var(--shadow-medium);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 12px 16px;
  }
  
  .title {
    font-size: 16px;
  }
  
  .content {
    padding: 16px;
  }
  
  .translate-section {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .translate-arrow {
    margin-top: 0;
    transform: rotate(90deg);
  }
  
  .controls {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 280px;
  }
  
  .language-selector {
    flex-direction: column;
    align-items: stretch;
    gap: 5px;
  }
  
  .language-selector label {
    min-width: auto;
  }
}
</style>