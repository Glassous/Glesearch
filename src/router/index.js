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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router