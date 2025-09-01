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

// Markdown选项
const markdownOptions = ref({
  breaks: true,
  gfm: true,
  highlight: true
})

// 示例模板
const exampleTemplates = ref([
  {
    id: 'basic',
    name: '基础语法',
    icon: '📝',
    description: 'Markdown基本语法示例',
    content: `# 标题示例\n\n## 二级标题\n\n这是**粗体**和*斜体*文本。\n\n> 这是引用块\n\n- 列表项1\n- 列表项2\n\n\`\`\`javascript\nconsole.log("Hello World");\n\`\`\``
  },
  {
    id: 'table',
    name: '表格示例',
    icon: '📊',
    description: '表格格式示例',
    content: `# 表格示例\n\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 数据1 | 数据2 | 数据3 |\n| 数据4 | 数据5 | 数据6 |`
  }
])

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

// 使用模板
const useTemplate = (template) => {
  markdownContent.value = template.content
  uploadedFileName.value = `${template.name}.md`
  renderMarkdown()
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
  clearTimeout(window.markdownRenderTimeout)
  window.markdownRenderTimeout = setTimeout(renderMarkdown, 300)
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

    <!-- 示例模板 -->
    <section class="templates-section">
      <h3>📋 示例模板</h3>
      <div class="templates-grid">
        <div 
          v-for="template in exampleTemplates" 
          :key="template.id"
          class="template-card"
          @click="useTemplate(template)"
        >
          <div class="template-icon">{{ template.icon }}</div>
          <div class="template-info">
            <h4>{{ template.name }}</h4>
            <p>{{ template.description }}</p>
          </div>
        </div>
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

    <!-- 编辑器 -->
    <section class="editor-section">
      <h3>✏️ 编辑器</h3>
      <div class="editor-form">
        <textarea 
          v-model="markdownContent"
          @input="handleInput"
          placeholder="在此输入Markdown内容..."
          class="form-textarea"
          rows="12"
        ></textarea>
        
        <div class="editor-actions">
          <button @click="renderMarkdown" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else>🔄</span>
            {{ loading ? '渲染中...' : '刷新预览' }}
          </button>
          <button @click="downloadMarkdown" class="btn-secondary" :disabled="!markdownContent.trim()">
            💾 下载MD
          </button>
        </div>
      </div>
    </section>

    <!-- 预览区域 -->
    <section v-if="htmlContent" class="preview-section">
      <h3>👀 预览效果</h3>
      <div class="preview-container">
        <div class="markdown-content" v-html="htmlContent"></div>
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

/* 模板样式 */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.template-card {
  background: var(--glass-bg);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.template-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
}

.template-icon {
  font-size: 2rem;
  min-width: 50px;
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
  
  .templates-grid {
    grid-template-columns: 1fr;
  }
  
  .upload-actions, .editor-actions {
    flex-direction: column;
  }
}
</style>