'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type Schedule = Database['public']['Tables']['schedules']['Row']

interface WeeklyCalendarProps {
  userId?: string
  onScheduleClick?: (day: number, time: string) => void
  editable?: boolean
}

interface TimeSlot {
  time: string
  label: string
}

// Lost Ark 週期：週四到週三
const DAYS = [
  { key: 4, label: '週四', shortLabel: '四' }, // Thursday
  { key: 5, label: '週五', shortLabel: '五' }, // Friday
  { key: 6, label: '週六', shortLabel: '六' }, // Saturday
  { key: 0, label: '週日', shortLabel: '日' }, // Sunday
  { key: 1, label: '週一', shortLabel: '一' }, // Monday
  { key: 2, label: '週二', shortLabel: '二' }, // Tuesday
  { key: 3, label: '週三', shortLabel: '三' }, // Wednesday
]

export function WeeklyCalendar({ userId, onScheduleClick, editable = false }: WeeklyCalendarProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  const [hoveredSlot, setHoveredSlot] = useState<{ day: number; time: string } | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  useEffect(() => {
    // 設定到本週的週四
    const today = new Date()
    const dayOfWeek = today.getDay()
    const daysUntilThursday = (4 - dayOfWeek + 7) % 7
    const thisThursday = new Date(today)
    thisThursday.setDate(today.getDate() + daysUntilThursday - (daysUntilThursday > 3 ? 7 : 0))
    thisThursday.setHours(0, 0, 0, 0)
    
    setCurrentWeekStart(thisThursday)
  }, [])

  useEffect(() => {
    if (userId) {
      loadSchedules()
    }
  }, [userId, currentWeekStart])

  // 動態生成時間槽
  useEffect(() => {
    if (schedules.length === 0) {
      // 如果沒有排程，顯示默認時間槽
      setTimeSlots([
        { time: '19:00', label: '19:00' },
        { time: '20:00', label: '20:00' },
        { time: '21:00', label: '21:00' },
        { time: '22:00', label: '22:00' },
        { time: '23:00', label: '23:00' },
      ])
    } else {
      // 從排程中提取所有唯一的開始時間
      const uniqueTimes = new Set<string>()
      schedules.forEach(schedule => {
        uniqueTimes.add(schedule.start_time)
      })

      // 轉換為TimeSlot數組並排序
      const slots = Array.from(uniqueTimes)
        .sort()
        .map(time => ({
          time,
          label: time
        }))

      setTimeSlots(slots)
    }
  }, [schedules])

  const loadSchedules = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error
      setSchedules(data || [])
    } catch (error) {
      console.error('Error loading schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigateWeek = (direction: number) => {
    const newWeek = new Date(currentWeekStart)
    newWeek.setDate(currentWeekStart.getDate() + (direction * 7))
    setCurrentWeekStart(newWeek)
  }

  const getDateForDay = (dayOfWeek: number): Date => {
    const date = new Date(currentWeekStart)
    const dayOffset = DAYS.findIndex(d => d.key === dayOfWeek)
    date.setDate(currentWeekStart.getDate() + dayOffset)
    return date
  }

  const getScheduleForSlot = (dayOfWeek: number, time: string): Schedule | null => {
    return schedules.find(s =>
      s.day_of_week === dayOfWeek &&
      s.start_time === time
    ) || null
  }

  const handleSlotClick = (dayOfWeek: number, time: string) => {
    if (!editable) return
    onScheduleClick?.(dayOfWeek, time)
  }

  const formatWeekRange = (): string => {
    const start = new Date(currentWeekStart)
    const end = new Date(currentWeekStart)
    end.setDate(start.getDate() + 6)
    
    const formatDate = (date: Date) => 
      `${date.getMonth() + 1}/${date.getDate()}`
    
    return `${formatDate(start)} - ${formatDate(end)}`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">載入中...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            週程表
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateWeek(-1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Badge variant="outline" className="px-3">
              {formatWeekRange()}
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateWeek(1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-8 gap-1">
          {/* 時間標籤列 */}
          <div className="flex items-center justify-center p-2 text-sm font-medium">
            <Clock className="w-4 h-4" />
          </div>
          {DAYS.map(day => (
            <div key={day.key} className="text-center p-2">
              <div className="text-sm font-medium">{day.label}</div>
              <div className="text-xs text-muted-foreground">
                {getDateForDay(day.key).getDate()}
              </div>
            </div>
          ))}

          {/* 時間段行 */}
          {timeSlots.map(timeSlot => (
            <div key={timeSlot.time} className="contents">
              <div className="flex items-center justify-center p-2 text-sm font-medium border-r">
                {timeSlot.label}
              </div>

              {DAYS.map(day => {
                const schedule = getScheduleForSlot(day.key, timeSlot.time)
                const isHovered = hoveredSlot?.day === day.key &&
                                hoveredSlot?.time === timeSlot.time
                const isToday = getDateForDay(day.key).toDateString() === new Date().toDateString()

                return (
                  <div
                    key={`${day.key}-${timeSlot.time}`}
                    className={`
                      relative p-2 min-h-[3rem] border border-border cursor-pointer
                      transition-all duration-200 hover:bg-muted/50
                      ${schedule ? 'bg-primary/10 hover:bg-primary/20' : ''}
                      ${isHovered ? 'ring-2 ring-primary/50' : ''}
                      ${isToday ? 'bg-accent/20' : ''}
                      ${editable ? 'hover:shadow-sm' : ''}
                    `}
                    onClick={() => handleSlotClick(day.key, timeSlot.time)}
                    onMouseEnter={() => setHoveredSlot({ day: day.key, time: timeSlot.time })}
                    onMouseLeave={() => setHoveredSlot(null)}
                  >
                    {schedule && (
                      <div className="space-y-1">
                        {schedule.available ? (
                          <Badge variant="default" className="text-xs">
                            空閒
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            忙碌
                          </Badge>
                        )}

                        {schedule.note && (
                          <div className="text-xs text-muted-foreground truncate">
                            {schedule.note}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          {schedule.start_time} - {schedule.end_time}
                        </div>
                      </div>
                    )}

                    {!schedule && editable && isHovered && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Badge variant="outline" className="text-xs opacity-70">
                          點擊設定
                        </Badge>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {editable && (
          <div className="mt-4 text-sm text-muted-foreground">
            點擊時間格來設定你的空閒時間
          </div>
        )}
      </CardContent>
    </Card>
  )
}