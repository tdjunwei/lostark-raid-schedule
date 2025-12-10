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
  User,
  Star,
  Sword,
  Shield,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getItemLevelColorClass } from '@/lib/utils'
import type { Database } from '@/types/supabase'
import type { CharacterFilters } from '@/types'

type Character = Database['public']['Tables']['characters']['Row'] & {
  job: Database['public']['Tables']['jobs']['Row'] & {
    category: Database['public']['Tables']['job_categories']['Row']
  }
  user: Database['public']['Tables']['user_profiles']['Row']
}

interface CharacterFilterProps {
  onCharacterSelect?: (character: Character) => void
  onFilterChange?: (filters: CharacterFilters) => void
  onStatsChange?: (stats: {
    totalCount: number
    mainCount: number
    avgItemLevel: number
    dpsCount: number
    supportCount: number
  }) => void
  compact?: boolean
  showUser?: boolean
}

export function CharacterFilter({
  onCharacterSelect,
  onFilterChange,
  onStatsChange,
  compact = false,
  showUser = true
}: CharacterFilterProps) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<CharacterFilters>({
    search: '',
    job: [],
    minItemLevel: undefined,
    maxItemLevel: undefined,
    isMain: undefined,
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    onFilterChange?.(filters)
  }, [filters, onFilterChange])

  const loadData = async () => {
    try {
      setLoading(true)

      // 取得當前使用者
      const { data: { user } } = await supabase.auth.getUser()

      // 載入角色資料 - 根據 showUser 決定是否過濾使用者
      let query = supabase
        .from('characters')
        .select(`
          *,
          job:jobs (
            *,
            category:job_categories (*)
          ),
          user:user_profiles (*)
        `)

      // 如果 showUser 為 false，只顯示當前使用者的角色
      if (!showUser && user) {
        query = query.eq('user_id', user.id)
      }

      const { data: charactersData, error: charactersError } = await query
        .order('item_level', { ascending: false })

      if (charactersError) throw charactersError
      setCharacters(charactersData || [])

      // 載入職業資料
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          category:job_categories (*)
        `)
        .order('name')

      if (jobsError) throw jobsError
      setJobs(jobsData || [])

    } catch (error) {
      console.error('Error loading character data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 過濾邏輯
  const filteredCharacters = useMemo(() => {
    return characters.filter(character => {
      // 文字搜尋
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesNickname = character.nickname.toLowerCase().includes(searchTerm)
        const matchesJob = character.job.name.toLowerCase().includes(searchTerm)
        const matchesUser = showUser && character.user?.name?.toLowerCase().includes(searchTerm)
        
        if (!matchesNickname && !matchesJob && !matchesUser) {
          return false
        }
      }

      // 職業過濾
      if (filters.job && filters.job.length > 0) {
        if (!filters.job.includes(character.job.id)) {
          return false
        }
      }

      // 最低裝等過濾
      if (filters.minItemLevel) {
        if (character.item_level < filters.minItemLevel) {
          return false
        }
      }

      // 最高裝等過濾
      if (filters.maxItemLevel) {
        if (character.item_level > filters.maxItemLevel) {
          return false
        }
      }

      // 主角過濾
      if (filters.isMain !== undefined) {
        if (character.is_main !== filters.isMain) {
          return false
        }
      }

      return true
    })
  }, [characters, filters, showUser])

  const updateFilter = (key: keyof CharacterFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleJobFilter = (jobId: string) => {
    setFilters(prev => {
      const currentJobs = prev.job || []
      const newJobs = currentJobs.includes(jobId)
        ? currentJobs.filter(id => id !== jobId)
        : [...currentJobs, jobId]
      
      return { ...prev, job: newJobs }
    })
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      job: [],
      minItemLevel: undefined,
      maxItemLevel: undefined,
      isMain: undefined,
    })
  }

  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.job && filters.job.length > 0) ||
    filters.minItemLevel ||
    filters.maxItemLevel ||
    filters.isMain !== undefined
  )

  // 統計資料
  const stats = useMemo(() => {
    const totalCount = filteredCharacters.length
    const mainCount = filteredCharacters.filter(c => c.is_main).length
    const avgItemLevel = totalCount > 0
      ? Math.round(filteredCharacters.reduce((sum, c) => sum + c.item_level, 0) / totalCount)
      : 0
    const dpsCount = filteredCharacters.filter(c => c.job.role === 'DPS').length
    const supportCount = filteredCharacters.filter(c => c.job.role === 'SUPPORT').length

    return {
      totalCount,
      mainCount,
      avgItemLevel,
      dpsCount,
      supportCount,
    }
  }, [filteredCharacters])

  useEffect(() => {
    onStatsChange?.(stats)
  }, [stats, onStatsChange])

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜尋角色暱稱、職業..."
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
                  <label className="text-xs text-muted-foreground">角色類型</label>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => updateFilter('isMain', filters.isMain === true ? undefined : true)}
                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                        filters.isMain === true
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      主角
                    </button>
                    <button
                      onClick={() => updateFilter('isMain', filters.isMain === false ? undefined : false)}
                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                        filters.isMain === false
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      分身
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">裝等範圍</label>
                  <div className="flex gap-1 mt-1">
                    <Input
                      type="number"
                      placeholder="最低"
                      value={filters.minItemLevel || ''}
                      onChange={(e) => updateFilter('minItemLevel', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="text-xs h-7"
                    />
                    <Input
                      type="number"
                      placeholder="最高"
                      value={filters.maxItemLevel || ''}
                      onChange={(e) => updateFilter('maxItemLevel', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="text-xs h-7"
                    />
                  </div>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    找到 {filteredCharacters.length} 個角色
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
            <User className="w-5 h-5" />
            角色搜尋
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜尋框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜尋角色暱稱、職業名稱、玩家名稱..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 快速過濾器 */}
          <div className="space-y-4">
            {/* 角色類型 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">角色類型</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateFilter('isMain', filters.isMain === true ? undefined : true)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    filters.isMain === true
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  主角
                </button>
                <button
                  onClick={() => updateFilter('isMain', filters.isMain === false ? undefined : false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                    filters.isMain === false
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <User className="w-4 h-4" />
                  分身
                </button>
              </div>
            </div>

            {/* 裝等範圍 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">裝等範圍</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    placeholder="最低裝等 (1490)"
                    value={filters.minItemLevel || ''}
                    onChange={(e) => updateFilter('minItemLevel', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="最高裝等 (1630)"
                    value={filters.maxItemLevel || ''}
                    onChange={(e) => updateFilter('maxItemLevel', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 職業選擇 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">職業篩選</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {jobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => toggleJobFilter(job.id)}
                  className={`flex items-center gap-2 p-2 text-sm rounded border transition-colors text-left ${
                    filters.job?.includes(job.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: job.category.color }}
                  />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{job.name}</div>
                    <div className="text-xs opacity-75 flex items-center gap-1">
                      {job.role === 'DPS' ? (
                        <Sword className="w-3 h-3" />
                      ) : (
                        <Shield className="w-3 h-3" />
                      )}
                      {job.role}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 過濾器狀態 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>找到 {filteredCharacters.length} 個角色</span>
              <span>DPS: {stats.dpsCount}</span>
              <span>輔助: {stats.supportCount}</span>
              <span>平均裝等: {stats.avgItemLevel}</span>
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
          <CardTitle>搜尋結果 ({filteredCharacters.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">載入中...</div>
          ) : filteredCharacters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {hasActiveFilters ? '沒有符合條件的角色' : '還沒有角色記錄'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCharacters.map(character => (
                <div
                  key={character.id}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onCharacterSelect?.(character)}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: character.job.category.color }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{character.nickname}</span>
                      {character.is_main && (
                        <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {character.job.name} • 裝等 {character.item_level}
                    </div>
                    
                    {showUser && character.user && (
                      <div className="text-xs text-muted-foreground">
                        {character.user.name}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <Badge variant={character.job.role === 'SUPPORT' ? 'secondary' : 'outline'}>
                      {character.job.role}
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