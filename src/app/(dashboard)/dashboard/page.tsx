'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    totalRaids: number
    completedRaids: number
    scheduledRaids: number
    totalCharacters: number
    upcomingRaids: Array<{ id: string; status: string; scheduled_time: string; name: string }>
  }>({
    totalRaids: 0,
    completedRaids: 0,
    scheduledRaids: 0,
    totalCharacters: 0,
    upcomingRaids: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // 載入副本統計
      const { data: raidsData, error: raidsError } = await supabase
        .from('raids')
        .select('id, status, scheduled_time, name')
        .order('scheduled_time', { ascending: true })

      if (raidsError) throw raidsError

      // 載入角色統計
      const { data: charactersData, error: charactersError } = await supabase
        .from('characters')
        .select('id')

      if (charactersError) throw charactersError

      const totalRaids = raidsData?.length || 0
      const completedRaids = raidsData?.filter(raid => raid.status === 'COMPLETED').length || 0
      const scheduledRaids = raidsData?.filter(raid => 
        raid.status === 'PLANNED' || raid.status === 'RECRUITING'
      ).length || 0

      // 即將到來的副本（未來 7 天）
      const oneWeekFromNow = new Date()
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7)
      
      const upcomingRaids = raidsData?.filter(raid => {
        const raidDate = new Date(raid.scheduled_time)
        return raidDate >= new Date() && raidDate <= oneWeekFromNow
      }).slice(0, 5) || []

      setStats({
        totalRaids,
        completedRaids,
        scheduledRaids,
        totalCharacters: charactersData?.length || 0,
        upcomingRaids,
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">控制台</h1>
        <div className="flex justify-center py-8">載入中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">控制台</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/raids/create">
              <Plus className="w-4 h-4 mr-2" />
              建立副本
            </Link>
          </Button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總副本數</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRaids}</div>
            <p className="text-xs text-muted-foreground">
              已完成 {stats.completedRaids} 個
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">計劃中副本</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledRaids}</div>
            <p className="text-xs text-muted-foreground">
              等待執行
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">角色數量</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCharacters}</div>
            <p className="text-xs text-muted-foreground">
              已註冊角色
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完成率</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRaids > 0 ? Math.round((stats.completedRaids / stats.totalRaids) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              副本完成率
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 即將到來的副本 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>即將到來的副本</CardTitle>
            <CardDescription>未來 7 天內的副本安排</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.upcomingRaids.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                沒有即將到來的副本
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcomingRaids.map((raid: any) => (
                  <div key={raid.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{raid.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(raid.scheduled_time).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {raid.status === 'PLANNED' && '計劃中'}
                        {raid.status === 'RECRUITING' && '招募中'}
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/dashboard/raids">查看所有副本</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 快速操作 */}
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用功能快速入口</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link href="/dashboard/schedule">
                <Calendar className="w-4 h-4 mr-2" />
                管理我的排程
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/dashboard/characters">
                <Users className="w-4 h-4 mr-2" />
                管理我的角色
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/dashboard/raids">
                <TrendingUp className="w-4 h-4 mr-2" />
                副本搜尋
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full justify-start">
              <Link href="/dashboard/economics">
                <TrendingUp className="w-4 h-4 mr-2" />
                收益分析
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 系統狀態 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            系統狀態
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">資料庫連線正常</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">即時同步啟用</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">功能開發中</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}