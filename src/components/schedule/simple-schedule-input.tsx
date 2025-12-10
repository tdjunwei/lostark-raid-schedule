'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SimpleScheduleInputProps {
  userId: string
  onSave?: () => void
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

interface TimeRange {
  start: string
  end: string
  nextDay: boolean
}

export function SimpleScheduleInput({ userId, onSave }: SimpleScheduleInputProps) {
  const [scheduleText, setScheduleText] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<number, string>>({})

  useEffect(() => {
    loadExistingSchedules()
  }, [userId])

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

      // Group schedules by day
      const grouped: Record<number, string[]> = {}
      data?.forEach(schedule => {
        if (!grouped[schedule.day_of_week]) {
          grouped[schedule.day_of_week] = []
        }
        grouped[schedule.day_of_week].push(
          `${schedule.start_time} - ${schedule.end_time}`
        )
      })

      // Convert to text format
      const text: Record<number, string> = {}
      Object.entries(grouped).forEach(([day, ranges]) => {
        text[parseInt(day)] = ranges.join(', ')
      })

      setScheduleText(text)
    } catch (error) {
      console.error('Error loading schedules:', error)
    }
  }

  const parseTimeRanges = (text: string): TimeRange[] => {
    if (!text.trim()) return []

    const ranges: TimeRange[] = []
    const parts = text.split(',').map(p => p.trim())

    for (const part of parts) {
      // 支持格式: "15:00 - 17:00" 或 "20:00 - 隔天03:00" 或 "20:00-隔天03:00"
      const match = part.match(/(\d{1,2}:\d{2})\s*-\s*(?:隔天)?(\d{1,2}:\d{2})/)
      if (!match) continue

      const [, start, end] = match
      const nextDay = part.includes('隔天')

      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(start) || !timeRegex.test(end)) continue

      ranges.push({ start, end, nextDay })
    }

    return ranges
  }

  const validateTimeRanges = (ranges: TimeRange[]): string | null => {
    for (const range of ranges) {
      // Parse times
      const [startH, startM] = range.start.split(':').map(Number)
      const [endH, endM] = range.end.split(':').map(Number)

      const startMinutes = startH * 60 + startM
      const endMinutes = endH * 60 + endM

      // If not next day, end must be after start
      if (!range.nextDay && endMinutes <= startMinutes) {
        return `時間格式錯誤：${range.start} - ${range.end}（結束時間必須晚於開始時間，或使用"隔天"）`
      }

      // If next day, validate the logic
      if (range.nextDay && endMinutes >= startMinutes) {
        return `時間格式錯誤：${range.start} - 隔天${range.end}（隔天時間應該比開始時間早）`
      }
    }

    return null
  }

  const handleSave = async () => {
    setSaving(true)
    setErrors({})

    try {
      // Parse and validate all days
      const parsedSchedules: Record<number, TimeRange[]> = {}
      const newErrors: Record<number, string> = {}

      for (const day of DAYS) {
        const text = scheduleText[day.key] || ''
        if (!text.trim()) continue

        const ranges = parseTimeRanges(text)
        if (ranges.length === 0 && text.trim()) {
          newErrors[day.key] = '無法解析時間格式，請使用"15:00 - 17:00"或"20:00 - 隔天03:00"'
          continue
        }

        const error = validateTimeRanges(ranges)
        if (error) {
          newErrors[day.key] = error
          continue
        }

        parsedSchedules[day.key] = ranges
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      // Delete all existing schedules for this user
      const { error: deleteError } = await supabase
        .from('schedules')
        .delete()
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      // Insert new schedules
      const schedules = []
      for (const [dayStr, ranges] of Object.entries(parsedSchedules)) {
        const dayOfWeek = parseInt(dayStr)

        for (const range of ranges) {
          schedules.push({
            user_id: userId,
            day_of_week: dayOfWeek,
            start_time: range.start,
            end_time: range.end,
            available: true,
            note: range.nextDay ? '跨天到隔日' : null,
          })
        }
      }

      if (schedules.length > 0) {
        const { error: insertError } = await supabase
          .from('schedules')
          .insert(schedules)

        if (insertError) throw insertError
      }

      alert('✅ 排程保存成功！')
      onSave?.()
    } catch (error) {
      console.error('Error saving schedules:', error)
      alert('❌ 保存失敗，請稍後再試')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>簡易排程輸入</CardTitle>
        <CardDescription>
          輸入每天的空閒時間，格式：15:00 - 17:00, 20:00 - 隔天03:00
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 使用說明 */}
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-1">
              <p className="font-medium">輸入格式說明：</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>單個時間段：<code className="text-xs bg-background px-1 py-0.5 rounded">15:00 - 17:00</code></li>
                <li>多個時間段：<code className="text-xs bg-background px-1 py-0.5 rounded">15:00 - 17:00, 20:00 - 23:00</code></li>
                <li>跨天時間：<code className="text-xs bg-background px-1 py-0.5 rounded">20:00 - 隔天03:00</code></li>
                <li>留空表示該天無空閒時間</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 每天的輸入欄 */}
        {DAYS.map((day) => (
          <div key={day.key} className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              {day.label}
              <span className="text-xs text-muted-foreground">
                ({['日', '一', '二', '三', '四', '五', '六'][day.key]})
              </span>
            </label>
            <Input
              value={scheduleText[day.key] || ''}
              onChange={(e) => setScheduleText({ ...scheduleText, [day.key]: e.target.value })}
              placeholder="例：15:00 - 17:00, 20:00 - 隔天03:00"
              className={errors[day.key] ? 'border-destructive' : ''}
            />
            {errors[day.key] && (
              <p className="text-sm text-destructive">{errors[day.key]}</p>
            )}
          </div>
        ))}

        {/* 保存按鈕 */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            <Check className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存排程'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
