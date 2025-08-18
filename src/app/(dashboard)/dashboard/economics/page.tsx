'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EconomicsTracker } from '@/components/economics/economics-tracker'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calculator,
  Filter
} from 'lucide-react'

export default function EconomicsPage() {
  const [selectedRaidId, setSelectedRaidId] = useState<string>('temp-raid-id')
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">收益分析</h1>
          <p className="text-muted-foreground">
            追蹤副本收益、成本分析和利潤統計
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            過濾器
          </Button>
        </div>
      </div>

      {/* 總體統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本週收益</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+45,200G</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              較上週增長 12%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總成本</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-18,500G</div>
            <p className="text-xs text-muted-foreground">
              包含消耗品和修理費
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">淨利潤</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+26,700G</div>
            <p className="text-xs text-muted-foreground">
              利潤率 59%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均 ROI</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">144%</div>
            <p className="text-xs text-muted-foreground">
              投資回報率
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 過濾器 */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">過濾條件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">時間範圍</label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option>本週</option>
                  <option>上週</option>
                  <option>本月</option>
                  <option>上月</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">副本類型</label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option>全部</option>
                  <option>天界</option>
                  <option>夢幻</option>
                  <option>象牙塔</option>
                  <option>瘟疫</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">角色</label>
                <select className="w-full mt-1 p-2 border rounded-md">
                  <option>全部角色</option>
                  <option>主角色</option>
                  <option>分身</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  套用過濾器
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 副本收益明細 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 收益分布圖 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>收益分布</CardTitle>
            <CardDescription>各副本類型的收益對比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">天界</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">15,200G</div>
                  <div className="text-xs text-muted-foreground">34%</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">夢幻</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">18,500G</div>
                  <div className="text-xs text-muted-foreground">41%</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">象牙塔</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">8,200G</div>
                  <div className="text-xs text-muted-foreground">18%</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">瘟疫</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">3,300G</div>
                  <div className="text-xs text-muted-foreground">7%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 最佳收益副本 */}
        <Card>
          <CardHeader>
            <CardTitle>最佳收益</CardTitle>
            <CardDescription>收益率最高的副本</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-medium text-sm">夢幻 G1-3</div>
                  <div className="text-xs text-muted-foreground">普通模式</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">+180%</div>
                  <div className="text-xs text-muted-foreground">2,500G</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-medium text-sm">天界 G1-2</div>
                  <div className="text-xs text-muted-foreground">困難模式</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">+165%</div>
                  <div className="text-xs text-muted-foreground">3,200G</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-medium text-sm">象牙塔 G1</div>
                  <div className="text-xs text-muted-foreground">普通模式</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">+142%</div>
                  <div className="text-xs text-muted-foreground">1,800G</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 詳細經濟追蹤 */}
      {selectedRaidId && (
        <EconomicsTracker 
          raidId={selectedRaidId}
          canEdit={true}
          onUpdate={(economics) => {
            // Handle economics updates
          }}
        />
      )}

      {/* 使用說明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">收益分析說明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• 活金：可在市場交易的金幣</p>
          <p>• 綁金：綁定帳號的金幣</p>
          <p>• 總成本：包含消耗品、修理費等所有支出</p>
          <p>• ROI：投資回報率 = (收益 - 成本) / 成本 × 100%</p>
        </CardContent>
      </Card>
    </div>
  )
}