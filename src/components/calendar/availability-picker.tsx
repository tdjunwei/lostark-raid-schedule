'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Clock, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type Schedule = Database['public']['Tables']['schedules']['Row']

interface AvailabilityPickerProps {
  userId: string
  dayOfWeek: number
  initialTime?: string
  onSave?: (schedule: Schedule) => void
  onCancel?: () => void
  onDelete?: (scheduleId: string) => void
}

const DAY_NAMES = {
  0: '週日',
  1: '週一', 
  2: '週二',
  3: '週三',
  4: '週四',
  5: '週五',
  6: '週六',
}

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: `${i.toString().padStart(2, '0')}:00`,
  label: `${i.toString().padStart(2, '0')}:00`,
}))

export function AvailabilityPicker({ 
  userId, 
  dayOfWeek, 
  initialTime, 
  onSave, 
  onCancel,
  onDelete 
}: AvailabilityPickerProps) {
  const [startTime, setStartTime] = useState(initialTime || '19:00')
  const [endTime, setEndTime] = useState('23:00')
  const [available, setAvailable] = useState(true)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [existingSchedules, setExistingSchedules] = useState<Schedule[]>([])
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)

  useEffect(() => {
    loadExistingSchedules()
  }, [userId, dayOfWeek])

  const loadExistingSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .eq('day_of_week', dayOfWeek)
        .order('start_time')

      if (error) throw error
      
      setExistingSchedules(data || [])
      
      // 如果有初始時間，查找對應的現有排程
      if (initialTime && data) {
        const existing = data.find(s => 
          s.start_time <= initialTime && s.end_time > initialTime
        )
        
        if (existing) {
          setEditingSchedule(existing)
          setStartTime(existing.start_time)
          setEndTime(existing.end_time)
          setAvailable(existing.available)
          setNote(existing.note || '')
        }
      }
    } catch (error) {
      console.error('Error loading schedules:', error)
    }
  }

  const handleSave = async () => {
    if (!userId) return

    setSaving(true)
    
    try {
      const scheduleData = {
        user_id: userId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        available,
        note: note || null,
      }

      let result
      
      if (editingSchedule) {
        // 更新現有排程
        result = await supabase
          .from('schedules')
          .update(scheduleData)
          .eq('id', editingSchedule.id)
          .select()
          .single()
      } else {
        // 創建新排程
        result = await supabase
          .from('schedules')
          .insert(scheduleData)
          .select()
          .single()
      }

      if (result.error) throw result.error
      
      onSave?.(result.data)
    } catch (error) {
      console.error('Error saving schedule:', error)
      alert('保存失敗，請稍後再試')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (schedule: Schedule) => {
    if (!confirm('確定要刪除這個時間段嗎？')) return

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', schedule.id)

      if (error) throw error
      
      setExistingSchedules(prev => prev.filter(s => s.id !== schedule.id))
      onDelete?.(schedule.id)
    } catch (error) {
      console.error('Error deleting schedule:', error)
      alert('刪除失敗，請稍後再試')
    }
  }

  const validateTimeRange = (): boolean => {
    if (startTime >= endTime) {
      alert('結束時間必須晚於開始時間')
      return false
    }
    
    // 檢查時間衝突（除了正在編輯的排程）
    const conflicting = existingSchedules.find(schedule => {
      if (editingSchedule && schedule.id === editingSchedule.id) {
        return false
      }
      
      return (
        (startTime < schedule.end_time && endTime > schedule.start_time)
      )
    })
    
    if (conflicting) {
      alert(`時間段與現有排程衝突：${conflicting.start_time} - ${conflicting.end_time}`)
      return false
    }
    
    return true
  }

  const handleSubmit = () => {
    if (validateTimeRange()) {
      handleSave()
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            設定 {DAY_NAMES[dayOfWeek as keyof typeof DAY_NAMES]} 的空閒時間
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">開始時間</label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map(time => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">結束時間</label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map(time => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">狀態</label>
            <Select value={available.toString()} onValueChange={(v) => setAvailable(v === 'true')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">空閒可參與</SelectItem>
                <SelectItem value="false">忙碌不可參與</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">備註 (可選)</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如：只能參與簡單副本"
              maxLength={100}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? '保存中...' : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {editingSchedule ? '更新' : '保存'}
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 現有排程列表 */}
      {existingSchedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {DAY_NAMES[dayOfWeek as keyof typeof DAY_NAMES]} 的現有排程
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {existingSchedules.map(schedule => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">
                    {schedule.start_time} - {schedule.end_time}
                  </div>
                  <Badge variant={schedule.available ? 'default' : 'secondary'}>
                    {schedule.available ? '空閒' : '忙碌'}
                  </Badge>
                  {schedule.note && (
                    <span className="text-sm text-muted-foreground">
                      {schedule.note}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(schedule)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}