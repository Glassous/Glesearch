# Glesearch - 多功能API聚合平台 v2.0.0

一个基于Vue 3的现代化多功能API聚合平台，集成了多种实用工具和娱乐功能。支持查询、工具、娱乐三大功能分类，提供丰富的API服务和智能搜索体验。

## 🌟 项目特色

- 🎨 **现代化UI设计** - 支持深色/浅色主题自动切换，基于CSS变量的主题系统
- ✨ **魔法动画效果** - 主页标题采用逐字母3D旋转入场动画，配有星点装饰和悬停特效
- 🪟 **毛玻璃效果** - 全站采用毛玻璃背景模糊效果，提供现代化视觉体验
- 📱 **响应式布局** - 完美适配移动端和桌面端，触摸友好的交互设计
- ⚡ **高性能构建** - 基于Vue 3 + Vite构建，快速启动和热重载
- 🔧 **模块化设计** - 组件化架构，易于维护和扩展
- 🌐 **丰富API集成** - 集成多种实用API服务

## 🚀 功能模块

### 📊 查询类功能
- **油价查询** - 全国各地实时油价信息，按GDP排序显示
- **热榜汇总** - 聚合微博、抖音、百度、哔哩哔哩等平台热门内容
- **历史上的今天** - 回顾历史上的重要事件
- **今日金价** - 实时黄金价格查询，包含银行投资金条、黄金回收、贵金属品牌价格
- **车辆价格** - 汽车价格信息查询，支持品牌型号搜索，提供指导价和经销商价格

### 🛠️ 工具类功能
- **汇率换算** - 实时汇率查询与换算，支持全球主要货币
- **AI翻译** - 支持多语言在线翻译，覆盖50+种语言
- **驾考题目** - 科目一和科目四随机练习题
- **AI助手** - 智能对话助手，支持多种AI模型
- **音乐解析** - 音乐链接解析下载功能
- **MV解析** - 音乐视频解析功能
- **随机数生成** - 自定义范围的随机数字生成
- **快递查询** - 快递物流信息查询
- **IP查询** - IP地址归属地查询
- **QQ头像** - QQ头像获取工具
- **演唱会时间表** - 演唱会信息查询

### 🎮 娱乐类功能
- **原神图片** - 精美原神角色图片和Coser图片
- **随机小姐姐图片** - 多种类型的精美图片（美女、白丝、黑丝、JK）
- **随机小姐姐视频** - 随机推荐精彩视频内容
- **随机壁纸** - 高清精美壁纸推荐
- **KFC疯狂星期四** - 疯狂星期四文案生成
- **狗屁不通文章** - 自动生成无意义文章
- **快看漫画** - 漫画资源浏览
- **番茄小说** - 小说阅读功能
- **小说阅读器** - 在线小说阅读体验

### 🔍 搜索功能
- **Glassous搜索** - 内置搜索引擎
- **多引擎搜索** - 支持Google、Bing、百度、DuckDuckGo、Wikipedia等
- **自定义搜索引擎** - 支持添加自定义搜索引擎

### 🧮 解题器功能
- **数学解题** - 支持各种数学问题求解
- **智能计算** - 复杂计算和公式求解

## 🛠️ 技术栈

- **前端框架**: Vue 3.5.18 (Composition API)
- **构建工具**: Vite 7.1.2
- **路由管理**: Vue Router 4.5.1
- **UI交互**: 原生CSS + 3D动画效果 + 毛玻璃设计
- **数学渲染**: KaTeX 0.16.22 (数学公式渲染)
- **拖拽功能**: Vue Draggable Next 2.3.0
- **排序功能**: SortableJS 1.15.6
- **移动端支持**: Capacitor 7.4.3 (支持Android应用打包)
- **状态栏管理**: Capacitor Status Bar 7.0.2
- **应用生命周期**: Capacitor App 7.0.2

## 📦 安装与运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 移动端应用
本项目支持使用Capacitor打包为Android应用：
```bash
# 构建Web应用
npm run build

# 添加Android平台
npx cap add android

# 同步代码到Android项目
npx cap sync

# 在Android Studio中打开项目
npx cap open android
```

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
├── .vscode/                # VS Code配置
│   └── extensions.json
├── public/                 # 静态资源
├── src/
│   ├── components/         # 功能组件
│   │   ├── Solver.vue            # 解题器组件
│   │   ├── entertainment/        # 娱乐类组件
│   │   │   ├── EntertainmentSection.vue  # 娱乐功能区块
│   │   │   ├── GenshinImages.vue         # 原神图片
│   │   │   ├── KFCThursday.vue           # KFC疯狂星期四
│   │   │   ├── KuaiKanComic.vue          # 快看漫画
│   │   │   ├── NonsenseArticle.vue       # 狗屁不通文章
│   │   │   ├── NovelChapter.vue          # 小说章节
│   │   │   ├── NovelReader.vue           # 小说阅读器
│   │   │   ├── RandomGirlImages.vue      # 随机小姐姐图片
│   │   │   ├── RandomGirlVideo.vue       # 随机小姐姐视频
│   │   │   ├── RandomWallpaper.vue       # 随机壁纸
│   │   │   └── TomatoNovel.vue           # 番茄小说
│   │   ├── query/                # 查询类组件
│   │   │   ├── CarPrice.vue              # 车辆价格查询
│   │   │   ├── GoldPrice.vue             # 今日金价
│   │   │   ├── HistoryToday.vue          # 历史上的今天
│   │   │   ├── HotList.vue               # 热榜汇总
│   │   │   ├── OilPrice.vue              # 油价查询
│   │   │   └── QuerySection.vue          # 查询功能区块
│   │   └── tools/                # 工具类组件
│   │       ├── AIAssistant.vue           # AI助手
│   │       ├── ConcertSchedule.vue       # 演唱会时间表
│   │       ├── DrivingTest.vue           # 驾考题目
│   │       ├── ExchangeRate.vue          # 汇率换算
│   │       ├── ExpressQuery.vue          # 快递查询
│   │       ├── IPQuery.vue               # IP查询
│   │       ├── MVParser.vue              # MV解析
│   │       ├── MusicParser.vue           # 音乐解析
│   │       ├── QQAvatar.vue              # QQ头像
│   │       ├── RandomNumber.vue          # 随机数生成
│   │       ├── ToolsSection.vue          # 工具功能区块
│   │       └── Translate.vue             # AI翻译
│   ├── views/              # 页面视图
│   │   ├── CategoryPage.vue      # 分类页面
│   │   ├── GlassousSearch.vue    # Glassous搜索页面
│   │   ├── Home.vue              # 主页
│   │   └── Solver.vue            # 解题器页面
│   ├── assets/             # 资源文件
│   │   └── images/               # 图片资源
│   │       ├── w80/              # 国家旗帜图标(80x80)
│   │       ├── Glassous-search.png
│   │       ├── Glesearchlogo.png
│   │       ├── gemini.svg
│   │       ├── pearapi.png
│   │       ├── qwen.png
│   │       ├── 云智api.ico
│   │       └── 小小api.ico
│   ├── router/             # 路由配置
│   │   └── index.js
│   ├── App.vue             # 根组件
│   ├── main.js             # 入口文件
│   └── style.css           # 全局样式
├── capacitor.config.json   # Capacitor配置
├── index.html              # HTML模板
├── package.json            # 项目配置
├── package-lock.json       # 依赖锁定文件
├── vite.config.js          # Vite配置
├── LICENSE                 # 开源协议
├── .gitignore              # Git忽略文件
└── README.md               # 项目说明
```

## 🎨 设计特色

### 🌙 智能主题系统
- **自动适配** - 根据系统偏好自动切换深色/浅色模式
- **无缝切换** - 基于CSS变量的主题系统，0.3s平滑过渡动画
- **深度定制** - 针对深色模式优化的色彩搭配和对比度

### ✨ 魔法动画效果
- **3D标题动画** - 主页"Glesearch"标题采用逐字母3D旋转入场效果
- **渐变文字** - 彩虹渐变文字效果，支持悬停放大和星点装饰
- **毛玻璃按钮** - 功能按钮采用毛玻璃效果，悬停时3D倾斜变换
- **流畅过渡** - 所有交互元素都配有cubic-bezier缓动函数

### 📱 现代响应式设计
- **移动端优先** - 专为触摸设备优化的交互体验
- **自适应网格** - 智能网格布局，自动适配不同屏幕尺寸
- **视觉层次** - 通过阴影、模糊和透明度营造空间感

## 🔌 API集成

本项目集成了多个第三方API服务，主要数据来源：

### 📊 查询类API
- **汇率数据**: 实时汇率查询API，支持全球主要货币
- **油价数据**: 全国油价查询API，按地区GDP排序
- **金价数据**: 银行投资金条、黄金回收、贵金属品牌价格API
- **车辆数据**: 汽车价格信息查询API，支持品牌型号搜索
- **热榜数据**: 各大平台热门内容聚合API
- **历史数据**: 历史事件查询API，回顾历史上的今天

### 🛠️ 工具类API
- **翻译服务**: AI翻译API，支持50+种语言互译
- **驾考题库**: 驾考题目API，科目一和科目四题库
- **AI助手**: 多种AI模型接口（Gemini、通义千问等）
- **音乐解析**: 音乐平台链接解析API
- **MV解析**: 音乐视频解析下载API
- **快递查询**: 快递物流信息查询API
- **IP查询**: IP地址归属地查询API
- **QQ头像**: QQ头像获取API
- **演唱会信息**: 演唱会时间表查询API

### 🎮 娱乐类API
- **图片资源**: 随机图片API（原神、美女、壁纸等）
- **视频资源**: 随机视频API
- **文案生成**: KFC疯狂星期四文案API
- **文章生成**: 狗屁不通文章生成API
- **漫画资源**: 快看漫画API
- **小说资源**: 番茄小说API

### 🔍 搜索引擎
- **Glassous搜索**: 内置搜索引擎
- **第三方搜索**: Google、Bing、百度、DuckDuckGo、Wikipedia
- **自定义引擎**: 支持用户自定义搜索引擎配置

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

感谢以下API服务提供商为本项目提供的优质服务支持：

- **[小小API](https://xxapi.cn/)** - 提供丰富的API服务，为本项目提供了核心数据源
- **[云智API](https://api.jkyai.top/)** - 提供AI助手和智能服务API支持
- **[PearAPI](https://api.pearktrue.cn/)** - 提供多样化的API接口服务

这些优质的API服务为本项目的功能实现提供了坚实的基础。

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 GitHub Issue
- 发送邮件至项目维护者

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
