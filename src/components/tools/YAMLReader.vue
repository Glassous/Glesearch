<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 状态管理
const yamlContent = ref('')
const formattedContent = ref('')
const fileInputRef = ref(null)
const uploadedFileName = ref('')
const loading = ref(false)
const errorMessage = ref('')
const showOptions = ref(false)
const viewMode = ref('convert') // 'convert' | 'split'
const convertMode = ref('yaml') // 'yaml' | 'formatted' 转换模式下显示的内容类型

// YAML选项
const yamlOptions = ref({
  indent: 2,
  sortKeys: false,
  validateSyntax: true
})

// 格式化YAML
const formatYAML = async () => {
  if (!yamlContent.value.trim()) {
    formattedContent.value = ''
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    // 简单的YAML格式化处理
    const lines = yamlContent.value.split('\n')
    const formatted = lines.map(line => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return line
      
      // 处理键值对
      if (trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':')
        const value = valueParts.join(':').trim()
        const indentLevel = (line.length - line.trimStart().length) / yamlOptions.value.indent
        const indent = ' '.repeat(indentLevel * yamlOptions.value.indent)
        return `${indent}${key.trim()}: ${value}`
      }
      
      return line
    }).join('\n')
    
    formattedContent.value = formatted
  } catch (error) {
    console.error('YAML格式化失败:', error)
    errorMessage.value = 'YAML格式处理失败，请检查语法'
  } finally {
    loading.value = false
  }
}

// 文件上传
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const validExtensions = ['.yaml', '.yml']
  const isValidFile = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  
  if (!isValidFile) {
    errorMessage.value = '请选择.yaml或.yml文件'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    yamlContent.value = e.target.result
    uploadedFileName.value = file.name
    formatYAML()
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
  yamlContent.value = ''
  formattedContent.value = ''
  uploadedFileName.value = ''
  errorMessage.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// 下载文件
const downloadYAML = () => {
  if (!yamlContent.value.trim()) return
  const blob = new Blob([yamlContent.value], { type: 'text/yaml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = uploadedFileName.value || `yaml_${Date.now()}.yaml`
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
    clearTimeout(window.yamlFormatTimeout)
    window.yamlFormatTimeout = setTimeout(formatYAML, 300)
  }
}

// 转换模式输入处理
const handleConvertInput = (event) => {
  updateCurrentDisplayContent(event.target.value)
}

// 切换视图模式
const switchViewMode = (mode) => {
  viewMode.value = mode
  if (mode === 'split' && yamlContent.value.trim()) {
    formatYAML()
  }
}

// 切换转换模式显示内容
const switchConvertMode = (mode) => {
  convertMode.value = mode
}

// 获取当前显示的内容
const getCurrentDisplayContent = () => {
  if (convertMode.value === 'yaml') {
    return yamlContent.value
  } else {
    return formattedContent.value
  }
}

// 更新当前显示的内容
const updateCurrentDisplayContent = (value) => {
  if (convertMode.value === 'yaml') {
    yamlContent.value = value
  }
  // 格式化模式下不允许编辑
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
      <h2 class="page-title">YAML阅读器</h2>
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
        <h3>格式化选项</h3>
        <div class="options-grid">
          <label class="checkbox-label">
            <input v-model="yamlOptions.sortKeys" @change="formatYAML" type="checkbox">
            <span>排序键名</span>
          </label>
          <label class="checkbox-label">
            <input v-model="yamlOptions.validateSyntax" @change="formatYAML" type="checkbox">
            <span>语法验证</span>
          </label>
          <div class="indent-control">
            <label>缩进空格数：</label>
            <select v-model="yamlOptions.indent" @change="formatYAML">
              <option :value="2">2</option>
              <option :value="4">4</option>
              <option :value="8">8</option>
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
          <h4>点击上传YAML文件</h4>
          <p>支持.yaml/.yml格式</p>
          <p v-if="uploadedFileName" class="uploaded-file">已上传：{{ uploadedFileName }}</p>
        </div>
        
        <input 
          ref="fileInputRef"
          type="file" 
          accept=".yaml,.yml"
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
      <h3>✏️ {{ viewMode === 'split' ? 'YAML编辑器 & 预览' : 'YAML编辑器' }}</h3>
      
      <!-- 转换模式 -->
      <div v-if="viewMode === 'convert'" class="convert-mode">
        <div class="editor-form">
          <!-- 转换模式切换器 -->
          <div class="convert-switcher">
            <button 
              :class="['convert-btn', { active: convertMode === 'yaml' }]"
              @click="switchConvertMode('yaml')"
            >
              <span class="convert-icon">📝</span>
              <span>编辑模式</span>
            </button>
            <button 
              :class="['convert-btn', { active: convertMode === 'formatted' }]"
              @click="switchConvertMode('formatted')"
            >
              <span class="convert-icon">📄</span>
              <span>格式化预览</span>
            </button>
          </div>

          <textarea 
            :value="getCurrentDisplayContent()"
            @input="handleConvertInput"
            :placeholder="convertMode === 'yaml' ? '在此编辑YAML...' : 'YAML格式化显示区域'"
            :readonly="convertMode === 'formatted'"
            class="form-textarea"
            :class="{ 'readonly': convertMode === 'formatted' }"
            rows="12"
          ></textarea>

          <div class="editor-actions">
            <button @click="formatYAML" class="btn-primary" :disabled="loading">
              {{ loading ? '⏳ 处理中...' : '🔄 格式化' }}
            </button>
            <button @click="downloadYAML" class="btn-secondary" :disabled="!yamlContent.trim()">
              💾 下载
            </button>
          </div>
        </div>
      </div>

      <!-- 分屏模式 -->
      <div v-if="viewMode === 'split'" class="split-mode">
        <div class="split-container">
          <div class="split-panel">
            <h4>📝 编辑区</h4>
            <textarea 
              v-model="yamlContent"
              @input="handleInput"
              placeholder="在此编辑YAML..."
              class="form-textarea split-textarea"
              rows="12"
            ></textarea>
          </div>
          
          <div class="split-panel">
            <h4>📄 预览区</h4>
            <textarea 
              :value="formattedContent"
              placeholder="格式化后的YAML将在此显示..."
              class="form-textarea split-textarea readonly"
              readonly
              rows="12"
            ></textarea>
          </div>
        </div>
        
        <div class="editor-actions">
          <button @click="formatYAML" class="btn-primary" :disabled="loading">
            {{ loading ? '⏳ 处理中...' : '🔄 格式化' }}
          </button>
          <button @click="downloadYAML" class="btn-secondary" :disabled="!yamlContent.trim()">
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

.indent-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.indent-control select {
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
  overflow: hidden;
}

.editor-panel, .preview-panel {
  display: flex;
  flex-direction: column;
  height: 500px;
  overflow: hidden;
  min-width: 0;
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
  box-sizing: border-box;
  min-height: 0;
}

.preview-content {
  flex: 1;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0 0 8px 8px;
  border-top: none;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  min-height: 0;
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

/* YAML预览样式 */
.yaml-content {
  color: var(--text-primary);
  line-height: 1.6;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

@media (max-width: 768px) {
  .split-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .editor-panel, .preview-panel {
    height: 300px;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .mode-switcher {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .convert-switcher {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>