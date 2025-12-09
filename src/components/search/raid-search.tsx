'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  Search,
  Filter,
  X,
  Calendar,
  Users,
  DollarSign,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatGold } from '@/lib/utils'
import type { Database } from '@/types/supabase'
import type { RaidFilters } from '@/types'

type Raid = Database['public']['Tables']['raids']['Row'] & {
  participants?: Array<{
    character: {
      nickname: string
      item_level: number
      job: {
        name: string
        role: string
      }
    }
  }>
  timeline?: Array<{
    status: string
  }>
}

interface RaidSearchProps {
  onRaidSelect?: (raid: Raid) => void
  onFilterChange?: (filters: RaidFilters) => void
  compact?: boolean
}

const RAID_TYPES = [
  { value: 'CELESTIAL', label: '天界' },
  { value: 'DREAM', label: '夢幻' },
  { value: 'IVORY_TOWER', label: '象牙塔' },
  { value: 'PLAGUE', label: '瘟疫' },
]

const RAID_MODES = [
  { value: 'NORMAL', label: '普通' },
  { value: 'HARD', label: '困難' },
  { value: 'SOLO', label: '單人' },
]

const RAID_STATUSES = [
  { value: 'PLANNED', label: '計劃中' },
  { value: 'RECRUITING', label: '招募中' },
  { value: 'FULL', label: '人員滿額' },
  { value: 'IN_PROGRESS', label: '進行中' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' },
]

export function RaidSearch({ onRaidSelect, onFilterChange, compact = false }: RaidSearchProps) {
  const [raids, setRaids] = useState<Raid[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<RaidFilters>({
    search: '',
    type: [],
    mode: [],
    status: [],
    dateFrom: undefined,
    dateTo: undefined,
    minItemLevel: undefined,
  })

  useEffect(() => {
    loadRaids()
  }, [])

  useEffect(() => {
    onFilterChange?.(filters)
  }, [filters, onFilterChange])

  const loadRaids = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('raids')
        .select(`
          *,
          participants:raid_participants (
            character:characters (
              nickname,
              item_level,
              job:jobs (
                name,
                role
              )
            )
          ),
          timeline:raid_timeline (
            status
          )
        `)
        .order('scheduled_time', { ascending: false })

      if (error) throw error
      setRaids(data || [])
    } catch (error) {
      console.error('Error loading raids:', error)
    } finally {
      setLoading(false)
    }
  }

  // 過濾邏輯
  const filteredRaids = useMemo(() => {
    return raids.filter(raid => {
      // 文字搜尋
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesName = raid.name.toLowerCase().includes(searchTerm)
        const matchesNotes = raid.notes?.toLowerCase().includes(searchTerm)
        const matchesParticipant = raid.participants?.some(p =>
          p.character.nickname.toLowerCase().includes(searchTerm)
        )
        
        if (!matchesName && !matchesNotes && !matchesParticipant) {
          return false
        }
      }

      // 副本類型過濾
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(raid.type)) {
          return false
        }
      }

      // 副本模式過濾
      if (filters.mode && filters.mode.length > 0) {
        if (!filters.mode.includes(raid.mode)) {
          return false
        }
      }

      // 狀態過濾
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(raid.status)) {
          return false
        }
      }

      // 日期過濾
      if (filters.dateFrom) {
        if (new Date(raid.scheduled_time) < filters.dateFrom) {
          return false
        }
      }

      if (filters.dateTo) {
        if (new Date(raid.scheduled_time) > filters.dateTo) {
          return false
        }
      }

      // 最低裝等過濾
      if (filters.minItemLevel) {
        if (raid.min_item_level < filters.minItemLevel) {
          return false
        }
      }

      return true
    })
  }, [raids, filters])

  const updateFilter = (key: keyof RaidFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleArrayFilter = (key: 'type' | 'mode' | 'status', value: string) => {
    setFilters(prev => {
      const currentArray = (prev[key] || []) as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]

      return { ...prev, [key]: newArray as any }
    })
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      type: [],
      mode: [],
      status: [],
      dateFrom: undefined,
      dateTo: undefined,
      minItemLevel: undefined,
    })
  }

  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.type && filters.type.length > 0) ||
    (filters.mode && filters.mode.length > 0) ||
    (filters.status && filters.status.length > 0) ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.minItemLevel
  )

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜尋副本名稱、參與者..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="w-4 h-4 mr-2" />
              過濾器
              {showAdvanced ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </Button>
          </div>

          {showAdvanced && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">副本類型</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {RAID_TYPES.map(type => (
                      <button
                        key={type.value}
                        onClick={() => toggleArrayFilter('type', type.value)}
                        className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                          filters.type?.includes(type.value as any)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">狀態</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {RAID_STATUSES.map(status => (
                      <button
                        key={status.value}
                        onClick={() => toggleArrayFilter('status', status.value)}
                        className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                          filters.status?.includes(status.value as any)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    找到 {filteredRaids.length} 個結果
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    清除過濾器
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 搜尋和過濾器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            副本搜尋
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜尋框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜尋副本名稱、參與者暱稱、備註..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 快速過濾器 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">副本類型</label>
              <div className="flex flex-wrap gap-2">
                {RAID_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => toggleArrayFilter('type', type.value)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      filters.type?.includes(type.value as any)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">模式</label>
              <div className="flex flex-wrap gap-2">
                {RAID_MODES.map(mode => (
                  <button
                    key={mode.value}
                    onClick={() => toggleArrayFilter('mode', mode.value)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      filters.mode?.includes(mode.value as any)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">狀態</label>
              <div className="flex flex-wrap gap-2">
                {RAID_STATUSES.map(status => (
                  <button
                    key={status.value}
                    onClick={() => toggleArrayFilter('status', status.value)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      filters.status?.includes(status.value as any)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 進階過濾器 */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-medium"
            >
              進階過濾器
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">開始日期</label>
                  <Input
                    type="date"
                    value={filters.dateFrom?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFilter('dateFrom', e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">結束日期</label>
                  <Input
                    type="date"
                    value={filters.dateTo?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFilter('dateTo', e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">最低裝等</label>
                  <Input
                    type="number"
                    placeholder="1490"
                    value={filters.minItemLevel || ''}
                    onChange={(e) => updateFilter('minItemLevel', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 過濾器狀態 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>找到 {filteredRaids.length} 個結果</span>
              {hasActiveFilters && (
                <>
                  <span>•</span>
                  <span>使用中的過濾器</span>
                </>
              )}
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                清除過濾器
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 搜尋結果 */}
      <Card>
        <CardHeader>
          <CardTitle>搜尋結果 ({filteredRaids.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">載入中...</div>
          ) : filteredRaids.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {hasActiveFilters ? '沒有符合條件的副本' : '還沒有副本記錄'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRaids.map(raid => (
                <div
                  key={raid.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onRaidSelect?.(raid)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">{raid.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {RAID_TYPES.find(t => t.value === raid.type)?.label} • 
                        {RAID_MODES.find(m => m.value === raid.mode)?.label}
                        {raid.gate && ` • ${raid.gate}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-center">
                      <div className="text-muted-foreground">時間</div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(raid.scheduled_time).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-sm text-center">
                      <div className="text-muted-foreground">人數</div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {raid.participants?.length || 0}/{raid.max_players}
                      </div>
                    </div>

                    <div className="text-sm text-center">
                      <div className="text-muted-foreground">收益</div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatGold((raid.active_gold_reward || 0) + (raid.bound_gold_reward || 0))}G
                      </div>
                    </div>

                    <Badge variant={
                      raid.status === 'COMPLETED' ? 'default' :
                      raid.status === 'IN_PROGRESS' ? 'secondary' :
                      'outline'
                    }>
                      {RAID_STATUSES.find(s => s.value === raid.status)?.label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}