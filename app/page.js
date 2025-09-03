'use client'

// hooks
import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

// icons
import { FaBaby, FaPerson, FaMedal, FaTrophy } from 'react-icons/fa6'

// utils
import { cn } from '@/lib/utils'
import { motion, useMotionValue, animate, useInView } from 'framer-motion'
import Autoplay from 'embla-carousel-autoplay'

// 資料請求函式庫
import useSWR from 'swr'

// icons
import {
  Plus,
  Star,
  School,
  ShoppingCart,
  Users,
  BookOpen,
  Search,
} from 'lucide-react'
import {
  AntaIcon,
  AsicsIcon,
  ButterflyIcon,
  MizunoIcon,
  MoltenIcon,
  SpaldingIcon,
  VictorIcon,
  WilsonIcon,
  YonexIcon,
  NikeIcon,
} from '@/components/icons/brand-icons'

// API 請求
import {
  fetchLocationOptions,
  fetchSportOptions,
  fetchBrandOptions,
  fetchCoachOptions,
} from '@/api'
import { fetchCenters } from '@/api/venue/center'
import { getCenterImageUrl } from '@/api/venue/image'

// next 元件
import Link from 'next/link'
import Image from 'next/image'

// UI 元件
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Ripple } from '@/components/ui/ripple'

// 自訂元件
import { Navbar } from '@/components/navbar'
import Footer from '@/components/footer'
import { HeroGeometric } from '@/components/shape-landing-hero'
import { LoadingState, ErrorState } from '@/components/loading-states'
import { CoachCard } from '@/components/card/coach-card'

export default function HomePage() {
  // #region 路由和URL參數
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryParams = useMemo(() => {
    const entries = Object.fromEntries(searchParams.entries())
    return entries
  }, [searchParams])

  // #region 狀態管理
  const [locationId, setLocationId] = useState('')
  const [sportId, setSportId] = useState('')
  const [minRating, setMinRating] = useState('')
  const [keyword, setKeyword] = useState('')
  const [coachId, setCoachId] = useState('')

  const [locations, setLocations] = useState([])
  const [sports, setSports] = useState([])
  const [brandIdMap, setBrandIdMap] = useState({})
  const [coaches, setCoaches] = useState([])

  // #region 數據獲取
  /* const {
    data,
    isLoading: isDataLoading,
    error,
    mutate,
  } = useSWR(['centers', queryParams], async ([, params]) => {
    // await new Promise((r) => setTimeout(r, 3000)) // 延遲測試載入動畫
    return fetchCenters(params)
  }) */

  // #region 副作用處理
  // 載入下拉選單選項
  /* useEffect(() => {
    const loadData = async () => {
      try {
        const locationData = await fetchLocationOptions()
        setLocations(locationData.rows || [])

        const sportData = await fetchSportOptions()
        setSports(sportData.rows || [])

        const brandData = await fetchBrandOptions()
        const map = {}
        ;(brandData.rows || []).forEach((brand) => {
          map[brand.name.toLowerCase()] = brand.id
        })
        setBrandIdMap(map)

        const coachData = await fetchCoachOptions()
        setCoaches(coachData.rows || [])
      } catch (error) {
        console.error('載入選項失敗:', error)
        toast.error('載入選項失敗')
      }
    }
    loadData()
  }, []) */

  // #region 事件處理函數
  const handleSearch = (keyword, customSportId) => {
    const newParams = new URLSearchParams(searchParams.toString())
    // 地區
    if (locationId && locationId !== 'all') {
      newParams.set('locationId', locationId)
    } else {
      newParams.delete('locationId')
    }
    // 運動
    const sportValue = customSportId ?? sportId
    if (sportValue && sportValue !== 'all') {
      newParams.set('sportId', sportValue)
    } else {
      newParams.delete('sportId')
    }
    // 評分
    if (minRating && minRating !== 'all') {
      newParams.set('minRating', minRating)
    } else {
      newParams.delete('minRating')
    }
    // 關鍵字
    if (keyword) {
      newParams.set('keyword', keyword)
    } else {
      newParams.delete('keyword')
    }
    newParams.set('page', '1') // 搜尋時重設分頁
    router.push(`/venue?${newParams.toString()}`)
  }

  // #region 資料顯示選項

  // 評分系統
  const ratingOptions = [
    { label: <>全部</>, value: 'all' },
    ...[2, 3, 4, 5].map((num) => ({
      label: (
        <>
          {Array.from({ length: num }).map((_, i) => (
            <Star key={i} className="text-yellow-400 fill-yellow-400" />
          ))}
          {num === 5 ? '5星' : `${num}星以上`}
        </>
      ),
      value: String(num),
    })),
  ]
  const renderStars = (data) => {
    const rating = data.averageRating ?? 0
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            className={cn(
              'h-4 w-4',
              i < fullStars
                ? 'fill-yellow-400 text-yellow-400'
                : i === fullStars && hasHalfStar
                  ? 'fill-yellow-400/50 text-yellow-400'
                  : 'stroke-yellow-400 text-muted'
            )}
            key={`star-${data.id}-position-${i + 1}`}
          />
        ))}
        {rating > 0 && (
          <span className="ml-1 text-xs text-accent">
            {Number(rating).toFixed(1)}
          </span>
        )}
      </div>
    )
  }

  // 數字紀錄
  function Feacture({ icon: Icon, count, label }) {
    const ref = React.useRef(null)
    const inView = useInView(ref, { once: true, amount: 0.5 })
    const motionValue = useMotionValue(0)
    const [display, setDisplay] = useState(0)

    useEffect(() => {
      if (inView) {
        const controls = animate(motionValue, count, {
          duration: 1.2,
          ease: 'easeOut',
          onUpdate: (latest) => setDisplay(Math.floor(latest)),
        })
        return controls.stop
      }
    }, [inView, count, motionValue])

    return (
      <div ref={ref} className="flex items-center gap-4">
        <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center border border-accent rounded">
          <Icon className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1} />
        </div>
        <div>
          <span className="text-xs md:text-sm">{label}超過</span>
          <div className="flex items-center">
            <motion.span className="font-bold text-highlight text-3xl md:text-5xl min-w-[2em]">
              {display}
            </motion.span>
            {/* <Plus strokeWidth={3} /> */}
          </div>
        </div>
      </div>
    )
  }
  const stats = [
    { icon: School, count: 100, label: '場館' },
    { icon: ShoppingCart, count: 50, label: '商品' },
    { icon: Users, count: 200, label: '隊伍' },
    { icon: BookOpen, count: 80, label: '課程' },
  ]

  // 動畫參數
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: i * 0.3,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }

  const centers = [
    {
      id: 1,
      name: '北投運動中心',
      location: '台北市',
      address: '台北市北投區石牌路一段39巷100號',
      image: '/center-pic/center01.jpg',
      averageRating: 3.5,
    },
    {
      id: 2,
      name: '士林運動中心',
      location: '台北市',
      address: '台北市士林區士商路一號',
      image: '/center-pic/center02.jpg',
      averageRating: 4,
    },
    {
      id: 3,
      name: '內湖運動中心',
      location: '台北市',
      address: '台北市內湖區洲子街12號',
      image: '/center-pic/center03.jpg',
      averageRating: 3.7,
    },
  ]

  // 品牌圖標映射
  const brandIconMap = {
    anta: AntaIcon,
    asics: AsicsIcon,
    butterfly: ButterflyIcon,
    mizuno: MizunoIcon,
    molten: MoltenIcon,
    spalding: SpaldingIcon,
    victor: VictorIcon,
    wilson: WilsonIcon,
    yonex: YonexIcon,
    Nike: NikeIcon,
  }

  // 定義 Brand 欄位
  const brandItems = [
    { iconKey: 'butterfly', label: 'Butterfly' },
    { iconKey: 'molten', label: 'Molten' },
    { iconKey: 'spalding', label: 'Spalding' },
    { iconKey: 'victor', label: 'VICTOR' },
    { iconKey: 'wilson', label: 'Wilson' },
    { iconKey: 'yonex', label: 'Yonex' },
    { iconKey: 'anta', label: 'Anta' },
    { iconKey: 'asics', label: 'Asics' },
    { iconKey: 'mizuno', label: 'Mizuno' },
    { iconKey: 'Nike', label: 'Nike' },
  ]

  const productHomeIcons = ['anta', 'asics', 'mizuno', 'Nike']

  const autoplay = Autoplay({ delay: 2000, stopOnInteraction: true })
  // 教練選項
  const coachs = [
    {
      id: 1,
      name: '周天成',
      avatar: '/coach/coach1.jpg',
      sport: '羽球',
      bio: '熱愛心肺訓練，協助學員提升耐力。',
    },
    {
      id: 2,
      name: '莊智淵',
      avatar: '/coach/coach2.jpg',
      sport: '桌球',
      bio: '專注於功能性與運動表現訓練。',
    },
    {
      id: 3,
      name: '林志傑',
      avatar: '/coach/coach3.jpg',
      sport: '籃球',
      bio: '專長於運動傷害復健與功能性訓練。',
    },
    {
      id: 4,
      name: '袁永誠',
      avatar: '/coach/coach4.jpg',
      sport: '足球',
      bio: '專業CrossFit教練，強調功能性訓練。',
    },
  ]

  //  #region 載入和錯誤狀態處理
  /* if (isDataLoading) return <LoadingState message="載入場館資料中..." />
  if (error)
    return (
      <ErrorState
        title="場館資料載入失敗"
        message={`載入錯誤：${error.message}` || '找不到您要查看的場館資料'}
        onRetry={mutate}
        backUrl="/"
        backLabel="返回首頁"
      />
    ) */
  // #region Marks up
  return (
    <>
      <Navbar />

      {/* Banner */}
      <section className="w-full h-[300px] md:h-[618px] relative">
        <Image
          src="/banner/home-banner.jpg"
          alt="Banner"
          fill
          className="object-cover"
          priority
        />
        <HeroGeometric
          badge="Sport + Simplify"
          title1="SPORTIFY"
          title2="使運動變得簡單"
          description="你將不再有藉口"
          className="h-full"
        />
      </section>

      {/* 數字紀錄 */}
      <section className="container mx-auto max-w-screen-xl px-4 md:px-6 py-12 md:py-20">
        <section className="grid grid-cols-2 md:grid-cols-4 justify-around md:justify-between gap-6 place-items-center">
          {stats.map((stat, idx) => (
            <Feacture
              key={idx}
              icon={stat.icon}
              count={stat.count}
              label={stat.label}
            />
          ))}
        </section>
      </section>

      {/* 快速預訂場地 */}
      <section className="bg-background-dark px-4 md:px-6 py-12 md:py-20">
        <div className="flex flex-col gap-8 container mx-auto max-w-screen-xl">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto text-center">
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={0}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                運動場地預訂
              </h2>
            </motion.div>
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={1}
            >
              <h3 className="italic text-highlight text-base sm:text-lg md:text-xl font-medium">
                「想打就打，場地先幫你訂好！」
              </h3>
              {/* <p className="text-base max-w-md">
                透過平台快速搜尋並預約附近的運動場地，讓你專心享受比賽與運動。
              </p> */}
            </motion.div>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            {/* 精選場館 */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={2}
              className="flex-2 relative"
            >
              <Carousel className="w-full">
                <CarouselContent>
                  {centers && centers.length > 0 ? (
                    centers.map((center, index) => (
                      <CarouselItem
                        key={center.id || index}
                        className="flex justify-center"
                      >
                        <Link
                          href={`/venue/${center.id}`}
                          className="w-full h-full block"
                        >
                          <div className="relative w-full h-[300px] md:h-[532px] rounded-lg overflow-hidden">
                            {center.image ? (
                              <Image
                                alt={center.name || `場館 ${index + 1}`}
                                className={cn(
                                  'object-cover transition-transform duration-300 ease-in-out hover:scale-105'
                                )}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                src={center.image}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                                <div className="text-center">
                                  <div className="text-lg font-medium">
                                    {center.name || `場館 ${index + 1}`}
                                  </div>
                                  <div className="text-sm mt-2">暫無圖片</div>
                                </div>
                              </div>
                            )}
                            {/* 場館名稱疊加層 */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                              <h3 className="text-white font-semibold text-lg">
                                {center.name || `場館 ${index + 1}`}
                              </h3>
                              {center.location && (
                                <p className="text-white/80 text-sm">
                                  {center.location.name || center.location}
                                </p>
                              )}
                              {center.averageRating && (
                                <div>{renderStars(center)}</div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </CarouselItem>
                    ))
                  ) : (
                    <CarouselItem className="flex justify-center">
                      <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg">
                        <div className="text-center">
                          <div className="text-lg font-medium">
                            暫無場館資料
                          </div>
                          <div className="text-sm mt-2">請稍後再試</div>
                        </div>
                      </div>
                    </CarouselItem>
                  )}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10" />
                <CarouselNext className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10" />
              </Carousel>
            </motion.div>

            {/* 快速搜尋 */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={3}
              className="flex-1 w-full"
            >
              <Card>
                <CardHeader>
                  <CardTitle>請輸入篩選條件</CardTitle>
                </CardHeader>
                <CardContent>
                  <form>
                    <div className="flex flex-col gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="email">地區</Label>
                        <Select
                          value={locationId}
                          onValueChange={setLocationId}
                        >
                          <SelectTrigger className="w-full bg-accent text-accent-foreground !h-10">
                            <SelectValue placeholder="請選擇地區" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem key="all" value="all">
                              全部
                            </SelectItem>
                            {locations.length === 0 ? (
                              <div className="px-3 py-2 text-gray-400">
                                沒有符合資料
                              </div>
                            ) : (
                              locations.map((loc) => (
                                <SelectItem
                                  key={loc.id}
                                  value={loc.id.toString()}
                                >
                                  {loc.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">運動</Label>
                        <Select value={sportId} onValueChange={setSportId}>
                          <SelectTrigger className="w-full bg-accent text-accent-foreground !h-10">
                            <SelectValue placeholder="請選擇運動" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem key="all" value="all">
                              全部
                            </SelectItem>
                            {sports?.length === 0 ? (
                              <div className="px-3 py-2 text-gray-400">
                                沒有符合資料
                              </div>
                            ) : (
                              sports.map((sport) => (
                                <SelectItem
                                  key={sport.id}
                                  value={sport.id.toString()}
                                >
                                  {sport.name || sport.id}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">評分</Label>
                        <Select value={minRating} onValueChange={setMinRating}>
                          <SelectTrigger className="w-full bg-accent text-accent-foreground !h-10">
                            <SelectValue placeholder="請選擇評分星等" />
                          </SelectTrigger>
                          <SelectContent>
                            {ratingOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">關鍵字</Label>
                        <div className="relative flex items-center">
                          <Search
                            className="absolute left-3 text-accent-foreground/50"
                            size={20}
                          />
                          <Input
                            type="search"
                            className="w-full bg-accent text-accent-foreground !h-10 pl-10"
                            placeholder="請輸入關鍵字"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSearch(keyword)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  <Button
                    variant="highlight"
                    type="submit"
                    className="w-full"
                    onClick={() => handleSearch(keyword)}
                  >
                    搜尋
                  </Button>
                  <Button
                    variant="secondary"
                    type="submit"
                    className="w-full"
                    onClick={() => router.push(`/venue`)}
                  >
                    查看更多
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 商城品牌（自動輪播） */}
      <section className="px-4 md:px-6 py-12 md:py-20">
        <div className="flex flex-col gap-8 container mx-auto max-w-screen-xl">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto text-center">
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={0}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                運動用品商城
              </h2>
            </motion.div>
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={1}
            >
              <h3 className="italic text-highlight text-base sm:text-lg md:text-xl font-medium">
                「裝備到位，運動更盡興。」
              </h3>
              {/* <p className="text-base max-w-md">
                精選各類運動用品與配件，從專業器材到運動服飾，一站式購足，品質保證，幫你用最合適的裝備迎接每場挑戰。
              </p> */}
            </motion.div>
          </div>
          <Carousel
            plugins={[autoplay]}
            onMouseEnter={autoplay.stop}
            onMouseLeave={autoplay.reset}
            className="relative w-full px-4 sm:px-12 overflow-hidden"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {brandItems.map((brandItem, idx) => {
                const IconComponent = brandIconMap[brandItem.iconKey]
                const brandId = brandIdMap[brandItem.label.toLowerCase()]
                const href = productHomeIcons.includes(brandItem.iconKey)
                  ? `/shop?page=1`
                  : brandId
                    ? `/shop?brandId=${brandId}&page=1`
                    : `/shop?keyword=${encodeURIComponent(brandItem.label)}&page=1`
                return (
                  <CarouselItem
                    key={`${brandItem.iconKey}-${idx}`}
                    className="pl-2 md:pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                  >
                    <Link
                      href={href}
                      className="group flex items-center justify-center transition-all duration-300 hover:scale-105"
                    >
                      {IconComponent ? (
                        <IconComponent className="w-20 h-20 text-foreground transition-opacity duration-300" />
                      ) : (
                        <span className="text-base">{brandItem.label}</span>
                      )}
                    </Link>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur hover:bg-background" />
            <CarouselNext className="hidden sm:flex right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur hover:bg-background" />
          </Carousel>
        </div>
      </section>

      {/* 組隊簡介 */}
      <section className="relative px-4 md:px-6 py-12 md:py-20 bg-[url('/banner/team-hero.jpg')] bg-cover bg-center bg-fixed">
        {/* 遮罩層 */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none z-0" />
        <div className="relative flex flex-col lg:flex-row justify-between container mx-auto max-w-screen-xl gap-6">
          {/* 標題區域 */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-4">
              <motion.div
                variants={fadeUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                custom={0}
              >
                <h3 className="italic text-highlight text-base sm:text-lg md:text-xl font-medium">
                  「沒隊友？這裡就是你的球隊！」
                </h3>
              </motion.div>
              <motion.div
                variants={fadeUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                custom={1}
              >
                <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold">
                  組隊找人打球
                </h2>
              </motion.div>
              <motion.div
                variants={fadeUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                custom={2}
              >
                <p className="text-white text-base max-w-md mb-4">
                  快速配對有相同興趣與水平的球友，不管是臨時湊人還是長期戰隊，都能輕鬆組成團隊，一起享受運動的樂趣。
                </p>
              </motion.div>
              <motion.div
                variants={fadeUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                custom={3}
                className="hidden md:block"
              >
                <Button variant="highlight">立即報名</Button>
              </motion.div>
            </div>
          </div>

          {/* 程度卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: '新手', icon: <FaBaby /> },
              { title: '中手', icon: <FaPerson /> },
              { title: '熟手', icon: <FaMedal /> },
              { title: '老手', icon: <FaTrophy /> },
            ].map((level, index) => (
              <motion.div
                key={level.title}
                variants={fadeUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                custom={index + 4}
              >
                <Card className="bg-background text-gray-900 h-full p-0 md:p-2">
                  <CardContent className="flex flex-col items-center justify-center p-8 h-full">
                    <div className="text-primary text-6xl mb-4 text-background">
                      {level.icon}
                    </div>
                    <h3 className="text-accent-foreground text-xl font-bold mb-4 text-center">
                      {level.title}
                    </h3>
                    <Button
                      variant="ghost"
                      className="text-primary hover:primary/90 font-medium"
                    >
                      查看更多
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* 手機版 立即報名 按鈕 */}
          <div className="md:hidden flex justify-center">
            <Button variant="highlight" className="w-full">
              立即報名
            </Button>
          </div>
        </div>
      </section>

      {/* 教練簡介 */}
      <section className="bg-background-dark px-4 md:px-6 py-12 md:pt-20 md:pb-30">
        <div className="flex flex-col gap-8 container mx-auto max-w-screen-xl">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto text-center">
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={0}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                找教練上課
              </h2>
            </motion.div>
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={1}
            >
              <h3 className="italic text-highlight text-base sm:text-lg md:text-xl font-medium">
                「專業教練，帶你突破極限。」
              </h3>
              {/* <p className="text-base max-w-md">
                提供多元運動教練資訊與課程，依照你的需求與程度量身推薦，無論是基礎入門或技術進階，都能找到最適合的指導。
              </p> */}
            </motion.div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {coachs?.length &&
              coachs?.slice(0, 4).map((coach) => (
                <motion.div
                  variants={fadeUpVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  custom={coach.id}
                  key={coach.id}
                >
                  <CoachCard data={coach} />
                </motion.div>
              ))}
          </div>
          <div className="flex flex-col items-center">
            <Button
              variant="highlight"
              size="lg"
              className="w-full md:w-auto"
              onClick={() => router.push(`/course`)}
            >
              查看更多
            </Button>
          </div>
        </div>
      </section>

      {/* 立即加入 */}
      <section className="relative bg-[url('/banner/join-us.jpg')] bg-cover bg-top bg-fixed text-white overflow-visible">
        <div className="container mx-auto max-w-screen-xl pt-10 md:pt-0 px-4 md:px-6">
          <div className="absolute inset-0 bg-black/60 pointer-events-none z-0" />
          <div className="flex flex-col-reverse lg:flex-row items-center gap-30 md:gap-20">
            {/* 運動員圖片 */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={0}
              className="relative -mt-20 md:-mt-32 lg:-mt-40 w-full max-w-none overflow-visible lg:w-2/5 z-10"
            >
              <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]">
                <Image
                  src="/banner/player.png"
                  alt="Professional Athlete"
                  fill
                  className="object-contain object-bottom"
                />
              </div>
            </motion.div>
            {/* 文字內容 */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={1}
              className="relative flex flex-col items-center justify-center gap-6 lg:pl-8 lg:w-3/5 z-10 md:min-h-[340px]"
            >
              {/* Ripple 絕對定位在中央 */}
              <Ripple className="hidden md:inline-block" />
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span
                    className={cn(
                      'bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-white/90 to-purple-600'
                    )}
                  >
                    立即加入
                  </span>
                  SPORTIFY
                </h2>
              </div>
              <motion.div
                variants={fadeUpVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                custom={2}
                className="relative z-10"
              >
                <Link href="/register">
                  <div className="p-[1px] sm:p-[2px] bg-gradient-to-r from-orange-600 to-purple-600 rounded-full">
                    <div className="bg-background transition-colors hover:bg-background/50 px-3 sm:px-8 py-1 sm:py-4 h-8 sm:h-12 rounded-full text-foreground text-xs sm:text-sm flex items-center justify-center whitespace-nowrap">
                      註冊會員
                    </div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
