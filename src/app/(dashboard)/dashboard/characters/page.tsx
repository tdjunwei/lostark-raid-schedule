'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CharacterFilter } from '@/components/search/character-filter'
import { CreateCharacterDialog } from '@/components/characters/create-character-dialog'
import { EditCharacterDialog } from '@/components/characters/edit-character-dialog'
import type { Database } from '@/types/supabase'
import {
  Users,
  Plus,
  Star
} from 'lucide-react'

type Job = Database['public']['Tables']['jobs']['Row'] & {
  category: Database['public']['Tables']['job_categories']['Row']
}

type Character = Database['public']['Tables']['characters']['Row'] & {
  job: Job
}

export default function CharactersPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [stats, setStats] = useState({
    totalCount: 0,
    mainCount: 0,
    avgItemLevel: 0,
    dpsCount: 0,
    supportCount: 0
  })

  const handleCharacterCreated = () => {
    // 刷新角色列表
    setRefreshKey(prev => prev + 1)
  }

  const handleCharacterUpdated = () => {
    // 刷新角色列表
    setRefreshKey(prev => prev + 1)
    setSelectedCharacter(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">角色管理</h1>
          <p className="text-muted-foreground">
            管理你的 Lost Ark 角色，設定職業和裝等
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增角色
        </Button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總角色數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCount}</div>
            <p className="text-xs text-muted-foreground">
              已註冊角色
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">主角色</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mainCount}</div>
            <p className="text-xs text-muted-foreground">
              主要角色
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均裝等</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgItemLevel}</div>
            <p className="text-xs text-muted-foreground">
              全角色平均
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DPS/輔助比</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dpsCount}:{stats.supportCount}</div>
            <p className="text-xs text-muted-foreground">
              職業分布
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 角色搜尋和過濾 */}
      <CharacterFilter
        key={refreshKey}
        onCharacterSelect={(character) => {
          setSelectedCharacter(character as Character)
        }}
        onStatsChange={setStats}
        showUser={false}
      />

      {/* 新增角色對話框 */}
      {showCreateForm && (
        <CreateCharacterDialog
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCharacterCreated}
        />
      )}

      {/* 編輯角色對話框 */}
      {selectedCharacter && (
        <EditCharacterDialog
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          onSuccess={handleCharacterUpdated}
        />
      )}

      {/* 使用說明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">角色管理說明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• 主角色會在副本分配時優先考慮</p>
          <p>• 裝等會影響可參與的副本類型</p>
          <p>• 職業角色（DPS/輔助）決定在副本中的定位</p>
          <p>• 可以為每個角色設定個別的備註和偏好</p>
        </CardContent>
      </Card>
    </div>
  )
}