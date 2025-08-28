<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { VueDraggableNext } from 'vue-draggable-next'

// 使用路由导航
const router = useRouter()

// 汇率数据
const exchangeRates = ref({})
const loading = ref(true)
const error = ref('')
const apiSource = ref('xxapi.cn')
const lastUpdateTime = ref('')

// 货币符号映射
const currencySymbols = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', KRW: '₩', RUB: '₽', INR: '₹',
  CAD: 'C$', AUD: 'A$', CHF: 'CHF', SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč',
  HUF: 'Ft', BGN: 'лв', RON: 'lei', HRK: 'kn', TRY: '₺', ILS: '₪', AED: 'د.إ', SAR: 'ر.س',
  QAR: 'ر.ق', KWD: 'د.ك', BHD: '.د.ب', OMR: 'ر.ع.', JOD: 'د.ا', EGP: 'E£', LBP: 'ل.ل',
  SYP: 'ل.س', IQD: 'ع.د', IRR: 'ریال', AFN: '؋', PKR: '₨', BDT: '৳', LKR: '₨', NPR: '₨',
  BTN: 'Nu.', MVR: 'Rf', THB: '฿', LAK: '₭', KHR: '៛', VND: '₫', MYR: 'RM', SGD: 'S$',
  BND: 'B$', IDR: 'Rp', PHP: '₱', TWD: 'NT$', HKD: 'HK$', MOP: 'MOP$', MMK: 'K', ZAR: 'R',
  NAD: 'N$', BWP: 'P', SZL: 'L', LSL: 'L', MZN: 'MT', MWK: 'MK', ZMW: 'ZK', ZWL: 'Z$',
  UGX: 'USh', TZS: 'TSh', KES: 'KSh', ETB: 'Br', ERN: 'Nfk', DJF: 'Fdj', SOS: 'S', RWF: 'RF',
  BIF: 'FBu', KMF: 'CF', SCR: '₨', MUR: '₨', MGA: 'Ar', XOF: 'CFA', XAF: 'FCFA', GHS: '₵',
  NGN: '₦', SLE: 'Le', LRD: 'L$', GMD: 'D', GNF: 'FG', STN: 'Db', CVE: '$', AOA: 'Kz',
  CDF: 'FC', MAD: 'د.م.', TND: 'د.ت', DZD: 'د.ج', LYD: 'ل.د', SDG: 'ج.س.', MXN: '$',
  GTQ: 'Q', BZD: 'BZ$', HNL: 'L', NIO: 'C$', CRC: '₡', PAB: 'B/.', COP: '$', VES: 'Bs.S',
  GYD: 'G$', SRD: '$', UYU: '$U', PYG: '₲', BOB: 'Bs.', BRL: 'R$', PEN: 'S/', CLP: '$',
  ARS: '$', FKP: '£', JMD: 'J$', KYD: '$', XCD: '$', TTD: 'TT$', BBD: 'Bds$', HTG: 'G',
  DOP: 'RD$', CUC: '$', CUP: '₱', BSD: 'B$', AWG: 'ƒ', ANG: 'ƒ', SBD: 'SI$', VUV: 'VT',
  FJD: 'FJ$', TOP: 'T$', WST: 'WS$', PGK: 'K', XPF: '₣', NZD: 'NZ$', ISK: 'kr',
  ALL: 'L', MKD: 'ден', RSD: 'дин', BAM: 'KM', MDL: 'L', UAH: '₴', BYN: 'Br', GEL: '₾',
  AMD: '֏', AZN: '₼', TMT: 'T', UZS: 'лв', KGS: 'лв', TJS: 'ЅМ', KZT: '₸', MNT: '₮',
  CNH: '¥', IMP: '£', JEP: '£', GGP: '£', SHP: '£', TVD: '$', RON: 'lei'
}

// 货币emoji映射（当国旗图片不存在时使用）
const currencyEmojis = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', CNY: '🇨🇳', KRW: '🇰🇷', RUB: '🇷🇺', INR: '🇮🇳',
  CAD: '🇨🇦', AUD: '🇦🇺', CHF: '🇨🇭', SEK: '🇸🇪', NOK: '🇳🇴', DKK: '🇩🇰', PLN: '🇵🇱', CZK: '🇨🇿',
  HUF: '🇭🇺', BGN: '🇧🇬', RON: '🇷🇴', HRK: '🇭🇷', TRY: '🇹🇷', ILS: '🇮🇱', AED: '🇦🇪', SAR: '🇸🇦',
  QAR: '🇶🇦', KWD: '🇰🇼', BHD: '🇧🇭', OMR: '🇴🇲', JOD: '🇯🇴', EGP: '🇪🇬', LBP: '🇱🇧',
  SYP: '🇸🇾', IQD: '🇮🇶', IRR: '🇮🇷', AFN: '🇦🇫', PKR: '🇵🇰', BDT: '🇧🇩', LKR: '🇱🇰', NPR: '🇳🇵',
  BTN: '🇧🇹', MVR: '🇲🇻', THB: '🇹🇭', LAK: '🇱🇦', KHR: '🇰🇭', VND: '🇻🇳', MYR: '🇲🇾', SGD: '🇸🇬',
  BND: '🇧🇳', IDR: '🇮🇩', PHP: '🇵🇭', TWD: '🇹🇼', HKD: '🇭🇰', MOP: '🇲🇴', MMK: '🇲🇲', ZAR: '🇿🇦',
  NAD: '🇳🇦', BWP: '🇧🇼', SZL: '🇸🇿', LSL: '🇱🇸', MZN: '🇲🇿', MWK: '🇲🇼', ZMW: '🇿🇲', ZWL: '🇿🇼',
  UGX: '🇺🇬', TZS: '🇹🇿', KES: '🇰🇪', ETB: '🇪🇹', ERN: '🇪🇷', DJF: '🇩🇯', SOS: '🇸🇴', RWF: '🇷🇼',
  BIF: '🇧🇮', KMF: '🇰🇲', SCR: '🇸🇨', MUR: '🇲🇺', MGA: '🇲🇬', XOF: '🌍', XAF: '🌍', GHS: '🇬🇭',
  NGN: '🇳🇬', SLE: '🇸🇱', LRD: '🇱🇷', GMD: '🇬🇲', GNF: '🇬🇳', STN: '🇸🇹', CVE: '🇨🇻', AOA: '🇦🇴',
  CDF: '🇨🇩', MAD: '🇲🇦', TND: '🇹🇳', DZD: '🇩🇿', LYD: '🇱🇾', SDG: '🇸🇩', MXN: '🇲🇽',
  GTQ: '🇬🇹', BZD: '🇧🇿', HNL: '🇭🇳', NIO: '🇳🇮', CRC: '🇨🇷', PAB: '🇵🇦', COP: '🇨🇴',
  VES: '🇻🇪', GYD: '🇬🇾', SRD: '🇸🇷', UYU: '🇺🇾', PYG: '🇵🇾', BOB: '🇧🇴', BRL: '🇧🇷',
  PEN: '🇵🇪', CLP: '🇨🇱', ARS: '🇦🇷', FKP: '🇫🇰', JMD: '🇯🇲', KYD: '🇰🇾', XCD: '🏝️',
  TTD: '🇹🇹', BBD: '🇧🇧', HTG: '🇭🇹', DOP: '🇩🇴', CUC: '🇨🇺', CUP: '🇨🇺', BSD: '🇧🇸',
  AWG: '🇦🇼', ANG: '🇳🇱', SBD: '🇸🇧', VUV: '🇻🇺', FJD: '🇫🇯', TOP: '🇹🇴', WST: '🇼🇸',
  PGK: '🇵🇬', XPF: '🇵🇫', NZD: '🇳🇿', ISK: '🇮🇸', ALL: '🇦🇱', MKD: '🇲🇰', RSD: '🇷🇸',
  BAM: '🇧🇦', MDL: '🇲🇩', UAH: '🇺🇦', BYN: '🇧🇾', GEL: '🇬🇪', AMD: '🇦🇲', AZN: '🇦🇿',
  TMT: '🇹🇲', UZS: '🇺🇿', KGS: '🇰🇬', TJS: '🇹🇯', KZT: '🇰🇿', MNT: '🇲🇳', CNH: '🇨🇳',
  IMP: '🇮🇲', JEP: '🇯🇪', GGP: '🇬🇬', SHP: '🇸🇭', TVD: '🇹🇻'
}

// 货币对应的国家代码映射（用于显示国旗）
const currencyCountryMap = {
  USD: 'us',
  CNY: 'cn',
  EUR: 'eu',
  GBP: 'gb',
  JPY: 'jp',
  KRW: 'kr',
  HKD: 'hk',
  AUD: 'au',
  CAD: 'ca',
  SGD: 'sg',
  AED: 'ae',
  AFN: 'af',
  ALL: 'al',
  AMD: 'am',
  ANG: 'an',
  AOA: 'ao',
  ARS: 'ar',
  AWG: 'aw',
  AZN: 'az',
  BAM: 'ba',
  BBD: 'bb',
  BDT: 'bd',
  BGN: 'bg',
  BHD: 'bh',
  BIF: 'bi',
  BMD: 'bm',
  BND: 'bn',
  BOB: 'bo',
  BRL: 'br',
  BSD: 'bs',
  BTN: 'bt',
  BWP: 'bw',
  BYN: 'by',
  BZD: 'bz',
  CDF: 'cd',
  CHF: 'ch',
  CLP: 'cl',
  CNH: 'cn',
  COP: 'co',
  CRC: 'cr',
  CUC: 'cu',
  CUP: 'cu',
  CVE: 'cv',
  CZK: 'cz',
  DJF: 'dj',
  DKK: 'dk',
  DOP: 'do',
  DZD: 'dz',
  EGP: 'eg',
  ERN: 'er',
  ETB: 'et',
  FJD: 'fj',
  FKP: 'fk',
  GEL: 'ge',
  GGP: 'gg',
  GHS: 'gh',
  GIP: 'gi',
  GMD: 'gm',
  GNF: 'gn',
  GTQ: 'gt',
  GYD: 'gy',
  HNL: 'hn',
  HRK: 'hr',
  HTG: 'ht',
  HUF: 'hu',
  IDR: 'id',
  ILS: 'il',
  IMP: 'im',
  INR: 'in',
  IQD: 'iq',
  IRR: 'ir',
  ISK: 'is',
  JEP: 'je',
  JMD: 'jm',
  JOD: 'jo',
  KES: 'ke',
  KGS: 'kg',
  KHR: 'kh',
  KMF: 'km',
  KPW: 'kp',
  KWD: 'kw',
  KYD: 'ky',
  KZT: 'kz',
  LAK: 'la',
  LBP: 'lb',
  LKR: 'lk',
  LRD: 'lr',
  LSL: 'ls',
  LYD: 'ly',
  MAD: 'ma',
  MDL: 'md',
  MGA: 'mg',
  MKD: 'mk',
  MMK: 'mm',
  MNT: 'mn',
  MOP: 'mo',
  MRU: 'mr',
  MUR: 'mu',
  MVR: 'mv',
  MWK: 'mw',
  MXN: 'mx',
  MYR: 'my',
  MZN: 'mz',
  NAD: 'na',
  NGN: 'ng',
  NIO: 'ni',
  NOK: 'no',
  NPR: 'np',
  NZD: 'nz',
  OMR: 'om',
  PAB: 'pa',
  PEN: 'pe',
  PGK: 'pg',
  PHP: 'ph',
  PKR: 'pk',
  PLN: 'pl',
  PYG: 'py',
  QAR: 'qa',
  RON: 'ro',
  RSD: 'rs',
  RUB: 'ru',
  RWF: 'rw',
  SAR: 'sa',
  SBD: 'sb',
  SCR: 'sc',
  SDG: 'sd',
  SEK: 'se',
  SHP: 'sh',
  SLE: 'sl',
  SOS: 'so',
  SRD: 'sr',
  STN: 'st',
  SYP: 'sy',
  SZL: 'sz',
  THB: 'th',
  TJS: 'tj',
  TMT: 'tm',
  TND: 'tn',
  TOP: 'to',
  TRY: 'tr',
  TTD: 'tt',
  TVD: 'tv',
  TWD: 'tw',
  TZS: 'tz',
  UAH: 'ua',
  UGX: 'ug',
  UYU: 'uy',
  UZS: 'uz',
  VED: 've',
  VES: 've',
  VND: 'vn',
  VUV: 'vu',
  WST: 'ws',
  XAF: 'cm',
  XCD: 'ag',
  XOF: 'sn',
  XPF: 'pf',
  YER: 'ye',
  ZAR: 'za',
  ZMW: 'zm',
  ZWL: 'zw'
}

// 主权货币白名单 - 只显示这些货币
const sovereignCurrencies = new Set([
  'USD', 'CNY', 'EUR', 'GBP', 'JPY', 'KRW', 'HKD', 'AUD', 'CAD', 'SGD',
  'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AWG', 'AZN', 'BAM',
  'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL', 'BSD',
  'BTN', 'BWP', 'BYN', 'BZD', 'CDF', 'CHF', 'CLP', 'CNH', 'COP', 'CRC',
  'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN',
  'ETB', 'FJD', 'FKP', 'GEL', 'GGP', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ',
  'GYD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'IMP', 'INR', 'IQD',
  'IRR', 'ISK', 'JEP', 'JMD', 'JOD', 'KES', 'KGS', 'KHR', 'KMF', 'KPW',
  'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD',
  'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK',
  'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR',
  'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD',
  'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SHP', 'SLE', 'SOS',
  'SRD', 'STN', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY',
  'TTD', 'TVD', 'TWD', 'TZS', 'UAH', 'UGX', 'UYU', 'UZS', 'VED', 'VES',
  'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XOF', 'XPF', 'YER', 'ZAR', 'ZMW', 'ZWL'
])

// 货币显示名称映射
const currencyNames = {
  USD: '美元',
  CNY: '人民币',
  EUR: '欧元',
  GBP: '英镑',
  JPY: '日元',
  KRW: '韩元',
  HKD: '港币',
  AUD: '澳元',
  CAD: '加元',
  SGD: '新加坡元',
  AED: '阿联酋迪拉姆',
  AFN: '阿富汗尼',
  ALL: '阿尔巴尼亚列克',
  AMD: '亚美尼亚德拉姆',
  ANG: '荷属安的列斯盾',
  AOA: '安哥拉宽扎',
  ARS: '阿根廷比索',
  AUD: '澳大利亚元',
  AWG: '阿鲁巴弗罗林',
  AZN: '阿塞拜疆马纳特',
  BAM: '波斯尼亚和黑塞哥维那可兑换马克',
  BBD: '巴巴多斯元',
  BDT: '孟加拉塔卡',
  BGN: '保加利亚列弗',
  BHD: '巴林第纳尔',
  BIF: '布隆迪法郎',
  BMD: '百慕大元',
  BND: '文莱元',
  BOB: '玻利维亚诺',
  BRL: '巴西雷亚尔',
  BSD: '巴哈马元',
  BTN: '不丹努尔特鲁姆',
  BWP: '博茨瓦纳普拉',
  BYN: '白俄罗斯卢布',
  BZD: '伯利兹元',
  CAD: '加拿大元',
  CDF: '刚果法郎',
  CHF: '瑞士法郎',
  CLP: '智利比索',
  CNH: '离岸人民币',
  COP: '哥伦比亚比索',
  CRC: '哥斯达黎加科朗',
  CUC: '古巴可兑换比索',
  CUP: '古巴比索',
  CVE: '佛得角埃斯库多',
  CZK: '捷克克朗',
  DJF: '吉布提法郎',
  DKK: '丹麦克朗',
  DOP: '多米尼加比索',
  DZD: '阿尔及利亚第纳尔',
  EGP: '埃及镑',
  ERN: '厄立特里亚纳克法',
  ETB: '埃塞俄比亚比尔',
  FJD: '斐济元',
  FKP: '福克兰群岛镑',
  GEL: '格鲁吉亚拉里',
  GGP: '根西岛镑',
  GHS: '加纳塞地',
  GIP: '直布罗陀镑',
  GMD: '冈比亚达拉西',
  GNF: '几内亚法郎',
  GTQ: '危地马拉格查尔',
  GYD: '圭亚那元',
  HNL: '洪都拉斯伦皮拉',
  HRK: '克罗地亚库纳',
  HTG: '海地古德',
  HUF: '匈牙利福林',
  IDR: '印尼盾',
  ILS: '以色列新谢克尔',
  IMP: '马恩岛镑',
  INR: '印度卢比',
  IQD: '伊拉克第纳尔',
  IRR: '伊朗里亚尔',
  ISK: '冰岛克朗',
  JEP: '泽西岛镑',
  JMD: '牙买加元',
  JOD: '约旦第纳尔',
  KES: '肯尼亚先令',
  KGS: '吉尔吉斯斯坦索姆',
  KHR: '柬埔寨瑞尔',
  KMF: '科摩罗法郎',
  KPW: '朝鲜元',
  KWD: '科威特第纳尔',
  KYD: '开曼群岛元',
  KZT: '哈萨克斯坦坚戈',
  LAK: '老挝基普',
  LBP: '黎巴嫩镑',
  LKR: '斯里兰卡卢比',
  LRD: '利比里亚元',
  LSL: '莱索托洛蒂',
  LYD: '利比亚第纳尔',
  MAD: '摩洛哥迪拉姆',
  MDL: '摩尔多瓦列伊',
  MGA: '马达加斯加阿里亚里',
  MKD: '马其顿代纳尔',
  MMK: '缅甸元',
  MNT: '蒙古图格里克',
  MOP: '澳门元',
  MRU: '毛里塔尼亚乌吉亚',
  MUR: '毛里求斯卢比',
  MVR: '马尔代夫拉菲亚',
  MWK: '马拉维克瓦查',
  MXN: '墨西哥比索',
  MYR: '马来西亚林吉特',
  MZN: '莫桑比克梅蒂卡尔',
  NAD: '纳米比亚元',
  NGN: '尼日利亚奈拉',
  NIO: '尼加拉瓜科多巴',
  NOK: '挪威克朗',
  NPR: '尼泊尔卢比',
  NZD: '新西兰元',
  OMR: '阿曼里亚尔',
  PAB: '巴拿马巴波亚',
  PEN: '秘鲁索尔',
  PGK: '巴布亚新几内亚基那',
  PHP: '菲律宾比索',
  PKR: '巴基斯坦卢比',
  PLN: '波兰兹罗提',
  PYG: '巴拉圭瓜拉尼',
  QAR: '卡塔尔里亚尔',
  RON: '罗马尼亚列伊',
  RSD: '塞尔维亚第纳尔',
  RUB: '俄罗斯卢布',
  RWF: '卢旺达法郎',
  SAR: '沙特里亚尔',
  SBD: '所罗门群岛元',
  SCR: '塞舌尔卢比',
  SDG: '苏丹镑',
  SEK: '瑞典克朗',
  SGD: '新加坡元',
  SHP: '圣赫勒拿镑',
  SLE: '塞拉利昂利昂',
  SOS: '索马里先令',
  SRD: '苏里南元',
  STN: '圣多美和普林西比多布拉',
  SYP: '叙利亚镑',
  SZL: '斯威士兰里兰吉尼',
  THB: '泰铢',
  TJS: '塔吉克斯坦索莫尼',
  TMT: '土库曼斯坦马纳特',
  TND: '突尼斯第纳尔',
  TOP: '汤加潘加',
  TRY: '土耳其里拉',
  TTD: '特立尼达和多巴哥元',
  TVD: '图瓦卢元',
  TWD: '新台币',
  TZS: '坦桑尼亚先令',
  UAH: '乌克兰格里夫纳',
  UGX: '乌干达先令',
  UYU: '乌拉圭比索',
  UZS: '乌兹别克斯坦索姆',
  VED: '委内瑞拉玻利瓦尔',
  VES: '委内瑞拉玻利瓦尔',
  VND: '越南盾',
  VUV: '瓦努阿图瓦图',
  WST: '萨摩亚塔拉',
  XAF: '中非法郎',
  XCD: '东加勒比元',
  XDR: '特别提款权',
  XOF: '西非法郎',
  XPF: '太平洋法郎',
  YER: '也门里亚尔',
  ZAR: '南非兰特',
  ZMW: '赞比亚克瓦查',
  ZWL: '津巴布韦元'
}

// 当前输入的货币和金额
const inputCurrency = ref('CNY')
const inputAmount = ref(100)

// 常用货币管理
const defaultFavoriteCurrencies = ['USD', 'CNY', 'EUR', 'GBP', 'JPY', 'KRW', 'HKD', 'AUD']
const favoriteCurrencies = ref([])
const showFavoriteManager = ref(false)
const availableCurrencies = computed(() => {
  return Object.keys(currencyNames).filter(currency => 
    sovereignCurrencies.has(currency) && !favoriteCurrencies.value.includes(currency)
  )
})

// 获取汇率数据
const fetchExchangeRates = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await fetch('https://v2.xxapi.cn/api/allrates')
    const data = await response.json()
    
    if (data.code === 200 && data.data && data.data.rates) {
      exchangeRates.value = {}
      for (const [currency, info] of Object.entries(data.data.rates)) {
        exchangeRates.value[currency] = info.rate
      }
      // 保存更新时间
      if (data.data.update_at) {
        const updateDate = new Date(data.data.update_at)
        lastUpdateTime.value = updateDate.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    } else {
      throw new Error('API返回数据格式错误')
    }
  } catch (err) {
    error.value = '获取汇率数据失败，请检查网络连接'
    lastUpdateTime.value = 'Error'
    console.error('汇率API请求失败:', err)
    // 使用备用数据
    exchangeRates.value = {
      USD: 1,
      CNY: 7.33,
      EUR: 0.97,
      GBP: 0.82,
      JPY: 157.77,
      KRW: 1472.56,
      HKD: 7.79,
      AUD: 1.62,
      CAD: 1.44,
      SGD: 1.37
    }
  } finally {
    loading.value = false
  }
}

// 计算所有货币的换算结果
const convertedAmounts = computed(() => {
  if (!exchangeRates.value[inputCurrency.value]) return {}
  
  const baseAmount = inputAmount.value / exchangeRates.value[inputCurrency.value]
  const results = {}
  
  for (const [currency, rate] of Object.entries(exchangeRates.value)) {
    // 只显示主权货币
    if (sovereignCurrencies.has(currency)) {
      results[currency] = (baseAmount * rate).toFixed(2)
    }
  }
  
  return results
})

// 返回主页
const goBack = () => {
  router.push('/')
}

// 更新输入金额
const updateAmount = (event) => {
  const value = parseFloat(event.target.value) || 0
  inputAmount.value = value
}

// 点击货币卡片切换输入货币
const switchInputCurrency = (currency) => {
  inputCurrency.value = currency
}

// 常用货币管理函数
const loadFavoriteCurrencies = () => {
  const saved = localStorage.getItem('favoriteCurrencies')
  if (saved) {
    try {
      favoriteCurrencies.value = JSON.parse(saved)
    } catch (e) {
      favoriteCurrencies.value = [...defaultFavoriteCurrencies]
    }
  } else {
    favoriteCurrencies.value = [...defaultFavoriteCurrencies]
  }
}

const saveFavoriteCurrencies = () => {
  localStorage.setItem('favoriteCurrencies', JSON.stringify(favoriteCurrencies.value))
}

const addToFavorites = (currency) => {
  if (!favoriteCurrencies.value.includes(currency)) {
    favoriteCurrencies.value.push(currency)
    saveFavoriteCurrencies()
  }
}

const removeFromFavorites = (currency) => {
  const index = favoriteCurrencies.value.indexOf(currency)
  if (index > -1) {
    favoriteCurrencies.value.splice(index, 1)
    saveFavoriteCurrencies()
  }
}

const onFavoriteDragEnd = () => {
  saveFavoriteCurrencies()
}

const toggleFavoriteManager = () => {
  showFavoriteManager.value = !showFavoriteManager.value
}

// 组件挂载时获取汇率数据
onMounted(() => {
  loadFavoriteCurrencies()
  fetchExchangeRates()
})
</script>

<template>
  <!-- 顶部固定区域 -->
  <div class="fixed-header">
    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      <h2 class="page-title">汇率换算</h2>
      <div class="api-info">
        <div class="api-source">数据来源: {{ apiSource }}</div>
        <div class="update-time" :class="{ 'error-status': lastUpdateTime === 'Error' }">
          {{ lastUpdateTime === 'Error' ? 'Error' : '更新时间: ' + lastUpdateTime }}
        </div>
      </div>
    </header>

    <!-- 输入区域 -->
    <div class="input-section">
      <h3>输入金额</h3>
      <div class="input-group">
        <select v-model="inputCurrency" class="currency-select">
          <option v-for="(name, code) in currencyNames" :key="code" :value="code" v-show="sovereignCurrencies.has(code)">
            {{ code }} - {{ name }}
          </option>
        </select>
        <input 
          type="number" 
          :value="inputAmount" 
          @input="updateAmount"
          class="amount-input"
          placeholder="请输入金额"
          min="0"
          step="0.01"
        />
      </div>
    </div>
  </div>

  <!-- 主要内容区域 -->
  <main class="main-content">
    <!-- 常用货币区域 -->
    <div class="favorite-section">
      <div class="favorite-header">
        <h3>常用货币</h3>
        <button class="manage-button" @click="toggleFavoriteManager">
          {{ showFavoriteManager ? '完成' : '管理' }}
        </button>
      </div>
      
      <!-- 常用货币网格 -->
      <VueDraggableNext 
        v-model="favoriteCurrencies" 
        class="favorite-grid"
        @end="onFavoriteDragEnd"
        :disabled="showFavoriteManager"
      >
        <div 
           v-for="currency in favoriteCurrencies" 
           :key="currency"
           class="favorite-item"
           :class="{ 'current-input': currency === inputCurrency, 'managing': showFavoriteManager }"
           @click="!showFavoriteManager && switchInputCurrency(currency)"
         >
           <div class="currency-header">
             <img 
                v-if="currencyCountryMap[currency]" 
                :src="`/src/assets/images/w80/${currencyCountryMap[currency]}.png`" 
                :alt="currency"
                class="currency-flag"
                @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='inline-flex'"
              />
              <span 
                v-else-if="currencyEmojis[currency]"
                class="currency-emoji"
              >
                {{ currencyEmojis[currency] }}
              </span>
              <span 
                v-if="currencyCountryMap[currency] && currencyEmojis[currency]"
                class="currency-emoji"
                style="display: none;"
              >
                {{ currencyEmojis[currency] }}
              </span>
             <div class="currency-info">
               <div class="currency-code">{{ currency }}</div>
               <div class="currency-name">{{ currencyNames[currency] || currency }}</div>
             </div>
           </div>
           <div class="currency-amount">
             <span v-if="currencySymbols[currency]" class="currency-symbol">{{ currencySymbols[currency] }}</span>
             {{ convertedAmounts[currency] || '0.00' }}
           </div>
           <button 
             v-if="showFavoriteManager" 
             class="remove-button"
             @click.stop="removeFromFavorites(currency)"
           >
             ×
           </button>
         </div>
      </VueDraggableNext>
      
      <!-- 添加货币区域 -->
      <div v-if="showFavoriteManager" class="add-currency-section">
        <h4>添加货币</h4>
        <div class="add-currency-grid">
          <div 
             v-for="currency in availableCurrencies" 
             :key="currency"
             class="add-currency-item"
             @click="addToFavorites(currency)"
           >
             <div class="add-currency-header">
               <img 
                  v-if="currencyCountryMap[currency]" 
                  :src="`/src/assets/images/w80/${currencyCountryMap[currency]}.png`" 
                  :alt="currency"
                  class="currency-flag-small"
                  @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='inline-flex'"
                />
                <span 
                  v-else-if="currencyEmojis[currency]"
                  class="currency-emoji-small"
                >
                  {{ currencyEmojis[currency] }}
                </span>
                <span 
                  v-if="currencyCountryMap[currency] && currencyEmojis[currency]"
                  class="currency-emoji-small"
                  style="display: none;"
                >
                  {{ currencyEmojis[currency] }}
                </span>
               <div class="add-currency-info">
                 <div class="currency-code">{{ currency }}</div>
                 <div class="currency-name">{{ currencyNames[currency] || currency }}</div>
               </div>
             </div>
             <div class="add-icon">+</div>
           </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-message">
      正在获取汇率数据...
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 换算结果区域 -->
    <div v-if="!loading" class="results-section">
      <h3>换算结果</h3>
      <div class="currency-grid">
        <div 
          v-for="(amount, currency) in convertedAmounts" 
          :key="currency"
          class="currency-item"
          :class="{ 'current-input': currency === inputCurrency }"
          @click="switchInputCurrency(currency)"
        >
          <div class="currency-header">
            <img 
              v-if="currencyCountryMap[currency]" 
              :src="`/src/assets/images/w80/${currencyCountryMap[currency]}.png`" 
              :alt="currency"
              class="currency-flag"
              @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='inline-flex'"
            />
            <span 
              v-else-if="currencyEmojis[currency]"
              class="currency-emoji"
            >
              {{ currencyEmojis[currency] }}
            </span>
            <span 
              v-if="currencyCountryMap[currency] && currencyEmojis[currency]"
              class="currency-emoji"
              style="display: none;"
            >
              {{ currencyEmojis[currency] }}
            </span>
            <div class="currency-info">
              <div class="currency-code">{{ currency }}</div>
              <div class="currency-name">{{ currencyNames[currency] || currency }}</div>
            </div>
          </div>
          <div class="currency-amount">
            <span v-if="currencySymbols[currency]" class="currency-symbol">{{ currencySymbols[currency] }}</span>
            {{ amount }}
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* 全局样式 */
* {
  box-sizing: border-box;
}

/* 顶部区域 */
.fixed-header {
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

.back-button {
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

.back-button:hover {
  background-color: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.back-icon {
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

.api-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.2;
}

.api-source {
  margin-bottom: 2px;
}

.update-time {
  color: var(--text-secondary);
}

.update-time.error-status {
  color: var(--text-accent);
  font-weight: bold;
}

/* 输入区域 */
.input-section {
  padding: 1rem 1.5rem;
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  margin: 1rem;
  width: calc(100% - 2rem);
}

.input-section h3 {
  color: var(--text-accent);
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.input-group {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.currency-select {
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  min-width: 180px;
  flex: 1;
}

.currency-select:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(30, 88, 75, 0.1);
}

.amount-input {
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  min-width: 150px;
  flex: 1;
}

.amount-input:focus {
  outline: none;
  border-color: var(--text-accent);
  box-shadow: 0 0 0 3px rgba(30, 88, 75, 0.1);
}

/* 主要内容区域 */
.main-content {
  margin-top: 220px;
  padding: 0;
  min-height: calc(100vh - 220px);
  width: 100%;
}

/* 加载和错误状态 */
.loading-message {
  text-align: center;
  padding: 2rem 1.5rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.error-message {
  text-align: center;
  padding: 2rem;
  color: var(--text-accent);
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  margin: 0 1.5rem 2rem 1.5rem;
  box-shadow: var(--glass-shadow);
}

/* 结果区域 */
.results-section {
  padding: 2rem 1.5rem;
}

.results-section h3 {
  color: var(--text-accent);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.currency-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  max-width: 100%;
}

.currency-item {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 8px 32px var(--glass-shadow);
}

.currency-item:hover {
  border-color: var(--text-accent);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.currency-item.current-input {
  border-color: var(--text-accent);
  background: var(--glass-bg);
  box-shadow: 0 8px 24px var(--shadow-medium);
}

.currency-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}

.currency-flag {
  width: 24px;
  height: 18px;
  border-radius: 2px;
  object-fit: cover;
  flex-shrink: 0;
}

.currency-emoji {
  font-size: 18px;
  width: 24px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.currency-emoji-small {
  font-size: 15px;
  width: 20px;
  height: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.currency-info {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.currency-code {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-accent);
  margin-bottom: 0.2rem;
}

.currency-name {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.currency-amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.currency-symbol {
  font-size: 1.2rem;
  color: var(--text-accent);
  font-weight: normal;
}

/* 常用货币区域样式 */
.favorite-section {
  padding: 1rem 1.5rem;
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  margin: 1rem;
  width: calc(100% - 2rem);
}

.favorite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.favorite-header h3 {
  color: var(--text-accent);
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.manage-button {
  background: var(--text-accent);
  color: var(--bg-secondary);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.manage-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-light);
  opacity: 0.9;
}

.favorite-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.favorite-item {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  box-shadow: 0 4px 16px var(--glass-shadow);
}

.favorite-item:hover {
  border-color: var(--text-accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow-medium);
}

.favorite-item.current-input {
  border-color: var(--text-accent);
  background: var(--glass-bg);
  box-shadow: 0 6px 20px var(--shadow-medium);
}

.favorite-item.managing {
  cursor: default;
}

.favorite-item.managing:hover {
  transform: none;
}

.currency-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}

.currency-flag {
  width: 24px;
  height: 18px;
  border-radius: 2px;
  object-fit: cover;
  flex-shrink: 0;
}

.currency-flag-small {
  width: 20px;
  height: 15px;
  border-radius: 2px;
  object-fit: cover;
  flex-shrink: 0;
}

.currency-info {
  flex: 1;
  min-width: 0;
}

.favorite-item .currency-code {
  font-size: 1rem;
  font-weight: bold;
  color: var(--text-accent);
  margin-bottom: 0.2rem;
}

.favorite-item .currency-name {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.favorite-item .currency-amount {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.currency-symbol {
  font-size: 0.9rem;
  color: var(--text-accent);
  font-weight: normal;
}

.remove-button {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--text-accent);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-button:hover {
  background: var(--text-primary);
  transform: scale(1.1);
  box-shadow: var(--shadow-medium);
}

.add-currency-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.add-currency-section h4 {
  color: var(--text-accent);
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.add-currency-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.6rem;
  max-height: 200px;
  overflow-y: auto;
}

.add-currency-item {
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 2px dashed var(--border-color);
  border-radius: 10px;
  padding: 0.8rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.add-currency-item:hover {
  border-color: var(--text-accent);
  background: var(--glass-bg);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--glass-shadow);
}

.add-currency-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.add-currency-info {
  flex: 1;
  min-width: 0;
}

.add-currency-item .currency-code {
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--text-accent);
  margin-bottom: 0.1rem;
}

.add-currency-item .currency-name {
  font-size: 0.7rem;
  color: var(--text-secondary);
  line-height: 1.1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-currency-item .add-icon {
  font-size: 1.2rem;
  color: var(--text-accent);
  font-weight: bold;
}

/* 响应式设计 */
/* 大屏幕 - 4列 */
@media (min-width: 1200px) {
  .currency-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 中等屏幕 - 3列 */
@media (min-width: 900px) and (max-width: 1199px) {
  .currency-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 小屏幕 - 2列 */
@media (min-width: 600px) and (max-width: 899px) {
  .currency-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 平板和手机 */
@media (max-width: 768px) {
  .top-bar {
    padding: 1rem;
  }
  
  .input-section {
    padding: 1rem;
  }
  
  .favorite-section {
    padding: 1rem;
  }
  
  .favorite-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.6rem;
  }
  
  .add-currency-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  
  .main-content {
    margin-top: 260px;
    padding: 1rem;
    min-height: calc(100vh - 260px);
  }
  
  .input-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .currency-select,
  .amount-input {
    min-width: auto;
    width: 100%;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .api-info {
    font-size: 0.7rem;
  }
}

/* 手机屏幕 - 1列 */
@media (max-width: 599px) {
  .currency-grid {
    grid-template-columns: 1fr;
  }
  
  .currency-item {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.2rem;
  }
  
  .api-info {
    font-size: 0.65rem;
  }
  
  .top-bar {
    padding: 0.8rem;
  }
}
</style>