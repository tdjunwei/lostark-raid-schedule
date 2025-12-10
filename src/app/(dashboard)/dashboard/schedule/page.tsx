'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VisualScheduleInput } from '@/components/schedule/visual-schedule-input'
import { ScheduleSettingsDialog } from '@/components/schedule/schedule-settings-dialog'
import { supabase } from '@/lib/supabase'
import {
  Calendar,
  Clock,
  Settings,
  Plus,
  X
} from 'lucide-react'

export default function SchedulePage() {
  const [showSettings, setShowSettings] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    availableSlots: 0,
    scheduledRaids: 0,
    conflicts: 0,
    availabilityRate: 0
  })
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (userId) {
      loadStats()
    }
  }, [userId, refreshKey])

  const loadStats = async () => {
    if (!userId) return

    try {
      // 獲取本週空閒時段數量
      const { data: schedules } = await supabase
        .from('schedules')
        .select('id')
        .eq('user_id', userId)
        .eq('available', true)

      const availableSlots = schedules?.length || 0

      // 獲取用戶的角色
      const { data: characters } = await supabase
        .from('characters')
        .select('id')
        .eq('user_id', userId)

      const characterIds = characters?.map(c => c.id) || []

      // 獲取已安排的副本數量
      let scheduledRaids = 0
      if (characterIds.length > 0) {
        const { data: participants } = await supabase
          .from('raid_participants')
          .select('raid_id')
          .in('character_id', characterIds)

        // 使用 Set 去重
        const uniqueRaidIds = new Set(participants?.map(p => p.raid_id) || [])
        scheduledRaids = uniqueRaidIds.size
      }

      // 計算可用率 (假設一週35個時段：5天 x 7個時段)
      const totalPossibleSlots = 35
      const availabilityRate = Math.round((availableSlots / totalPossibleSlots) * 100)

      setStats({
        availableSlots,
        scheduledRaids,
        conflicts: 0, // TODO: 實現衝突檢測
        availabilityRate
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSaveSchedule = () => {
    // 刷新統計數據
    setRefreshKey(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-muted-foreground">載入中...</p>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-muted-foreground">請先登入</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">排程管理</h1>
          <p className="text-muted-foreground">
            輸入你的空閒時間，讓系統為你安排最適合的副本
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowSettings(true)}>
          <Settings className="w-4 h-4 mr-2" />
          批量設定
        </Button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本週空閒時段</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableSlots}</div>
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
            <div className="text-2xl font-bold">{stats.scheduledRaids}</div>
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
            <div className="text-2xl font-bold">{stats.conflicts}</div>
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
            <div className="text-2xl font-bold">{stats.availabilityRate}%</div>
            <p className="text-xs text-muted-foreground">
              本週可用時間
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 視覺化排程輸入 */}
      <VisualScheduleInput
        key={refreshKey}
        userId={userId}
        onSave={handleSaveSchedule}
      />

      {/* 排程設定對話框（批量操作） */}
      {showSettings && (
        <ScheduleSettingsDialog
          userId={userId}
          onClose={() => setShowSettings(false)}
          onSuccess={() => {
            setShowSettings(false)
            setRefreshKey(prev => prev + 1)
          }}
        />
      )}

      {/* 使用說明 */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">💡</span>
            使用技巧
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="font-semibold text-foreground">📝 輸入格式</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• 單個時段：<code className="text-xs bg-muted px-1 py-0.5 rounded">15:00 - 17:00</code></li>
              <li>• 多個時段：<code className="text-xs bg-muted px-1 py-0.5 rounded">15:00 - 17:00, 20:00 - 23:00</code></li>
              <li>• 跨天時段：<code className="text-xs bg-muted px-1 py-0.5 rounded">20:00 - 03:00</code> (自動識別)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-foreground">⚡ 快速操作</p>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-center gap-1">
                • 點擊 <Plus className="w-3 h-3" /> 顯示快速模板
              </li>
              <li>• 使用預設時段快速填入</li>
              <li className="flex items-center gap-1">
                • 點擊 <X className="w-3 h-3" /> 清除整天
              </li>
              <li>• 點擊「批量設定」一次設置全週</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
