'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  PieChart,
  BarChart3,
  Coins,
  Wallet
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatGold, calculateProfitRatio } from '@/lib/utils'
import type { Database } from '@/types/supabase'

type RaidEconomics = Database['public']['Tables']['raid_economics']['Row'] & {
  character: Database['public']['Tables']['characters']['Row'] & {
    job: Database['public']['Tables']['jobs']['Row']
  }
}

type Raid = Database['public']['Tables']['raids']['Row']

interface EconomicsTrackerProps {
  raidId: string
  canEdit?: boolean
  onUpdate?: (economics: RaidEconomics[]) => void
}

interface EconomicsForm {
  characterId: string
  totalCost: number
  activeGold: number
  boundGold: number
  notes: string
}

export function EconomicsTracker({ raidId, canEdit = false, onUpdate }: EconomicsTrackerProps) {
  const [raid, setRaid] = useState<Raid | null>(null)
  const [economics, setEconomics] = useState<RaidEconomics[]>([])
  const [characters, setCharacters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EconomicsForm>({
    characterId: '',
    totalCost: 0,
    activeGold: 0,
    boundGold: 0,
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [raidId])

  const loadData = async () => {
    try {
      setLoading(true)

      // 載入副本資訊
      const { data: raidData, error: raidError } = await supabase
        .from('raids')
        .select('*')
        .eq('id', raidId)
        .single()

      if (raidError) throw raidError
      setRaid(raidData)

      // 載入經濟數據
      const { data: economicsData, error: economicsError } = await supabase
        .from('raid_economics')
        .select(`
          *,
          character:characters (
            *,
            job:jobs (*)
          )
        `)
        .eq('raid_id', raidId)

      if (economicsError) throw economicsError
      setEconomics(economicsData || [])

      // 載入參與者角色
      const { data: participantData, error: participantError } = await supabase
        .from('raid_participants')
        .select(`
          character:characters (
            *,
            job:jobs (*)
          )
        `)
        .eq('raid_id', raidId)

      if (participantError) throw participantError
      setCharacters(participantData?.map(p => p.character) || [])

    } catch (error) {
      console.error('Error loading economics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.characterId) {
      alert('請選擇角色')
      return
    }

    try {
      const totalRevenue = form.activeGold + form.boundGold
      const profitRatio = calculateProfitRatio(totalRevenue, form.totalCost)

      const economicsData = {
        raid_id: raidId,
        character_id: form.characterId,
        total_cost: form.totalCost,
        active_gold: form.activeGold,
        bound_gold: form.boundGold,
        total_revenue: totalRevenue,
        profit_ratio: profitRatio,
        notes: form.notes || null,
      }

      let result
      if (editingId) {
        // 更新現有記錄
        result = await supabase
          .from('raid_economics')
          .update(economicsData)
          .eq('id', editingId)
          .select(`
            *,
            character:characters (
              *,
              job:jobs (*)
            )
          `)
          .single()
      } else {
        // 創建新記錄
        result = await supabase
          .from('raid_economics')
          .insert(economicsData)
          .select(`
            *,
            character:characters (
              *,
              job:jobs (*)
            )
          `)
          .single()
      }

      if (result.error) throw result.error

      // 更新本地狀態
      if (editingId) {
        setEconomics(prev => prev.map(item => 
          item.id === editingId ? result.data : item
        ))
      } else {
        setEconomics(prev => [...prev, result.data])
      }

      // 重置表單
      setForm({
        characterId: '',
        totalCost: 0,
        activeGold: 0,
        boundGold: 0,
        notes: '',
      })
      setShowForm(false)
      setEditingId(null)

      onUpdate?.(economics)
    } catch (error) {
      console.error('Error saving economics:', error)
      alert('保存失敗，請稍後再試')
    }
  }

  const handleEdit = (economicsItem: RaidEconomics) => {
    setForm({
      characterId: economicsItem.character_id,
      totalCost: economicsItem.total_cost,
      activeGold: economicsItem.active_gold,
      boundGold: economicsItem.bound_gold,
      notes: economicsItem.notes || '',
    })
    setEditingId(economicsItem.id)
    setShowForm(true)
  }

  const handleDelete = async (economicsId: string) => {
    if (!confirm('確定要刪除這筆經濟記錄嗎？')) return

    try {
      const { error } = await supabase
        .from('raid_economics')
        .delete()
        .eq('id', economicsId)

      if (error) throw error

      setEconomics(prev => prev.filter(item => item.id !== economicsId))
    } catch (error) {
      console.error('Error deleting economics:', error)
      alert('刪除失敗，請稍後再試')
    }
  }

  const calculateTotals = () => {
    const totalCost = economics.reduce((sum, item) => sum + item.total_cost, 0)
    const totalActiveGold = economics.reduce((sum, item) => sum + item.active_gold, 0)
    const totalBoundGold = economics.reduce((sum, item) => sum + item.bound_gold, 0)
    const totalRevenue = totalActiveGold + totalBoundGold
    const netProfit = totalRevenue - totalCost
    const avgProfitRatio = economics.length > 0 
      ? economics.reduce((sum, item) => sum + item.profit_ratio, 0) / economics.length
      : 0

    return {
      totalCost,
      totalActiveGold,
      totalBoundGold,
      totalRevenue,
      netProfit,
      avgProfitRatio,
    }
  }

  const totals = calculateTotals()

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
    <div className="space-y-6">
      {/* 經濟總覽 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            經濟總覽
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">總成本</div>
              <div className="flex items-center gap-1">
                <Wallet className="w-4 h-4 text-red-500" />
                <span className="text-lg font-bold text-red-600">
                  {formatGold(totals.totalCost)}G
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">活金收益</div>
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-lg font-bold text-yellow-600">
                  {formatGold(totals.totalActiveGold)}G
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">綁金收益</div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-blue-500" />
                <span className="text-lg font-bold text-blue-600">
                  {formatGold(totals.totalBoundGold)}G
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">總收益</div>
              <div className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4 text-green-500" />
                <span className="text-lg font-bold text-green-600">
                  {formatGold(totals.totalRevenue)}G
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">淨利潤</div>
              <div className="flex items-center gap-1">
                {totals.netProfit >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-lg font-bold ${
                  totals.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totals.netProfit >= 0 ? '+' : ''}{formatGold(totals.netProfit)}G
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">平均收益率</div>
              <div className="flex items-center gap-1">
                <Calculator className="w-4 h-4" />
                <span className={`text-lg font-bold ${
                  totals.avgProfitRatio >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totals.avgProfitRatio.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 個人經濟記錄 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>個人經濟記錄</CardTitle>
            {canEdit && (
              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? '取消' : '新增記錄'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* 新增/編輯表單 */}
          {showForm && (
            <div className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">選擇角色</label>
                  <Select value={form.characterId} onValueChange={(value) => 
                    setForm(prev => ({ ...prev, characterId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇參與角色" />
                    </SelectTrigger>
                    <SelectContent>
                      {characters.map(character => (
                        <SelectItem key={character.id} value={character.id}>
                          {character.nickname} ({character.job.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">總成本</label>
                  <Input
                    type="number"
                    value={form.totalCost}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      totalCost: parseInt(e.target.value) || 0 
                    }))}
                    placeholder="消耗的金幣總額"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">活金收益</label>
                  <Input
                    type="number"
                    value={form.activeGold}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      activeGold: parseInt(e.target.value) || 0 
                    }))}
                    placeholder="獲得的活金"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">綁金收益</label>
                  <Input
                    type="number"
                    value={form.boundGold}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      boundGold: parseInt(e.target.value) || 0 
                    }))}
                    placeholder="獲得的綁金"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">備註</label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="額外說明或特殊情況"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit}>
                  {editingId ? '更新' : '保存'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setForm({
                    characterId: '',
                    totalCost: 0,
                    activeGold: 0,
                    boundGold: 0,
                    notes: '',
                  })
                }}>
                  取消
                </Button>
              </div>
            </div>
          )}

          {/* 經濟記錄列表 */}
          {economics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              還沒有經濟記錄
            </div>
          ) : (
            <div className="space-y-3">
              {economics.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">
                        {item.character.nickname}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.character.job.name} • 裝等 {item.character.item_level}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-muted-foreground">成本</div>
                      <div className="font-medium text-red-600">
                        -{formatGold(item.total_cost)}G
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">收益</div>
                      <div className="font-medium text-green-600">
                        +{formatGold(item.total_revenue)}G
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">利潤</div>
                      <div className={`font-medium ${
                        item.profit_ratio >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.profit_ratio >= 0 ? '+' : ''}{item.profit_ratio.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">淨額</div>
                      <div className={`font-medium ${
                        item.total_revenue - item.total_cost >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.total_revenue - item.total_cost >= 0 ? '+' : ''}
                        {formatGold(item.total_revenue - item.total_cost)}G
                      </div>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                        編輯
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                        刪除
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}