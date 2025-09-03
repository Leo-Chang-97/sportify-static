'use client'

// hooks
import React, { useState, useEffect } from 'react'
import { useVenue } from '@/contexts/venue-context'

// utils
import { cn } from '@/lib/utils'

// Icon
import {
  Heart,
  Share,
  Star,
  ClipboardCheck,
  CircleParking,
  ShowerHead,
  MapPin,
  TrainFront,
  Bus,
} from 'lucide-react'
import {
  IconShoppingCart,
  IconBarbell,
  IconYoga,
  IconBike,
  IconTreadmill,
  IconWifi,
} from '@tabler/icons-react'
import {
  BasketballIcon,
  BadmintonIcon,
  TableTennisIcon,
  TennisIcon,
  VolleyballIcon,
  TennisRacketIcon,
  SoccerIcon,
  BaseballBatIcon,
  BilliardBallIcon,
} from '@/components/icons/sport-icons'
import {
  FacebookShareButton,
  LineShareButton,
  TwitterShareButton,
  ThreadsShareButton,
  FacebookIcon,
  LineIcon,
  XIcon,
  ThreadsIcon,
} from 'react-share'
import { FaFacebook } from 'react-icons/fa6'

// API 請求
import { fetchCenter } from '@/api/venue/center'
import { getCenterImageUrl } from '@/api/venue/image'
import { addRating, getCenterRatings } from '@/api/venue/rating'

// next 元件
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// UI 元件
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Rating, RatingButton } from '@/components/ui/rating'

// 自訂元件
import { Navbar } from '@/components/navbar'
import BreadcrumbAuto from '@/components/breadcrumb-auto'
import Footer from '@/components/footer'
import { LoadingState, ErrorState } from '@/components/loading-states'
import { CardFooter } from '@/components/card/card'

// 使用 Map 提供互動式地圖功能
const Map = dynamic(() => import('@/components/map'), {
  ssr: false,
})

const range = (length) => Array.from({ length }, (_, i) => i)

// #region 評論區元件
function RatingSection({ centerId }) {
  const [userRating, setUserRating] = React.useState(0)
  const [comment, setComment] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // 分頁評論相關狀態
  const [ratings, setRatings] = React.useState([])
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalRows, setTotalRows] = React.useState(0)
  const [loadingMore, setLoadingMore] = React.useState(false)
  const [initialLoading, setInitialLoading] = React.useState(true)

  // 初次載入評論
  /* React.useEffect(() => {
    const fetchInitialRatings = async () => {
      try {
        setInitialLoading(true)
        const result = await getCenterRatings(centerId, {
          page: 1,
          perPage: 5,
        })
        setRatings(result.ratings || [])
        setPage(result.page || 1)
        setTotalPages(result.totalPages || 1)
        setTotalRows(result.totalRows || 0)
      } catch (error) {
        console.error('載入評論失敗:', error)
        toast.error('載入評論失敗')
      } finally {
        setInitialLoading(false)
      }
    }

    if (centerId) {
      fetchInitialRatings()
    }
  }, [centerId]) */

  // 載入更多評論
  const handleLoadMore = async () => {
    if (page >= totalPages) return

    setLoadingMore(true)
    try {
      const nextPage = +page + 1
      const result = await getCenterRatings(centerId, {
        page: nextPage,
        perPage: 5,
      })
      setRatings((prev) => [...prev, ...(result.ratings || [])])
      setPage(nextPage)
    } catch (error) {
      console.error('載入更多評論失敗:', error)
      toast.error('載入更多評論失敗')
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSubmitRating = async () => {
    if (userRating === 0) {
      toast.error('請選擇評分')
      return
    }

    setIsSubmitting(true)
    try {
      await addRating(centerId, {
        rating: userRating,
        comment: comment || null,
      })
      toast.success('評分提交成功')
      setUserRating(0)
      setComment('')

      // 重新載入第一頁評論
      const result = await getCenterRatings(centerId, { page: 1, perPage: 5 })
      setRatings(result.ratings || [])
      setPage(1)
      setTotalPages(result.totalPages || 1)
      setTotalRows(result.totalRows || 0)
    } catch (error) {
      console.error('評分提交失敗:', error)
      toast.error('評分提交失敗')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <section>
      <h2 className="mb-6 text-xl font-bold">評價與評論</h2>

      {/* 評分輸入區 */}
      <Card className="mb-6">
        {/* <CardHeader>
          <h3 className="text-lg font-semibold">留下您的評價</h3>
        </CardHeader> */}
        <CardContent className="space-y-4">
          {/* 星星評分 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">評分</label>
            <div className="flex items-center gap-1">
              <Rating
                value={userRating}
                onValueChange={(v) => setUserRating(v)}
                className="text-yellow-400"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <RatingButton key={i} size={25} />
                ))}
              </Rating>
              <span className="ml-2 text-sm text-muted-foreground">
                {userRating > 0 && `${userRating} 星`}
              </span>
            </div>
          </div>

          {/* 評論輸入 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">評論 (選填)</label>
            <Textarea
              placeholder="分享您的使用體驗..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleSubmitRating}
            disabled={isSubmitting || userRating === 0}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? '提交中...' : '提交評價'}
          </Button>
        </CardContent>
      </Card>

      {/* 其他人的評論 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">其他評價 ({totalRows || 0})</h3>

        {initialLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>載入評價中...</p>
          </div>
        ) : ratings && ratings.length > 0 ? (
          <div className="space-y-4">
            {ratings.map((rating, index) => (
              <Card key={rating.id || index} className="gap-2">
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={rating.member?.avatar} />
                      <AvatarFallback>
                        {(
                          rating.member?.name ||
                          rating.member_name ||
                          '匿名用戶'
                        ).charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm md:text-base">
                            {rating.member?.name ||
                              rating.member_name ||
                              '匿名用戶'}
                          </span>
                          <div className="flex items-center">
                            {range(5).map((i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'h-4 w-4',
                                  i < rating.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-yellow-400'
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs md:text-sm text-muted-foreground ">
                          {formatDate(rating.created_at || rating.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                {rating.comment && (
                  <CardFooter>
                    <p className="pl-12 text-sm text-muted-foreground leading-relaxed">
                      {rating.comment}
                    </p>
                  </CardFooter>
                )}
              </Card>
            ))}

            {/* 載入更多按鈕 */}
            {page < totalPages && (
              <div className="text-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {loadingMore
                    ? '載入中...'
                    : `載入更多評價 (剩餘 ${totalRows - ratings.length} 則)`}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="mx-auto mb-2 text-muted-foreground/50" />
            <p>尚無評價，成為第一個評價的人吧！</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default function CenterDetailPage() {
  // #region 路由和URL參數
  const { id } = useParams()
  const router = useRouter()
  const { setVenueData } = useVenue()

  // 在 client-side 取得當前 URL，避免 SSR 階段存取 window
  const [currentUrl, setCurrentUrl] = useState('')
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href)
    }
  }, [])

  // #region 組件狀態管理
  // const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // #region 副作用處理
  /* useEffect(() => {
    const fetchCenterData = async () => {
      try {
        setLoading(true)
        // await new Promise((r) => setTimeout(r, 3000)) // 延遲測試載入動畫
        const centerData = await fetchCenter(id)
        setData(centerData.record)
      } catch (err) {
        console.error('Error fetching center detail:', err)
        setError(err.message)
        toast.error('載入場館資料失敗')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCenterData()
    }
  }, [id]) */

  // #region 事件處理函數
  const handleReservation = (e) => {
    e.preventDefault()
    setVenueData((prev) => ({
      ...prev,
      center: data.name,
      location: data.location.name,
      centerId: data.id,
      locationId: data.location.id,
    }))
    // 跳轉到預約頁面
    router.push('/venue/reservation')
  }

  const handleSportButton = (item) => {
    setVenueData((prev) => ({
      ...prev,
      center: data.name,
      centerId: data.id,
      location: data.location.name,
      locationId: data.location.id,
      sport: item.name,
      sportId: item.id,
    }))
    // 跳轉到預約頁面
    router.push('/venue/reservation')
  }

  //  #region 載入和錯誤狀態處理
  /* if (loading) {
    return <LoadingState message="載入場館資料中..." />
  }

  if (error || !data) {
    const retryFetch = () => {
      const fetchCenterData = async () => {
        try {
          setLoading(true)
          setError(null)
          const centerData = await fetchCenter(id)
          setData(centerData.record)
        } catch (err) {
          console.error('Error fetching center detail:', err)
          setError(err.message)
          toast.error('載入場館資料失敗')
        } finally {
          setLoading(false)
        }
      }
      fetchCenterData()
    }

    return (
      <ErrorState
        title="場館資料載入失敗"
        message={error || '找不到您要查看的場館資料'}
        onRetry={retryFetch}
        backUrl="/venue"
        backLabel="返回場館列表"
      />
    )
  } */
  const data = {
    id: 1,
    name: '北投運動中心',
    locationId: 1,
    address: '台北市北投區石牌路一段39巷100號',
    latitude: 25.11669482631824,
    longitude: 121.5099281673907,
    location: {
      id: 1,
      name: '台北市',
    },
    centerSports: [
      {
        centerId: 1,
        sportId: 2,
        sport: {
          id: 2,
          name: '羽球',
          iconKey: 'badminton',
        },
      },
      {
        centerId: 1,
        sportId: 3,
        sport: {
          id: 3,
          name: '桌球',
          iconKey: 'tabletennis',
        },
      },
      {
        centerId: 1,
        sportId: 5,
        sport: {
          id: 5,
          name: '排球',
          iconKey: 'volleyball',
        },
      },
      {
        centerId: 1,
        sportId: 6,
        sport: {
          id: 6,
          name: '壁球',
          iconKey: 'squash',
        },
      },
      {
        centerId: 1,
        sportId: 7,
        sport: {
          id: 7,
          name: '足球',
          iconKey: 'soccer',
        },
      },
      {
        centerId: 1,
        sportId: 8,
        sport: {
          id: 8,
          name: '棒球',
          iconKey: 'baseball',
        },
      },
    ],
    images: [
      'center01.jpg',
      'center01-1.jpg',
      'center01-2.jpg',
      'center01-3.jpg',
      'center01-4.jpg',
    ],
    ratings: [
      {
        member: {
          id: '20',
          email: 'user20_DZbAY@example.com',
          password:
            '$2b$10$dzcDwmarK4sLr3ifATqlo./v9LozunDm3RJmL5/STBEPKF54PAOSm',
          name: '劉冠廷',
          phone: '0964616666',
          gender: 'male',
          birth: '1990-08-14T00:00:00.000Z',
          avatar: null,
          address: '花蓮縣',
          isActive: true,
          emailVerified: true,
          phoneVerified: false,
          role: 'user',
          firebaseUid: null,
          createdAt: '2025-08-26T12:00:26.641Z',
          updatedAt: '2025-08-26T12:00:26.641Z',
        },
        rating: 4,
        comment: '工作人員很親切，服務很周到',
        createdAt: '2025-08-03T18:13:53.281Z',
      },
      {
        member: {
          id: '24',
          email: 'user24_d2aTh@example.com',
          password:
            '$2b$10$PyuH6fgX2k4WW615zA0f0uumIB1QZIV2R3WqFVVK1hVr33W2lF84O',
          name: '沈冠宇',
          phone: '0971767335',
          gender: 'none',
          birth: '1986-02-21T00:00:00.000Z',
          avatar: null,
          address: '南投縣',
          isActive: true,
          emailVerified: false,
          phoneVerified: true,
          role: 'user',
          firebaseUid: null,
          createdAt: '2025-08-26T12:00:26.641Z',
          updatedAt: '2025-08-26T12:00:26.641Z',
        },
        rating: 3,
        comment: '有專業的體適能檢測，很貼心',
        createdAt: '2025-05-10T02:17:31.375Z',
      },
      {
        member: {
          id: '27',
          email: 'user27_khU48@example.com',
          password:
            '$2b$10$4OLzjTurmdabLuoGfzW1OewYaLFSPQysJtS8dmJ5X7zkMX8AgAUxq',
          name: '韓鈺婷',
          phone: '0972020287',
          gender: 'male',
          birth: '1988-01-08T00:00:00.000Z',
          avatar: null,
          address: '臺中市',
          isActive: false,
          emailVerified: false,
          phoneVerified: true,
          role: 'user',
          firebaseUid: null,
          createdAt: '2025-08-26T12:00:26.641Z',
          updatedAt: '2025-08-26T12:00:26.641Z',
        },
        rating: 3,
        comment: null,
        createdAt: '2025-02-08T19:55:30.361Z',
      },
      {
        member: {
          id: '31',
          email: 'user31_DlRMW@example.com',
          password:
            '$2b$10$mEd0wb49mMUd08hGrF25Eu8djZkOhSrZu6wmLaEgNnQW5d7gwcAYu',
          name: '吳怡婷',
          phone: '0992230655',
          gender: 'male',
          birth: '1985-03-23T00:00:00.000Z',
          avatar: null,
          address: '嘉義市',
          isActive: true,
          emailVerified: true,
          phoneVerified: true,
          role: 'user',
          firebaseUid: null,
          createdAt: '2025-08-26T12:00:26.641Z',
          updatedAt: '2025-08-26T12:00:26.641Z',
        },
        rating: 5,
        comment: '運動氛圍很好，大家都很友善',
        createdAt: '2025-05-25T06:27:46.906Z',
      },
      {
        member: {
          id: '36',
          email: 'user36_EIKbX@example.com',
          password:
            '$2b$10$7iDpLjYb3Zu2TClRrVEBM.VwOxFdmNux4K.51DnuLJrJglgrnzi9S',
          name: '張詩涵',
          phone: '0944998600',
          gender: 'female',
          birth: '2007-10-28T00:00:00.000Z',
          avatar: null,
          address: '苗栗縣',
          isActive: true,
          emailVerified: true,
          phoneVerified: false,
          role: 'user',
          firebaseUid: null,
          createdAt: '2025-08-26T12:00:26.641Z',
          updatedAt: '2025-08-26T12:00:26.641Z',
        },
        rating: 4,
        comment: null,
        createdAt: '2025-06-01T17:07:18.616Z',
      },
      {
        member: {
          id: '37',
          email: 'user37_N3F4A@example.com',
          password:
            '$2b$10$dt6ivwLW5g6kSy5aIVCxueed8peyii9/0tpYQm31YUdFrCB/sOU.u',
          name: '徐雅筑',
          phone: '0910632919',
          gender: 'male',
          birth: '1981-12-02T00:00:00.000Z',
          avatar: null,
          address: '桃園市',
          isActive: true,
          emailVerified: false,
          phoneVerified: true,
          role: 'user',
          firebaseUid: null,
          createdAt: '2025-08-26T12:00:26.641Z',
          updatedAt: '2025-08-26T12:00:26.641Z',
        },
        rating: 1,
        comment: null,
        createdAt: '2025-06-08T11:23:19.404Z',
      },
      {
        member: {
          id: '49',
          email: 'user49_YiAbd@example.com',
          password:
            '$2b$10$xA2DVY3mKnlacOxAzvWtDuaySPhqMUDkIOX3EaJxDIwyC7tIUNts6',
          name: '蕭怡君',
          phone: '0922405750',
          gender: 'female',
          birth: '2009-07-17T00:00:00.000Z',
          avatar: null,
          address: '基隆市',
          isActive: false,
          emailVerified: true,
          phoneVerified: false,
          role: 'user',
          firebaseUid: null,
          createdAt: '2025-08-26T12:00:26.641Z',
          updatedAt: '2025-08-26T12:00:26.641Z',
        },
        rating: 3,
        comment: '有專業的體適能檢測，很貼心',
        createdAt: '2025-05-02T09:01:23.775Z',
      },
      {
        member: {
          id: '67',
          email: 'user67_mgSvn@example.com',
          password:
            '$2b$10$P9KfI0q/kUb45uAS7gk4Jek69W757mF5B9MayFZ4nOu4OpfyjJqva',
          name: '高怡婷',
          phone: '0974670173',
          gender: 'female',
          birth: '2005-09-17T00:00:00.000Z',
          avatar: null,
          address: '彰化縣',
          isActive: false,
          emailVerified: false,
          phoneVerified: false,
          role: 'user',
          firebaseUid: null,
          createdAt: '2025-08-26T12:00:26.641Z',
          updatedAt: '2025-08-26T12:00:26.641Z',
        },
        rating: 5,
        comment: null,
        createdAt: '2025-06-10T14:04:56.584Z',
      },
      {
        member: {
          id: '68',
          email: 'user68_Fln6q@example.com',
          password:
            '$2b$10$EyXkwgPlJz3/ZzjrvjBQUOJsbQYlHjKYdM75pqI002Hwc.PwgCM6K',
          name: '梁冠宇',
          phone: '0990505633',
          gender: 'male',
          birth: '1991-03-12T00:00:00.000Z',
          avatar:
            'https://tw.portal-pokemon.com/play/resources/pokedex/img/pm/f3868a6a16c75d75435819deab8bab97926fc54c.png',
          address: '彰化縣',
          isActive: false,
          emailVerified: false,
          phoneVerified: true,
          role: 'user',
          firebaseUid: null,
          createdAt: '2025-08-26T12:00:26.641Z',
          updatedAt: '2025-08-26T12:00:26.641Z',
        },
        rating: 4,
        comment: null,
        createdAt: '2025-06-24T21:41:47.463Z',
      },
      {
        member: {
          id: '77',
          email: 'user77_6hDto@example.com',
          password:
            '$2b$10$zsf/.yI/.g0d1adDIDpjjOmAWHHtyRyr9Q242g.M7U1jmtFj0wSwC',
          name: '周怡婷',
          phone: '0944444894',
          gender: 'male',
          birth: '1986-05-14T00:00:00.000Z',
          avatar:
            'https://tw.portal-pokemon.com/play/resources/pokedex/img/pm/cd2282e3ecef2ea7889594f954f7f04865bc48e4.png',
          address: '嘉義市',
          isActive: true,
          emailVerified: false,
          phoneVerified: true,
          role: 'user',
          firebaseUid: null,
          createdAt: '2025-08-26T12:00:26.641Z',
          updatedAt: '2025-08-26T12:00:26.641Z',
        },
        rating: 3,
        comment: '燈光明亮，視野很清楚',
        createdAt: '2025-03-26T00:53:33.390Z',
      },
      {
        member: {
          id: '95',
          email: 'user95_dx4yP@example.com',
          password:
            '$2b$10$pcPBf01T.frxAU5sND83FOu/sycUtGoUJpCI3XXC1CgVASiHDKYlS',
          name: '孫詩涵',
          phone: '0977635886',
          gender: 'male',
          birth: '1983-03-14T00:00:00.000Z',
          avatar: null,
          address: '臺東縣',
          isActive: true,
          emailVerified: false,
          phoneVerified: true,
          role: 'user',
          firebaseUid: null,
          createdAt: '2025-08-26T12:00:26.641Z',
          updatedAt: '2025-08-26T12:00:26.641Z',
        },
        rating: 4,
        comment: null,
        createdAt: '2025-04-22T06:07:49.662Z',
      },
      {
        member: {
          id: '102',
          email: 'user@gmail.com',
          password:
            '$2b$10$8qCuUNAMMG1n8sf9iskYVuC5jSF5d5VFwRt7muSb78O4nnbquD5d.',
          name: '一般用戶',
          phone: '0912345678',
          gender: 'female',
          birth: '1995-01-29T00:00:00.000Z',
          avatar: 'avatar-102-1755831812486-610451110.jpg',
          address: null,
          isActive: true,
          emailVerified: false,
          phoneVerified: false,
          role: 'user',
          firebaseUid: null,
          createdAt: '2025-08-26T12:00:26.641Z',
          updatedAt: '2025-08-26T12:00:26.641Z',
        },
        rating: 1,
        comment: '很差',
        createdAt: '2025-08-26T12:50:40.683Z',
      },
    ],
    sports: [
      {
        id: 2,
        name: '羽球',
        iconKey: 'badminton',
      },
      {
        id: 3,
        name: '桌球',
        iconKey: 'tabletennis',
      },
      {
        id: 5,
        name: '排球',
        iconKey: 'volleyball',
      },
      {
        id: 6,
        name: '壁球',
        iconKey: 'squash',
      },
      {
        id: 7,
        name: '足球',
        iconKey: 'soccer',
      },
      {
        id: 8,
        name: '棒球',
        iconKey: 'baseball',
      },
    ],
    averageRating: '3.3',
    ratingCount: 12,
  }
  // #region 資料顯示選項
  const sportIconMap = {
    basketball: BasketballIcon,
    badminton: BadmintonIcon,
    tabletennis: TableTennisIcon,
    tennis: TennisIcon,
    volleyball: VolleyballIcon,
    squash: TennisRacketIcon,
    soccer: SoccerIcon,
    baseball: BaseballBatIcon,
    billiard: BilliardBallIcon,
  }

  const facilityItems = [
    { icon: CircleParking, label: '停車場' },
    { icon: ShowerHead, label: '淋浴間' },
    { icon: IconShoppingCart, label: '運動用品店' },
    { icon: IconBarbell, label: '健身房' },
    { icon: IconYoga, label: '瑜珈教室' },
    { icon: IconBike, label: '飛輪教室' },
    { icon: IconTreadmill, label: '體適能教室' },
    { icon: IconWifi, label: 'Wi-Fi' },
  ]

  const businessHours = {
    星期一: '08:00-20:00',
    星期二: '08:00-20:00',
    星期三: '08:00-20:00',
    星期四: '08:00-20:00',
    星期五: '08:00-20:00',
    星期六: '08:00-20:00',
    星期日: '休館',
  }
  // 使用 API 資料的位置，如果沒有則使用預設位置
  const position =
    data &&
    typeof data.latitude === 'number' &&
    typeof data.longitude === 'number'
      ? [data.latitude, data.longitude]
      : [25.034053953650112, 121.54344508654384]
  // #endregion 資料顯示選項

  // #region 頁面渲染
  return (
    <>
      <Navbar />
      <BreadcrumbAuto venueName={data?.name} />
      <main className="px-4 md:px-6 py-10">
        <div className="flex flex-col container mx-auto max-w-screen-xl min-h-screen">
          {/* 標題與按鈕 */}
          <section className="flex flex-col md:flex-row justify-between items-start gap-6">
            {/* Title & rating */}
            <div>
              <h1 className="text-3xl font-bold">{data.name}</h1>

              <div className="mt-2 flex items-center gap-2">
                {/* Stars */}
                <div
                  aria-label={`Rating ${data.averageRating || 0} out of 5`}
                  className="flex items-center"
                >
                  {range(5).map((i) => (
                    <Star
                      className={`
                          h-5 w-5
                          ${
                            i < Math.floor(data.averageRating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : i < (data.averageRating || 0)
                                ? 'fill-yellow-400/50 text-yellow-400'
                                : 'text-yellow-400'
                          }
                        `}
                      key={`star-${i}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({Number(data.averageRating || 0).toFixed(1)})
                </span>
              </div>
            </div>
            {/* Buttons */}
            <div className="flex flex-col md:flex-row gap-2 w-full sm:w-auto">
              <Link href={`/venue/reservation`} className="w-full sm:w-auto">
                <Button
                  onClick={handleReservation}
                  variant="highlight"
                  size="lg"
                  className="w-full"
                >
                  預訂
                  <ClipboardCheck />
                </Button>
              </Link>
              <div className="flex flex-row gap-2 w-full sm:w-auto">
                <div className="w-1/2 sm:w-auto">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full md:w-auto"
                        size="lg"
                      >
                        分享
                        <Share />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit px-2 py-2">
                      <div className="flex flex-row gap-2 w-full sm:w-auto">
                        <FacebookShareButton url={currentUrl || ''}>
                          {/* <FaFacebook size={30} color="#1f7bf2" /> */}
                          <FacebookIcon size={32} round />
                        </FacebookShareButton>
                        <LineShareButton url={currentUrl || ''}>
                          <LineIcon size={32} round />
                        </LineShareButton>
                        <TwitterShareButton url={currentUrl || ''}>
                          <XIcon size={32} round />
                        </TwitterShareButton>
                        <ThreadsShareButton url={currentUrl || ''}>
                          <ThreadsIcon size={32} round />
                        </ThreadsShareButton>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Link href="#" className="w-1/2 sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full">
                    收藏
                    <Heart />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <Separator className="my-8" />

          {/* 圖片 */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Main image */}
            <div className="overflow-hidden rounded-lg">
              <AspectRatio ratio={4 / 3} className="bg-muted">
                <Image
                  alt={data.name || '場館圖片'}
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  src={
                    data.images && data.images[0]
                      ? getCenterImageUrl(data.images[0])
                      : 'https://images.unsplash.com/photo-1626158610593-687879be50b7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                  }
                />
              </AspectRatio>
            </div>
            {/* 2x2 grid image */}
            <div className="grid grid-cols-2 gap-2">
              <div className="overflow-hidden rounded-lg">
                <AspectRatio ratio={4 / 3} className="bg-muted">
                  <Image
                    alt={`${data.name} - 圖片 1`}
                    className="object-cover"
                    fill
                    priority
                    sizes="(max-width: 768px) 50vw, 25vw"
                    src={
                      data.images && data.images[1]
                        ? getCenterImageUrl(data.images[1])
                        : 'https://images.unsplash.com/photo-1494199505258-5f95387f933c?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                    }
                  />
                </AspectRatio>
              </div>
              <div className="overflow-hidden rounded-lg">
                <AspectRatio ratio={4 / 3} className="bg-muted">
                  <Image
                    alt={`${data.name} - 圖片 2`}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    src={
                      data.images && data.images[2]
                        ? getCenterImageUrl(data.images[2])
                        : 'https://images.unsplash.com/photo-1708312604073-90639de903fc?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                    }
                  />
                </AspectRatio>
              </div>
              <div className="overflow-hidden rounded-lg">
                <AspectRatio ratio={4 / 3} className="bg-muted">
                  <Image
                    alt={`${data.name} - 圖片 3`}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    src={
                      data.images && data.images[3]
                        ? getCenterImageUrl(data.images[3])
                        : 'https://images.unsplash.com/photo-1708268418738-4863baa9cf72?q=80&w=1214&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                    }
                  />
                </AspectRatio>
              </div>
              <div className="overflow-hidden rounded-lg">
                <AspectRatio ratio={4 / 3} className="bg-muted">
                  <Image
                    alt={`${data.name} - 圖片 4`}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    src={
                      data.images && data.images[4]
                        ? getCenterImageUrl(data.images[4])
                        : 'https://images.unsplash.com/photo-1627314387807-df615e8567de?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                    }
                  />
                </AspectRatio>
              </div>
            </div>
          </section>

          <Separator className="my-8" />

          {/* 資訊 */}
          <section
            className={`
              grid grid-cols-1 gap-8
              md:grid-cols-2
            `}
          >
            {/* 左半部 */}
            <section className="flex flex-col gap-6">
              {/* 場館運動項目 */}
              <div className="flex flex-col">
                <h2 className="mb-4 text-xl font-bold">場館運動項目</h2>

                <div className="flex flex-wrap gap-2">
                  {data.sports.map((item, idx) => {
                    const IconComponent = sportIconMap[item.iconKey]
                    return (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleSportButton(item)
                        }}
                      >
                        {IconComponent && (
                          <IconComponent className="!w-6 !h-6" />
                        )}
                        {item.name}
                        <span className="text-muted-foreground">3個場地</span>
                      </Button>
                    )
                  })}
                </div>
              </div>
              {/* 場館設施 */}
              <div className="flex flex-col">
                <h2 className="mb-4 text-xl font-bold">場館設施</h2>
                <div className="flex flex-wrap gap-4">
                  {facilityItems.map((item, idx) => {
                    const IconComponent = item.icon
                    return (
                      <div className="flex gap-2" key={idx}>
                        <IconComponent className="!w-6 !h-6 text-highlight" />
                        <span>{item.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* 營業時間 */}
            <section>
              <h2 className="mb-4 text-xl font-bold">營業時間</h2>
              <div className="space-y-2">
                {data.businessHours ? (
                  Object.entries(data.businessHours).map(
                    ([key, value], idx, arr) => (
                      <div
                        className={cn(
                          'flex justify-between pb-2 text-sm',
                          idx !== arr.length - 1 && 'border-b'
                        )}
                        key={key}
                      >
                        <span className="font-medium capitalize">{key}</span>
                        <span>{value}</span>
                      </div>
                    )
                  )
                ) : businessHours ? (
                  Object.entries(businessHours).map(
                    ([key, value], idx, arr) => (
                      <div
                        className={cn(
                          'flex justify-between pb-2 text-sm',
                          idx !== arr.length - 1 && 'border-b'
                        )}
                        key={key}
                      >
                        <span className="font-medium capitalize">{key}</span>
                        <span>{value}</span>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-muted-foreground">
                    營業時間資料載入中...
                  </div>
                )}
              </div>
            </section>
          </section>

          <Separator className="my-8" />

          {/* 地理位置 */}
          <section>
            <h2 className="mb-4 text-xl font-bold">地理位置</h2>
            <div className="space-y-2 mb-4">
              <div className="flex pb-2 gap-2">
                <MapPin className="text-highlight" />
                <Link
                  href={`https://www.google.com/maps/place/${data.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="underline">{data.address}</span>
                </Link>
              </div>
              <div className="flex pb-2 gap-2">
                <TrainFront className="text-highlight" />
                <span>距離最近的捷運站</span>
                <span className="text-highlight text-bold">200</span>
                <span>公尺</span>
              </div>
              <div className="flex pb-2 gap-2">
                <Bus className="text-highlight" />
                <span>距離最近的公車站</span>
                <span className="text-highlight text-bold">150</span>
                <span>公尺</span>
              </div>
            </div>
            <div className="w-full h-[400px] rounded-lg overflow-hidden relative z-0">
              <Map position={position} dataName={data.name || '場館位置'} />
            </div>
          </section>

          <Separator className="my-8" />

          {/* 評論區 */}
          <RatingSection centerId={data.id} />
        </div>
      </main>
      <Footer />
    </>
  )
}
