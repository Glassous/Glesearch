import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.pearktrue.cn',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      // 为了兼容旧API，保留原配置
      '/old-api': {
        target: 'https://v2.xxapi.cn',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/old-api/, '/api')
      }
    }
  }
})
