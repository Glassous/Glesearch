<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import QRCode from 'qrcode'

const router = useRouter()
const route = useRoute()

// 状态管理
const inputText = ref('')
const qrCodeDataURL = ref('')
const loading = ref(false)
const errorMessage = ref('')
const showOptions = ref(false)

// 二维码选项
const qrOptions = ref({
  width: 256,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  },
  errorCorrectionLevel: 'M'
})

// 预设模板
const presetTemplates = ref([
  {
    id: 'wifi',
    name: 'WiFi连接',
    icon: '📶',
    description: '生成WiFi连接二维码',
    template: 'WIFI:T:WPA;S:网络名称;P:密码;H:false;;'
  },
  {
    id: 'url',
    name: '网站链接',
    icon: '🔗',
    description: '生成网址二维码',
    template: 'https://'
  },
  {
    id: 'text',
    name: '纯文本',
    icon: '📝',
    description: '生成文本内容二维码',
    template: ''
  },
  {
    id: 'email',
    name: '邮件地址',
    icon: '📧',
    description: '生成邮件联系二维码',
    template: 'mailto:example@email.com'
  },
  {
    id: 'phone',
    name: '电话号码',
    icon: '📱',
    description: '生成电话拨号二维码',
    template: 'tel:+86'
  },
  {
    id: 'sms',
    name: '短信发送',
    icon: '💬',
    description: '生成短信发送二维码',
    template: 'sms:+86?body=短信内容'
  }
])

// 生成二维码
const generateQRCode = async () => {
  if (!inputText.value.trim()) {
    errorMessage.value = '请输入要生成二维码的内容'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const dataURL = await QRCode.toDataURL(inputText.value, qrOptions.value)
    qrCodeDataURL.value = dataURL
  } catch (error) {
    console.error('生成二维码失败:', error)
    errorMessage.value = '生成二维码失败，请检查输入内容'
  } finally {
    loading.value = false
  }
}

// 清除二维码
const clearQRCode = () => {
  inputText.value = ''
  qrCodeDataURL.value = ''
  errorMessage.value = ''
}

// 下载二维码
const downloadQRCode = () => {
  if (!qrCodeDataURL.value) return

  const link = document.createElement('a')
  link.download = `qrcode_${Date.now()}.png`
  link.href = qrCodeDataURL.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 使用模板
const useTemplate = (template) => {
  inputText.value = template.template
  if (template.template) {
    generateQRCode()
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
    router.push('/')
  }
}

// 监听输入变化自动生成
const handleInput = () => {
  if (inputText.value.trim()) {
    // 防抖处理
    clearTimeout(window.qrGenerateTimeout)
    window.qrGenerateTimeout = setTimeout(() => {
      generateQRCode()
    }, 500)
  } else {
    qrCodeDataURL.value = ''
    errorMessage.value = ''
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
      <h2 class="page-title">二维码生成</h2>
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
        <h3>二维码设置</h3>
        <div class="options-grid">
          <div class="form-group">
            <label>尺寸大小</label>
            <select v-model="qrOptions.width" class="form-input">
              <option value="128">128x128</option>
              <option value="256">256x256</option>
              <option value="512">512x512</option>
              <option value="1024">1024x1024</option>
            </select>
          </div>
          <div class="form-group">
            <label>边距</label>
            <select v-model="qrOptions.margin" class="form-input">
              <option value="1">小</option>
              <option value="2">中</option>
              <option value="4">大</option>
            </select>
          </div>
          <div class="form-group">
            <label>前景色</label>
            <input v-model="qrOptions.color.dark" type="color" class="color-input">
          </div>
          <div class="form-group">
            <label>背景色</label>
            <input v-model="qrOptions.color.light" type="color" class="color-input">
          </div>
        </div>
      </div>
    </div>

    <!-- 快速模板 -->
    <section class="templates-section">
      <h3>📋 快速模板</h3>
      <div class="templates-grid">
        <div 
          v-for="template in presetTemplates" 
          :key="template.id"
          class="template-card"
          @click="useTemplate(template)"
        >
          <div class="template-icon">{{ template.icon }}</div>
          <div class="template-info">
            <h4 class="template-name">{{ template.name }}</h4>
            <p class="template-description">{{ template.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 输入区域 -->
    <section class="input-section">
      <h3>📝 输入内容</h3>
      <div class="input-form">
        <div class="form-group">
          <label for="qr-input">要生成二维码的内容</label>
          <textarea 
            id="qr-input"
            v-model="inputText"
            @input="handleInput"
            placeholder="输入文本、网址、WiFi信息等内容..."
            class="form-textarea"
            rows="4"
          ></textarea>
        </div>
        
        <div class="input-actions">
          <button @click="generateQRCode" class="btn-primary" :disabled="loading || !inputText.trim()">
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else>🔲</span>
            {{ loading ? '生成中...' : '生成二维码' }}
          </button>
          <button @click="clearQRCode" class="btn-secondary">
            🗑️ 清空
          </button>
        </div>

        <div v-if="errorMessage" class="error-message">
          ⚠️ {{ errorMessage }}
        </div>
      </div>
    </section>

    <!-- 二维码显示区域 -->
    <section v-if="qrCodeDataURL" class="result-section">
      <h3>📱 生成结果</h3>
      <div class="qr-result">
        <div class="qr-display">
          <img :src="qrCodeDataURL" alt="生成的二维码" class="qr-image" />
        </div>
        <div class="qr-actions">
          <button @click="downloadQRCode" class="btn-primary">
            💾 下载二维码
          </button>
          <button @click="generateQRCode" class="btn-secondary">
            🔄 重新生成
          </button>
        </div>
        <div class="qr-info">
          <p><strong>内容：</strong>{{ inputText }}</p>
          <p><strong>尺寸：</strong>{{ qrOptions.width }}x{{ qrOptions.width }}px</p>
          <p><strong>格式：</strong>PNG</p>
        </div>
      </div>
    </section>

    <!-- 使用说明 -->
    <section class="tips-section">
      <h3>💡 使用说明</h3>
      <div class="tips-content">
        <div class="tip-item">
          <span class="tip-icon">🔗</span>
          <div class="tip-text">
            <h4>网址链接</h4>
            <p>直接输入 http:// 或 https:// 开头的完整网址</p>
          </div>
        </div>
        <div class="tip-item">
          <span class="tip-icon">📶</span>
          <div class="tip-text">
            <h4>WiFi连接</h4>
            <p>格式：WIFI:T:WPA;S:网络名称;P:密码;H:false;;</p>
          </div>
        </div>
        <div class="tip-item">
          <span class="tip-icon">📧</span>
          <div class="tip-text">
            <h4>邮件地址</h4>
            <p>格式：mailto:example@email.com</p>
          </div>
        </div>
        <div class="tip-item">
          <span class="tip-icon">📱</span>
          <div class="tip-text">
            <h4>电话号码</h4>
            <p>格式：tel:+8613800138000</p>
          </div>
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

.back-button, .options-button {
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

.back-button:hover, .options-button:hover {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transform: translateY(-1px);
}

.back-icon, .options-icon {
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

/* 选项设置区域 */
.options-section {
  margin-bottom: 2rem;
}

.options-form {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.options-form h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

/* 模板区域 */
.templates-section {
  margin-bottom: 2rem;
}

.templates-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.template-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px var(--glass-shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.template-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow-medium);
}

.template-icon {
  font-size: 2rem;
  min-width: 50px;
  text-align: center;
}

.template-info {
  flex: 1;
}

.template-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.template-description {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* 输入区域 */
.input-section {
  margin-bottom: 2rem;
}

.input-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.input-form {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.form-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.form-input {
  width: 100%;
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

.color-input {
  width: 100%;
  height: 40px;
  padding: 0.25rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  cursor: pointer;
}

.input-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
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

.btn-primary:disabled {
  background: var(--border-color);
  cursor: not-allowed;
  transform: none;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 结果区域 */
.result-section {
  margin-bottom: 2rem;
}

.result-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.qr-result {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
  text-align: center;
}

.qr-display {
  margin-bottom: 2rem;
}

.qr-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 16px var(--shadow-light);
}

.qr-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.qr-info {
  text-align: left;
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.qr-info p {
  margin: 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.qr-info strong {
  color: var(--text-primary);
}

/* 使用说明区域 */
.tips-section {
  margin-bottom: 2rem;
}

.tips-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.tips-content {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-icon {
  font-size: 1.5rem;
  min-width: 40px;
  text-align: center;
}

.tip-text h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.tip-text p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
  font-family: monospace;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .templates-grid {
    grid-template-columns: 1fr;
  }
  
  .template-card {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .options-form, .input-form, .qr-result, .tips-content {
    padding: 1.5rem;
  }
  
  .input-actions, .qr-actions {
    flex-direction: column;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.2rem;
  }
  
  .tip-item {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .tip-icon {
    min-width: auto;
  }
}
</style>