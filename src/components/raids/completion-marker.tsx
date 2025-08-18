'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy, 
  Star,
  MessageSquare,
  Users,
  Target
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/supabase'

type GateStatus = Database['public']['Enums']['gate_status']

interface CompletionMarkerProps {
  gate: string
  status: GateStatus
  completedAt?: Date
  notes?: string
  participantCount?: number
  onComplete?: (data: CompletionData) => void
  className?: string
}

interface CompletionData {
  notes?: string
  mvp?: string
  difficulty?: number
  completionTime?: string
}

const STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    label: '待開始',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
  },
  IN_PROGRESS: {
    icon: Clock,
    label: '進行中',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
  },
  COMPLETED: {
    icon: CheckCircle,
    label: '已完成',
    color: 'text-green-500',
    bgColor: 'bg-green-100',
  },
  FAILED: {
    icon: XCircle,
    label: '失敗',
    color: 'text-red-500',
    bgColor: 'bg-red-100',
  },
}

export function CompletionMarker({
  gate,
  status,
  completedAt,
  notes,
  participantCount,
  onComplete,
  className
}: CompletionMarkerProps) {
  const [open, setOpen] = useState(false)
  const [completionNotes, setCompletionNotes] = useState(notes || '')
  const [mvp, setMvp] = useState('')
  const [difficulty, setDifficulty] = useState(3)
  const [customTime, setCustomTime] = useState('')

  const config = STATUS_CONFIG[status]
  const StatusIcon = config.icon

  const handleComplete = () => {
    onComplete?.({
      notes: completionNotes,
      mvp,
      difficulty,
      completionTime: customTime,
    })
    setOpen(false)
  }

  const getDurationText = (): string => {
    if (!completedAt) return ''
    
    const now = new Date()
    const diff = Math.abs(now.getTime() - completedAt.getTime())
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}小時${minutes % 60}分鐘前`
    } else {
      return `${minutes}分鐘前`
    }
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative">
        {/* 狀態圖示 */}
        <div className={cn(
          'flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all',
          config.bgColor,
          status === 'COMPLETED' && 'border-green-500 shadow-lg',
          status === 'FAILED' && 'border-red-500 shadow-lg',
          status === 'IN_PROGRESS' && 'border-blue-500 animate-pulse',
          status === 'PENDING' && 'border-gray-300'
        )}>
          <StatusIcon className={cn('w-6 h-6', config.color)} />
        </div>

        {/* 完成時的特效 */}
        {status === 'COMPLETED' && (
          <>
            <div className="absolute -top-1 -right-1">
              <div className="flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full">
                <Star className="w-3 h-3 text-yellow-800" fill="currentColor" />
              </div>
            </div>
            
            <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-75" />
          </>
        )}

        {/* 關卡標籤 */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <Badge variant="outline" className="text-xs">
            {gate}
          </Badge>
        </div>
      </div>

      {/* 完成詳情對話框 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {status === 'COMPLETED' && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 p-1"
              onClick={() => setOpen(true)}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          )}
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              {gate} 完成記錄
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {completedAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {completedAt.toLocaleString()} ({getDurationText()})
              </div>
            )}

            {participantCount && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                {participantCount} 人參與
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">完成備註</label>
              <Textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="記錄關卡完成過程、難點、亮點等..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">MVP 玩家</label>
              <Input
                value={mvp}
                onChange={(e) => setMvp(e.target.value)}
                placeholder="表現最佳的玩家暱稱"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                難度評級 ({difficulty}/5)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors',
                      level <= difficulty 
                        ? 'border-yellow-400 bg-yellow-100 text-yellow-800' 
                        : 'border-gray-200 text-gray-400'
                    )}
                  >
                    <Target className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                1=很簡單, 3=中等, 5=非常困難
              </div>
            </div>

            {status === 'IN_PROGRESS' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">預估完成時間</label>
                <Input
                  type="datetime-local"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleComplete}>
              保存記錄
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}