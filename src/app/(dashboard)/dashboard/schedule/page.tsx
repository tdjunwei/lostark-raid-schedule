'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WeeklyCalendar } from '@/components/calendar/weekly-calendar'
import { AvailabilityPicker } from '@/components/calendar/availability-picker'
import { 
  Calendar,
  Clock,
  Plus,
  Settings
} from 'lucide-react'

export default function SchedulePage() {
  const [showAvailabilityPicker, setShowAvailabilityPicker] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number>(0)
  const [selectedTime, setSelectedTime] = useState<string>('')

  // 這裡需要實際的用戶 ID，暫時用假數據
  const userId = 'temp-user-id'

  const handleScheduleClick = (day: number, time: string) => {
    setSelectedDay(day)
    setSelectedTime(time)
    setShowAvailabilityPicker(true)
  }

  const handleSaveSchedule = () => {
    setShowAvailabilityPicker(false)
    // 重新載入日曆
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">排程管理</h1>
          <p className="text-muted-foreground">
            管理你的空閒時間，讓系統為你安排最適合的副本
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            排程設定
          </Button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本週空閒時段</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              個時間段
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已安排副本</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              本週副本
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">衝突警告</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              時間衝突
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">可用率</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              本週可用時間
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 週曆 */}
      <WeeklyCalendar
        userId={userId}
        onScheduleClick={handleScheduleClick}
        editable={true}
      />

      {/* 可用性設定對話框 */}
      {showAvailabilityPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <AvailabilityPicker
              userId={userId}
              dayOfWeek={selectedDay}
              initialTime={selectedTime}
              onSave={handleSaveSchedule}
              onCancel={() => setShowAvailabilityPicker(false)}
            />
          </div>
        </div>
      )}

      {/* 使用說明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">使用說明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• 點擊日曆上的時間格來設定你的空閒時間</p>
          <p>• 綠色表示你有空，灰色表示你忙碌</p>
          <p>• 系統會根據你的空閒時間自動推薦副本</p>
          <p>• 週期從週四開始到週三結束，符合 Lost Ark 的重置時間</p>
        </CardContent>
      </Card>
    </div>
  )
}