<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 状态管理
const htmlContent = ref('')
const cssContent = ref('')
const fileInputRef = ref(null)
const uploadedFileName = ref('')
const loading = ref(false)
const errorMessage = ref('')
const showOptions = ref(false)
const viewMode = ref('split') // 'edit' | 'preview' | 'split'
const activeTab = ref('html') // 'html' | 'css'
const previewRef = ref(null)

// HTML+CSS选项
const renderOptions = ref({
  autoRefresh: true,
  showLineNumbers: true,
  fontSize: 14,
  theme: 'light'
})

// 默认HTML模板
const defaultHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML+CSS预览</title>
</head>
<body>
    <h1>欢迎使用HTML+CSS渲染器</h1>
    <p>在左侧编辑HTML和CSS代码，右侧将实时显示效果。</p>
    <div class="demo-box">
        <p>这是一个演示盒子</p>
    </div>
</body>
</html>`

const defaultCSS = `body {
    font-family: 'Arial', sans-serif;
    margin: 20px;
    background-color: #f5f5f5;
    color: #333;
}

h1 {
    color: #2c3e50;
    text-align: center;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
}

p {
    line-height: 1.6;
    margin: 15px 0;
}

.demo-box {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    margin: 20px 0;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.demo-box:hover {
    transform: translateY(-5px);
}`

// 渲染HTML+CSS
const renderHTML = () => {
  if (!previewRef.value) return
  
  try {
    const iframe = previewRef.value
    const doc = iframe.contentDocument || iframe.contentWindow.document
    
    let htmlToRender = htmlContent.value || defaultHTML
    
    // 如果有CSS内容，注入到HTML中
    if (cssContent.value) {
      const styleTag = `<style>${cssContent.value}</style>`
      
      // 检查HTML是否有head标签
      if (htmlToRender.includes('</head>')) {
        htmlToRender = htmlToRender.replace('</head>', `${styleTag}\n</head>`)
      } else {
        // 如果没有head标签，在body前添加
        htmlToRender = `<style>${cssContent.value}</style>\n${htmlToRender}`
      }
    }
    
    doc.open()
    doc.write(htmlToRender)
    doc.close()
    
    errorMessage.value = ''
  } catch (error) {
    console.error('渲染失败:', error)
    errorMessage.value = 'HTML渲染失败，请检查代码语法'
  }
}

// 文件上传
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const validExtensions = ['.html', '.htm', '.css']
  const isValidFile = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  
  if (!isValidFile) {
    errorMessage.value = '请选择HTML或CSS文件'
    return
  }

  loading.value = true
  errorMessage.value = ''

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target.result
    
    if (file.name.toLowerCase().endsWith('.css')) {
      cssContent.value = content
      activeTab.value = 'css'
    } else {
      htmlContent.value = content
      activeTab.value = 'html'
    }
    
    uploadedFileName.value = file.name
    loading.value = false
    
    if (renderOptions.value.autoRefresh) {
      nextTick(() => renderHTML())
    }
  }
  reader.onerror = () => {
    errorMessage.value = '文件读取失败'
    loading.value = false
  }
  reader.readAsText(file, 'UTF-8')
}

// 触发文件选择
const triggerFileUpload = () => {
  fileInputRef.value.click()
}

// 清除内容
const clearContent = () => {
  htmlContent.value = ''
  cssContent.value = ''
  uploadedFileName.value = ''
  errorMessage.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  renderHTML()
}

// 加载示例
const loadExample = () => {
  htmlContent.value = defaultHTML
  cssContent.value = defaultCSS
  nextTick(() => renderHTML())
}

// 下载HTML文件
const downloadHTML = () => {
  if (!htmlContent.value.trim()) return
  
  let content = htmlContent.value
  
  // 如果有CSS，合并到HTML中
  if (cssContent.value.trim()) {
    const styleTag = `<style>\n${cssContent.value}\n</style>`
    
    if (content.includes('</head>')) {
      content = content.replace('</head>', `${styleTag}\n</head>`)
    } else {
      content = `${styleTag}\n${content}`
    }
  }
  
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = uploadedFileName.value || `webpage_${Date.now()}.html`
  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 下载CSS文件
const downloadCSS = () => {
  if (!cssContent.value.trim()) return
  const blob = new Blob([cssContent.value], { type: 'text/css;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `styles_${Date.now()}.css`
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
  if (renderOptions.value.autoRefresh) {
    clearTimeout(window.htmlRenderTimeout)
    window.htmlRenderTimeout = setTimeout(renderHTML, 500)
  }
}

// 切换视图模式
const switchViewMode = (mode) => {
  viewMode.value = mode
  if (mode === 'preview' || mode === 'split') {
    nextTick(() => renderHTML())
  }
}

// 切换标签页
const switchTab = (tab) => {
  activeTab.value = tab
}

// 手动刷新预览
const refreshPreview = () => {
  renderHTML()
}

onMounted(() => {
  // 初始化时加载示例
  loadExample()
})
</script>

<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">HTML+CSS渲染器</h2>
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
            <input v-model="renderOptions.autoRefresh" type="checkbox">
            <span>自动刷新预览</span>
          </label>
          <label class="checkbox-label">
            <input v-model="renderOptions.showLineNumbers" type="checkbox">
            <span>显示行号</span>
          </label>
          <div class="font-size-control">
            <label>字体大小：</label>
            <select v-model="renderOptions.fontSize">
              <option :value="12">12px</option>
              <option :value="14">14px</option>
              <option :value="16">16px</option>
              <option :value="18">18px</option>
            </select>
          </div>
          <div class="theme-control">
            <label>主题：</label>
            <select v-model="renderOptions.theme">
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>
        </div>
      </div>
    </div>

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
        <button 
          :class="['mode-btn', { active: viewMode === 'split' }]"
          @click="switchViewMode('split')"
        >
          <span class="mode-icon">📱</span>
          <span>分屏模式</span>
        </button>
      </div>
    </section>

    <!-- 文件上传和操作 -->
    <section class="upload-section">
      <h3>📁 文件操作</h3>
      <div class="upload-form">
        <div class="upload-area" @click="triggerFileUpload">
          <div class="upload-icon">🌐</div>
          <h4>点击上传HTML/CSS文件</h4>
          <p>支持.html/.htm/.css格式</p>
          <p v-if="uploadedFileName" class="uploaded-file">已上传：{{ uploadedFileName }}</p>
        </div>
        
        <input 
          ref="fileInputRef"
          type="file" 
          accept=".html,.htm,.css"
          @change="handleFileUpload"
          style="display: none"
        />
        
        <div class="upload-actions">
          <button @click="triggerFileUpload" class="btn-primary">📁 选择文件</button>
          <button @click="loadExample" class="btn-secondary">📋 加载示例</button>
          <button @click="clearContent" class="btn-secondary">🗑️ 清空</button>
        </div>

        <div v-if="errorMessage" class="error-message">⚠️ {{ errorMessage }}</div>
      </div>
    </section>

    <!-- 编辑器和预览区域 -->
    <section class="editor-preview-section">
      <h3>{{ viewMode === 'edit' ? '✏️ 代码编辑器' : viewMode === 'preview' ? '👁️ 网页预览' : '🔧 编辑器 & 预览' }}</h3>
      
      <!-- 编辑模式 -->
      <div v-if="viewMode === 'edit'" class="edit-mode">
        <!-- 标签页切换 -->
        <div class="tab-switcher">
          <button 
            :class="['tab-btn', { active: activeTab === 'html' }]"
            @click="switchTab('html')"
          >
            <span class="tab-icon">🌐</span>
            <span>HTML</span>
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'css' }]"
            @click="switchTab('css')"
          >
            <span class="tab-icon">🎨</span>
            <span>CSS</span>
          </button>
        </div>

        <!-- HTML编辑器 -->
        <div v-if="activeTab === 'html'" class="editor-container">
          <textarea 
            v-model="htmlContent"
            @input="handleInput"
            placeholder="在此编辑HTML代码..."
            class="form-textarea"
            :style="{ fontSize: renderOptions.fontSize + 'px' }"
            rows="15"
          ></textarea>
        </div>

        <!-- CSS编辑器 -->
        <div v-if="activeTab === 'css'" class="editor-container">
          <textarea 
            v-model="cssContent"
            @input="handleInput"
            placeholder="在此编辑CSS样式..."
            class="form-textarea"
            :style="{ fontSize: renderOptions.fontSize + 'px' }"
            rows="15"
          ></textarea>
        </div>

        <div class="editor-actions">
          <button @click="refreshPreview" class="btn-primary">
            🔄 刷新预览
          </button>
          <button @click="downloadHTML" class="btn-secondary" :disabled="!htmlContent.trim()">
            💾 下载HTML
          </button>
          <button @click="downloadCSS" class="btn-secondary" :disabled="!cssContent.trim()">
            💾 下载CSS
          </button>
        </div>
      </div>

      <!-- 预览模式 -->
      <div v-if="viewMode === 'preview'" class="preview-mode">
        <div class="preview-container">
          <div class="preview-header">
            <h4>🌐 网页预览</h4>
            <button @click="refreshPreview" class="refresh-btn">🔄</button>
          </div>
          <iframe 
            ref="previewRef"
            class="preview-iframe"
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
        </div>
        
        <div class="preview-actions">
          <button @click="downloadHTML" class="btn-secondary" :disabled="!htmlContent.trim()">
            💾 下载HTML
          </button>
          <button @click="downloadCSS" class="btn-secondary" :disabled="!cssContent.trim()">
            💾 下载CSS
          </button>
        </div>
      </div>

      <!-- 分屏模式 -->
      <div v-if="viewMode === 'split'" class="split-mode">
        <div class="split-container">
          <div class="split-panel editor-panel">
            <!-- 标签页切换 -->
            <div class="tab-switcher">
              <button 
                :class="['tab-btn', { active: activeTab === 'html' }]"
                @click="switchTab('html')"
              >
                <span class="tab-icon">🌐</span>
                <span>HTML</span>
              </button>
              <button 
                :class="['tab-btn', { active: activeTab === 'css' }]"
                @click="switchTab('css')"
              >
                <span class="tab-icon">🎨</span>
                <span>CSS</span>
              </button>
            </div>

            <!-- HTML编辑器 -->
            <div v-if="activeTab === 'html'" class="editor-container">
              <textarea 
                v-model="htmlContent"
                @input="handleInput"
                placeholder="在此编辑HTML代码..."
                class="form-textarea split-textarea"
                :style="{ fontSize: renderOptions.fontSize + 'px' }"
                rows="12"
              ></textarea>
            </div>

            <!-- CSS编辑器 -->
            <div v-if="activeTab === 'css'" class="editor-container">
              <textarea 
                v-model="cssContent"
                @input="handleInput"
                placeholder="在此编辑CSS样式..."
                class="form-textarea split-textarea"
                :style="{ fontSize: renderOptions.fontSize + 'px' }"
                rows="12"
              ></textarea>
            </div>
          </div>
          
          <div class="split-panel preview-panel">
            <div class="preview-header">
              <h4>🌐 实时预览</h4>
              <button @click="refreshPreview" class="refresh-btn">🔄</button>
            </div>
            <iframe 
              ref="previewRef"
              class="preview-iframe split-iframe"
              sandbox="allow-scripts allow-same-origin"
            ></iframe>
          </div>
        </div>
        
        <div class="editor-actions">
          <button @click="refreshPreview" class="btn-primary">
            🔄 刷新预览
          </button>
          <button @click="downloadHTML" class="btn-secondary" :disabled="!htmlContent.trim()">
            💾 下载HTML
          </button>
          <button @click="downloadCSS" class="btn-secondary" :disabled="!cssContent.trim()">
            💾 下载CSS
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

.font-size-control, .theme-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.font-size-control select, .theme-control select {
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

/* 标签页切换器 */
.tab-switcher {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 0.25rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
}

.tab-btn:hover {
  background: var(--glass-bg);
}

.tab-btn.active {
  background: var(--text-accent);
  color: white;
}

.tab-icon {
  font-size: 1rem;
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
}

.form-textarea:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.split-textarea {
  min-height: 250px;
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

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

/* 预览相关 */
.preview-container {
  background: var(--glass-bg);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.preview-header h4 {
  margin: 0;
  color: var(--text-primary);
}

.refresh-btn {
  background: none;
  border: none;
  color: var(--text-accent);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: var(--glass-bg);
}

.preview-iframe {
  width: 100%;
  height: 500px;
  border: none;
  background: white;
}

.split-iframe {
  height: 400px;
}

/* 分屏模式 */
.split-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.split-panel {
  background: var(--glass-bg);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
}

.editor-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 1rem;
  height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 1rem;
  height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .mode-switcher {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .tab-switcher {
    flex-direction: column;
  }
  
  .split-container {
    grid-template-columns: 1fr;
  }
  
  .upload-actions, .editor-actions, .preview-actions {
    flex-direction: column;
  }
  
  .preview-iframe, .split-iframe {
    height: 300px;
  }
}

.options-form h3 {
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

.font-size-control, .theme-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
}

.font-size-control select, .theme-control select {
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

.tab-switcher {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 0.5rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.tab-btn:hover {
  background: var(--glass-hover);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--accent-color);
  color: white;
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

.preview-container {
  margin-bottom: 1rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--glass-border);
}

.preview-header h4 {
  margin: 0;
  color: var(--text-accent);
  font-size: 1rem;
}

.refresh-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: var(--glass-hover);
}

.preview-iframe {
  width: 100%;
  height: 400px;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  background: white;
}

.split-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.split-panel {
  min-height: 400px;
}

.split-textarea {
  height: 300px;
}

.split-iframe {
  height: 350px;
}

.editor-actions, .preview-actions {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .split-container {
    grid-template-columns: 1fr;
  }
  
  .mode-switcher {
    flex-direction: column;
  }
  
  .upload-actions, .editor-actions, .preview-actions {
    flex-direction: column;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .tab-switcher {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>