'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/supabase'

type GateStatus = Database['public']['Enums']['gate_status']

interface GateProgressProps {
  gate: string
  status: GateStatus
  startTime?: Date
  completedAt?: Date
  notes?: string
  onStatusChange?: (newStatus: GateStatus) => void
  editable?: boolean
  className?: string
}

const STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    label: '待開始',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    variant: 'secondary' as const,
  },
  IN_PROGRESS: {
    icon: Play,
    label: '進行中',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    variant: 'default' as const,
  },
  COMPLETED: {
    icon: CheckCircle,
    label: '已完成',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    variant: 'default' as const,
  },
  FAILED: {
    icon: XCircle,
    label: '失敗',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    variant: 'destructive' as const,
  },
}

export function GateProgress({
  gate,
  status,
  startTime,
  completedAt,
  notes,
  onStatusChange,
  editable = false,
  className
}: GateProgressProps) {
  const config = STATUS_CONFIG[status]
  const StatusIcon = config.icon

  const getDuration = (): string => {
    if (!startTime) return '-'
    
    const end = completedAt || new Date()
    const duration = Math.round((end.getTime() - startTime.getTime()) / (1000 * 60))
    
    if (duration < 60) {
      return `${duration}分鐘`
    } else {
      return `${Math.floor(duration / 60)}小時${duration % 60}分鐘`
    }
  }

  const getProgressValue = (): number => {
    switch (status) {
      case 'PENDING': return 0
      case 'IN_PROGRESS': return 50
      case 'COMPLETED': return 100
      case 'FAILED': return 25
      default: return 0
    }
  }

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className={cn('p-2 rounded-full', config.bgColor)}>
              <StatusIcon className={cn('w-4 h-4', config.color)} />
            </div>
            {gate}
          </CardTitle>
          <Badge variant={config.variant}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 進度條 */}
        <div className="space-y-2">
          <Progress 
            value={getProgressValue()} 
            className={cn(
              'h-2',
              status === 'COMPLETED' && 'progress-completed',
              status === 'IN_PROGRESS' && 'progress-in-progress',
              status === 'FAILED' && 'progress-failed'
            )}
          />
          <div className="text-xs text-muted-foreground">
            {getProgressValue()}% 完成
          </div>
        </div>

        {/* 時間資訊 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">開始時間</div>
            <div className="font-medium">
              {startTime ? startTime.toLocaleString() : '-'}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">耗時</div>
            <div className="font-medium">{getDuration()}</div>
          </div>
        </div>

        {completedAt && (
          <div className="text-sm">
            <div className="text-muted-foreground">完成時間</div>
            <div className="font-medium">{completedAt.toLocaleString()}</div>
          </div>
        )}

        {notes && (
          <div className="text-sm">
            <div className="text-muted-foreground">備註</div>
            <div className="font-medium text-wrap">{notes}</div>
          </div>
        )}

        {/* 操作按鈕 */}
        {editable && (
          <div className="flex gap-2 pt-2 border-t">
            {status === 'PENDING' && (
              <Button 
                size="sm" 
                onClick={() => onStatusChange?.('IN_PROGRESS')}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-1" />
                開始
              </Button>
            )}
            
            {status === 'IN_PROGRESS' && (
              <>
                <Button 
                  size="sm" 
                  onClick={() => onStatusChange?.('COMPLETED')}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  完成
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => onStatusChange?.('FAILED')}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  失敗
                </Button>
              </>
            )}
            
            {(status === 'COMPLETED' || status === 'FAILED') && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onStatusChange?.('PENDING')}
                className="flex-1"
              >
                <Clock className="w-4 h-4 mr-1" />
                重置
              </Button>
            )}
          </div>
        )}

        {/* 成功提示 */}
        {status === 'COMPLETED' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <Trophy className="w-5 h-5 text-green-600" />
            <div className="text-sm text-green-800">
              <div className="font-medium">關卡完成！</div>
              <div>耗時 {getDuration()}</div>
            </div>
          </div>
        )}

        {/* 失敗提示 */}
        {status === 'FAILED' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <XCircle className="w-5 h-5 text-red-600" />
            <div className="text-sm text-red-800">
              <div className="font-medium">關卡失敗</div>
              <div>建議調整策略後重新嘗試</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}