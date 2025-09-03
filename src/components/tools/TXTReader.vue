<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 状态管理
const txtContent = ref('')
const fileInputRef = ref(null)
const uploadedFileName = ref('')
const loading = ref(false)
const errorMessage = ref('')
const showOptions = ref(false)
const viewMode = ref('edit') // 'edit' | 'preview'

// TXT选项
const txtOptions = ref({
  wordWrap: true,
  showLineNumbers: true,
  fontSize: 14,
  encoding: 'UTF-8'
})

// 统计信息
const getTextStats = () => {
  if (!txtContent.value) {
    return {
      characters: 0,
      words: 0,
      lines: 0,
      paragraphs: 0
    }
  }
  
  const text = txtContent.value
  const lines = text.split('\n').length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const characters = text.length
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length
  
  return { characters, words, lines, paragraphs }
}

// 文件上传
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const validExtensions = ['.txt', '.log', '.md', '.readme', '.text']
  const isValidFile = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext)) || file.type.startsWith('text/')
  
  if (!isValidFile) {
    errorMessage.value = '请选择文本文件（.txt、.log、.md等）'
    return
  }

  loading.value = true
  errorMessage.value = ''

  const reader = new FileReader()
  reader.onload = (e) => {
    txtContent.value = e.target.result
    uploadedFileName.value = file.name
    loading.value = false
  }
  reader.onerror = () => {
    errorMessage.value = '文件读取失败'
    loading.value = false
  }
  reader.readAsText(file, txtOptions.value.encoding)
}

// 触发文件选择
const triggerFileUpload = () => {
  fileInputRef.value.click()
}

// 清除内容
const clearContent = () => {
  txtContent.value = ''
  uploadedFileName.value = ''
  errorMessage.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// 下载文件
const downloadTXT = () => {
  if (!txtContent.value.trim()) return
  const blob = new Blob([txtContent.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = uploadedFileName.value || `text_${Date.now()}.txt`
  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 复制到剪贴板
const copyToClipboard = async () => {
  if (!txtContent.value.trim()) return
  
  try {
    await navigator.clipboard.writeText(txtContent.value)
    // 可以添加一个临时的成功提示
  } catch (err) {
    console.error('复制失败:', err)
    errorMessage.value = '复制到剪贴板失败'
  }
}

// 返回
const goBack = () => {
  const from = route.query.from
  if (from === 'tools') {
    router.push('/tools')
  } else {
    router.push('/')
  }
}

// 切换视图模式
const switchViewMode = (mode) => {
  viewMode.value = mode
}

// 格式化文本（基本的段落整理）
const formatText = () => {
  if (!txtContent.value.trim()) return
  
  let formatted = txtContent.value
  // 移除多余的空行
  formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n')
  // 移除行尾空格
  formatted = formatted.replace(/[ \t]+$/gm, '')
  // 移除文件开头和结尾的空行
  formatted = formatted.trim()
  
  txtContent.value = formatted
}

onMounted(() => {
  // 初始化
})
</script>

<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">文本阅读器</h2>
      <button class="options-button" @click="showOptions = !showOptions">
        <span class="options-icon">⚙️</span>
      </button>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 选项设置 -->
    <div v-if="showOptions" class="options-section">
      <div class="options-form">
        <h3>显示选项</h3>
        <div class="options-grid">
          <label class="checkbox-label">
            <input v-model="txtOptions.wordWrap" type="checkbox">
            <span>自动换行</span>
          </label>
          <label class="checkbox-label">
            <input v-model="txtOptions.showLineNumbers" type="checkbox">
            <span>显示行号</span>
          </label>
          <div class="font-size-control">
            <label>字体大小：</label>
            <select v-model="txtOptions.fontSize">
              <option :value="12">12px</option>
              <option :value="14">14px</option>
              <option :value="16">16px</option>
              <option :value="18">18px</option>
              <option :value="20">20px</option>
            </select>
          </div>
          <div class="encoding-control">
            <label>编码格式：</label>
            <select v-model="txtOptions.encoding">
              <option value="UTF-8">UTF-8</option>
              <option value="GBK">GBK</option>
              <option value="GB2312">GB2312</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 文本统计 -->
    <section v-if="txtContent" class="stats-section">
      <h3>📊 文本统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">字符数：</span>
          <span class="stat-value">{{ getTextStats().characters.toLocaleString() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">单词数：</span>
          <span class="stat-value">{{ getTextStats().words.toLocaleString() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">行数：</span>
          <span class="stat-value">{{ getTextStats().lines.toLocaleString() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">段落数：</span>
          <span class="stat-value">{{ getTextStats().paragraphs.toLocaleString() }}</span>
        </div>
      </div>
    </section>

    <!-- 视图模式切换 -->
    <section class="view-mode-section">
      <h3>🔧 视图模式</h3>
      <div class="mode-switcher">
        <button 
          :class="['mode-btn', { active: viewMode === 'edit' }]"
          @click="switchViewMode('edit')"
        >
          <span class="mode-icon">✏️</span>
          <span>编辑模式</span>
        </button>
        <button 
          :class="['mode-btn', { active: viewMode === 'preview' }]"
          @click="switchViewMode('preview')"
        >
          <span class="mode-icon">👁️</span>
          <span>预览模式</span>
        </button>
      </div>
    </section>

    <!-- 文件上传 -->
    <section class="upload-section">
      <h3>📁 文件上传</h3>
      <div class="upload-form">
        <div class="upload-area" @click="triggerFileUpload">
          <div class="upload-icon">📄</div>
          <h4>点击上传文本文件</h4>
          <p>支持.txt/.log/.md等文本格式</p>
          <p v-if="uploadedFileName" class="uploaded-file">已上传：{{ uploadedFileName }}</p>
        </div>
        
        <input 
          ref="fileInputRef"
          type="file" 
          accept=".txt,.log,.md,.readme,.text,text/*"
          @change="handleFileUpload"
          style="display: none"
        />
        
        <div class="upload-actions">
          <button @click="triggerFileUpload" class="btn-primary">📁 选择文件</button>
          <button @click="clearContent" class="btn-secondary">🗑️ 清空</button>
        </div>

        <div v-if="errorMessage" class="error-message">⚠️ {{ errorMessage }}</div>
      </div>
    </section>

    <!-- 文本编辑器和预览区域 -->
    <section class="editor-preview-section">
      <h3>{{ viewMode === 'edit' ? '✏️ 文本编辑器' : '👁️ 文本预览' }}</h3>
      
      <!-- 编辑模式 -->
      <div v-if="viewMode === 'edit'" class="edit-mode">
        <div class="editor-form">
          <textarea 
            v-model="txtContent"
            placeholder="在此输入或编辑文本内容..."
            class="form-textarea"
            :class="{ 
              'word-wrap': txtOptions.wordWrap,
              'show-line-numbers': txtOptions.showLineNumbers 
            }"
            :style="{ fontSize: txtOptions.fontSize + 'px' }"
            rows="15"
          ></textarea>

          <div class="editor-actions">
            <button @click="formatText" class="btn-primary" :disabled="!txtContent.trim()">
              🔧 格式化文本
            </button>
            <button @click="copyToClipboard" class="btn-secondary" :disabled="!txtContent.trim()">
              📋 复制
            </button>
            <button @click="downloadTXT" class="btn-secondary" :disabled="!txtContent.trim()">
              💾 下载
            </button>
          </div>
        </div>
      </div>

      <!-- 预览模式 -->
      <div v-if="viewMode === 'preview'" class="preview-mode">
        <div class="preview-container">
          <div 
            class="text-preview"
            :class="{ 
              'word-wrap': txtOptions.wordWrap,
              'show-line-numbers': txtOptions.showLineNumbers 
            }"
            :style="{ fontSize: txtOptions.fontSize + 'px' }"
          >
            <div v-if="!txtContent.trim()" class="empty-preview">
              <div class="empty-icon">📄</div>
              <p>暂无文本内容</p>
              <p>请上传文件或切换到编辑模式输入内容</p>
            </div>
            <pre v-else class="preview-text">{{ txtContent }}</pre>
          </div>
        </div>
        
        <div class="preview-actions">
          <button @click="copyToClipboard" class="btn-secondary" :disabled="!txtContent.trim()">
            📋 复制
          </button>
          <button @click="downloadTXT" class="btn-secondary" :disabled="!txtContent.trim()">
            💾 下载
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* 基础样式 */
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

.back-button, .options-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-accent);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  width: 40px;
  height: 40px;
}

.back-button:hover, .options-button:hover {
  background: var(--glass-bg);
  transform: translateY(-1px);
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

.main-content {
  margin-top: 60px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 60px);
}

/* 表单样式 */
.options-form, .upload-form, .editor-form, .preview-container {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
  margin-bottom: 2rem;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.checkbox-label:hover {
  background: var(--glass-bg);
}

.font-size-control, .encoding-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.font-size-control select, .encoding-control select {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

/* 模式切换器 */
.mode-switcher {
  display: flex;
  gap: 1rem;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
}

.mode-btn:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
}

.mode-btn.active {
  background: var(--text-accent);
  color: white;
  border-color: var(--text-accent);
}

.mode-icon {
  font-size: 1.2rem;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.upload-area:hover {
  border-color: var(--text-accent);
  background: rgba(102, 126, 234, 0.05);
}

.upload-icon {
  font-size: 3rem;
  color: var(--text-accent);
  margin-bottom: 1rem;
}

.uploaded-file {
  color: var(--text-accent) !important;
  font-weight: 500 !important;
}

/* 表单控件 */
.form-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: 'Consolas', 'Monaco', monospace;
  resize: vertical;
  min-height: 300px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.upload-actions, .editor-actions, .preview-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--text-accent);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--glass-bg);
  transform: translateY(-1px);
}

.error-message {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

/* 文本统计 */
.text-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  text-align: center;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-accent);
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

/* 预览模式 */
.text-preview {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  min-height: 400px;
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', monospace;
}

.text-preview.word-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.text-preview.show-line-numbers {
  counter-reset: line-number;
}

.text-preview.show-line-numbers .preview-text {
  counter-increment: line-number;
}

.text-preview.show-line-numbers .preview-text::before {
  content: counter(line-number);
  display: inline-block;
  width: 3em;
  padding-right: 0.5em;
  margin-right: 0.5em;
  text-align: right;
  color: var(--text-secondary);
  border-right: 1px solid var(--border-color);
}

.preview-text {
  margin: 0;
  color: var(--text-primary);
  line-height: 1.6;
  white-space: pre;
  overflow-x: auto;
}

.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-preview p {
  margin: 0.5rem 0;
  font-style: italic;
}

@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .mode-switcher {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .text-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .upload-actions, .editor-actions, .preview-actions {
    flex-direction: column;
  }
}

.main-content {
  margin-top: 60px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 60px);
  width: 100%;
}

.options-section, .stats-section {
  margin-bottom: 2rem;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.options-form h3, .stats-section h3 {
  margin: 0 0 1rem 0;
  color: var(--text-accent);
  font-size: 1.2rem;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.stat-value {
  color: var(--accent-color);
  font-weight: 600;
  font-size: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-color);
}

.font-size-control, .encoding-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
}

.font-size-control select, .encoding-control select {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  background: var(--glass-bg);
  color: var(--text-primary);
}

section {
  margin-bottom: 2rem;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

section h3 {
  margin: 0 0 1rem 0;
  color: var(--text-accent);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mode-switcher {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.mode-btn:hover {
  background: var(--glass-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--glass-shadow);
}

.mode-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-area {
  border: 2px dashed var(--glass-border);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--glass-bg);
}

.upload-area:hover {
  border-color: var(--accent-color);
  background: var(--glass-hover);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-area h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-accent);
}

.upload-area p {
  margin: 0.25rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.uploaded-file {
  color: var(--accent-color) !important;
  font-weight: 500;
}

.upload-actions, .editor-actions, .preview-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--accent-shadow);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--glass-bg);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--glass-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--glass-shadow);
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: var(--error-color);
  background: var(--error-bg);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--error-border);
  font-size: 0.9rem;
}

.form-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  background: var(--glass-bg);
  color: var(--text-primary);
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.3s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--accent-shadow);
}

.form-textarea.word-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.preview-container {
  margin-bottom: 1rem;
}

.text-preview {
  min-height: 400px;
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  background: var(--glass-bg);
  padding: 1rem;
  overflow: auto;
}

.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: var(--text-secondary);
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.preview-text {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: inherit;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: var(--text-primary);
}

.editor-actions, .preview-actions {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .mode-switcher {
    flex-direction: column;
  }
  
  .upload-actions, .editor-actions, .preview-actions {
    flex-direction: column;
  }
  
  .options-grid, .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>