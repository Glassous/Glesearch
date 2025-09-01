<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const router = useRouter()
const route = useRoute()

// 状态管理
const markdownContent = ref('')
const htmlContent = ref('')
const fileInputRef = ref(null)
const uploadedFileName = ref('')
const loading = ref(false)
const errorMessage = ref('')
const showOptions = ref(false)
const viewMode = ref('convert') // 'convert' | 'split'
const convertMode = ref('markdown') // 'markdown' | 'plain' 转换模式下显示的内容类型

// Markdown选项
const markdownOptions = ref({
  breaks: true,
  gfm: true,
  highlight: true
})

// 配置marked
const configureMarked = () => {
  marked.setOptions({
    breaks: markdownOptions.value.breaks,
    gfm: markdownOptions.value.gfm,
    highlight: markdownOptions.value.highlight ? (code, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value
        } catch (err) {
          console.error('代码高亮失败:', err)
        }
      }
      return hljs.highlightAuto(code).value
    } : null
  })
}

// 渲染Markdown
const renderMarkdown = async () => {
  if (!markdownContent.value.trim()) {
    htmlContent.value = ''
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    configureMarked()
    htmlContent.value = marked(markdownContent.value)
  } catch (error) {
    console.error('渲染失败:', error)
    errorMessage.value = 'Markdown渲染失败，请检查语法'
  } finally {
    loading.value = false
  }
}

// 文件上传
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!file.name.toLowerCase().endsWith('.md') && !file.name.toLowerCase().endsWith('.markdown')) {
    errorMessage.value = '请选择.md或.markdown文件'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    markdownContent.value = e.target.result
    uploadedFileName.value = file.name
    renderMarkdown()
  }
  reader.onerror = () => {
    errorMessage.value = '文件读取失败'
  }
  reader.readAsText(file, 'UTF-8')
}

// 触发文件选择
const triggerFileUpload = () => {
  fileInputRef.value.click()
}

// 清除内容
const clearContent = () => {
  markdownContent.value = ''
  htmlContent.value = ''
  uploadedFileName.value = ''
  errorMessage.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}



// 下载文件
const downloadMarkdown = () => {
  if (!markdownContent.value.trim()) return
  const blob = new Blob([markdownContent.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = uploadedFileName.value || `markdown_${Date.now()}.md`
  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
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

// 输入处理
const handleInput = () => {
  if (viewMode.value === 'split') {
    clearTimeout(window.markdownRenderTimeout)
    window.markdownRenderTimeout = setTimeout(renderMarkdown, 300)
  }
}

// 转换模式输入处理
const handleConvertInput = (event) => {
  updateCurrentDisplayContent(event.target.value)
}

// 切换视图模式
const switchViewMode = (mode) => {
  viewMode.value = mode
  if (mode === 'split' && markdownContent.value.trim()) {
    renderMarkdown()
  }
}

// 切换转换模式显示内容
const switchConvertMode = (mode) => {
  convertMode.value = mode
}

// 将Markdown转换为纯文本
const convertToPlainText = (markdown) => {
  if (!markdown) return ''
  
  return markdown
    // 移除标题标记
    .replace(/^#{1,6}\s+/gm, '')
    // 移除粗体和斜体标记
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // 移除删除线
    .replace(/~~([^~]+)~~/g, '$1')
    // 移除内联代码标记
    .replace(/`([^`]+)`/g, '$1')
    // 移除链接，保留链接文本
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除图片标记
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // 移除引用标记
    .replace(/^>\s+/gm, '')
    // 移除列表标记
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // 移除代码块标记
    .replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```\w*\n?/g, '').replace(/```$/g, '')
    })
    // 移除水平分割线
    .replace(/^[-*_]{3,}$/gm, '')
    // 清理多余的空行
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// 获取当前显示的内容
const getCurrentDisplayContent = () => {
  if (convertMode.value === 'markdown') {
    return markdownContent.value
  } else {
    return convertToPlainText(markdownContent.value)
  }
}

// 更新当前显示的内容
const updateCurrentDisplayContent = (value) => {
  if (convertMode.value === 'markdown') {
    markdownContent.value = value
  }
  // 纯文本模式下不允许编辑
}

onMounted(() => {
  configureMarked()
})
</script>

<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">Markdown阅读器</h2>
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
        <h3>渲染选项</h3>
        <div class="options-grid">
          <label class="checkbox-label">
            <input v-model="markdownOptions.breaks" @change="renderMarkdown" type="checkbox">
            <span>支持换行符</span>
          </label>
          <label class="checkbox-label">
            <input v-model="markdownOptions.gfm" @change="renderMarkdown" type="checkbox">
            <span>GitHub风格</span>
          </label>
          <label class="checkbox-label">
            <input v-model="markdownOptions.highlight" @change="renderMarkdown" type="checkbox">
            <span>代码高亮</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 视图模式切换 -->
    <section class="view-mode-section">
      <h3>🔧 视图模式</h3>
      <div class="mode-switcher">
        <button 
          :class="['mode-btn', { active: viewMode === 'convert' }]"
          @click="switchViewMode('convert')"
        >
          <span class="mode-icon">🔄</span>
          <span>转换模式</span>
        </button>
        <button 
          :class="['mode-btn', { active: viewMode === 'split' }]"
          @click="switchViewMode('split')"
        >
          <span class="mode-icon">📱</span>
          <span>分屏模式</span>
        </button>
      </div>
    </section>

    <!-- 文件上传 -->
    <section class="upload-section">
      <h3>📁 文件上传</h3>
      <div class="upload-form">
        <div class="upload-area" @click="triggerFileUpload">
          <div class="upload-icon">📄</div>
          <h4>点击上传Markdown文件</h4>
          <p>支持.md和.markdown格式</p>
          <p v-if="uploadedFileName" class="uploaded-file">已上传：{{ uploadedFileName }}</p>
        </div>
        
        <input 
          ref="fileInputRef"
          type="file" 
          accept=".md,.markdown"
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

    <!-- 编辑器和预览区域 -->
    <section class="editor-preview-section">
      <h3>✏️ {{ viewMode === 'split' ? 'Markdown编辑器 & 预览' : 'Markdown编辑器' }}</h3>
      
      <!-- 转换模式 -->
      <div v-if="viewMode === 'convert'" class="convert-mode">
        <div class="editor-form">
          <!-- 转换模式切换器 -->
          <div class="convert-switcher">
            <button 
              :class="['convert-btn', { active: convertMode === 'markdown' }]"
              @click="switchConvertMode('markdown')"
            >
              <span class="convert-icon">📝</span>
              <span>编辑模式</span>
            </button>
            <button 
              :class="['convert-btn', { active: convertMode === 'plain' }]"
              @click="switchConvertMode('plain')"
            >
              <span class="convert-icon">📜</span>
              <span>Markdown预览</span>
            </button>
          </div>

          <textarea 
            :value="getCurrentDisplayContent()"
            @input="handleConvertInput"
            :placeholder="convertMode === 'markdown' ? '在此编辑...' : 'Markdown显示区域'"
            :readonly="convertMode === 'plain'"
            class="form-textarea"
            :class="{ 'readonly': convertMode === 'plain' }"
            rows="12"
          ></textarea>
          
          <div class="editor-actions">
            <button 
              v-if="convertMode === 'markdown' && markdownContent.trim()"
              @click="switchConvertMode('plain')" 
              class="btn-primary"
            >
              🔄 转换为纯文本
            </button>
            <button 
              v-if="convertMode === 'plain' && markdownContent.trim()"
              @click="switchConvertMode('markdown')" 
              class="btn-primary"
            >
              ← 返回Markdown
            </button>
            <button @click="downloadMarkdown" class="btn-secondary" :disabled="!markdownContent.trim()">
              💾 下载MD
            </button>
          </div>
        </div>
      </div>

      <!-- 分屏模式 -->
      <div v-if="viewMode === 'split'" class="split-mode">
        <div class="split-container">
          <div class="preview-panel">
            <div class="panel-header">
              <h4>👀 实时预览</h4>
            </div>
            <div class="preview-content">
              <div v-if="loading" class="loading-message">
                <span class="loading-spinner"></span>
                渲染中...
              </div>
              <div v-else-if="htmlContent" class="markdown-content" v-html="htmlContent"></div>
              <div v-else class="empty-preview">
                在右侧输入Markdown内容查看预览
              </div>
            </div>
          </div>
          
          <div class="editor-panel">
            <div class="panel-header">
              <h4>✏️ Markdown编辑器</h4>
            </div>
            <textarea 
              v-model="markdownContent"
              @input="handleInput"
              placeholder="在此输入Markdown内容..."
              class="form-textarea split-textarea"
            ></textarea>
          </div>
        </div>
        
        <div class="split-actions">
          <button @click="downloadMarkdown" class="btn-secondary" :disabled="!markdownContent.trim()">
            💾 下载MD
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

/* 转换模式切换器 */
.convert-switcher {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 0.5rem;
}

.convert-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
  font-size: 0.9rem;
}

.convert-btn:hover {
  background: var(--glass-bg);
}

.convert-btn.active {
  background: var(--text-accent);
  color: white;
}

.convert-icon {
  font-size: 1rem;
}

/* 只读输入框 */
.form-textarea.readonly {
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: default;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
}

/* 分屏模式 */
.split-mode {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.split-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.editor-panel, .preview-panel {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.panel-header {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid var(--border-color);
}

.panel-header h4 {
  margin: 0;
  color: var(--text-accent);
  font-size: 1.1rem;
}

.split-textarea {
  flex: 1;
  border-radius: 0 0 8px 8px;
  border-top: none;
  resize: none;
  margin: 0;
}

.preview-content {
  flex: 1;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0 0 8px 8px;
  border-top: none;
  overflow-y: auto;
}

.empty-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  text-align: center;
  font-style: italic;
}

.loading-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 100%;
  color: var(--text-secondary);
}

.split-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* 转换模式 */
.convert-mode .editor-form {
  margin-bottom: 0;
}

.preview-header {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 16px 16px 0 0;
  border-bottom: 1px solid var(--border-color);
  margin: -2rem -2rem 1rem -2rem;
}

.preview-header h4 {
  margin: 0;
  color: var(--text-accent);
  font-size: 1.1rem;
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
}

.form-textarea:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.upload-actions, .editor-actions {
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

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

/* 预览样式 */
.markdown-content {
  color: var(--text-primary);
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.markdown-content h1, .markdown-content h2, .markdown-content h3 {
  color: var(--text-accent);
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.markdown-content h1 {
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.markdown-content code {
  background: var(--bg-secondary);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
}

.markdown-content pre {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid var(--border-color);
}

.markdown-content blockquote {
  border-left: 4px solid var(--text-accent);
  margin: 1rem 0;
  padding-left: 1rem;
  color: var(--text-secondary);
  font-style: italic;
}

.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-content th, .markdown-content td {
  border: 1px solid var(--border-color);
  padding: 0.75rem;
  text-align: left;
}

.markdown-content th {
  background: var(--bg-secondary);
  font-weight: 600;
}

section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

/* 响应式 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .mode-switcher {
    flex-direction: column;
  }
  
  .convert-switcher {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .split-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .editor-panel, .preview-panel {
    height: 300px;
  }
  
  .upload-actions, .editor-actions, .split-actions {
    flex-direction: column;
  }
}
</style>