import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import CategoryPage from '../views/CategoryPage.vue'
import ExchangeRate from '../components/tools/ExchangeRate.vue'
import OilPrice from '../components/query/OilPrice.vue'
import HotList from '../components/query/HotList.vue'
import HistoryToday from '../components/query/HistoryToday.vue'
import GenshinImages from '../components/entertainment/GenshinImages.vue'
import RandomGirlImages from '../components/entertainment/RandomGirlImages.vue'
import RandomWallpaper from '../components/entertainment/RandomWallpaper.vue'
import RandomGirlVideo from '../components/entertainment/RandomGirlVideo.vue'
import DrivingTest from '../components/tools/DrivingTest.vue'
import Translate from '../components/tools/Translate.vue'
import GoldPrice from '../components/query/GoldPrice.vue'
import CarPrice from '../components/query/CarPrice.vue'
import Solver from '../components/Solver.vue'
import MusicParser from '../components/tools/MusicParser.vue'
import MVParser from '../components/tools/MVParser.vue'
import RandomNumber from '../components/tools/RandomNumber.vue'
import ExpressQuery from '../components/tools/ExpressQuery.vue'
import IPQuery from '../components/tools/IPQuery.vue'
import QQAvatar from '../components/tools/QQAvatar.vue'
import ConcertSchedule from '../components/tools/ConcertSchedule.vue'
import AIAssistant from '../components/tools/AIAssistant.vue'
import GlassousSearch from '../views/GlassousSearch.vue'
import KFCThursday from '../components/entertainment/KFCThursday.vue'
import NonsenseArticle from '../components/entertainment/NonsenseArticle.vue'
import KuaiKanComic from '../components/entertainment/KuaiKanComic.vue'
import TomatoNovel from '../components/entertainment/TomatoNovel.vue'
import NovelChapter from '../components/entertainment/NovelChapter.vue'
import NovelReader from '../components/entertainment/NovelReader.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/query',
    name: 'QueryPage',
    component: CategoryPage
  },
  {
    path: '/tools',
    name: 'ToolsPage',
    component: CategoryPage
  },
  {
    path: '/entertainment',
    name: 'EntertainmentPage',
    component: CategoryPage
  },
  {
    path: '/exchange-rate',
    name: 'ExchangeRate',
    component: ExchangeRate
  },
  {
    path: '/oil-price',
    name: 'OilPrice',
    component: OilPrice
  },
  {
    path: '/hot-list',
    name: 'HotList',
    component: HotList
  },
  {
    path: '/history-today',
    name: 'HistoryToday',
    component: HistoryToday
  },
  {
    path: '/genshin-images',
    name: 'GenshinImages',
    component: GenshinImages
  },
  {
    path: '/random-girl-images',
    name: 'RandomGirlImages',
    component: RandomGirlImages
  },
  {
    path: '/random-wallpaper',
    name: 'RandomWallpaper',
    component: RandomWallpaper
  },
  {
    path: '/random-girl-video',
    name: 'RandomGirlVideo',
    component: RandomGirlVideo
  },
  {
    path: '/driving-test',
    name: 'DrivingTest',
    component: DrivingTest
  },
  {
    path: '/translate',
    name: 'Translate',
    component: Translate
  },
  {
    path: '/gold-price',
    name: 'GoldPrice',
    component: GoldPrice
  },
  {
    path: '/car-price',
    name: 'CarPrice',
    component: CarPrice
  },
  {
    path: '/solver',
    name: 'Solver',
    component: Solver
  },
  {
    path: '/music-parser',
    name: 'MusicParser',
    component: MusicParser
  },
  {
    path: '/mv-parser',
    name: 'MVParser',
    component: MVParser
  },
  {
    path: '/random-number',
    name: 'RandomNumber',
    component: RandomNumber
  },
  {
    path: '/express-query',
    name: 'ExpressQuery',
    component: ExpressQuery
  },
  {
    path: '/ip-query',
    name: 'IPQuery',
    component: IPQuery
  },
  {
    path: '/qq-avatar',
    name: 'QQAvatar',
    component: QQAvatar
  },
  {
    path: '/concert-schedule',
    name: 'ConcertSchedule',
    component: ConcertSchedule
  },
  {
    path: '/ai-assistant',
    name: 'AIAssistant',
    component: AIAssistant
  },
  {
    path: '/glassous-search',
    name: 'GlassousSearch',
    component: GlassousSearch
  },
  {
    path: '/kfc-thursday',
    name: 'KFCThursday',
    component: KFCThursday
  },
  {
    path: '/nonsense-article',
    name: 'NonsenseArticle',
    component: NonsenseArticle
  },
  {
    path: '/kuaikan-comic',
    name: 'KuaiKanComic',
    component: KuaiKanComic
  },
  {
    path: '/tomato-novel',
    name: 'TomatoNovel',
    component: TomatoNovel
  },
  {
    path: '/novel-chapter',
    name: 'NovelChapter',
    component: NovelChapter
  },
  {
    path: '/novel-reader',
    name: 'NovelReader',
    component: NovelReader
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router