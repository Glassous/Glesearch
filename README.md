# Glesearch - 多功能API聚合平台

一个基于Vue 3的现代化多功能API聚合平台，集成了多种实用工具和娱乐功能。

## 🌟 项目特色

- 🎨 现代化UI设计，支持深色/浅色主题自动切换
- 📱 响应式布局，完美适配移动端和桌面端
- ⚡ 基于Vue 3 + Vite构建，快速启动和热重载
- 🔧 模块化组件设计，易于维护和扩展
- 🌐 集成多种实用API服务

## 🚀 功能模块

### 💰 金融工具
- **汇率换算** - 实时汇率查询与换算，支持全球主要货币
- **油价查询** - 全国各地实时油价信息，按GDP排序显示

### 📊 信息聚合
- **热榜汇总** - 聚合微博、抖音、百度、哔哩哔哩等平台热门内容
- **历史上的今天** - 回顾历史上的重要事件

### 🎮 娱乐功能
- **原神图片** - 精美原神角色图片和Coser图片
- **随机小姐姐图片** - 多种类型的精美图片（美女、白丝、黑丝、JK）
- **随机小姐姐视频** - 随机推荐精彩视频内容
- **随机壁纸** - 高清精美壁纸推荐

### 🛠️ 实用工具
- **AI翻译** - 支持多语言在线翻译，覆盖50+种语言
- **驾考题目** - 科目一和科目四随机练习题

### 🔮 即将推出
- **今日金价** - 实时黄金价格查询
- **车辆价格** - 汽车价格信息查询

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **路由管理**: Vue Router 4
- **UI交互**: 原生CSS + 现代化动画效果
- **拖拽功能**: Vue Draggable Next
- **排序功能**: SortableJS

## 📦 安装与运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```

### 生产环境构建
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 📁 项目结构

```
glesearch/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 功能组件
│   │   ├── ExchangeRate.vue      # 汇率换算
│   │   ├── OilPrice.vue          # 油价查询
│   │   ├── HotList.vue           # 热榜汇总
│   │   ├── HistoryToday.vue      # 历史上的今天
│   │   ├── GenshinImages.vue     # 原神图片
│   │   ├── RandomGirlImages.vue  # 随机小姐姐图片
│   │   ├── RandomGirlVideo.vue   # 随机小姐姐视频
│   │   ├── RandomWallpaper.vue   # 随机壁纸
│   │   ├── DrivingTest.vue       # 驾考题目
│   │   └── Translate.vue         # AI翻译
│   ├── views/              # 页面视图
│   │   └── Home.vue              # 主页
│   ├── router/             # 路由配置
│   │   └── index.js
│   ├── assets/             # 资源文件
│   ├── App.vue             # 根组件
│   ├── main.js             # 入口文件
│   └── style.css           # 全局样式
├── index.html              # HTML模板
├── package.json            # 项目配置
├── vite.config.js          # Vite配置
└── README.md               # 项目说明
```

## 🎨 设计特色

### 主题系统
- 自动检测系统主题偏好
- 深色/浅色模式无缝切换
- CSS变量驱动的主题系统

### 动画效果
- 页面标题逐字母动画入场
- 按钮悬停和点击反馈
- 平滑的页面切换过渡

### 响应式设计
- 移动端优先的设计理念
- 灵活的网格布局系统
- 触摸友好的交互设计

## 🔌 API集成

本项目集成了多个第三方API服务，主要数据来源：

- **汇率数据**: 实时汇率API
- **油价数据**: 全国油价查询API
- **热榜数据**: 各大平台热门内容API
- **历史数据**: 历史事件查询API
- **图片资源**: 随机图片API
- **视频资源**: 随机视频API
- **翻译服务**: AI翻译API
- **驾考题库**: 驾考题目API

## 🤝 贡献指南

欢迎提交Issue和Pull Request来帮助改进项目！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 开源协议

本项目采用 MIT 协议 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 特别鸣谢

感谢 [xxapi.cn](https://xxapi.cn/) 提供的优质API服务支持，为本项目提供了丰富的数据源和功能实现基础。

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 GitHub Issue
- 发送邮件至项目维护者

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
