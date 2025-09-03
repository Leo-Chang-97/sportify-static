'use client'

// hooks
import { useState, useEffect } from 'react'
import { useVenue } from '@/contexts/venue-context'

// utils
import { format as formatDate } from 'date-fns'
import { cn, validateVenueField } from '@/lib/utils'
import { format } from 'date-fns'

// Icon
import { ClipboardCheck, CalendarCheck } from 'lucide-react'

// next 元件
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// UI 元件
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/date-calendar'
import { Status, StatusIndicator, StatusLabel } from '@/components/ui/status'
import { toast } from 'sonner'

// 自訂元件
import { Navbar } from '@/components/navbar'
import BreadcrumbAuto from '@/components/breadcrumb-auto'
import Step from '@/components/step'
import Footer from '@/components/footer'
import { TimeSlotTable } from '@/components/timeslot-table'

// #region 資料顯示選項
// 步驟選項設定
const steps = [
  { id: 1, title: '選擇場地與時間', active: true },
  { id: 2, title: '填寫付款資訊', completed: false },
  { id: 3, title: '完成訂單', completed: false },
]
const locations = [
  { id: 1, name: '台北市' },
  { id: 2, name: '新北市' },
  { id: 3, name: '桃園市' },
  { id: 4, name: '臺中市' },
  { id: 5, name: '高雄市' },
]
const sports = [
  {
    id: 1,
    name: '籃球',
    iconKey: 'basketball',
  },
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
    id: 4,
    name: '網球',
    iconKey: 'tennis',
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
  {
    id: 9,
    name: '撞球',
    iconKey: 'billiard',
  },
]

const centers = [
  {
    id: 1,
    name: '北投運動中心',
    locationId: 1,
    location: {
      id: 1,
      name: '台北市',
    },
  },
  {
    id: 2,
    name: '士林運動中心',
    locationId: 1,
    location: {
      id: 1,
      name: '台北市',
    },
  },
  {
    id: 3,
    name: '內湖運動中心',
    locationId: 1,
    location: {
      id: 1,
      name: '台北市',
    },
  },
  {
    id: 4,
    name: '南港運動中心',
    locationId: 1,
    location: {
      id: 1,
      name: '台北市',
    },
  },
  {
    id: 5,
    name: '松山運動中心',
    locationId: 1,
    location: {
      id: 1,
      name: '台北市',
    },
  },
  {
    id: 6,
    name: '信義運動中心',
    locationId: 1,
    location: {
      id: 1,
      name: '台北市',
    },
  },
  {
    id: 7,
    name: '大同運動中心',
    locationId: 1,
    location: {
      id: 1,
      name: '台北市',
    },
  },
  {
    id: 8,
    name: '中山運動中心',
    locationId: 1,
    location: {
      id: 1,
      name: '台北市',
    },
  },
  {
    id: 9,
    name: '萬華運動中心',
    locationId: 1,
    location: {
      id: 1,
      name: '台北市',
    },
  },
  {
    id: 10,
    name: '中正運動中心',
    locationId: 1,
    location: {
      id: 1,
      name: '台北市',
    },
  },
  {
    id: 11,
    name: '大安運動中心',
    locationId: 1,
    location: {
      id: 1,
      name: '台北市',
    },
  },
  {
    id: 12,
    name: '文山運動中心',
    locationId: 1,
    location: {
      id: 1,
      name: '台北市',
    },
  },
]

// 場地時段靜態資料
const courtTimeSlots = [
  {
    id: '1',
    courtId: 1,
    timeSlotId: 1,
    price: '100',
    court: {
      id: 1,
      name: '場地 1',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 1,
      startTime: '1970-01-01T00:00:00.000Z',
      endTime: '1970-01-01T01:00:00.000Z',
      label: '08:00-09:00',
      timePeriodId: 1,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '08:00',
    endTime: '09:00',
  },
  {
    id: '2',
    courtId: 1,
    timeSlotId: 2,
    price: '100',
    court: {
      id: 1,
      name: '場地 1',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 2,
      startTime: '1970-01-01T01:00:00.000Z',
      endTime: '1970-01-01T02:00:00.000Z',
      label: '09:00-10:00',
      timePeriodId: 1,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '09:00',
    endTime: '10:00',
  },
  {
    id: '3',
    courtId: 1,
    timeSlotId: 3,
    price: '100',
    court: {
      id: 1,
      name: '場地 1',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 3,
      startTime: '1970-01-01T02:00:00.000Z',
      endTime: '1970-01-01T03:00:00.000Z',
      label: '10:00-11:00',
      timePeriodId: 1,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '10:00',
    endTime: '11:00',
  },
  {
    id: '4',
    courtId: 1,
    timeSlotId: 4,
    price: '100',
    court: {
      id: 1,
      name: '場地 1',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 4,
      startTime: '1970-01-01T03:00:00.000Z',
      endTime: '1970-01-01T04:00:00.000Z',
      label: '11:00-12:00',
      timePeriodId: 1,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '11:00',
    endTime: '12:00',
  },
  {
    id: '5',
    courtId: 1,
    timeSlotId: 5,
    price: '150',
    court: {
      id: 1,
      name: '場地 1',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 5,
      startTime: '1970-01-01T04:00:00.000Z',
      endTime: '1970-01-01T05:00:00.000Z',
      label: '12:00-13:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '12:00',
    endTime: '13:00',
  },
  {
    id: '6',
    courtId: 1,
    timeSlotId: 6,
    price: '150',
    court: {
      id: 1,
      name: '場地 1',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 6,
      startTime: '1970-01-01T05:00:00.000Z',
      endTime: '1970-01-01T06:00:00.000Z',
      label: '13:00-14:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '13:00',
    endTime: '14:00',
  },
  {
    id: '7',
    courtId: 1,
    timeSlotId: 7,
    price: '150',
    court: {
      id: 1,
      name: '場地 1',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 7,
      startTime: '1970-01-01T06:00:00.000Z',
      endTime: '1970-01-01T07:00:00.000Z',
      label: '14:00-15:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '14:00',
    endTime: '15:00',
  },
  {
    id: '8',
    courtId: 1,
    timeSlotId: 8,
    price: '150',
    court: {
      id: 1,
      name: '場地 1',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 8,
      startTime: '1970-01-01T07:00:00.000Z',
      endTime: '1970-01-01T08:00:00.000Z',
      label: '15:00-16:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '15:00',
    endTime: '16:00',
  },
  {
    id: '9',
    courtId: 1,
    timeSlotId: 9,
    price: '150',
    court: {
      id: 1,
      name: '場地 1',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 9,
      startTime: '1970-01-01T08:00:00.000Z',
      endTime: '1970-01-01T09:00:00.000Z',
      label: '16:00-17:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '16:00',
    endTime: '17:00',
  },
  {
    id: '10',
    courtId: 1,
    timeSlotId: 10,
    price: '150',
    court: {
      id: 1,
      name: '場地 1',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 10,
      startTime: '1970-01-01T09:00:00.000Z',
      endTime: '1970-01-01T10:00:00.000Z',
      label: '17:00-18:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '17:00',
    endTime: '18:00',
  },
  {
    id: '11',
    courtId: 1,
    timeSlotId: 11,
    price: '100',
    court: {
      id: 1,
      name: '場地 1',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 11,
      startTime: '1970-01-01T10:00:00.000Z',
      endTime: '1970-01-01T11:00:00.000Z',
      label: '18:00-19:00',
      timePeriodId: 3,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '18:00',
    endTime: '19:00',
  },
  {
    id: '12',
    courtId: 1,
    timeSlotId: 12,
    price: '100',
    court: {
      id: 1,
      name: '場地 1',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 12,
      startTime: '1970-01-01T11:00:00.000Z',
      endTime: '1970-01-01T12:00:00.000Z',
      label: '19:00-20:00',
      timePeriodId: 3,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '19:00',
    endTime: '20:00',
  },
  {
    id: '13',
    courtId: 2,
    timeSlotId: 1,
    price: '100',
    court: {
      id: 2,
      name: '場地 2',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 1,
      startTime: '1970-01-01T00:00:00.000Z',
      endTime: '1970-01-01T01:00:00.000Z',
      label: '08:00-09:00',
      timePeriodId: 1,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '08:00',
    endTime: '09:00',
  },
  {
    id: '14',
    courtId: 2,
    timeSlotId: 2,
    price: '100',
    court: {
      id: 2,
      name: '場地 2',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 2,
      startTime: '1970-01-01T01:00:00.000Z',
      endTime: '1970-01-01T02:00:00.000Z',
      label: '09:00-10:00',
      timePeriodId: 1,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '09:00',
    endTime: '10:00',
  },
  {
    id: '15',
    courtId: 2,
    timeSlotId: 3,
    price: '100',
    court: {
      id: 2,
      name: '場地 2',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 3,
      startTime: '1970-01-01T02:00:00.000Z',
      endTime: '1970-01-01T03:00:00.000Z',
      label: '10:00-11:00',
      timePeriodId: 1,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '10:00',
    endTime: '11:00',
  },
  {
    id: '16',
    courtId: 2,
    timeSlotId: 4,
    price: '100',
    court: {
      id: 2,
      name: '場地 2',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 4,
      startTime: '1970-01-01T03:00:00.000Z',
      endTime: '1970-01-01T04:00:00.000Z',
      label: '11:00-12:00',
      timePeriodId: 1,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '11:00',
    endTime: '12:00',
  },
  {
    id: '17',
    courtId: 2,
    timeSlotId: 5,
    price: '150',
    court: {
      id: 2,
      name: '場地 2',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 5,
      startTime: '1970-01-01T04:00:00.000Z',
      endTime: '1970-01-01T05:00:00.000Z',
      label: '12:00-13:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '12:00',
    endTime: '13:00',
  },
  {
    id: '18',
    courtId: 2,
    timeSlotId: 6,
    price: '150',
    court: {
      id: 2,
      name: '場地 2',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 6,
      startTime: '1970-01-01T05:00:00.000Z',
      endTime: '1970-01-01T06:00:00.000Z',
      label: '13:00-14:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '13:00',
    endTime: '14:00',
  },
  {
    id: '19',
    courtId: 2,
    timeSlotId: 7,
    price: '150',
    court: {
      id: 2,
      name: '場地 2',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 7,
      startTime: '1970-01-01T06:00:00.000Z',
      endTime: '1970-01-01T07:00:00.000Z',
      label: '14:00-15:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '14:00',
    endTime: '15:00',
  },
  {
    id: '20',
    courtId: 2,
    timeSlotId: 8,
    price: '150',
    court: {
      id: 2,
      name: '場地 2',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 8,
      startTime: '1970-01-01T07:00:00.000Z',
      endTime: '1970-01-01T08:00:00.000Z',
      label: '15:00-16:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '15:00',
    endTime: '16:00',
  },
  {
    id: '21',
    courtId: 2,
    timeSlotId: 9,
    price: '150',
    court: {
      id: 2,
      name: '場地 2',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 9,
      startTime: '1970-01-01T08:00:00.000Z',
      endTime: '1970-01-01T09:00:00.000Z',
      label: '16:00-17:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '16:00',
    endTime: '17:00',
  },
  {
    id: '22',
    courtId: 2,
    timeSlotId: 10,
    price: '150',
    court: {
      id: 2,
      name: '場地 2',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 10,
      startTime: '1970-01-01T09:00:00.000Z',
      endTime: '1970-01-01T10:00:00.000Z',
      label: '17:00-18:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '17:00',
    endTime: '18:00',
  },
  {
    id: '23',
    courtId: 2,
    timeSlotId: 11,
    price: '100',
    court: {
      id: 2,
      name: '場地 2',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 11,
      startTime: '1970-01-01T10:00:00.000Z',
      endTime: '1970-01-01T11:00:00.000Z',
      label: '18:00-19:00',
      timePeriodId: 3,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '18:00',
    endTime: '19:00',
  },
  {
    id: '24',
    courtId: 2,
    timeSlotId: 12,
    price: '100',
    court: {
      id: 2,
      name: '場地 2',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 12,
      startTime: '1970-01-01T11:00:00.000Z',
      endTime: '1970-01-01T12:00:00.000Z',
      label: '19:00-20:00',
      timePeriodId: 3,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '19:00',
    endTime: '20:00',
  },
  {
    id: '25',
    courtId: 3,
    timeSlotId: 1,
    price: '100',
    court: {
      id: 3,
      name: '場地 3',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 1,
      startTime: '1970-01-01T00:00:00.000Z',
      endTime: '1970-01-01T01:00:00.000Z',
      label: '08:00-09:00',
      timePeriodId: 1,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '08:00',
    endTime: '09:00',
  },
  {
    id: '26',
    courtId: 3,
    timeSlotId: 2,
    price: '100',
    court: {
      id: 3,
      name: '場地 3',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 2,
      startTime: '1970-01-01T01:00:00.000Z',
      endTime: '1970-01-01T02:00:00.000Z',
      label: '09:00-10:00',
      timePeriodId: 1,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '09:00',
    endTime: '10:00',
  },
  {
    id: '27',
    courtId: 3,
    timeSlotId: 3,
    price: '100',
    court: {
      id: 3,
      name: '場地 3',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 3,
      startTime: '1970-01-01T02:00:00.000Z',
      endTime: '1970-01-01T03:00:00.000Z',
      label: '10:00-11:00',
      timePeriodId: 1,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '10:00',
    endTime: '11:00',
  },
  {
    id: '28',
    courtId: 3,
    timeSlotId: 4,
    price: '100',
    court: {
      id: 3,
      name: '場地 3',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 4,
      startTime: '1970-01-01T03:00:00.000Z',
      endTime: '1970-01-01T04:00:00.000Z',
      label: '11:00-12:00',
      timePeriodId: 1,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '11:00',
    endTime: '12:00',
  },
  {
    id: '29',
    courtId: 3,
    timeSlotId: 5,
    price: '150',
    court: {
      id: 3,
      name: '場地 3',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 5,
      startTime: '1970-01-01T04:00:00.000Z',
      endTime: '1970-01-01T05:00:00.000Z',
      label: '12:00-13:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '12:00',
    endTime: '13:00',
  },
  {
    id: '30',
    courtId: 3,
    timeSlotId: 6,
    price: '150',
    court: {
      id: 3,
      name: '場地 3',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 6,
      startTime: '1970-01-01T05:00:00.000Z',
      endTime: '1970-01-01T06:00:00.000Z',
      label: '13:00-14:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '13:00',
    endTime: '14:00',
  },
  {
    id: '31',
    courtId: 3,
    timeSlotId: 7,
    price: '150',
    court: {
      id: 3,
      name: '場地 3',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 7,
      startTime: '1970-01-01T06:00:00.000Z',
      endTime: '1970-01-01T07:00:00.000Z',
      label: '14:00-15:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '14:00',
    endTime: '15:00',
  },
  {
    id: '32',
    courtId: 3,
    timeSlotId: 8,
    price: '150',
    court: {
      id: 3,
      name: '場地 3',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 8,
      startTime: '1970-01-01T07:00:00.000Z',
      endTime: '1970-01-01T08:00:00.000Z',
      label: '15:00-16:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '15:00',
    endTime: '16:00',
  },
  {
    id: '33',
    courtId: 3,
    timeSlotId: 9,
    price: '150',
    court: {
      id: 3,
      name: '場地 3',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 9,
      startTime: '1970-01-01T08:00:00.000Z',
      endTime: '1970-01-01T09:00:00.000Z',
      label: '16:00-17:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '16:00',
    endTime: '17:00',
  },
  {
    id: '34',
    courtId: 3,
    timeSlotId: 10,
    price: '150',
    court: {
      id: 3,
      name: '場地 3',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 10,
      startTime: '1970-01-01T09:00:00.000Z',
      endTime: '1970-01-01T10:00:00.000Z',
      label: '17:00-18:00',
      timePeriodId: 2,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '17:00',
    endTime: '18:00',
  },
  {
    id: '35',
    courtId: 3,
    timeSlotId: 11,
    price: '100',
    court: {
      id: 3,
      name: '場地 3',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 11,
      startTime: '1970-01-01T10:00:00.000Z',
      endTime: '1970-01-01T11:00:00.000Z',
      label: '18:00-19:00',
      timePeriodId: 3,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '18:00',
    endTime: '19:00',
  },
  {
    id: '36',
    courtId: 3,
    timeSlotId: 12,
    price: '100',
    court: {
      id: 3,
      name: '場地 3',
      centerId: 1,
      sportId: 2,
    },
    timeSlot: {
      id: 12,
      startTime: '1970-01-01T11:00:00.000Z',
      endTime: '1970-01-01T12:00:00.000Z',
      label: '19:00-20:00',
      timePeriodId: 3,
    },
    date: '2025-09-03',
    isAvailable: true,
    status: '可預約',
    startTime: '19:00',
    endTime: '20:00',
  },
]
// #endregion 資料顯示選項

export default function ReservationPage() {
  // #region 路由和URL參數
  const router = useRouter()
  const { venueData, setVenueData } = useVenue()

  // #region 組件狀態管理
  const [errors, setErrors] = useState({}) // 用於存放驗證錯誤

  const [locationId, setLocationId] = useState(
    venueData.locationId?.toString() || ''
  )
  const [centerId, setCenterId] = useState(venueData.centerId?.toString() || '')
  const [sportId, setSportId] = useState(venueData.sportId?.toString() || '')

  const [date, setDate] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // #region 副作用處理

  // #region 訂單摘要 - 更新選擇的中心名稱
  useEffect(() => {
    const selectedCenter = centers.find(
      (center) => center.id.toString() === centerId
    )
    const newCenterName = selectedCenter?.name || ''

    setVenueData((prev) => {
      if (prev.center !== newCenterName || prev.centerId !== centerId) {
        return { ...prev, center: newCenterName, centerId }
      }
      return prev
    })
  }, [centerId, setVenueData])

  // #region 訂單摘要 - 更新選擇的運動名稱
  useEffect(() => {
    const selectedSport = sports.find(
      (sport) => sport.id.toString() === sportId
    )
    const newSportName = selectedSport?.name || ''

    setVenueData((prev) => {
      if (prev.sport !== newSportName || prev.sportId !== sportId) {
        return { ...prev, sport: newSportName, sportId }
      }
      return prev
    })
  }, [sportId, setVenueData])

  // #region 事件處理函數

  // 格式化價格，加上千分位逗號
  const formatPrice = (price) => {
    return Number(price).toLocaleString('zh-TW')
  }

  // 處理預訂按鈕點擊
  const handleReservation = () => {
    const newErrors = {}

    newErrors.center = validateVenueField('center', centerId)
    newErrors.sport = validateVenueField('sport', sportId)
    newErrors.selectedDate = validateVenueField('selectedDate', date)
    newErrors.timeSlots = validateVenueField(
      'timeSlots',
      '',
      venueData.timeSlots
    )

    setErrors(newErrors)

    const hasErrors = Object.values(newErrors).some((error) => error !== '')
    if (!hasErrors) {
      router.push('/venue/reservation/payment')
    } else {
      // 驗證失敗，滾動到第一個錯誤欄位
      const errorFields = [
        { field: 'center', selector: '[data-testid="center-select"]' },
        { field: 'sport', selector: '[data-testid="sport-select"]' },
        { field: 'selectedDate', selector: '[data-testid="calendar"]' },
        { field: 'timeSlots', selector: '[data-testid="timeslot-table"]' },
      ]

      setTimeout(() => {
        for (const errorField of errorFields) {
          if (newErrors[errorField.field]) {
            const element = document.querySelector(errorField.selector)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' })
              break
            }
          }
        }
      }, 100)
    }
  }

  // 獲取特定日期的可預約數量（靜態邏輯）
  const getAvailableCount = (date) => {
    if (!date || !centerId || !sportId) return null

    // 簡單的靜態邏輯：每天都有可預約時段
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date < today) return 0 // 過去的日期沒有可預約時段

    // 根據選擇的中心和運動返回可預約時段數
    return courtTimeSlots.length > 0 ? Math.floor(courtTimeSlots.length / 3) : 8 // 假設每個場地有8個時段
  }

  // 處理場地時段選擇
  const handleTimeSlotSelection = (selectionData) => {
    setVenueData((prev) => {
      // 檢查是否真的有變化
      if (
        JSON.stringify(prev.timeSlots) !==
          JSON.stringify(selectionData.details) ||
        prev.totalPrice !== selectionData.totalPrice
      ) {
        return {
          ...prev,
          timeSlots: selectionData.details,
          totalPrice: selectionData.totalPrice,
        }
      }
      return prev
    })
  }

  // #region 頁面渲染
  return (
    <>
      <Navbar />
      <BreadcrumbAuto />
      <main className="px-4 md:px-6 py-10">
        <div className="flex flex-col container mx-auto max-w-screen-xl min-h-screen gap-6">
          {/* 步驟 */}
          <section>
            <Step
              steps={steps}
              orientation="horizontal"
              onStepClick={(step, index) => console.log('Clicked step:', step)}
            />
          </section>

          <section className="flex flex-col md:flex-row gap-6">
            {/* 訂單選擇 */}
            <section className="flex-1 md:flex-2 min-w-0 flex flex-col gap-6">
              {/* 選擇場館與運動 */}
              <section>
                <h2 className="text-xl font-semibold mb-4">選擇場館與運動</h2>
                <div className="flex flex-col lg:flex-row gap-2">
                  <div className="space-y-2 flex-1">
                    <Label>地區</Label>
                    <Select value={locationId} onValueChange={setLocationId}>
                      <SelectTrigger className="w-full !bg-card text-accent-foreground !h-10">
                        <SelectValue placeholder="全部地區" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.length === 0 ? (
                          <div className="px-3 py-2 text-gray-400">
                            沒有符合資料
                          </div>
                        ) : (
                          locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id.toString()}>
                              {loc.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label>中心</Label>
                    <Select value={centerId} onValueChange={setCenterId}>
                      <SelectTrigger
                        className={cn(
                          'w-full !bg-card text-accent-foreground !h-10',
                          errors.center &&
                            'border-destructive focus:border-destructive focus:ring-destructive'
                        )}
                        data-testid="center-select"
                      >
                        {centers.length === 0 ? (
                          <SelectValue placeholder="沒有符合資料" />
                        ) : (
                          <SelectValue placeholder="請選擇中心" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {centers.length === 0 ? (
                          <div className="px-3 py-2 text-gray-400">
                            沒有符合資料
                          </div>
                        ) : (
                          centers.map((center) => (
                            <SelectItem
                              key={center.id}
                              value={center.id.toString()}
                            >
                              {center.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.center && (
                      <span className="text-destructive text-sm">
                        {errors.center}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label>運動</Label>
                    <Select value={sportId} onValueChange={setSportId}>
                      <SelectTrigger
                        className={cn(
                          'w-full !bg-card text-accent-foreground !h-10',
                          errors.sport &&
                            'border-destructive focus:border-destructive focus:ring-destructive'
                        )}
                        data-testid="sport-select"
                        style={{ opacity: 0.9 }}
                      >
                        <SelectValue placeholder={'請選擇運動'} />
                      </SelectTrigger>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem
                            key={sport.id}
                            value={sport.id.toString()}
                          >
                            {sport.name || sport.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sport && (
                      <span className="text-destructive text-sm">
                        {errors.sport}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* 選擇預約日期 */}
              <section>
                <h2 className="text-xl font-semibold mb-4">選擇預約日期</h2>
                <div
                  data-testid="calendar"
                  className={cn(
                    'bg-card border rounded-lg p-6',
                    errors.selectedDate && 'border-destructive'
                  )}
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate)
                      // 更新訂單摘要中的選擇日期
                      setVenueData((prev) => ({
                        ...prev,
                        selectedDate: selectedDate,
                      }))
                    }}
                    disabled={(date) => {
                      // 禁用今天之前的日期
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      // 禁用沒有可預約時段的日期
                      const availableCount = getAvailableCount(date)
                      return date < today || !availableCount
                    }}
                    className={cn(
                      'w-full bg-card text-accent-foreground rounded [--cell-size:3.5rem] aspect-3/2 object-cover p-0'
                    )}
                    components={{
                      DayButton: ({ day, modifiers, ...props }) => {
                        const date = day.date
                        const availableCount = getAvailableCount(date)
                        const hasData = centerId && sportId
                        const isPast = date < new Date().setHours(0, 0, 0, 0)
                        return (
                          <button
                            {...props}
                            className={cn(
                              'aspect-[3/2] flex flex-col md:gap-1 items-center justify-center w-full h-full p-1 text-base rounded-md transition-colors',
                              modifiers.selected
                                ? 'bg-primary text-primary-foreground'
                                : modifiers.today
                                  ? 'bg-muted'
                                  : '',
                              !modifiers.selected && 'hover:bg-muted',
                              modifiers.disabled
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer'
                            )}
                            disabled={modifiers.disabled}
                          >
                            <span className="font-medium">
                              {format(date, 'd')}
                            </span>
                            {hasData && availableCount !== null && !isPast && (
                              <span
                                className={cn(
                                  'flex justify-center text-xs md:text-sm w-full font-medium md:py-1 rounded',
                                  modifiers.selected &&
                                    'text-primary-foreground',
                                  !modifiers.selected &&
                                    availableCount === 0 &&
                                    'text-red',
                                  !modifiers.selected &&
                                    availableCount > 0 &&
                                    'text-green'
                                )}
                              >
                                {modifiers.selected ? (
                                  <Status
                                    status="maintenance"
                                    className="bg-background"
                                  >
                                    <StatusIndicator />
                                    <StatusLabel className="hidden lg:inline">
                                      已選擇
                                    </StatusLabel>
                                  </Status>
                                ) : availableCount === 0 ? (
                                  <Status
                                    status="offline"
                                    className="bg-background"
                                  >
                                    <StatusIndicator />
                                    <StatusLabel className="hidden lg:inline">
                                      已額滿
                                    </StatusLabel>
                                  </Status>
                                ) : (
                                  <Status
                                    status="online"
                                    className="bg-background"
                                  >
                                    <StatusIndicator />
                                    <StatusLabel className="hidden lg:inline">
                                      {availableCount}
                                    </StatusLabel>
                                  </Status>
                                )}
                              </span>
                            )}
                          </button>
                        )
                      },
                    }}
                  />

                  {/* 狀態說明 */}
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Status status="online" className="bg-transparent">
                        <StatusIndicator />
                      </Status>
                      <span>可預約時段數</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Status status="offline" className="bg-transparent">
                        <StatusIndicator />
                      </Status>
                      <span>已額滿</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Status status="maintenance" className="bg-transparent">
                        <StatusIndicator />
                      </Status>
                      <span>已選擇</span>
                    </div>
                  </div>
                </div>
                {errors.selectedDate && (
                  <span className="text-destructive text-sm mt-2 block">
                    {errors.selectedDate}
                  </span>
                )}
              </section>

              {/* 選擇場地與時段 */}
              <section>
                <h2 className="text-xl font-semibold mb-4">選擇場地與時段</h2>
                <div
                  data-testid="timeslot-table"
                  className={cn(
                    '',
                    errors.selectedDate &&
                      'border border-destructive rounded-lg'
                  )}
                >
                  <TimeSlotTable
                    courtTimeSlots={courtTimeSlots}
                    onSelectionChange={handleTimeSlotSelection}
                  />
                </div>
                {errors.timeSlots && (
                  <span className="text-destructive text-sm mt-2 block">
                    {errors.timeSlots}
                  </span>
                )}
              </section>
            </section>

            {/* 訂單確認 */}
            <section className="flex-1 lg:max-w-sm xl:max-w-md min-w-0 w-full">
              <h2 className="text-xl font-semibold mb-4">您的訂單</h2>
              {/* 訂單摘要卡片 */}
              <Card>
                <CardHeader>
                  {/* 預約圖片 */}
                  <div className="overflow-hidden rounded-lg">
                    <AspectRatio ratio={4 / 3} className="bg-muted">
                      <Image
                        alt="center-picture"
                        className="object-cover"
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 320px"
                        src="https://images.unsplash.com/photo-1626158610593-687879be50b7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      />
                    </AspectRatio>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 場館資訊 */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-accent-foreground">
                      場館資訊
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {/* <div>地區: {venueData.location || '未選擇'}</div> */}
                      <div className="text-primary">
                        {venueData.center || '未選擇'}
                      </div>
                      <div>運動: {venueData.sport || '未選擇'}</div>
                    </div>
                  </div>

                  {/* 預約日期 */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-accent-foreground">
                      預約日期
                    </h4>
                    <div className="text-sm text-primary">
                      {venueData.selectedDate
                        ? venueData.selectedDate.toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'long',
                          })
                        : '未選擇'}
                    </div>
                  </div>

                  {/* 場地時段 */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-accent-foreground">
                      場地時段
                    </h4>
                    {venueData.timeSlots?.length > 0 ? (
                      <div className="space-y-2">
                        {venueData.timeSlots.map((slot, index) => (
                          <Alert
                            key={index}
                            className="text-sm text-muted-foreground bg-muted p-2 rounded"
                          >
                            <AlertTitle className="font-medium text-blue-500">
                              {slot.courtName}
                            </AlertTitle>
                            <AlertDescription className="flex justify-between">
                              <span>{slot.timeRange}</span>
                              <span className="text-primary">
                                NT$ {formatPrice(slot.price)}
                              </span>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        未選擇
                      </div>
                    )}
                  </div>

                  {/* 總計 */}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">總計</span>
                      <span className="text-lg font-bold text-primary">
                        NT$ {formatPrice(venueData.totalPrice) || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleReservation}
                  >
                    預訂
                    <ClipboardCheck />
                  </Button>
                </CardFooter>
              </Card>
            </section>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
