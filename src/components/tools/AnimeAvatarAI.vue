<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 动漫头像转换相关状态
const selectedFile = ref(null)
const imageUrl = ref('')
const previewUrl = ref('')
const isLoading = ref(false)
const result = ref(null)
const error = ref('')
const uploadMethod = ref('file') // 'file' 或 'url'

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    error.value = '请选择有效的图片文件'
    return
  }

  // 验证文件大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = '图片文件大小不能超过5MB'
    return
  }

  selectedFile.value = file
  error.value = ''
  result.value = null

  // 创建预览
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// 切换上传方式
const switchUploadMethod = (method) => {
  uploadMethod.value = method
  selectedFile.value = null
  imageUrl.value = ''
  previewUrl.value = ''
  error.value = ''
  result.value = null
}

// 处理图片URL输入
const handleUrlInput = () => {
  if (!imageUrl.value.trim()) {
    previewUrl.value = ''
    return
  }

  // 简单验证URL格式
  if (!imageUrl.value.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
    error.value = '请输入有效的图片链接'
    return
  }

  error.value = ''
  result.value = null
  previewUrl.value = imageUrl.value
}

// 转换为动漫头像
const convertToAnime = async () => {
  if (uploadMethod.value === 'file' && !selectedFile.value) {
    error.value = '请选择要转换的图片'
    return
  }

  if (uploadMethod.value === 'url' && !imageUrl.value.trim()) {
    error.value = '请输入图片链接'
    return
  }

  isLoading.value = true
  error.value = ''
  result.value = null

  try {
    let response
    
    if (uploadMethod.value === 'file') {
      // 使用FormData上传文件
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      
      response = await fetch('https://api.pearktrue.cn/api/imgtoanime/', {
        method: 'POST',
        body: formData
      })
    } else {
      // 使用JSON发送图片链接
      response = await fetch('https://api.pearktrue.cn/api/imgtoanime/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file: imageUrl.value
        })
      })
    }

    const data = await response.json()

    if (data.code === 200) {
      result.value = {
        originalUrl: previewUrl.value,
        animeUrl: data.imgurl,
        message: data.msg
      }
    } else {
      error.value = data.msg || '转换失败，请稍后重试'
    }
  } catch (err) {
    console.error('转换失败:', err)
    error.value = '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 下载转换后的图片
const downloadResult = () => {
  if (result.value?.animeUrl) {
    const link = document.createElement('a')
    link.href = result.value.animeUrl
    link.download = `anime_avatar_${Date.now()}.jpg`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// 清空结果
const clearResult = () => {
  result.value = null
  error.value = ''
  selectedFile.value = null
  imageUrl.value = ''
  previewUrl.value = ''
}

// 处理键盘事件
const handleKeyPress = (event) => {
  if (event.key === 'Enter' && uploadMethod.value === 'url') {
    convertToAnime()
  }
}

// 返回主页
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
</script>

<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">动漫头像AI转换</h2>
      <button class="clear-button" @click="clearResult" v-if="result">
        <span class="clear-icon">✕</span>
      </button>
      <div v-else style="width: 40px;"></div>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 转换表单区域 -->
    <section class="convert-section">
      <div class="convert-form">
        <h3>🎨 动漫头像AI转换</h3>
        <p class="description">上传照片或输入图片链接，AI将为您生成精美的动漫风格头像</p>
        
        <!-- 上传方式选择 -->
        <div class="upload-method-selector">
          <button 
            @click="switchUploadMethod('file')"
            class="method-button"
            :class="{ active: uploadMethod === 'file' }"
          >
            <span class="method-icon">📁</span>
            上传文件
          </button>
          <button 
            @click="switchUploadMethod('url')"
            class="method-button"
            :class="{ active: uploadMethod === 'url' }"
          >
            <span class="method-icon">🔗</span>
            图片链接
          </button>
        </div>

        <!-- 文件上传 -->
        <div v-if="uploadMethod === 'file'" class="form-group">
          <label>选择图片文件</label>
          <div class="file-upload-area">
            <input 
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              class="file-input"
              id="fileInput"
            />
            <label for="fileInput" class="file-upload-label">
              <span class="upload-icon">📸</span>
              <span class="upload-text">
                {{ selectedFile ? selectedFile.name : '点击选择图片文件' }}
              </span>
              <span class="upload-hint">支持 JPG、PNG、GIF、WebP，最大5MB</span>
            </label>
          </div>
        </div>

        <!-- URL输入 -->
        <div v-if="uploadMethod === 'url'" class="form-group">
          <label>图片链接</label>
          <div class="input-group">
            <input 
              v-model="imageUrl"
              type="url" 
              placeholder="请输入图片链接（如：https://example.com/image.jpg）"
              class="form-input"
              @input="handleUrlInput"
              @keypress="handleKeyPress"
              :disabled="isLoading"
            />
            <button 
              @click="convertToAnime"
              class="convert-button"
              :disabled="isLoading || (!selectedFile && !imageUrl.trim())"
            >
              <span v-if="isLoading" class="loading-spinner"></span>
              <span v-else>🎨</span>
              {{ isLoading ? '转换中...' : '转换' }}
            </button>
          </div>
        </div>

        <!-- 文件上传时的转换按钮 -->
        <div v-if="uploadMethod === 'file' && selectedFile" class="convert-action">
          <button 
            @click="convertToAnime"
            class="convert-button-large"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <span v-else>🎨</span>
            {{ isLoading ? '转换中...' : '开始AI转换' }}
          </button>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ error }}
        </div>

        <!-- 图片预览 -->
        <div v-if="previewUrl" class="preview-section">
          <h4>📷 原始图片预览</h4>
          <div class="preview-container">
            <img :src="previewUrl" alt="原始图片" class="preview-image" />
          </div>
        </div>
      </div>
    </section>

    <!-- 转换结果区域 -->
    <section v-if="result" class="result-section">
      <div class="result-card">
        <h3>✨ 转换完成</h3>
        
        <!-- 对比展示 -->
        <div class="comparison-view">
          <div class="image-comparison">
            <div class="comparison-item">
              <h4>原始图片</h4>
              <div class="image-container">
                <img :src="result.originalUrl" alt="原始图片" class="comparison-image" />
              </div>
            </div>
            
            <div class="arrow-separator">
              <span class="arrow">→</span>
            </div>
            
            <div class="comparison-item">
              <h4>动漫风格</h4>
              <div class="image-container">
                <img :src="result.animeUrl" alt="动漫头像" class="comparison-image" />
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="result-actions">
          <button @click="downloadResult" class="download-btn">
            <span class="btn-icon">💾</span>
            <div class="btn-content">
              <span class="btn-title">下载动漫头像</span>
              <span class="btn-desc">保存到本地</span>
            </div>
          </button>
          
          <a 
            :href="result.animeUrl" 
            target="_blank"
            class="download-btn view-btn"
          >
            <span class="btn-icon">👁️</span>
            <div class="btn-content">
              <span class="btn-title">查看大图</span>
              <span class="btn-desc">新窗口打开</span>
            </div>
          </a>
        </div>

        <!-- 转换信息 -->
        <div v-if="result.message" class="convert-info">
          <p><strong>转换状态：</strong>{{ result.message }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

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

.back-button, .clear-button {
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

.back-button:hover, .clear-button:hover {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transform: translateY(-1px);
}

.back-icon, .clear-icon {
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

/* 主要内容区域 */
.main-content {
  margin-top: 60px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 60px);
  width: 100%;
}

/* 转换表单区域 */
.convert-section {
  margin-bottom: 2rem;
}

.convert-form {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.convert-form h3 {
  color: var(--text-accent);
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  line-height: 1.4;
}

/* 上传方式选择器 */
.upload-method-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.25rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.method-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-secondary);
  font-weight: 500;
}

.method-button.active {
  background: var(--text-accent);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.method-button:hover:not(.active) {
  background: var(--glass-bg);
  color: var(--text-primary);
}

.method-icon {
  font-size: 1.1rem;
}

/* 表单组 */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

/* 文件上传区域 */
.file-upload-area {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.file-upload-label:hover {
  border-color: var(--text-accent);
  background: var(--glass-bg);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.upload-text {
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.upload-hint {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

/* 输入组 */
.input-group {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.form-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* 转换按钮 */
.convert-button, .convert-button-large {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--text-accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.convert-button-large {
  width: 100%;
  justify-content: center;
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.convert-button:hover:not(:disabled), 
.convert-button-large:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.convert-button:disabled, 
.convert-button-large:disabled {
  background: var(--border-color);
  cursor: not-allowed;
  transform: none;
}

.convert-action {
  margin-top: 1rem;
}

/* 加载动画 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误提示 */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.error-icon {
  font-size: 1rem;
}

/* 预览区域 */
.preview-section {
  margin-top: 1.5rem;
}

.preview-section h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1rem;
}

.preview-container {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* 结果区域 */
.result-section {
  animation: slideInUp 0.5s ease;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.result-card h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

/* 对比展示 */
.comparison-view {
  margin-bottom: 2rem;
}

.image-comparison {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.comparison-item {
  flex: 1;
  text-align: center;
}

.comparison-item h4 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 500;
}

.image-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.comparison-image {
  width: 100%;
  max-width: 200px;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.comparison-image:hover {
  transform: scale(1.05);
}

.arrow-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
}

.arrow {
  font-size: 2rem;
  color: var(--text-accent);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* 操作按钮 */
.result-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--glass-bg);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--glass-shadow);
  border-color: var(--text-accent);
}

.view-btn:hover {
  background: rgba(0, 123, 255, 0.1);
}

.btn-icon {
  font-size: 2rem;
  line-height: 1;
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.btn-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.btn-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* 转换信息 */
.convert-info {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.convert-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.convert-info strong {
  color: var(--text-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .convert-form {
    padding: 1.5rem;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .image-comparison {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .arrow-separator {
    transform: rotate(90deg);
  }
  
  .result-actions {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.2rem;
  }
  
  .convert-form {
    padding: 1rem;
  }
  
  .result-card {
    padding: 1.5rem;
  }
  
  .comparison-image {
    max-width: 150px;
    height: 150px;
  }
}
</style>