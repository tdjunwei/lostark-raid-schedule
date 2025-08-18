'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users,
  Calendar,
  DollarSign,
  AlertTriangle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatGold } from '@/lib/utils'
import type { Database } from '@/types/supabase'
import type { RaidWithDetails, RaidTimelineEntry } from '@/types'

type Raid = Database['public']['Tables']['raids']['Row']
type RaidTimeline = Database['public']['Tables']['raid_timeline']['Row']
type RaidParticipant = Database['public']['Tables']['raid_participants']['Row'] & {
  character: Database['public']['Tables']['characters']['Row'] & {
    job: Database['public']['Tables']['jobs']['Row']
  }
}

interface RaidTimelineProps {
  raidId: string
  canEdit?: boolean
  onTimelineUpdate?: (timeline: RaidTimelineEntry[]) => void
}

const GATE_STATUS_COLORS = {
  PENDING: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
}

const GATE_STATUS_ICONS = {
  PENDING: Clock,
  IN_PROGRESS: Play,
  COMPLETED: CheckCircle,
  FAILED: XCircle,
}

export function RaidTimeline({ raidId, canEdit = false, onTimelineUpdate }: RaidTimelineProps) {
  const [raid, setRaid] = useState<Raid | null>(null)
  const [timeline, setTimeline] = useState<RaidTimeline[]>([])
  const [participants, setParticipants] = useState<RaidParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingGate, setUpdatingGate] = useState<string | null>(null)
  const [newGateNote, setNewGateNote] = useState('')

  useEffect(() => {
    loadRaidData()
  }, [raidId])

  const loadRaidData = async () => {
    try {
      setLoading(true)

      // 載入副本基本資訊
      const { data: raidData, error: raidError } = await supabase
        .from('raids')
        .select('*')
        .eq('id', raidId)
        .single()

      if (raidError) throw raidError
      setRaid(raidData)

      // 載入時間線
      const { data: timelineData, error: timelineError } = await supabase
        .from('raid_timeline')
        .select('*')
        .eq('raid_id', raidId)
        .order('created_at')

      if (timelineError) throw timelineError
      setTimeline(timelineData || [])

      // 載入參與者
      const { data: participantData, error: participantError } = await supabase
        .from('raid_participants')
        .select(`
          *,
          character:characters (
            *,
            job:jobs (*)
          )
        `)
        .eq('raid_id', raidId)

      if (participantError) throw participantError
      setParticipants(participantData || [])

    } catch (error) {
      console.error('Error loading raid data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGateStatusChange = async (gateId: string, newStatus: Database['public']['Enums']['gate_status']) => {
    if (!canEdit) return

    setUpdatingGate(gateId)

    try {
      const updateData: any = { status: newStatus }
      
      // 設定完成時間
      if (newStatus === 'COMPLETED') {
        updateData.completed_at = new Date().toISOString()
      } else if (newStatus === 'IN_PROGRESS' && !timeline.find(t => t.id === gateId)?.start_time) {
        updateData.start_time = new Date().toISOString()
      }

      // 添加備註
      if (newGateNote.trim()) {
        updateData.notes = newGateNote.trim()
      }

      const { data, error } = await supabase
        .from('raid_timeline')
        .update(updateData)
        .eq('id', gateId)
        .select()
        .single()

      if (error) throw error

      // 更新本地狀態
      setTimeline(prev => prev.map(item => 
        item.id === gateId ? data : item
      ))

      // 如果所有關卡都完成，更新副本狀態
      const allCompleted = timeline.every(t => 
        t.id === gateId ? newStatus === 'COMPLETED' : t.status === 'COMPLETED'
      )

      if (allCompleted && newStatus === 'COMPLETED') {
        await supabase
          .from('raids')
          .update({ status: 'COMPLETED' })
          .eq('id', raidId)
      }

      setNewGateNote('')
      onTimelineUpdate?.(timeline.map(t => ({
        id: t.id,
        gate: t.gate,
        status: t.id === gateId ? newStatus : t.status as any,
        startTime: t.start_time ? new Date(t.start_time) : undefined,
        completedAt: t.completed_at ? new Date(t.completed_at) : undefined,
        notes: t.notes,
      })))

    } catch (error) {
      console.error('Error updating gate status:', error)
      alert('更新失敗，請稍後再試')
    } finally {
      setUpdatingGate(null)
    }
  }

  const createDefaultGates = async () => {
    if (!raid || timeline.length > 0) return

    const defaultGates = ['G1', 'G2', 'G3', 'G4'].slice(0, 
      raid.type === 'PLAGUE' ? 2 : 3 // 瘟疫通常只有 2 個關卡
    )

    try {
      const gateData = defaultGates.map(gate => ({
        raid_id: raidId,
        gate,
        status: 'PENDING' as const,
      }))

      const { data, error } = await supabase
        .from('raid_timeline')
        .insert(gateData)
        .select()

      if (error) throw error
      setTimeline(data)
    } catch (error) {
      console.error('Error creating default gates:', error)
    }
  }

  const calculateProgress = (): number => {
    if (timeline.length === 0) return 0
    const completed = timeline.filter(t => t.status === 'COMPLETED').length
    return Math.round((completed / timeline.length) * 100)
  }

  const getTotalTime = (): string => {
    const firstStart = timeline
      .filter(t => t.start_time)
      .sort((a, b) => new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime())[0]
    
    const lastComplete = timeline
      .filter(t => t.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0]

    if (!firstStart?.start_time || !lastComplete?.completed_at) {
      return '進行中'
    }

    const start = new Date(firstStart.start_time)
    const end = new Date(lastComplete.completed_at)
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60))

    return `${Math.floor(duration / 60)}小時${duration % 60}分鐘`
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

  if (!raid) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">找不到副本資料</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 副本概覽 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {raid.name} - {raid.type} ({raid.mode})
            </div>
            <Badge variant={raid.status === 'COMPLETED' ? 'default' : 'secondary'}>
              {raid.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">進度</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{calculateProgress()}%</div>
                <div className="text-sm text-muted-foreground">
                  ({timeline.filter(t => t.status === 'COMPLETED').length}/{timeline.length})
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">參與人數</div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-lg font-medium">
                  {participants.length}/{raid.max_players}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">總耗時</div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-lg font-medium">{getTotalTime()}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">預估收益</div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-lg font-medium">
                  {formatGold((raid.active_gold_reward || 0) + (raid.bound_gold_reward || 0))}G
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 關卡時間線 */}
      <Card>
        <CardHeader>
          <CardTitle>關卡進度</CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">還沒有設定關卡</div>
              {canEdit && (
                <Button onClick={createDefaultGates}>
                  創建預設關卡
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((gate, index) => {
                const StatusIcon = GATE_STATUS_ICONS[gate.status]
                const isUpdating = updatingGate === gate.id

                return (
                  <div
                    key={gate.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <StatusIcon className="w-6 h-6" />
                        {index < timeline.length - 1 && (
                          <div className="absolute left-3 top-6 w-px h-8 bg-border" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{gate.gate}</div>
                        <Badge className={GATE_STATUS_COLORS[gate.status]}>
                          {gate.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-muted-foreground">開始時間</div>
                        <div>
                          {gate.start_time 
                            ? new Date(gate.start_time).toLocaleString()
                            : '-'
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">完成時間</div>
                        <div>
                          {gate.completed_at 
                            ? new Date(gate.completed_at).toLocaleString()
                            : '-'
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">備註</div>
                        <div>{gate.notes || '-'}</div>
                      </div>
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-2">
                        <Select
                          value={gate.status}
                          onValueChange={(status) => 
                            handleGateStatusChange(gate.id, status as any)
                          }
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">待開始</SelectItem>
                            <SelectItem value="IN_PROGRESS">進行中</SelectItem>
                            <SelectItem value="COMPLETED">已完成</SelectItem>
                            <SelectItem value="FAILED">失敗</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )
              })}

              {canEdit && (
                <div className="flex gap-2">
                  <Input
                    placeholder="添加備註..."
                    value={newGateNote}
                    onChange={(e) => setNewGateNote(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 警告和建議 */}
      {timeline.some(t => t.status === 'FAILED') && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">注意：有關卡失敗</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              建議檢視失敗原因並調整策略，或考慮重新挑戰
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}