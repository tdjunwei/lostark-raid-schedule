'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CharacterFilter } from '@/components/search/character-filter'
import { JobSelector } from '@/components/jobs/job-selector'
import { 
  Users,
  Plus,
  Settings,
  Star
} from 'lucide-react'

export default function CharactersPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">角色管理</h1>
          <p className="text-muted-foreground">
            管理你的 Lost Ark 角色，設定職業和裝等
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            新增角色
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            角色設定
          </Button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總角色數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
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
            <div className="text-2xl font-bold">3</div>
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
            <div className="text-2xl font-bold">1580</div>
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
            <div className="text-2xl font-bold">6:2</div>
            <p className="text-xs text-muted-foreground">
              職業分布
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 角色搜尋和過濾 */}
      <CharacterFilter
        onCharacterSelect={(character) => {
          // Handle character selection
        }}
        showUser={false}
      />

      {/* 新增角色對話框 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="mb-4">
              <h2 className="text-xl font-bold">新增角色</h2>
              <p className="text-muted-foreground">選擇角色的職業和填寫基本資訊</p>
            </div>
            
            <JobSelector
              onJobSelect={(job) => {
                // Handle job selection for character creation
              }}
            />
            
            <div className="flex gap-2 mt-6">
              <Button>
                創建角色
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                取消
              </Button>
            </div>
          </div>
        </div>
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