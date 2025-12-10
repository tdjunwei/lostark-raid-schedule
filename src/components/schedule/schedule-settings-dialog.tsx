'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { X, Copy, Trash2, Clock, Bell } from 'lucide-react'
import type { Database } from '@/types/supabase'

interface ScheduleSettingsDialogProps {
  userId: string
  onClose: () => void
  onSuccess: () => void
}

const DAYS = [
  { key: 4, label: '週四' },
  { key: 5, label: '週五' },
  { key: 6, label: '週六' },
  { key: 0, label: '週日' },
  { key: 1, label: '週一' },
  { key: 2, label: '週二' },
  { key: 3, label: '週三' },
]

// 副本類型映射
const RAID_TYPE_LABELS: Record<Database['public']['Enums']['raid_type'], string> = {
  CELESTIAL: '天界',
  DREAM: '夢幻',
  IVORY_TOWER: '象牙塔',
  PLAGUE: '瘟疫',
}

export function ScheduleSettingsDialog({ userId, onClose, onSuccess }: ScheduleSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<'template' | 'bulk' | 'preferences' | 'notifications'>('template')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 週期性模板
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [startTime, setStartTime] = useState('19:00')
  const [endTime, setEndTime] = useState('23:00')

  // 偏好設定
  const [availableRaidTypes, setAvailableRaidTypes] = useState<Database['public']['Enums']['raid_type'][]>([])
  const [preferredRaidTypes, setPreferredRaidTypes] = useState<Database['public']['Enums']['raid_type'][]>([])
  const [preferredTimeSlots, setPreferredTimeSlots] = useState<string[]>([])
  const [newTimeSlot, setNewTimeSlot] = useState('')

  // 通知設定
  const [enableScheduleNotifications, setEnableScheduleNotifications] = useState(true)
  const [enableRaidReminders, setEnableRaidReminders] = useState(true)
  const [reminderMinutes, setReminderMinutes] = useState('30')

  // 載入可用的副本類型
  useEffect(() => {
    const loadRaidTypes = async () => {
      try {
        const { data: raids } = await supabase
          .from('raids')
          .select('type')

        if (raids) {
          // 獲取唯一的副本類型
          const uniqueTypes = Array.from(new Set(raids.map(r => r.type)))
          setAvailableRaidTypes(uniqueTypes)
        }
      } catch (err) {
        console.error('Error loading raid types:', err)
      }
    }
    loadRaidTypes()
  }, [])

  const handleDayToggle = (dayKey: number) => {
    setSelectedDays(prev =>
      prev.includes(dayKey)
        ? prev.filter(d => d !== dayKey)
        : [...prev, dayKey]
    )
  }

  const handleApplyTemplate = async () => {
    if (selectedDays.length === 0) {
      setError('請至少選擇一天')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 自動判斷是否跨天：當結束時間 <= 開始時間時，視為跨天
      const [startH, startM] = startTime.split(':').map(Number)
      const [endH, endM] = endTime.split(':').map(Number)
      const startMinutes = startH * 60 + startM
      const endMinutes = endH * 60 + endM
      const isOvernight = endMinutes <= startMinutes

      // 先刪除選定日期的所有現有排程（覆蓋模式）
      const { error: deleteError } = await supabase
        .from('schedules')
        .delete()
        .eq('user_id', userId)
        .in('day_of_week', selectedDays)

      if (deleteError) throw deleteError

      // 為每個選擇的日子創建排程
      const schedules = selectedDays.map(dayOfWeek => ({
        user_id: userId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        available: true,
        note: isOvernight ? '跨天到隔日' : null,
      }))

      const { error: insertError } = await supabase
        .from('schedules')
        .insert(schedules)

      if (insertError) throw insertError

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error applying template:', err)
      setError(err.message || '套用模板失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleClearAll = async () => {
    if (!confirm('確定要清除所有排程嗎？此操作無法復原。')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('schedules')
        .delete()
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error clearing schedules:', err)
      setError(err.message || '清除排程失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToNextWeek = async () => {
    setLoading(true)
    setError(null)

    try {
      // 這個功能需要更複雜的邏輯來處理週次
      // 暫時顯示提示訊息
      alert('複製到下週功能開發中...')
    } catch (err: any) {
      console.error('Error copying to next week:', err)
      setError(err.message || '複製排程失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-background p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold">排程設定</h2>
          <p className="text-muted-foreground text-sm">管理你的排程偏好和通知設定</p>
        </div>

        {/* 分頁 */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'template'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('template')}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            週期模板
          </button>
          <button
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'bulk'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('bulk')}
          >
            <Copy className="w-4 h-4 inline mr-2" />
            批量操作
          </button>
          <button
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'preferences'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('preferences')}
          >
            偏好設定
          </button>
          <button
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            通知設定
          </button>
        </div>

        {/* 週期性模板 */}
        {activeTab === 'template' && (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">選擇星期</Label>
              <div className="grid grid-cols-4 gap-2">
                {DAYS.map(day => (
                  <div key={day.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.key}`}
                      checked={selectedDays.includes(day.key)}
                      onCheckedChange={() => handleDayToggle(day.key)}
                    />
                    <Label htmlFor={`day-${day.key}`} className="cursor-pointer">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">開始時間</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="endTime">結束時間</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">預覽：</p>
              <p className="text-muted-foreground">
                {selectedDays.length > 0 ? (() => {
                  // 判斷是否跨天
                  const [startH, startM] = startTime.split(':').map(Number)
                  const [endH, endM] = endTime.split(':').map(Number)
                  const startMinutes = startH * 60 + startM
                  const endMinutes = endH * 60 + endM
                  const isOvernight = endMinutes <= startMinutes

                  return `每週 ${selectedDays.map(d => DAYS.find(day => day.key === d)?.label).join('、')} ${startTime} - ${endTime}${isOvernight ? ' (跨天)' : ''} 標記為空閒`
                })() : '請選擇至少一天'}
              </p>
            </div>

            <Button onClick={handleApplyTemplate} disabled={loading || selectedDays.length === 0} className="w-full">
              {loading ? '套用中...' : '套用模板'}
            </Button>
          </div>
        )}

        {/* 批量操作 */}
        {activeTab === 'bulk' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  複製到下週
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  將本週的排程複製到下週
                </p>
                <Button onClick={handleCopyToNextWeek} disabled={loading} variant="outline" className="w-full">
                  複製排程
                </Button>
              </div>

              <div className="p-4 border rounded-lg border-destructive/50">
                <h3 className="font-medium mb-2 flex items-center gap-2 text-destructive">
                  <Trash2 className="w-4 h-4" />
                  清除所有排程
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  刪除所有已設定的排程，此操作無法復原
                </p>
                <Button onClick={handleClearAll} disabled={loading} variant="destructive" className="w-full">
                  清除所有排程
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 偏好設定 */}
        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">偏好副本類型</Label>
              <div className="space-y-2">
                {availableRaidTypes.length > 0 ? (
                  availableRaidTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`raid-${type}`}
                        checked={preferredRaidTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferredRaidTypes([...preferredRaidTypes, type])
                          } else {
                            setPreferredRaidTypes(preferredRaidTypes.filter(t => t !== type))
                          }
                        }}
                      />
                      <Label htmlFor={`raid-${type}`} className="cursor-pointer">
                        {RAID_TYPE_LABELS[type]}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">載入副本類型中...</p>
                )}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">偏好時段</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    placeholder="選擇時間"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newTimeSlot && !preferredTimeSlots.includes(newTimeSlot)) {
                        setPreferredTimeSlots([...preferredTimeSlots, newTimeSlot])
                        setNewTimeSlot('')
                      }
                    }}
                    disabled={!newTimeSlot || preferredTimeSlots.includes(newTimeSlot)}
                  >
                    新增
                  </Button>
                </div>
                {preferredTimeSlots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {preferredTimeSlots.map(time => (
                      <div
                        key={time}
                        className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-md text-sm"
                      >
                        <span>{time}</span>
                        <button
                          type="button"
                          onClick={() => setPreferredTimeSlots(preferredTimeSlots.filter(t => t !== time))}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">尚未新增任何偏好時段</p>
                )}
              </div>
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="text-muted-foreground">
                偏好設定將用於系統推薦副本時的參考
              </p>
            </div>

            <Button onClick={() => alert('儲存偏好設定功能開發中...')} disabled={loading} className="w-full">
              儲存偏好
            </Button>
          </div>
        )}

        {/* 通知設定 */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="scheduleNotif" className="cursor-pointer font-medium">
                    排程變更通知
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    當排程有變更時接收通知
                  </p>
                </div>
                <Checkbox
                  id="scheduleNotif"
                  checked={enableScheduleNotifications}
                  onCheckedChange={(checked) => setEnableScheduleNotifications(checked as boolean)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="raidReminder" className="cursor-pointer font-medium">
                    副本提醒
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    在副本開始前接收提醒
                  </p>
                </div>
                <Checkbox
                  id="raidReminder"
                  checked={enableRaidReminders}
                  onCheckedChange={(checked) => setEnableRaidReminders(checked as boolean)}
                />
              </div>

              {enableRaidReminders && (
                <div className="ml-4">
                  <Label htmlFor="reminderTime">提前通知時間</Label>
                  <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
                    <SelectTrigger id="reminderTime">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15分鐘前</SelectItem>
                      <SelectItem value="30">30分鐘前</SelectItem>
                      <SelectItem value="60">1小時前</SelectItem>
                      <SelectItem value="120">2小時前</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="text-muted-foreground">
                通知將透過瀏覽器推送或電子郵件發送
              </p>
            </div>

            <Button onClick={() => alert('儲存通知設定功能開發中...')} disabled={loading} className="w-full">
              儲存通知設定
            </Button>
          </div>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* 關閉按鈕 */}
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            關閉
          </Button>
        </div>
      </div>
    </div>
  )
}
