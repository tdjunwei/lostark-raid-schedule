'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Plus, X, Clock, Zap, Sun, Moon, Sunrise, Sunset } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface VisualScheduleInputProps {
  userId: string
  onSave?: () => void
}

const DAYS = [
  { key: 4, label: '週四', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  { key: 5, label: '週五', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  { key: 6, label: '週六', color: 'bg-pink-500/10 text-pink-600 border-pink-500/20' },
  { key: 0, label: '週日', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  { key: 1, label: '週一', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  { key: 2, label: '週二', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
  { key: 3, label: '週三', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
]

const QUICK_TEMPLATES = [
  { icon: Sunrise, label: '早上', time: '08:00 - 12:00', desc: '早鳥時段' },
  { icon: Sun, label: '下午', time: '14:00 - 18:00', desc: '午後時光' },
  { icon: Sunset, label: '傍晚', time: '18:00 - 21:00', desc: '黃金時段' },
  { icon: Moon, label: '深夜', time: '21:00 - 02:00', desc: '夜貓時段' },
]

interface TimeSlot {
  start: string
  end: string
  isOvernight: boolean
}

export function VisualScheduleInput({ userId, onSave }: VisualScheduleInputProps) {
  const [scheduleText, setScheduleText] = useState<Record<number, string>>({})
  const [parsedSlots, setParsedSlots] = useState<Record<number, TimeSlot[]>>({})
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<number, string>>({})
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  useEffect(() => {
    loadExistingSchedules()
  }, [userId])

  useEffect(() => {
    // Parse text for all days
    const parsed: Record<number, TimeSlot[]> = {}
    DAYS.forEach(day => {
      const text = scheduleText[day.key] || ''
      parsed[day.key] = parseTimeRanges(text)
    })
    setParsedSlots(parsed)
  }, [scheduleText])

  const loadExistingSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .eq('available', true)
        .order('day_of_week')
        .order('start_time')

      if (error) throw error

      const grouped: Record<number, string[]> = {}
      data?.forEach(schedule => {
        if (!grouped[schedule.day_of_week]) {
          grouped[schedule.day_of_week] = []
        }
        // 不需要手動添加"隔天"，系統會自動識別
        const timeStr = `${schedule.start_time} - ${schedule.end_time}`
        grouped[schedule.day_of_week].push(timeStr)
      })

      const text: Record<number, string> = {}
      Object.entries(grouped).forEach(([day, ranges]) => {
        text[parseInt(day)] = ranges.join(', ')
      })

      setScheduleText(text)
    } catch (error) {
      console.error('Error loading schedules:', error)
    }
  }

  const parseTimeRanges = (text: string): TimeSlot[] => {
    if (!text.trim()) return []

    const slots: TimeSlot[] = []
    const parts = text.split(',').map(p => p.trim())

    for (const part of parts) {
      const match = part.match(/(\d{1,2}:\d{2})\s*-\s*(?:隔天)?(\d{1,2}:\d{2})/)
      if (!match) continue

      const [, start, end] = match

      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(start) || !timeRegex.test(end)) continue

      // 自動判斷是否跨天：當結束時間 <= 開始時間時，視為跨天
      const [startH, startM] = start.split(':').map(Number)
      const [endH, endM] = end.split(':').map(Number)
      const startMinutes = startH * 60 + startM
      const endMinutes = endH * 60 + endM
      const isOvernight = endMinutes <= startMinutes

      slots.push({ start, end, isOvernight })
    }

    return slots
  }

  const addQuickTemplate = (dayKey: number, template: typeof QUICK_TEMPLATES[0]) => {
    const current = scheduleText[dayKey] || ''
    const newText = current ? `${current}, ${template.time}` : template.time
    setScheduleText({ ...scheduleText, [dayKey]: newText })
  }

  const clearDay = (dayKey: number) => {
    const newSchedule = { ...scheduleText }
    delete newSchedule[dayKey]
    setScheduleText(newSchedule)
    const newErrors = { ...errors }
    delete newErrors[dayKey]
    setErrors(newErrors)
  }

  const handleSave = async () => {
    setSaving(true)
    setErrors({})

    try {
      const newErrors: Record<number, string> = {}
      const schedulesToInsert = []

      for (const day of DAYS) {
        const slots = parsedSlots[day.key] || []

        for (const slot of slots) {
          schedulesToInsert.push({
            user_id: userId,
            day_of_week: day.key,
            start_time: slot.start,
            end_time: slot.end,
            available: true,
            note: slot.isOvernight ? '跨天到隔日' : null,
          })
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      // Delete all existing schedules
      const { error: deleteError } = await supabase
        .from('schedules')
        .delete()
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      // Insert new schedules
      if (schedulesToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('schedules')
          .insert(schedulesToInsert)

        if (insertError) throw insertError
      }

      // Success animation
      const saveBtn = document.querySelector('[data-save-btn]')
      saveBtn?.classList.add('scale-95')
      setTimeout(() => saveBtn?.classList.remove('scale-95'), 200)

      onSave?.()
    } catch (error) {
      console.error('Error saving schedules:', error)
      alert('❌ 保存失敗，請稍後再試')
    } finally {
      setSaving(false)
    }
  }

  const renderTimeVisualization = (dayKey: number) => {
    const slots = parsedSlots[dayKey] || []
    if (slots.length === 0) return null

    return (
      <div className="mt-2 space-y-1">
        {slots.map((slot, idx) => {
          const color = DAYS.find(d => d.key === dayKey)?.color || ''
          return (
            <div
              key={idx}
              className={cn(
                "flex items-center gap-2 p-2 rounded-md border text-sm transition-all hover:scale-[1.02]",
                color,
                "animate-in fade-in slide-in-from-left-2 duration-300"
              )}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span className="font-medium">{slot.start}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-medium">
                {slot.isOvernight && <span className="text-xs">隔天</span>} {slot.end}
              </span>
              {slot.isOvernight && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  跨天
                </Badge>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const totalSlots = Object.values(parsedSlots).reduce((sum, slots) => sum + slots.length, 0)

  return (
    <div className="space-y-6">
      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">總時間段</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {totalSlots}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">活躍天數</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {Object.values(parsedSlots).filter(slots => slots.length > 0).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">未設定</p>
                <p className="text-3xl font-bold text-muted-foreground">
                  {7 - Object.values(parsedSlots).filter(slots => slots.length > 0).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速模板 */}
      {selectedDay !== null && (
        <Card className="border-2 animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4" />
              快速添加 - {DAYS.find(d => d.key === selectedDay)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {QUICK_TEMPLATES.map((template, idx) => {
                const Icon = template.icon
                return (
                  <Button
                    key={idx}
                    variant="outline"
                    className="h-auto flex flex-col items-start p-3 hover:scale-105 transition-transform"
                    onClick={() => addQuickTemplate(selectedDay, template)}
                  >
                    <div className="flex items-center gap-2 w-full mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{template.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{template.time}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 每天的輸入 */}
      <div className="grid gap-4">
        {DAYS.map((day) => {
          const hasSchedule = (parsedSlots[day.key]?.length || 0) > 0

          return (
            <Card
              key={day.key}
              className={cn(
                "border-2 transition-all hover:shadow-md",
                selectedDay === day.key && "ring-2 ring-primary ring-offset-2",
                hasSchedule && "bg-gradient-to-r from-background to-muted/20"
              )}
            >
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("px-3 py-1.5 rounded-lg border-2 font-bold", day.color)}>
                        {day.label}
                      </div>
                      {hasSchedule && (
                        <Badge variant="secondary" className="animate-in fade-in zoom-in-95">
                          {parsedSlots[day.key].length} 個時段
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {hasSchedule && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => clearDay(day.key)}
                          className="h-8 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedDay(selectedDay === day.key ? null : day.key)}
                        className="h-8"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Input */}
                  <Input
                    value={scheduleText[day.key] || ''}
                    onChange={(e) => setScheduleText({ ...scheduleText, [day.key]: e.target.value })}
                    placeholder="例：15:00 - 17:00, 20:00 - 03:00"
                    className={cn(
                      "border-2 transition-all",
                      errors[day.key] && "border-destructive",
                      hasSchedule && "bg-muted/50"
                    )}
                    onFocus={() => setSelectedDay(day.key)}
                  />

                  {/* Error */}
                  {errors[day.key] && (
                    <p className="text-sm text-destructive animate-in slide-in-from-top-1">
                      ⚠️ {errors[day.key]}
                    </p>
                  )}

                  {/* Visualization */}
                  {renderTimeVisualization(day.key)}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 保存按鈕 */}
      <div className="sticky bottom-6 z-10">
        <Card className="border-2 shadow-lg">
          <CardContent className="pt-6">
            <Button
              data-save-btn
              onClick={handleSave}
              disabled={saving || totalSlots === 0}
              className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02]"
              size="lg"
            >
              <Check className="w-5 h-5 mr-2" />
              {saving ? '保存中...' : `保存排程 (${totalSlots} 個時段)`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
