'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Settings,
  Bell,
  Database,
  Shield,
  Palette,
  Download,
  Upload,
  Trash2
} from 'lucide-react'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    raidReminders: true,
    weeklyReset: true,
    newParticipants: false,
    systemUpdates: true
  })

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    scheduleVisible: false,
    characterVisible: true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">系統設定</h1>
          <p className="text-muted-foreground">
            管理你的帳戶設定、通知偏好和隱私設定
          </p>
        </div>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          重置設定
        </Button>
      </div>

      {/* 通知設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            通知設定
          </CardTitle>
          <CardDescription>
            選擇你想要接收的通知類型
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">副本提醒</div>
              <div className="text-sm text-muted-foreground">
                在副本開始前 30 分鐘收到提醒
              </div>
            </div>
            <Switch 
              checked={notifications.raidReminders}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, raidReminders: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">週重置提醒</div>
              <div className="text-sm text-muted-foreground">
                每週四 06:00 發送重置提醒
              </div>
            </div>
            <Switch 
              checked={notifications.weeklyReset}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, weeklyReset: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">新參與者通知</div>
              <div className="text-sm text-muted-foreground">
                當有新成員加入你的副本時通知
              </div>
            </div>
            <Switch 
              checked={notifications.newParticipants}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, newParticipants: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">系統更新</div>
              <div className="text-sm text-muted-foreground">
                收到新功能和重要更新的通知
              </div>
            </div>
            <Switch 
              checked={notifications.systemUpdates}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, systemUpdates: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* 隱私設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            隱私設定
          </CardTitle>
          <CardDescription>
            控制其他用戶可以看到的資訊
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">個人資料可見性</div>
              <div className="text-sm text-muted-foreground">
                允許其他用戶查看你的基本資料
              </div>
            </div>
            <Switch 
              checked={privacy.profileVisible}
              onCheckedChange={(checked) => 
                setPrivacy(prev => ({ ...prev, profileVisible: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">排程可見性</div>
              <div className="text-sm text-muted-foreground">
                允許其他用戶查看你的副本排程
              </div>
            </div>
            <Switch 
              checked={privacy.scheduleVisible}
              onCheckedChange={(checked) => 
                setPrivacy(prev => ({ ...prev, scheduleVisible: checked }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">角色資訊可見性</div>
              <div className="text-sm text-muted-foreground">
                允許其他用戶查看你的角色資訊
              </div>
            </div>
            <Switch 
              checked={privacy.characterVisible}
              onCheckedChange={(checked) => 
                setPrivacy(prev => ({ ...prev, characterVisible: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* 外觀設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            外觀設定
          </CardTitle>
          <CardDescription>
            自訂應用程式的外觀和感覺
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">主題</div>
              <div className="text-sm text-muted-foreground">
                選擇亮色或暗色主題（可使用右上角切換按鈕）
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              已啟用自動切換
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">語言</div>
              <div className="text-sm text-muted-foreground">
                選擇應用程式語言
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              繁體中文
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 資料管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            資料管理
          </CardTitle>
          <CardDescription>
            匯入、匯出和管理你的資料
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4" />
                <span className="font-medium">匯出資料</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                將你的角色、排程和副本資料匯出為 Excel 檔案
              </p>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4" />
                <span className="font-medium">匯入資料</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                從 Excel 檔案匯入現有的副本排程資料
              </p>
            </Button>
          </div>

          <Separator />

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <div className="font-medium text-destructive">危險區域</div>
                <p className="text-sm text-muted-foreground mt-1">
                  刪除所有資料將永久移除你的角色、排程和副本記錄。此操作無法復原。
                </p>
                <Button variant="destructive" size="sm" className="mt-3">
                  刪除所有資料
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 關於 */}
      <Card>
        <CardHeader>
          <CardTitle>關於應用程式</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Lost Ark 副本日程表 v1.0.0</p>
            <p>專為 Lost Ark 玩家設計的副本排程管理系統</p>
            <p>支援即時協作、收益追蹤、角色管理等功能</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}