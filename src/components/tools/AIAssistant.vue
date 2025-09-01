<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 预设的AI助手列表
const aiAssistants = ref([
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    description: 'OpenAI开发的强大对话AI',
    url: 'https://chatgpt.com/',
    icon: '',
    iconUrl: 'chatgpt-svg',
    color: 'rgba(16, 163, 127, 0.4)',
    loading: false
  },
  {
    id: 'gemini',
    name: 'Gemini',
    description: 'Google的多模态AI助手',
    url: 'https://gemini.google.com',
    icon: '',
    iconUrl: 'gemini-svg',
    color: 'rgba(66, 133, 244, 0.4)',
    loading: false
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Anthropic的AI助手',
    url: 'https://claude.ai',
    icon: '',
    iconUrl: 'claude-svg',
    color: 'rgba(255, 107, 53, 0.4)',
    loading: false
  },
  {
    id: 'grok',
    name: 'Grok',
    description: 'xAI的幽默AI助手',
    url: 'https://grok.com/',
    icon: '',
    iconUrl: 'grok-svg',
    color: 'rgba(29, 161, 242, 0.4)',
    loading: false
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: '深度求索的AI助手',
    url: 'https://chat.deepseek.com',
    icon: '',
    iconUrl: 'deepseek-svg',
    color: 'rgba(138, 43, 226, 0.4)',
    loading: false
  },
  {
    id: 'qwen',
    name: 'Qwen',
    description: '阿里云的通义千问',
    url: 'https://chat.qwen.ai/',
    icon: '',
    iconUrl: 'qwen-png',
    color: 'rgba(255, 102, 0, 0.4)',
    loading: false
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    description: '强大的AI搜索引擎',
    url: 'https://www.perplexity.ai',
    icon: '',
    iconUrl: 'perplexity-svg',
    color: 'rgba(32, 201, 151, 0.4)',
    loading: false
  }
])

// 自定义链接
const customLinks = ref([])
const showAddForm = ref(false)
const newLink = ref({
  name: '',
  url: '',
  description: '',
  icon: '🔗',
  iconUrl: '',
  customIcon: false,
  customTitle: false
})

// 获取网站favicon的函数 - 使用免费API服务
const getFavicon = async (url) => {
  try {
    // 确保URL包含协议
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    
    const domain = new URL(url).hostname
    
    // 推荐的免费API服务列表（按优先级排序）
    const faviconAPIs = [
      // 1. Google S2 Favicon API - 最稳定，免费
      `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      
      // 2. Favicon.io API - 开源免费
      `https://favicons.githubusercontent.com/${domain}`,
      
      // 3. DuckDuckGo Icons API - 隐私友好
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      
      // 4. Favicon Kit API - 备用选项
      `https://api.faviconkit.com/${domain}/32`,
      
      // 5. 直接访问网站favicon（可能有跨域问题）
      `https://${domain}/favicon.ico`
    ]
    
    // 依次尝试各个API
    for (const apiUrl of faviconAPIs) {
      try {
        // 创建一个测试图片来验证URL是否有效
        const testResult = await new Promise((resolve) => {
          const img = new Image()
          const timeout = setTimeout(() => resolve(false), 3000) // 3秒超时
          
          img.onload = () => {
            clearTimeout(timeout)
            resolve(true)
          }
          
          img.onerror = () => {
            clearTimeout(timeout)
            resolve(false)
          }
          
          img.src = apiUrl
        })
        
        if (testResult) {
          console.log(`成功获取图标: ${apiUrl}`)
          return apiUrl
        }
      } catch (error) {
        console.warn(`API ${apiUrl} 失败:`, error)
        continue
      }
    }
    
    // 如果所有API都失败，返回Google的作为最后备选
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    
  } catch (error) {
    console.error('获取favicon失败:', error)
    return null
  }
}



// 获取网页信息的状态
const fetchingInfo = ref(false)
const showIconConfirm = ref(false)

// 手动获取favicon
const fetchFavicon = async () => {
  if (!newLink.value.url) return
  
  fetchingInfo.value = true
  try {
    const faviconUrl = await getFavicon(newLink.value.url)
    if (faviconUrl) {
      newLink.value.iconUrl = faviconUrl
      showIconConfirm.value = true
    } else {
      alert('无法获取网站图标，将使用默认图标')
    }
  } catch (error) {
    console.error('获取图标失败:', error)
    alert('获取图标失败，请稍后重试')
  } finally {
    fetchingInfo.value = false
  }
}

// 确认使用图标
const confirmIcon = () => {
  showIconConfirm.value = false
  // 图标已经设置在 newLink.value.iconUrl 中
}

// 拒绝使用图标
const rejectIcon = () => {
  newLink.value.iconUrl = ''
  showIconConfirm.value = false
}

// 从localStorage加载自定义链接
onMounted(() => {
  const saved = localStorage.getItem('ai-assistant-custom-links')
  if (saved) {
    customLinks.value = JSON.parse(saved)
  }
})

// 保存自定义链接到localStorage
const saveCustomLinks = () => {
  localStorage.setItem('ai-assistant-custom-links', JSON.stringify(customLinks.value))
}

// 打开AI助手链接
const openAI = (url) => {
  window.open(url, '_blank')
}

// 添加自定义链接
const addCustomLink = () => {
  if (newLink.value.name && newLink.value.url) {
    // 确保URL包含协议
    let url = newLink.value.url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    
    customLinks.value.push({
      id: Date.now().toString(),
      name: newLink.value.name,
      url: url,
      description: newLink.value.description || '自定义AI助手',
      icon: newLink.value.iconUrl ? '' : '🔗',
      iconUrl: newLink.value.iconUrl || '',
      color: 'rgba(108, 117, 125, 0.4)'
    })
    
    saveCustomLinks()
    
    // 重置表单
    newLink.value = {
      name: '',
      url: '',
      description: '',
      icon: '🔗',
      iconUrl: '',
      customIcon: false,
      customTitle: false
    }
    showAddForm.value = false
  }
}

// 删除自定义链接
const removeCustomLink = (id) => {
  customLinks.value = customLinks.value.filter(link => link.id !== id)
  saveCustomLinks()
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
      <h2 class="page-title">AI助手</h2>
      <button class="add-button" @click="showAddForm = !showAddForm">
        <span class="add-icon">+</span>
      </button>
    </header>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 添加自定义链接表单 -->
    <div v-if="showAddForm" class="add-form-section">
      <div class="add-form">
        <h3>添加自定义AI助手</h3>
        <div class="form-group">
          <label>名称</label>
          <input 
            v-model="newLink.name" 
            type="text" 
            placeholder="输入AI助手名称"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label>链接</label>
          <div class="url-input-group">
            <input 
              v-model="newLink.url" 
              type="url" 
              placeholder="输入网站链接"
              class="form-input url-input"
            />
            <button 
              type="button"
              @click="fetchFavicon"
              class="fetch-icon-btn"
              :disabled="!newLink.url || fetchingInfo"
            >
              <span v-if="fetchingInfo" class="loading-spinner"></span>
              <span v-else>🔍</span>
              {{ fetchingInfo ? '获取中...' : '获取图标' }}
            </button>
          </div>
          <div v-if="fetchingInfo" class="fetching-info">
            <span class="loading-spinner"></span>
            正在获取网站图标...
          </div>
        </div>
        
        <!-- 图标确认对话框 -->
        <div v-if="showIconConfirm" class="icon-confirm-dialog">
          <h4>确认使用此图标？</h4>
          <div class="icon-preview-large">
            <img :src="newLink.iconUrl" alt="网站图标" class="favicon-large" />
            <div class="icon-info">
              <p><strong>图标来源：</strong>{{ newLink.iconUrl }}</p>
              <p>是否使用此图标作为 "{{ newLink.name || '该网站' }}" 的图标？</p>
            </div>
          </div>
          <div class="confirm-buttons">
            <button type="button" @click="confirmIcon" class="btn-primary">✓ 使用此图标</button>
            <button type="button" @click="rejectIcon" class="btn-secondary">✗ 使用默认图标</button>
          </div>
        </div>

        <!-- 已确认的图标预览 -->
        <div v-else-if="newLink.iconUrl && !showIconConfirm" class="form-group">
          <label>已选择的图标</label>
          <div class="icon-preview">
            <img :src="newLink.iconUrl" alt="网站图标" class="favicon-preview" />
            <span class="icon-status">✓ 已确认使用</span>
            <button type="button" @click="newLink.iconUrl = ''" class="remove-icon-btn">更换</button>
          </div>
        </div>
        <div class="form-group">
          <label>描述（可选）</label>
          <input 
            v-model="newLink.description" 
            type="text" 
            placeholder="输入简短描述"
            class="form-input"
          />
        </div>
        <div class="form-buttons">
          <button @click="addCustomLink" class="btn-primary">添加</button>
          <button @click="showAddForm = false" class="btn-secondary">取消</button>
        </div>
      </div>
    </div>

    <!-- 预设AI助手 -->
    <section class="ai-section">
      <h3>🤖 预设AI助手</h3>
      <div class="ai-grid">
        <div 
          v-for="ai in aiAssistants" 
          :key="ai.id"
          class="ai-card"
          @click="openAI(ai.url)"
          :style="{ '--hover-color': ai.color }"
        >
          <div class="ai-icon">
            <span v-if="ai.iconUrl === 'chatgpt-svg'" class="chatgpt-svg">
              <svg width="40" height="40" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11.2475 18.25C10.6975 18.25 10.175 18.1455 9.67999 17.9365C9.18499 17.7275 8.74499 17.436 8.35999 17.062C7.94199 17.205 7.50749 17.2765 7.05649 17.2765C6.31949 17.2765 5.63749 17.095 5.01049 16.732C4.38349 16.369 3.87749 15.874 3.49249 15.247C3.11849 14.62 2.93149 13.9215 2.93149 13.1515C2.93149 12.8325 2.97549 12.486 3.06349 12.112C2.62349 11.705 2.28249 11.2375 2.04049 10.7095C1.79849 10.1705 1.67749 9.6095 1.67749 9.0265C1.67749 8.4325 1.80399 7.8605 2.05699 7.3105C2.30999 6.7605 2.66199 6.2875 3.11299 5.8915C3.57499 5.4845 4.10849 5.204 4.71349 5.05C4.83449 4.423 5.08749 3.862 5.47249 3.367C5.86849 2.861 6.35249 2.465 6.92449 2.179C7.49649 1.893 8.10699 1.75 8.75599 1.75C9.30599 1.75 9.82849 1.8545 10.3235 2.0635C10.8185 2.2725 11.2585 2.564 11.6435 2.938C12.0615 2.795 12.496 2.7235 12.947 2.7235C13.684 2.7235 14.366 2.905 14.993 3.268C15.62 3.631 16.1205 4.126 16.4945 4.753C16.8795 5.38 17.072 6.0785 17.072 6.8485C17.072 7.1675 17.028 7.514 16.94 7.888C17.38 8.295 17.721 8.768 17.963 9.307C18.205 9.835 18.326 10.3905 18.326 10.9735C18.326 11.5675 18.1995 12.1395 17.9465 12.6895C17.6935 13.2395 17.336 13.718 16.874 14.125C16.423 14.521 15.895 14.796 15.29 14.95C15.169 15.577 14.9105 16.138 14.5145 16.633C14.1295 17.139 13.651 17.535 13.079 17.821C12.507 18.107 11.8965 18.25 11.2475 18.25ZM7.17199 16.1875C7.72199 16.1875 8.20049 16.072 8.60749 15.841L11.7095 14.059C11.8195 13.982 11.8745 13.8775 11.8745 13.7455V12.3265L7.88149 14.62C7.63949 14.763 7.39749 14.763 7.15549 14.62L4.03699 12.8215C4.03699 12.8545 4.03149 12.893 4.02049 12.937C4.02049 12.981 4.02049 13.047 4.02049 13.135C4.02049 13.696 4.15249 14.213 4.41649 14.686C4.69149 15.148 5.07099 15.511 5.55499 15.775C6.03899 16.05 6.57799 16.1875 7.17199 16.1875ZM7.33699 13.498C7.40299 13.531 7.46349 13.5475 7.51849 13.5475C7.57349 13.5475 7.62849 13.531 7.68349 13.498L8.92099 12.7885L4.94449 10.4785C4.70249 10.3355 4.58149 10.121 4.58149 9.835V6.2545C4.03149 6.4965 3.59149 6.8705 3.26149 7.3765C2.93149 7.8715 2.76649 8.4215 2.76649 9.0265C2.76649 9.5655 2.90399 10.0825 3.17899 10.5775C3.45399 11.0725 3.81149 11.4465 4.25149 11.6995L7.33699 13.498ZM11.2475 17.161C11.8305 17.161 12.3585 17.029 12.8315 16.765C13.3045 16.501 13.6785 16.138 13.9535 15.676C14.2285 15.214 14.366 14.697 14.366 14.125V10.561C14.366 10.429 14.311 10.33 14.201 10.264L12.947 9.538V14.1415C12.947 14.4275 12.826 14.642 12.584 14.785L9.46549 16.5835C10.0045 16.9685 10.5985 17.161 11.2475 17.161ZM11.8745 11.122V8.878L10.01 7.822L8.12899 8.878V11.122L10.01 12.178L11.8745 11.122ZM7.05649 5.8585C7.05649 5.5725 7.17749 5.358 7.41949 5.215L10.538 3.4165C9.99899 3.0315 9.40499 2.839 8.75599 2.839C8.17299 2.839 7.64499 2.971 7.17199 3.235C6.69899 3.499 6.32499 3.862 6.04999 4.324C5.78599 4.786 5.65399 5.303 5.65399 5.875V9.4225C5.65399 9.5545 5.70899 9.659 5.81899 9.736L7.05649 10.462V5.8585ZM15.4385 13.7455C15.9885 13.5035 16.423 13.1295 16.742 12.6235C17.072 12.1175 17.237 11.5675 17.237 10.9735C17.237 10.4345 17.0995 9.9175 16.8245 9.4225C16.5495 8.9275 16.192 8.5535 15.752 8.3005L12.6665 6.5185C12.6005 6.4745 12.54 6.458 12.485 6.469C12.43 6.469 12.375 6.4855 12.32 6.5185L11.0825 7.2115L15.0755 9.538C15.1965 9.604 15.2845 9.692 15.3395 9.802C15.4055 9.901 15.4385 10.022 15.4385 10.165V13.7455ZM12.122 5.3635C12.364 5.2095 12.606 5.2095 12.848 5.3635L15.983 7.195C15.983 7.118 15.983 7.019 15.983 6.898C15.983 6.37 15.851 5.8695 15.587 5.3965C15.334 4.9125 14.9655 4.5275 14.4815 4.2415C14.0085 3.9555 13.4585 3.8125 12.8315 3.8125C12.2815 3.8125 11.803 3.928 11.396 4.159L8.29399 5.941C8.18399 6.018 8.12899 6.1225 8.12899 6.2545V7.6735L12.122 5.3635Z"></path>
              </svg>
            </span>
            <span v-else-if="ai.iconUrl === 'gemini-svg'" class="gemini-svg">
              <img src="/src/assets/images/gemini.svg" alt="Gemini" width="40" height="40" />
            </span>
            <span v-else-if="ai.iconUrl === 'qwen-png'" class="qwen-png">
              <img src="/src/assets/images/qwen.png" alt="Qwen" width="40" height="40" />
            </span>
            <span v-else-if="ai.iconUrl === 'perplexity-svg'" class="perplexity-svg">
              <svg width="40" height="40" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M101.008 42L190.99 124.905V124.886V42.1913H208.506V125.276L298.891 42V136.524H336V272.866H299.005V357.035L208.506 277.525V357.948H190.99V278.836L101.11 358V272.866H64V136.524H101.008V42ZM177.785 153.826H81.5159V255.564H101.088V223.472L177.785 153.826ZM118.625 231.149V319.392L190.99 255.655V165.421L118.625 231.149ZM209.01 254.812V165.336L281.396 231.068V272.866H281.489V318.491L209.01 254.812ZM299.005 255.564H318.484V153.826H222.932L299.005 222.751V255.564ZM281.375 136.524V81.7983L221.977 136.524H281.375ZM177.921 136.524H118.524V81.7983L177.921 136.524Z" fill="currentColor"/>
              </svg>
            </span>
            <span v-else-if="ai.iconUrl === 'deepseek-svg'" class="deepseek-svg">
              <svg width="40" height="40" viewBox="0 0 58 44" xmlns="http://www.w3.org/2000/svg">
                <path d="M57.25 3.64C56.64 3.33 56.37 3.91 56.01 4.21C55.89 4.3 55.79 4.43 55.68 4.54C54.79 5.52 53.74 6.16 52.37 6.08C50.38 5.97 48.67 6.61 47.16 8.16C46.84 6.24 45.77 5.1 44.15 4.36C43.3 3.98 42.45 3.6 41.85 2.77C41.44 2.17 41.32 1.51 41.12 0.86C40.98 0.47 40.85 0.07 40.41 0C39.93 -0.07 39.74 0.34 39.55 0.68C38.8 2.09 38.5 3.64 38.53 5.2C38.6 8.73 40.06 11.54 42.96 13.54C43.29 13.76 43.38 13.99 43.27 14.33C43.08 15.02 42.84 15.68 42.63 16.37C42.5 16.81 42.3 16.91 41.84 16.72C40.25 16.04 38.87 15.04 37.65 13.82C35.59 11.79 33.72 9.54 31.39 7.78C30.85 7.37 30.3 6.99 29.73 6.63C27.36 4.28 30.05 2.35 30.67 2.12C31.32 1.88 30.89 1.06 28.79 1.06C26.69 1.07 24.77 1.79 22.31 2.75C21.96 2.89 21.58 3 21.19 3.08C18.97 2.65 16.66 2.56 14.24 2.83C9.7 3.35 6.07 5.54 3.4 9.27C0.19 13.76 -0.56 18.87 0.36 24.19C1.33 29.8 4.14 34.44 8.46 38.07C12.94 41.84 18.1 43.68 23.98 43.33C27.56 43.12 31.54 42.63 36.02 38.76C37.16 39.33 38.34 39.56 40.31 39.74C41.83 39.88 43.29 39.66 44.43 39.42C46.2 39.04 46.08 37.37 45.43 37.06C40.24 34.6 41.38 35.6 40.34 34.79C42.98 31.6 46.96 28.3 48.52 17.59C48.64 16.74 48.54 16.2 48.52 15.51C48.51 15.09 48.6 14.93 49.07 14.88C50.38 14.73 51.64 14.37 52.8 13.72C56.16 11.84 57.52 8.77 57.84 5.08C57.89 4.51 57.83 3.93 57.25 3.64ZM27.91 36.83C22.88 32.8 20.44 31.47 19.43 31.53C18.49 31.59 18.65 32.68 18.86 33.4C19.08 34.11 19.36 34.6 19.76 35.22C20.03 35.63 20.22 36.24 19.48 36.7C17.86 37.72 15.04 36.35 14.91 36.29C11.63 34.32 8.89 31.72 6.95 28.16C5.09 24.74 4 21.07 3.82 17.16C3.78 16.21 4.05 15.88 4.97 15.7C6.19 15.48 7.44 15.43 8.66 15.61C13.8 16.37 18.17 18.71 21.84 22.42C23.94 24.53 25.52 27.06 27.15 29.52C28.89 32.14 30.75 34.63 33.13 36.68C33.97 37.4 34.64 37.94 35.28 38.34C33.35 38.56 30.12 38.61 27.91 36.83ZM30.33 21.02C30.33 20.6 30.66 20.26 31.07 20.26C31.17 20.26 31.25 20.28 31.33 20.31C31.43 20.35 31.53 20.41 31.6 20.49C31.73 20.63 31.81 20.82 31.81 21.02C31.81 21.44 31.48 21.77 31.06 21.77C30.65 21.77 30.33 21.44 30.33 21.02ZM37.82 24.93C37.34 25.14 36.86 25.31 36.4 25.33C35.68 25.36 34.9 25.07 34.48 24.71C33.82 24.14 33.35 23.83 33.15 22.84C33.06 22.42 33.11 21.77 33.19 21.4C33.36 20.6 33.17 20.08 32.61 19.61C32.16 19.23 31.58 19.12 30.95 19.12C30.72 19.12 30.5 19.02 30.34 18.93C30.07 18.8 29.86 18.47 30.06 18.05C30.13 17.92 30.45 17.6 30.53 17.54C31.38 17.04 32.37 17.2 33.29 17.58C34.14 17.93 34.78 18.58 35.7 19.5C36.65 20.61 36.82 20.91 37.35 21.74C37.78 22.39 38.16 23.06 38.43 23.83C38.59 24.3 38.38 24.7 37.82 24.93Z" fill="#4D6BFE" fill-opacity="1.000000" fill-rule="nonzero"/>
              </svg>
            </span>
            <span v-else-if="ai.iconUrl === 'grok-svg'" class="grok-svg">
              <svg width="40" height="40" viewBox="0 0 34 33" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.9503 23.0313C7.07343 19.3235 7.74185 13.5853 11.0498 10.2763C13.4959 7.82722 17.5036 6.82767 21.0021 8.2971L24.7595 6.55998C24.0826 6.07017 23.215 5.54334 22.2195 5.17313C17.7198 3.31926 12.3326 4.24192 8.67479 7.90126C5.15635 11.4239 4.0499 16.8403 5.94992 21.4622C7.36924 24.9165 5.04257 27.3598 2.69884 29.826C1.86829 30.7002 1.0349 31.5745 0.36364 32.5L10.9474 23.0341" fill="currentColor"/>
                <path d="M13.2371 21.0407L24.3186 12.8506C24.8619 12.4491 25.6384 12.6057 25.8973 13.2294C27.2597 16.5185 26.651 20.4712 23.9403 23.1851C21.2297 25.8989 17.4581 26.4941 14.0108 25.1386L10.2449 26.8843C15.6463 30.5806 22.2053 29.6665 26.304 25.5601C29.5551 22.3051 30.562 17.8683 29.6205 13.8673L29.629 13.8758C28.2637 7.99809 29.9647 5.64871 33.449 0.844576C33.5314 0.730667 33.6139 0.616757 33.6964 0.5L29.1113 5.09055V5.07631L13.2343 21.0436" fill="currentColor"/>
              </svg>
            </span>
            <span v-else-if="ai.iconUrl === 'claude-svg'" class="claude-svg">
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <path shape-rendering="optimizeQuality" fill="#D97757" d="m7.75 26.27 7.77-4.36.13-.38-.13-.21h-.38l-1.3-.08-4.44-.12-3.85-.16-3.73-.2-.94-.2L0 19.4l.09-.58.79-.53 1.13.1 2.5.17 3.75.26 2.72.16 4.03.42h.64l.09-.26-.22-.16-.17-.16-3.88-2.63-4.2-2.78-2.2-1.6L3.88 11l-.6-.76-.26-1.66L4.1 7.39l1.45.1.37.1 1.47 1.13 3.14 2.43 4.1 3.02.6.5.24-.17.03-.12-.27-.45L13 9.9l-2.38-4.1-1.06-1.7-.28-1.02c-.1-.42-.17-.77-.17-1.2L10.34.21l.68-.22 1.64.22.69.6 1.02 2.33 1.65 3.67 2.56 4.99.75 1.48.4 1.37.15.42h.26v-.24l.21-2.81.39-3.45.38-4.44.13-1.25.62-1.5L23.1.57l.96.46.79 1.13-.11.73-.47 3.05-.92 4.78-.6 3.2h.35l.4-.4 1.62-2.15 2.72-3.4 1.2-1.35 1.4-1.49.9-.71h1.7l1.25 1.86-.56 1.92-1.75 2.22-1.45 1.88-2.08 2.8-1.3 2.24.12.18.31-.03 4.7-1 2.54-.46 3.03-.52 1.37.64.15.65-.54 1.33-3.24.8-3.8.76-5.66 1.34-.07.05.08.1 2.55.24 1.09.06h2.67l4.97.37 1.3.86.78 1.05-.13.8-2 1.02-2.7-.64-6.3-1.5-2.16-.54h-.3v.18l1.8 1.76 3.3 2.98 4.13 3.84.21.95-.53.75-.56-.08-3.63-2.73-1.4-1.23-3.17-2.67h-.21v.28l.73 1.07 3.86 5.8.2 1.78-.28.58-1 .35-1.1-.2L26 33.14l-2.33-3.57-1.88-3.2-.23.13-1.11 11.95-.52.61-1.2.46-1-.76-.53-1.23.53-2.43.64-3.17.52-2.52.47-3.13.28-1.04-.02-.07-.23.03-2.36 3.24-3.59 4.85-2.84 3.04-.68.27-1.18-.61.11-1.09.66-.97 3.93-5 2.37-3.1 1.53-1.79-.01-.26h-.09L6.8 30.56l-1.86.24-.8-.75.1-1.23.38-.4 3.14-2.16Z"/>
              </svg>
            </span>
            <span v-else>{{ ai.icon }}</span>
          </div>
          <div class="ai-info">
            <h4 class="ai-name">{{ ai.name }}</h4>
            <p class="ai-description">{{ ai.description }}</p>
          </div>
          <div class="ai-arrow">→</div>
        </div>
      </div>
    </section>

    <!-- 自定义链接 -->
    <section v-if="customLinks.length > 0" class="ai-section">
      <h3>🔗 自定义链接</h3>
      <div class="ai-grid">
        <div 
          v-for="link in customLinks" 
          :key="link.id"
          class="ai-card custom-card"
          :style="{ '--hover-color': link.color }"
        >
          <div class="ai-icon">
            <img 
              v-if="link.iconUrl" 
              :src="link.iconUrl" 
              :alt="link.name + ' 图标'" 
              class="favicon-icon"
              @error="link.iconUrl = ''; link.icon = '🔗'"
            />
            <span v-else>{{ link.icon }}</span>
          </div>
          <div class="ai-info" @click="openAI(link.url)">
            <h4 class="ai-name">{{ link.name }}</h4>
            <p class="ai-description">{{ link.description }}</p>
          </div>
          <button 
            class="remove-button" 
            @click.stop="removeCustomLink(link.id)"
            title="删除"
          >
            ×
          </button>
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

.back-button, .add-button {
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

.back-button:hover, .add-button:hover {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transform: translateY(-1px);
}

.back-icon, .add-icon {
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

/* 添加表单区域 */
.add-form-section {
  margin-bottom: 2rem;
}

.add-form {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.add-form h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
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

.form-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-primary, .btn-secondary {
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

.btn-primary:hover {
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

/* AI助手区域 */
.ai-section {
  margin-bottom: 3rem;
}

.ai-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.ai-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.ai-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px var(--glass-shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.ai-card:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
  background: var(--hover-color);
}

.ai-icon {
  font-size: 2.5rem;
  min-width: 60px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chatgpt-svg, .deepseek-svg, .grok-svg, .claude-svg, .gemini-svg, .qwen-png, .perplexity-svg {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chatgpt-svg svg, .deepseek-svg svg, .grok-svg svg, .claude-svg svg, .gemini-svg img, .qwen-png img, .perplexity-svg svg {
  transition: all 0.3s ease;
}

.ai-card:hover .chatgpt-svg svg, .ai-card:hover .deepseek-svg svg, .ai-card:hover .grok-svg svg, .ai-card:hover .claude-svg svg, .ai-card:hover .gemini-svg img, .ai-card:hover .qwen-png img, .ai-card:hover .perplexity-svg svg {
  transform: scale(1.1);
}

/* Favicon图标样式 */
.favicon-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  object-fit: contain;
  transition: all 0.3s ease;
}

.ai-card:hover .favicon-icon {
  transform: scale(1.1);
}

.favicon-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: contain;
  margin-right: 8px;
}

.icon-preview {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.icon-url {
  word-break: break-all;
  font-family: monospace;
}

.fetching-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: var(--text-accent);
  font-size: 0.9rem;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--text-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* URL输入组样式 */
.url-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.url-input {
  flex: 1;
}

.fetch-icon-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--text-accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 100px;
}

.fetch-icon-btn:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.fetch-icon-btn:disabled {
  background: var(--border-color);
  cursor: not-allowed;
  transform: none;
}

/* 图标确认对话框 */
.icon-confirm-dialog {
  background: var(--glass-bg);
  border: 2px solid var(--text-accent);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1rem 0;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.icon-confirm-dialog h4 {
  margin: 0 0 1rem 0;
  color: var(--text-accent);
  font-size: 1.1rem;
}

.icon-preview-large {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.favicon-large {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: contain;
  flex-shrink: 0;
}

.icon-info {
  flex: 1;
}

.icon-info p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.icon-info strong {
  color: var(--text-primary);
}

.confirm-buttons {
  display: flex;
  gap: 1rem;
}

.confirm-buttons button {
  flex: 1;
}

/* 已确认图标样式 */
.icon-status {
  color: #28a745;
  font-weight: 500;
  font-size: 0.9rem;
}

.remove-icon-btn {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-icon-btn:hover {
  background: var(--glass-bg);
  color: var(--text-primary);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .url-input-group {
    flex-direction: column;
  }
  
  .fetch-icon-btn {
    min-width: auto;
  }
  
  .icon-preview-large {
    flex-direction: column;
    text-align: center;
  }
  
  .confirm-buttons {
    flex-direction: column;
  }
}

.chatgpt-svg svg {
  color: #000000;
}

.grok-svg svg {
  color: #000000;
}

.perplexity-svg svg {
  color: #000000;
}

.ai-info {
  flex: 1;
}

.ai-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--text-primary);
}

.ai-description {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.4;
}

.ai-arrow {
  font-size: 1.5rem;
  color: var(--text-accent);
  transition: transform 0.3s ease;
}

.ai-card:hover .ai-arrow {
  transform: translateX(4px);
}

/* 自定义卡片样式 */
.custom-card {
  position: relative;
}

.custom-card .ai-info {
  cursor: pointer;
}

.remove-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(220, 53, 69, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-button:hover {
  background: rgba(220, 53, 69, 1);
  transform: scale(1.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .ai-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .ai-card {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .add-form {
    padding: 1.5rem;
  }
  
  .form-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.2rem;
  }
  
  .top-bar {
    padding: 0.8rem;
  }
  
  .ai-card {
    flex-direction: column;
    text-align: center;
    gap: 0.8rem;
  }
  
  .ai-arrow {
    display: none;
  }
  
  .ai-info {
    text-align: center;
  }
}
</style>