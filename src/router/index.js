import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import CategoryPage from '../views/CategoryPage.vue'
import ExchangeRate from '../components/tools/ExchangeRate.vue'
import OilPrice from '../components/query/OilPrice.vue'
import MovieBox from '../components/query/MovieBox.vue'
import CountdownDay from '../components/query/CountdownDay.vue'
import RecipeInfo from '../components/query/RecipeInfo.vue'
import LotteryResults from '../components/query/LotteryResults.vue'
import StockData from '../components/query/StockData.vue'
import TrademarkInfo from '../components/query/TrademarkInfo.vue'
import CityRoutes from '../components/query/CityRoutes.vue'
import HighSpeedTicket from '../components/query/HighSpeedTicket.vue'
import WebsiteInfo from '../components/query/WebsiteInfo.vue'
import MapSearch from '../components/query/MapSearch.vue'
import EnglishDict from '../components/query/EnglishDict.vue'
import TechNews from '../components/query/TechNews.vue'
import WorldPopulation from '../components/query/WorldPopulation.vue'
import NameDuplicate from '../components/query/NameDuplicate.vue'
import PerformanceRanking from '../components/query/PerformanceRanking.vue'
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
import DouyinParser from '../components/tools/DouyinParser.vue'
import AnimeAvatarAI from '../components/tools/AnimeAvatarAI.vue'
import SpeechToText from '../components/tools/SpeechToText.vue'
import BaiduTiku from '../components/tools/BaiduTiku.vue'
import OCRTextRecognition from '../components/tools/OCRTextRecognition.vue'
import TextConverter from '../components/tools/TextConverter.vue'
import QRGenerator from '../components/tools/QRGenerator.vue'
import MarkdownReader from '../components/tools/MarkdownReader.vue'
import AIPromptGenerator from '../components/tools/AIPromptGenerator.vue'
import GlassousSearch from '../views/GlassousSearch.vue'
import KFCThursday from '../components/entertainment/KFCThursday.vue'
import NonsenseArticle from '../components/entertainment/NonsenseArticle.vue'
import KuaiKanComic from '../components/entertainment/KuaiKanComic.vue'
import TomatoNovel from '../components/entertainment/TomatoNovel.vue'
import NovelChapter from '../components/entertainment/NovelChapter.vue'
import NovelReader from '../components/entertainment/NovelReader.vue'
import AlipayVoice from '../components/entertainment/AlipayVoice.vue'
import BrainTeaser from '../components/entertainment/BrainTeaser.vue'
import TodayFood from '../components/entertainment/TodayFood.vue'
import HiddenPoem from '../components/entertainment/HiddenPoem.vue'
import CertificateGenerator from '../components/entertainment/CertificateGenerator.vue'
import AwardGenerator from '../components/entertainment/AwardGenerator.vue'
import HomophoneNameGenerator from '../components/entertainment/HomophoneNameGenerator.vue'
import USAIdentity from '../components/entertainment/USAIdentity.vue'

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
    path: '/movie-box',
    name: 'MovieBox',
    component: MovieBox
  },
  {
    path: '/countdown-day',
    name: 'CountdownDay',
    component: CountdownDay
  },
  {
    path: '/recipe-info',
    name: 'RecipeInfo',
    component: RecipeInfo
  },
  {
    path: '/lottery-results',
    name: 'LotteryResults',
    component: LotteryResults
  },
  {
    path: '/stock-data',
    name: 'StockData',
    component: StockData
  },
  {
    path: '/trademark-info',
    name: 'TrademarkInfo',
    component: TrademarkInfo
  },
  {
    path: '/city-routes',
    name: 'CityRoutes',
    component: CityRoutes
  },
  {
    path: '/high-speed-ticket',
    name: 'HighSpeedTicket',
    component: HighSpeedTicket
  },
  {
    path: '/website-info',
    name: 'WebsiteInfo',
    component: WebsiteInfo
  },
  {
    path: '/map-search',
    name: 'MapSearch',
    component: MapSearch
  },
  {
    path: '/english-dict',
    name: 'EnglishDict',
    component: EnglishDict
  },
  {
    path: '/tech-news',
    name: 'TechNews',
    component: TechNews
  },
  {
    path: '/world-population',
    name: 'WorldPopulation',
    component: WorldPopulation
  },
  {
    path: '/name-duplicate',
    name: 'NameDuplicate',
    component: NameDuplicate
  },
  {
    path: '/performance-ranking',
    name: 'PerformanceRanking',
    component: PerformanceRanking
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
    path: '/douyin-parser',
    name: 'DouyinParser',
    component: DouyinParser
  },
  {
    path: '/anime-avatar-ai',
    name: 'AnimeAvatarAI',
    component: AnimeAvatarAI
  },
  {
    path: '/speech-to-text',
    name: 'SpeechToText',
    component: SpeechToText
  },
  {
    path: '/baidu-tiku',
    name: 'BaiduTiku',
    component: BaiduTiku
  },
  {
    path: '/ocr-text-recognition',
    name: 'OCRTextRecognition',
    component: OCRTextRecognition
  },
  {
    path: '/text-converter',
    name: 'TextConverter',
    component: TextConverter
  },
  {
    path: '/qr-generator',
    name: 'QRGenerator',
    component: QRGenerator
  },
  {
    path: '/markdown-reader',
    name: 'MarkdownReader',
    component: MarkdownReader
  },
  {
    path: '/ai-prompt-generator',
    name: 'AIPromptGenerator',
    component: AIPromptGenerator
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
  },
  {
    path: '/alipay-voice',
    name: 'AlipayVoice',
    component: AlipayVoice
  },
  {
    path: '/brain-teaser',
    name: 'BrainTeaser',
    component: BrainTeaser
  },
  {
    path: '/today-food',
    name: 'TodayFood',
    component: TodayFood
  },
  {
    path: '/hidden-poem',
    name: 'HiddenPoem',
    component: HiddenPoem
  },
  {
    path: '/certificate-generator',
    name: 'CertificateGenerator',
    component: CertificateGenerator
  },
  {
    path: '/award-generator',
    name: 'AwardGenerator',
    component: AwardGenerator
  },
  {
    path: '/homophone-name-generator',
    name: 'HomophoneNameGenerator',
    component: HomophoneNameGenerator
  },
  {
    path: '/usa-identity',
    name: 'USAIdentity',
    component: USAIdentity
  },
  {
    path: '/today-food',
    name: 'TodayFood',
    component: TodayFood
  },
  {
    path: '/hidden-poem',
    name: 'HiddenPoem',
    component: HiddenPoem
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router