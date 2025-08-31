import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ExchangeRate from '../components/ExchangeRate.vue'
import OilPrice from '../components/OilPrice.vue'
import HotList from '../components/HotList.vue'
import HistoryToday from '../components/HistoryToday.vue'
import GenshinImages from '../components/GenshinImages.vue'
import RandomGirlImages from '../components/RandomGirlImages.vue'
import RandomWallpaper from '../components/RandomWallpaper.vue'
import RandomGirlVideo from '../components/RandomGirlVideo.vue'
import DrivingTest from '../components/DrivingTest.vue'
import Translate from '../components/Translate.vue'
import GoldPrice from '../components/GoldPrice.vue'
import CarPrice from '../components/CarPrice.vue'
import Solver from '../components/Solver.vue'
import MusicParser from '../components/MusicParser.vue'
import MVParser from '../components/MVParser.vue'
import RandomNumber from '../components/RandomNumber.vue'
import ExpressQuery from '../components/ExpressQuery.vue'
import IPQuery from '../components/IPQuery.vue'
import QQAvatar from '../components/QQAvatar.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router