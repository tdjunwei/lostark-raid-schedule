'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RaidSearch } from '@/components/search/raid-search'
import { RaidTimeline } from '@/components/raids/raid-timeline'
import { supabase } from '@/lib/supabase'
import { 
  Search,
  Plus,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react'

interface RaidStats {
  weeklyRaids: number
  totalParticipants: number
  completionRate: number
  averageRevenue: number
}

export default function RaidsPage() {
  const [selectedRaid, setSelectedRaid] = useState<any>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [stats, setStats] = useState<RaidStats>({
    weeklyRaids: 0,
    totalParticipants: 0,
    completionRate: 0,
    averageRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Calculate this week's date range
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)

      // Count weekly raids
      const { count: weeklyRaids } = await supabase
        .from('raids')
        .select('*', { count: 'exact', head: true })
        .gte('scheduled_time', startOfWeek.toISOString())
        .lt('scheduled_time', endOfWeek.toISOString())

      // Count total participants this week
      const { data: participantsData } = await supabase
        .from('raid_participants')
        .select('id, raids!inner(*)')
        .gte('raids.scheduled_time', startOfWeek.toISOString())
        .lt('raids.scheduled_time', endOfWeek.toISOString())

      // Calculate completion rate
      const { data: completedRaids } = await supabase
        .from('raids')
        .select('id')
        .gte('scheduled_time', startOfWeek.toISOString())
        .lt('scheduled_time', endOfWeek.toISOString())
        .eq('status', 'COMPLETED')

      const completionRate = weeklyRaids && weeklyRaids > 0 
        ? Math.round((completedRaids?.length || 0) / weeklyRaids * 100)
        : 0

      // Calculate average revenue from economics
      const { data: economicsData } = await supabase
        .from('raid_economics')
        .select('total_revenue, raids!inner(*)')
        .gte('raids.scheduled_time', startOfWeek.toISOString())
        .lt('raids.scheduled_time', endOfWeek.toISOString())

      const averageRevenue = economicsData && economicsData.length > 0
        ? Math.round(economicsData.reduce((sum, item) => sum + (item.total_revenue || 0), 0) / economicsData.length)
        : 0

      setStats({
        weeklyRaids: weeklyRaids || 0,
        totalParticipants: participantsData?.length || 0,
        completionRate,
        averageRevenue
      })
    } catch (error) {
      console.error('Error loading raid stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">副本管理</h1>
          <p className="text-muted-foreground">
            搜尋、管理和追蹤副本進度
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            建立副本
          </Button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本週副本</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.weeklyRaids}
            </div>
            <p className="text-xs text-muted-foreground">
              已安排副本
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">參與人數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.totalParticipants}
            </div>
            <p className="text-xs text-muted-foreground">
              總參與者
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完成率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : `${stats.completionRate}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              本週完成率
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均收益</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : `${stats.averageRevenue.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">
              金幣/副本
            </p>
          </CardContent>
        </Card>
      </div>

      {selectedRaid ? (
        // 顯示選中的副本詳情
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">副本詳情 - {selectedRaid.name}</h2>
            <Button variant="outline" onClick={() => setSelectedRaid(null)}>
              返回搜尋
            </Button>
          </div>
          
          <RaidTimeline 
            raidId={selectedRaid.id}
            canEdit={true}
          />
        </div>
      ) : (
        // 顯示副本搜尋
        <RaidSearch
          onRaidSelect={setSelectedRaid}
          onFilterChange={(filters) => {
            // Handle filter changes
          }}
        />
      )}

      {/* 建立副本對話框 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold">建立新副本</h2>
              <p className="text-muted-foreground">設定副本的基本資訊</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">副本名稱</label>
                <input 
                  className="w-full mt-1 p-2 border rounded-md" 
                  placeholder="例如：天界 G1-3"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">副本類型</label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option>天界</option>
                  <option>夢幻</option>
                  <option>象牙塔</option>
                  <option>瘟疫</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">預定時間</label>
                <input 
                  type="datetime-local" 
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">最大人數</label>
                <input 
                  type="number" 
                  defaultValue="8" 
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button>
                建立副本
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}