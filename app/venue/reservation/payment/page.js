'use client'

// hooks
import { useState, useEffect, useMemo, Suspense } from 'react'
import { useVenue } from '@/contexts/venue-context'
import { useAuth } from '@/contexts/auth-context'

// utils
import { validateField, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'

// Icon
import { CreditCard } from 'lucide-react'

// next 元件
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'

// UI 元件
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'

// 自訂元件
import { Navbar } from '@/components/navbar'
import BreadcrumbAuto from '@/components/breadcrumb-auto'
import Step from '@/components/step'
import Footer from '@/components/footer'
import PaymentMethodSelector, {
  paymentOptions,
} from '@/components/payment-method-selector'
import ReceiptTypeSelector, {
  receiptOptions,
} from '@/components/receipt-type-selector'

// 將使用 useSearchParams 的邏輯抽取到單獨的組件
function PaymentContent() {
  // #region 路由和URL參數
  const router = useRouter()
  const { user } = useAuth()

  // #region 狀態管理
  const [errors, setErrors] = useState({})

  const { venueData, setVenueData } = useVenue()

  // 付款和發票選項狀態
  const [selectedPayment, setSelectedPayment] = useState('')
  const [selectedReceipt, setSelectedReceipt] = useState('')

  // 用戶輸入資料狀態
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    carrierId: '', // 載具號碼
    companyId: '', // 統一編號
  })
  console.log('venueData', venueData)

  // #region 副作用處理 - 靜態版本移除

  // #region 事件處理函數

  // 格式化價格，加上千分位逗號
  const formatPrice = (price) => {
    return Number(price).toLocaleString('zh-TW')
  }

  // 處理表單輸入變更
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // 清除該欄位的錯誤
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  // 獲取選中的付款和發票選項
  const getSelectedOptions = () => {
    const selectedPaymentOption = paymentOptions.find(
      (opt) => opt.id === selectedPayment
    )
    const selectedReceiptOption = receiptOptions.find(
      (opt) => opt.id === selectedReceipt
    )

    return {
      paymentMethod: selectedPaymentOption?.label || '',
      receiptType: selectedReceiptOption?.label || '',
    }
  }

  // 處理下拉選單變更
  const handleSelectChange = (field, value, setter) => {
    setter(value)
    // 如果改變發票類型，清除相關欄位
    if (field === 'receipt') {
      setFormData((prev) => ({
        ...prev,
        carrierId: '',
        companyId: '',
      }))
    }
  }

  // #region 處理付款按鈕點擊 - 靜態版本
  const handlePayment = async () => {
    // 先執行驗證並獲取錯誤
    const newErrors = {}
    newErrors.name = validateField('name', formData.name || '', true)
    newErrors.phone = validateField('phone', formData.phone || '', true)
    newErrors.payment = validateField('payment', selectedPayment || '', true)
    newErrors.receipt = validateField('receipt', selectedReceipt || '', true)
    newErrors.carrierId = validateField(
      'carrierId',
      formData.carrierId || '',
      true,
      '',
      selectedReceipt
    )
    newErrors.companyId = validateField(
      'companyId',
      formData.companyId || '',
      true,
      '',
      selectedReceipt
    )

    setErrors(newErrors)

    // 檢查是否有任何錯誤
    const hasErrors = Object.values(newErrors).some((error) => error !== '')

    if (!hasErrors) {
      // 表單驗證通過，更新 context 包含用戶資料和付款資訊
      setVenueData({
        ...venueData,
        userInfo: formData,
        ...getSelectedOptions(),
      })

      // 靜態版本：直接導向成功頁面，不進行實際付款處理
      toast.success('訂單建立成功！')

      // 模擬一個訂單 ID
      const mockReservationId = Date.now()

      // 直接跳轉到成功頁面
      router.push(
        `/venue/reservation/success?reservationId=${mockReservationId}`
      )
    } else {
      // 表單驗證失敗，滾動到第一個錯誤欄位
      const errorFields = [
        { field: 'name', selector: '#name' },
        { field: 'phone', selector: '#phone' },
        { field: 'payment', selector: '[data-field="payment"]' },
        { field: 'receipt', selector: '[data-field="receipt"]' },
        { field: 'carrierId', selector: '#carrierId' },
        { field: 'companyId', selector: '#companyId' },
      ]

      // 找到第一個有錯誤的欄位並跳轉
      setTimeout(() => {
        for (const errorField of errorFields) {
          if (newErrors[errorField.field]) {
            const element = document.querySelector(errorField.selector)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' })
              // 如果是輸入框，則聚焦
              const input = element.querySelector('input') || element
              if (input && input.focus) {
                input.focus()
              }
              break
            }
          }
        }
      }, 100) // 稍微延遲確保 DOM 更新完成
    }
  }

  // #region 資料顯示選項
  const steps = [
    { id: 1, title: '選擇場地與時間', completed: true },
    { id: 2, title: '填寫付款資訊', active: true },
    { id: 3, title: '完成訂單', completed: false },
  ]
  // #endregion 資料顯示選項

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
            {/* 付款流程 */}
            <section className="flex-1 lg:flex-2 min-w-0 flex flex-col">
              <h2 className="text-xl font-semibold mb-4">付款方式</h2>
              <Card>
                <CardContent className="flex flex-col gap-6">
                  {/* 預訂人資料 */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">訂單人資料</Label>
                    <div className="space-y-2 grid gap-3">
                      <div className="grid w-full items-center gap-3">
                        <Label htmlFor="name">姓名</Label>
                        <Input
                          type="text"
                          id="name"
                          placeholder="請輸入姓名"
                          className={cn(
                            'w-full',
                            errors.name &&
                              'border-destructive focus:border-destructive focus:ring-destructive'
                          )}
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange('name', e.target.value)
                          }
                        />
                        {errors.name && (
                          <span className="text-destructive text-sm">
                            {errors.name}
                          </span>
                        )}
                      </div>
                      <div className="grid w-full items-center gap-3">
                        <Label htmlFor="phone">電話</Label>
                        <Input
                          type="text"
                          id="phone"
                          placeholder="請填寫電話號碼(例：0912345678)"
                          className={cn(
                            'w-full',
                            errors.phone &&
                              'border-destructive focus:border-destructive focus:ring-destructive'
                          )}
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange('phone', e.target.value)
                          }
                        />
                        {errors.phone && (
                          <span className="text-destructive text-sm">
                            {errors.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* 付款方式 */}
                  <PaymentMethodSelector
                    selectedPayment={selectedPayment}
                    onPaymentChange={(value) =>
                      handleSelectChange('payment', value, setSelectedPayment)
                    }
                    options={[
                      paymentOptions[0],
                      paymentOptions[1],
                      paymentOptions[3],
                    ]}
                    errors={errors}
                  />

                  {/* 發票類型 */}
                  <ReceiptTypeSelector
                    selectedReceipt={selectedReceipt}
                    formData={formData}
                    onInputChange={handleInputChange}
                    onReceiptChange={(value) =>
                      handleSelectChange('receipt', value, setSelectedReceipt)
                    }
                    errors={errors}
                  />
                </CardContent>
              </Card>
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
                        alt="場館圖片"
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
                      <div className="text-sm text-primary">
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
                <CardFooter className="flex justify-end">
                  <Button size="lg" className="w-full" onClick={handlePayment}>
                    確認付款
                    <CreditCard />
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

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>載入中...</div>}>
      <PaymentContent />
    </Suspense>
  )
}
