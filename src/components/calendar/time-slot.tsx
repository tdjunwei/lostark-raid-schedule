'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/supabase'

type Schedule = Database['public']['Tables']['schedules']['Row']

interface TimeSlotProps {
  schedule?: Schedule | null
  isHovered?: boolean
  isToday?: boolean
  isSelected?: boolean
  editable?: boolean
  onClick?: () => void
  className?: string
}

export function TimeSlot({
  schedule,
  isHovered = false,
  isToday = false,
  isSelected = false,
  editable = false,
  onClick,
  className
}: TimeSlotProps) {
  const hasSchedule = Boolean(schedule)
  
  return (
    <div
      className={cn(
        'relative p-2 min-h-[3rem] border border-border transition-all duration-200',
        // 基礎樣式
        hasSchedule && 'bg-primary/10',
        isToday && 'bg-accent/20',
        isSelected && 'ring-2 ring-primary',
        isHovered && hasSchedule && 'bg-primary/20',
        isHovered && !hasSchedule && 'bg-muted/50',
        
        // 互動樣式
        editable && 'cursor-pointer hover:shadow-sm',
        !editable && hasSchedule && 'cursor-default',
        
        className
      )}
      onClick={onClick}
    >
      {schedule && (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Badge 
              variant={schedule.available ? 'default' : 'secondary'}
              className="text-xs"
            >
              {schedule.available ? '空閒' : '忙碌'}
            </Badge>
          </div>
          
          {schedule.note && (
            <div className="text-xs text-muted-foreground truncate">
              {schedule.note}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
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
      
      {isToday && !hasSchedule && (
        <div className="absolute top-1 right-1">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
        </div>
      )}
    </div>
  )
}