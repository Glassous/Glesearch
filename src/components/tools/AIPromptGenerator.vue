<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const router = useRouter()
const route = useRoute()

// 配置marked
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    return hljs.highlight(code, { language }).value
  },
  langPrefix: 'hljs language-',
  breaks: true,
  gfm: true
})

// 状态管理
const selectedTemplate = ref(null)
const customParameters = ref({})
const userRequirements = ref('')
const generatedPrompt = ref('')
const showCustomTemplate = ref(false)
const loading = ref(false)
const aiEnhancing = ref(false)
const errorMessage = ref('')
const showMarkdown = ref(true) // 默认显示Markdown渲染模式

// 保存功能相关状态
const savedPrompts = ref([])
const showSaveDialog = ref(false)
const showManageDialog = ref(false)
const showDetailDialog = ref(false)
const currentDetailItem = ref(null)
const saveTitle = ref('')


// 自定义模板
const customTemplate = ref({
  name: '',
  description: '',
  icon: '🎯',
  template: '',
  parameters: []
})

// 预设模板
const promptTemplates = ref([
  {
    id: 'programming',
    category: 'programming',
    name: '编程助手',
    icon: '💻',
    description: '生成编程相关提示词',
    template: `你是一位专业的{language}开发专家。请帮我{task}。

要求：
- 代码风格：{style}
- 复杂度：{complexity}
- 包含注释：{comments}

{userRequirements}

请提供详细解决方案和最佳实践。`,
    parameters: [
      { key: 'language', label: '编程语言', type: 'text', placeholder: '例如：JavaScript', default: '' },
      { key: 'task', label: '任务描述', type: 'text', placeholder: '例如：开发登录系统', default: '' },
      { key: 'style', label: '代码风格', type: 'text', placeholder: '例如：简洁明了', default: '' },
      { key: 'complexity', label: '复杂度', type: 'text', placeholder: '例如：中级', default: '' },
      { key: 'comments', label: '包含注释', type: 'text', placeholder: '例如：是', default: '' }
    ]
  },
  {
    id: 'video-script',
    category: 'video',
    name: '视频脚本',
    icon: '🎬',
    description: '生成视频内容脚本',
    template: `请为我创作关于{topic}的{videoType}视频脚本。

视频信息：
- 时长：{duration}分钟
- 目标观众：{audience}
- 风格：{tone}
- 平台：{platform}

{userRequirements}

请提供完整脚本，包括开头、主体内容和结尾。`,
    parameters: [
      { key: 'topic', label: '视频主题', type: 'text', placeholder: '例如：健康生活', default: '' },
      { key: 'videoType', label: '视频类型', type: 'text', placeholder: '例如：教程', default: '' },
      { key: 'duration', label: '时长', type: 'text', placeholder: '例如：5-10分钟', default: '' },
      { key: 'audience', label: '目标观众', type: 'text', placeholder: '例如：年轻人', default: '' },
      { key: 'tone', label: '风格', type: 'text', placeholder: '例如：轻松', default: '' },
      { key: 'platform', label: '平台', type: 'text', placeholder: '例如：B站', default: '' }
    ]
  },
  {
    id: 'image-ai',
    category: 'image',
    name: '图片生成',
    icon: '🎨',
    description: 'AI绘画提示词',
    template: `Create a {imageType} of {subject}.

Style: {style}
Mood: {mood}
Colors: {colors}
Quality: {quality}
Lighting: {lighting}

{userRequirements}

Technical: {resolution}, {medium}`,
    parameters: [
      { key: 'imageType', label: '图片类型', type: 'text', placeholder: '例如：digital art', default: '' },
      { key: 'subject', label: '主题', type: 'text', placeholder: '例如：mountain landscape', default: '' },
      { key: 'style', label: '风格', type: 'text', placeholder: '例如：realistic', default: '' },
      { key: 'mood', label: '氛围', type: 'text', placeholder: '例如：peaceful', default: '' },
      { key: 'colors', label: '色彩', type: 'text', placeholder: '例如：warm', default: '' },
      { key: 'quality', label: '质量', type: 'text', placeholder: '例如：ultra detailed', default: '' },
      { key: 'lighting', label: '光照', type: 'text', placeholder: '例如：natural', default: '' },
      { key: 'resolution', label: '分辨率', type: 'text', placeholder: '例如：1024x1024', default: '' },
      { key: 'medium', label: '媒介', type: 'text', placeholder: '例如：digital', default: '' }
    ]
  },
  {
    id: 'writing',
    category: 'writing',
    name: '写作助手',
    icon: '✍️',
    description: '写作提示词生成',
    template: `请帮我创作关于{topic}的{contentType}。

要求：
- 字数：{wordCount}字
- 风格：{style}
- 读者：{audience}
- 语调：{tone}

{userRequirements}

请确保内容逻辑清晰，语言{style}。`,
    parameters: [
      { key: 'topic', label: '主题', type: 'text', placeholder: '例如：人工智能', default: '' },
      { key: 'contentType', label: '类型', type: 'text', placeholder: '例如：文章', default: '' },
      { key: 'wordCount', label: '字数', type: 'text', placeholder: '例如：1000-2000', default: '' },
      { key: 'style', label: '风格', type: 'text', placeholder: '例如：简洁', default: '' },
      { key: 'audience', label: '读者', type: 'text', placeholder: '例如：普通大众', default: '' },
      { key: 'tone', label: '语调', type: 'text', placeholder: '例如：客观', default: '' }
    ]
  }
])

// 分类
const templateCategories = ref([
  { id: 'all', name: '全部', icon: '🌟' },
  { id: 'programming', name: '编程', icon: '💻' },
  { id: 'video', name: '视频', icon: '🎬' },
  { id: 'image', name: '图片', icon: '🎨' },
  { id: 'writing', name: '写作', icon: '✍️' },
  { id: 'custom', name: '自定义', icon: '🎯' }
])

const activeCategory = ref('all')

const filteredTemplates = computed(() => {
  if (activeCategory.value === 'all') {
    return promptTemplates.value
  }
  return promptTemplates.value.filter(template => template.category === activeCategory.value)
})

// 生成提示词
const generatePrompt = () => {
  if (!selectedTemplate.value) return
  
  loading.value = true
  let prompt = selectedTemplate.value.template
  
  selectedTemplate.value.parameters.forEach(param => {
    const value = customParameters.value[param.key] || param.default || ''
    prompt = prompt.replace(new RegExp(`{${param.key}}`, 'g'), value)
  })
  
  // 处理用户具体需求
  const userReq = userRequirements.value.trim()
  if (userReq) {
    prompt = prompt.replace('{userRequirements}', `用户具体需求：\n${userReq}`)
  } else {
    prompt = prompt.replace('{userRequirements}', '')
  }
  
  generatedPrompt.value = prompt
  loading.value = false
}

// 选择模板
const selectTemplate = (template) => {
  selectedTemplate.value = template
  customParameters.value = {}
  template.parameters.forEach(param => {
    customParameters.value[param.key] = param.default || ''
  })
  generatePrompt()
}

// 复制提示词
const copyPrompt = async () => {
  if (!generatedPrompt.value) return
  try {
    await navigator.clipboard.writeText(generatedPrompt.value)
    const button = document.querySelector('.copy-button')
    const originalText = button.textContent
    button.textContent = '✅ 已复制'
    setTimeout(() => { button.textContent = originalText }, 2000)
  } catch (error) {
    errorMessage.value = '复制失败'
  }
}

// Markdown渲染
const renderedMarkdown = computed(() => {
  if (!generatedPrompt.value || !showMarkdown.value) return ''
  try {
    return marked(generatedPrompt.value)
  } catch (error) {
    console.error('Markdown渲染失败:', error)
    return generatedPrompt.value
  }
})

// 切换显示模式
const toggleDisplayMode = () => {
  showMarkdown.value = !showMarkdown.value
}

// 保存功能
const openSaveDialog = () => {
  if (!selectedTemplate.value || !generatedPrompt.value) {
    errorMessage.value = '请先生成提示词后再保存'
    return
  }
  saveTitle.value = ''
  showSaveDialog.value = true
}

const savePrompt = () => {
  if (!saveTitle.value.trim()) {
    errorMessage.value = '请输入保存标题'
    return
  }
  
  const saveData = {
    id: Date.now().toString(),
    title: saveTitle.value.trim(),
    template: {
      id: selectedTemplate.value.id,
      name: selectedTemplate.value.name,
      icon: selectedTemplate.value.icon
    },
    parameters: { ...customParameters.value },
    requirements: userRequirements.value,
    result: generatedPrompt.value,
    createdAt: new Date().toLocaleString('zh-CN'),
    timestamp: Date.now()
  }
  
  savedPrompts.value.unshift(saveData)
  localStorage.setItem('ai-prompt-saves', JSON.stringify(savedPrompts.value))
  
  showSaveDialog.value = false
  saveTitle.value = ''
  
  // 显示成功提示
  const originalError = errorMessage.value
  errorMessage.value = '✅ 保存成功'
  setTimeout(() => {
    if (errorMessage.value === '✅ 保存成功') {
      errorMessage.value = originalError
    }
  }, 2000)
}

// 管理保存的提示词
const openManageDialog = () => {
  showManageDialog.value = true
}

const deletePrompt = (id) => {
  const index = savedPrompts.value.findIndex(item => item.id === id)
  if (index > -1) {
    savedPrompts.value.splice(index, 1)
    localStorage.setItem('ai-prompt-saves', JSON.stringify(savedPrompts.value))
  }
}

const showDetail = (item) => {
  currentDetailItem.value = item
  showDetailDialog.value = true
}

const loadSavedPrompt = (item) => {
  // 找到对应的模板
  const template = promptTemplates.value.find(t => t.id === item.template.id)
  if (template) {
    selectTemplate(template)
    // 加载参数
    customParameters.value = { ...item.parameters }
    userRequirements.value = item.requirements
    generatedPrompt.value = item.result
    
    showManageDialog.value = false
    showDetailDialog.value = false
    
    // 显示成功提示
    const originalError = errorMessage.value
    errorMessage.value = '✅ 加载成功'
    setTimeout(() => {
      if (errorMessage.value === '✅ 加载成功') {
        errorMessage.value = originalError
      }
    }, 2000)
  }
}

// 初始化加载保存的数据
const loadSavedData = () => {
  try {
    const saved = localStorage.getItem('ai-prompt-saves')
    if (saved) {
      savedPrompts.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载保存数据失败:', error)
  }
}

// 组件初始化
onMounted(() => {
  loadSavedData()
})

// 自定义模板
const saveCustomTemplate = () => {
  if (!customTemplate.value.name || !customTemplate.value.template) {
    errorMessage.value = '请填写模板名称和内容'
    return
  }
  
  const newTemplate = {
    id: `custom_${Date.now()}`,
    category: 'custom',
    ...customTemplate.value,
    parameters: [...customTemplate.value.parameters]
  }
  
  promptTemplates.value.push(newTemplate)
  customTemplate.value = { name: '', description: '', icon: '🎯', template: '', parameters: [] }
  showCustomTemplate.value = false
  activeCategory.value = 'custom'
}

const addCustomParameter = () => {
  customTemplate.value.parameters.push({
    key: '', label: '', type: 'text', default: '', placeholder: ''
  })
}

const removeCustomParameter = (index) => {
  customTemplate.value.parameters.splice(index, 1)
}

const goBack = () => {
  const from = route.query.from
  if (from === 'tools') {
    router.push('/tools')
  } else {
    router.push('/')
  }
}

// AI超级增强功能
const superEnhancePrompt = async () => {
  if (!selectedTemplate.value) {
    errorMessage.value = '请先选择一个模板'
    return
  }

  // 构建提问内容
  const templateInfo = `模板类型：${selectedTemplate.value.name}`
  const parameterInfo = selectedTemplate.value.parameters.map(param => {
    const value = customParameters.value[param.key] || '未填写'
    return `${param.label}：${value}`
  }).join('\n')
  
  const userReq = userRequirements.value.trim() || '无特殊需求'
  
  const questionContent = `请帮我优化和增强以下提示词的内容：

${templateInfo}

参数信息：
${parameterInfo}

用户具体需求：
${userReq}

原始提示词：
${generatedPrompt.value}`

  const systemPrompt = '你是一个专业的AI提示词优化师。你的任务是帮助用户生成更加精准、详细和高效的AI提示词。请根据用户提供的模板信息、参数设置和具体需求，生成一个更加专业、全面和有效的提示词。请直接返回优化后的提示词内容，不需要附加说明。'

  aiEnhancing.value = true
  errorMessage.value = ''

  try {
    const apiUrl = `https://api.jkyai.top/API/gemini2.5.php?question=${encodeURIComponent(questionContent)}&system=${encodeURIComponent(systemPrompt)}`
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`)
    }
    
    // 先获取文本内容
    const responseText = await response.text()
    console.log('API响应文本:', responseText)
    
    // 尝试解析JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (jsonError) {
      // 如果JSON解析失败，可能是直接返回的文本内容
      console.log('JSON解析失败，尝试直接使用响应文本')
      if (responseText && responseText.trim()) {
        generatedPrompt.value = responseText.trim()
        return
      } else {
        throw new Error('API返回空内容')
      }
    }
    
    // 处理正常的JSON响应
    if (data.code === 200 && data.data) {
      generatedPrompt.value = data.data.trim()
    } else {
      throw new Error(data.msg || 'API返回错误')
    }
  } catch (error) {
    console.error('AI增强失败:', error)
    errorMessage.value = `AI增强失败：${error.message}`
  } finally {
    aiEnhancing.value = false
  }
}

const updatePrompt = () => {
  if (selectedTemplate.value) generatePrompt()
}
</script>

<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">AI提示词生成器</h2>
      <button class="manage-button" @click="openManageDialog" :title="`已保存${savedPrompts.length}个提示词`">
        <span class="manage-icon">📋</span>
        <span v-if="savedPrompts.length > 0" class="save-count">{{ savedPrompts.length }}</span>
      </button>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 分类选择 -->
    <section class="category-section">
      <h3>🏷️ 模板分类</h3>
      <div class="category-tabs">
        <button 
          v-for="category in templateCategories"
          :key="category.id"
          class="category-tab"
          :class="{ active: activeCategory === category.id }"
          @click="activeCategory = category.id"
        >
          {{ category.icon }} {{ category.name }}
        </button>
      </div>
    </section>

    <!-- 模板选择 -->
    <section class="templates-section">
      <div class="section-header">
        <h3>📋 选择模板</h3>
        <button class="btn-secondary" @click="showCustomTemplate = true">
          ➕ 自定义模板
        </button>
      </div>
      
      <div class="templates-grid">
        <div 
          v-for="template in filteredTemplates" 
          :key="template.id"
          class="template-card"
          :class="{ selected: selectedTemplate?.id === template.id }"
          @click="selectTemplate(template)"
        >
          <div class="template-icon">{{ template.icon }}</div>
          <div class="template-info">
            <h4>{{ template.name }}</h4>
            <p>{{ template.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 参数配置 -->
    <section v-if="selectedTemplate" class="parameters-section">
      <h3>⚙️ 参数配置</h3>
      <div class="parameters-form">
        <div v-for="param in selectedTemplate.parameters" :key="param.key" class="parameter-item">
          <label>{{ param.label }}</label>
          <input 
            v-model="customParameters[param.key]"
            @input="updatePrompt"
            :placeholder="param.placeholder"
            class="parameter-input"
          />
        </div>
        <div class="parameter-actions">
          <button @click="generatePrompt" class="btn-primary" :disabled="loading">
            {{ loading ? '生成中...' : '🔄 重新生成' }}
          </button>
        </div>
      </div>
    </section>



    <!-- 用户具体需求 -->
    <section v-if="selectedTemplate" class="requirements-section">
      <h3>📝 用户具体需求</h3>
      <div class="requirements-form">
        <div class="form-group">
          <label>请详细描述您的具体需求和期望</label>
          <textarea 
            v-model="userRequirements"
            @input="updatePrompt"
            placeholder="例如：需要包含实际代码示例、性能优化建议、具体的技术细节..."
            class="requirements-textarea"
            rows="4"
          ></textarea>
          <div class="requirements-tips">
            <p>💡 提示：越详细的需求描述，生成的提示词越精准</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 生成结果 -->
    <section v-if="generatedPrompt" class="result-section">
      <h3>✨ 生成结果</h3>
      <div class="result-container">
        <div class="display-mode-toggle">
          <button 
            @click="toggleDisplayMode" 
            class="mode-toggle-btn"
            :class="{ active: showMarkdown }"
          >
            <span v-if="showMarkdown">📝 Markdown</span>
            <span v-else>📜 原始文本</span>
          </button>
        </div>
        
        <div class="prompt-display">
          <!-- Markdown渲染模式 -->
          <div 
            v-if="showMarkdown" 
            v-html="renderedMarkdown" 
            class="markdown-content"
          ></div>
          
          <!-- 原始文本模式 -->
          <pre v-else class="raw-text">{{ generatedPrompt }}</pre>
        </div>
        
        <div class="result-actions">
          <button @click="copyPrompt" class="btn-primary copy-button">📋 复制</button>
          <button @click="generatePrompt" class="btn-secondary">🔄 重新生成</button>
          <button @click="openSaveDialog" class="btn-secondary">💾 保存</button>
          <button 
            @click="superEnhancePrompt" 
            class="btn-enhance" 
            :disabled="aiEnhancing || !generatedPrompt.trim()"
            v-show="generatedPrompt.trim()"
          >
            <span v-if="aiEnhancing" class="loading-spinner"></span>
            <span v-else>✨</span>
            {{ aiEnhancing ? 'AI处理中...' : 'AI增强' }}
          </button>
        </div>
      </div>
    </section>

    <!-- 自定义模板弹窗 -->
    <div v-if="showCustomTemplate" class="modal-overlay" @click.self="showCustomTemplate = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>🎯 创建自定义模板</h3>
          <button @click="showCustomTemplate = false" class="modal-close">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>模板名称</label>
            <input v-model="customTemplate.name" placeholder="模板名称" class="form-input">
          </div>
          
          <div class="form-group">
            <label>模板描述</label>
            <input v-model="customTemplate.description" placeholder="模板描述" class="form-input">
          </div>
          
          <div class="form-group">
            <label>模板内容 (使用 {参数名} 占位符)</label>
            <textarea v-model="customTemplate.template" placeholder="请帮我{任务}..." class="form-textarea" rows="6"></textarea>
          </div>
          
          <div class="form-group">
            <div class="parameters-header">
              <label>参数设置</label>
              <button @click="addCustomParameter" class="btn-small">➕ 添加</button>
            </div>
            
            <div v-for="(param, index) in customTemplate.parameters" :key="index" class="custom-parameter">
              <div class="parameter-row">
                <input v-model="param.key" placeholder="参数名" class="param-input">
                <input v-model="param.label" placeholder="显示名" class="param-input">
                <select v-model="param.type" class="param-select">
                  <option value="text">文本</option>
                  <option value="select">选择</option>
                </select>
                <button @click="removeCustomParameter(index)" class="btn-remove">🗑️</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="saveCustomTemplate" class="btn-primary">💾 保存</button>
          <button @click="showCustomTemplate = false" class="btn-secondary">取消</button>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="error-message">
      ⚠️ {{ errorMessage }}
      <button @click="errorMessage = ''" class="error-close">×</button>
    </div>

    <!-- 保存对话框 -->
    <div v-if="showSaveDialog" class="modal-overlay" @click.self="showSaveDialog = false">
      <div class="modal-content save-modal">
        <div class="modal-header">
          <h3>💾 保存提示词</h3>
          <button @click="showSaveDialog = false" class="modal-close">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>保存标题</label>
            <input 
              v-model="saveTitle" 
              placeholder="请输入保存标题..."
              class="form-input" 
              @keyup.enter="savePrompt"
              autofocus
            >
          </div>
          
          <div class="save-preview">
            <div class="preview-item">
              <strong>模板：</strong>{{ selectedTemplate?.name }}
            </div>
            <div class="preview-item">
              <strong>参数数量：</strong>{{ Object.keys(customParameters).length }}个
            </div>
            <div class="preview-item">
              <strong>结果长度：</strong>{{ generatedPrompt?.length || 0 }}字符
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="savePrompt" class="btn-primary">💾 保存</button>
          <button @click="showSaveDialog = false" class="btn-secondary">取消</button>
        </div>
      </div>
    </div>

    <!-- 管理对话框 -->
    <div v-if="showManageDialog" class="modal-overlay" @click.self="showManageDialog = false">
      <div class="modal-content manage-modal">
        <div class="modal-header">
          <h3>📋 保存管理 ({{ savedPrompts.length }})</h3>
          <button @click="showManageDialog = false" class="modal-close">×</button>
        </div>
        
        <div class="modal-body">
          <div v-if="savedPrompts.length === 0" class="empty-state">
            <div class="empty-icon">📄</div>
            <p>暂无保存的提示词</p>
            <p class="empty-tip">生成提示词后点击“保存”按钮即可保存</p>
          </div>
          
          <div v-else class="saved-list">
            <div 
              v-for="item in savedPrompts" 
              :key="item.id"
              class="saved-item"
              @click="showDetail(item)"
            >
              <div class="saved-header">
                <div class="saved-title">
                  <span class="template-icon">{{ item.template.icon }}</span>
                  {{ item.title }}
                </div>
                <div class="saved-actions">
                  <button 
                    @click.stop="loadSavedPrompt(item)" 
                    class="action-btn load-btn"
                    title="加载到编辑器"
                  >
                    🔄
                  </button>
                  <button 
                    @click.stop="deletePrompt(item.id)" 
                    class="action-btn delete-btn"
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div class="saved-meta">
                <span class="meta-item">
                  <span class="meta-label">模板：</span>
                  {{ item.template.name }}
                </span>
                <span class="meta-item">
                  <span class="meta-label">时间：</span>
                  {{ item.createdAt }}
                </span>
              </div>
              
              <div class="saved-preview">
                <div class="preview-text">{{ item.result.substring(0, 100) }}{{ item.result.length > 100 ? '...' : '' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情对话框 -->
    <div v-if="showDetailDialog && currentDetailItem" class="modal-overlay" @click.self="showDetailDialog = false">
      <div class="modal-content detail-modal">
        <div class="modal-header">
          <h3>🔍 {{ currentDetailItem.title }}</h3>
          <button @click="showDetailDialog = false" class="modal-close">×</button>
        </div>
        
        <div class="modal-body">
          <div class="detail-section">
            <h4>📝 模板信息</h4>
            <div class="detail-content">
              <p><strong>模板名称：</strong>{{ currentDetailItem.template.icon }} {{ currentDetailItem.template.name }}</p>
              <p><strong>创建时间：</strong>{{ currentDetailItem.createdAt }}</p>
            </div>
          </div>
          
          <div v-if="Object.keys(currentDetailItem.parameters).length > 0" class="detail-section">
            <h4>⚙️ 参数配置</h4>
            <div class="detail-content">
              <div v-for="(value, key) in currentDetailItem.parameters" :key="key" class="param-item">
                <strong>{{ key }}:</strong> {{ value || '（未填写）' }}
              </div>
            </div>
          </div>
          
          <div v-if="currentDetailItem.requirements" class="detail-section">
            <h4>📝 用户需求</h4>
            <div class="detail-content">
              <div class="requirements-text">{{ currentDetailItem.requirements }}</div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>✨ 生成结果</h4>
            <div class="detail-content">
              <div class="result-text">{{ currentDetailItem.result }}</div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="loadSavedPrompt(currentDetailItem)" class="btn-primary">🔄 加载到编辑器</button>
          <button @click="showDetailDialog = false" class="btn-secondary">关闭</button>
        </div>
      </div>
    </div>
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

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-accent);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.manage-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-accent);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  position: relative;
  transition: all 0.3s ease;
}

.manage-button:hover {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transform: translateY(-1px);
}

.manage-icon {
  font-size: 1.5rem;
}

.save-count {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--text-accent);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
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

.placeholder {
  width: 40px;
}

.main-content {
  margin-top: 60px;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 60px);
}

/* 分类选择 */
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.category-tab {
  padding: 0.75rem 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-tab:hover, .category-tab.active {
  border-color: var(--text-accent);
  background: var(--text-accent);
  color: white;
}

/* 模板样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
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

.template-card:hover, .template-card.selected {
  border-color: var(--text-accent);
  transform: translateY(-2px);
}

.template-card.selected {
  background: rgba(102, 126, 234, 0.1);
}

.template-icon {
  font-size: 2rem;
  min-width: 50px;
}

/* 表单样式 */
.parameters-form, .requirements-form, .super-enhance-form, .result-container {
  background: var(--glass-bg);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.parameter-item {
  margin-bottom: 1rem;
}

.parameter-item label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.parameter-input, .form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.requirements-textarea {
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
}

.requirements-textarea:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.requirements-tips {
  margin-top: 0.5rem;
}

.requirements-tips p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-style: italic;
}

.form-textarea {
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: 'Consolas', monospace;
  resize: vertical;
}

/* 按钮样式 */
.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 1rem;
}

.btn-primary {
  background: var(--text-accent);
  color: white;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-enhance {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  margin-right: 1rem;
}

.btn-enhance:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-enhance:disabled {
  background: var(--border-color);
  cursor: not-allowed;
  transform: none;
}

.parameter-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background: var(--text-accent);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-remove {
  padding: 0.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 预览区域 */
.prompt-display {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  max-height: 500px;
  overflow-y: auto;
}

.prompt-display pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: 'Consolas', monospace;
  line-height: 1.5;
}

/* Markdown渲染样式 */
.markdown-content {
  color: var(--text-primary);
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  color: var(--text-accent);
  margin: 1.5rem 0 1rem 0;
  font-weight: 600;
}

.markdown-content h1 { font-size: 2rem; }
.markdown-content h2 { font-size: 1.75rem; }
.markdown-content h3 { font-size: 1.5rem; }
.markdown-content h4 { font-size: 1.25rem; }
.markdown-content h5 { font-size: 1.1rem; }
.markdown-content h6 { font-size: 1rem; }

.markdown-content p {
  margin: 1rem 0;
  color: var(--text-primary);
}

.markdown-content ul,
.markdown-content ol {
  margin: 1rem 0;
  padding-left: 2rem;
}

.markdown-content li {
  margin: 0.5rem 0;
  color: var(--text-primary);
}

.markdown-content code {
  background: rgba(102, 126, 234, 0.1);
  color: var(--text-accent);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
}

.markdown-content pre {
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
  position: relative;
}

.markdown-content pre code {
  background: none;
  color: inherit;
  padding: 0;
  border-radius: 0;
}

.markdown-content blockquote {
  border-left: 4px solid var(--text-accent);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--text-secondary);
  background: rgba(102, 126, 234, 0.05);
  border-radius: 0 8px 8px 0;
}

.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid var(--border-color);
  padding: 0.75rem;
  text-align: left;
}

.markdown-content th {
  background: var(--glass-bg);
  font-weight: 600;
  color: var(--text-accent);
}

.markdown-content strong {
  color: var(--text-accent);
  font-weight: 600;
}

.markdown-content em {
  color: var(--text-secondary);
  font-style: italic;
}

.raw-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: 'Consolas', monospace;
  line-height: 1.5;
  color: var(--text-primary);
}

/* 模式切换按钮 */
.display-mode-toggle {
  margin-bottom: 1rem;
  text-align: right;
}

.mode-toggle-btn {
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.mode-toggle-btn:hover {
  border-color: var(--text-accent);
  color: var(--text-primary);
}

.mode-toggle-btn.active {
  background: var(--text-accent);
  color: white;
  border-color: var(--text-accent);
}

/* 保存功能样式 */
.save-modal .modal-content {
  max-width: 500px;
}

.save-preview {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.preview-item {
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-item strong {
  color: var(--text-primary);
}

/* 管理对话框 */
.manage-modal .modal-content {
  max-width: 800px;
  max-height: 80vh;
}

.manage-modal .modal-body {
  max-height: 60vh;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-tip {
  font-size: 0.9rem;
  opacity: 0.7;
}

.saved-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.saved-item {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.saved-item:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--shadow-light);
}

.saved-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.saved-title {
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.template-icon {
  font-size: 1.2rem;
}

.saved-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.load-btn:hover {
  border-color: var(--text-accent);
  color: var(--text-accent);
}

.delete-btn:hover {
  border-color: #dc3545;
  color: #dc3545;
}

.saved-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.meta-label {
  font-weight: 500;
}

.saved-preview {
  background: var(--bg-secondary);
  border-radius: 6px;
  padding: 0.75rem;
}

.preview-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
}

/* 详情对话框 */
.detail-modal .modal-content {
  max-width: 700px;
  max-height: 80vh;
}

.detail-modal .modal-body {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  color: var(--text-accent);
  margin-bottom: 1rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-content {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1rem;
}

.param-item {
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.param-item:last-child {
  margin-bottom: 0;
}

.param-item strong {
  color: var(--text-primary);
  margin-right: 0.5rem;
}

.requirements-text,
.result-text {
  color: var(--text-primary);
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.result-actions {
  display: flex;
  gap: 1rem;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-content {
  background: var(--glass-bg);
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* 自定义参数 */
.parameters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.custom-parameter {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.parameter-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  gap: 0.5rem;
  align-items: center;
}

.param-input, .param-select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
}

/* 错误信息 */
.error-message {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-close {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-close:hover {
  background: rgba(220, 53, 69, 0.2);
  border-radius: 50%;
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
  
  .parameter-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .result-actions {
    flex-direction: column;
  }
  
  .parameter-actions {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  /* 保存功能移动端适配 */
  .save-modal .modal-content,
  .manage-modal .modal-content,
  .detail-modal .modal-content {
    max-width: 95vw;
    margin: 1rem;
  }
  
  .saved-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .saved-actions {
    flex-direction: column;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .modal-footer button {
    width: 100%;
  }
}
</style>