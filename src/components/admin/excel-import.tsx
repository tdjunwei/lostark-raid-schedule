'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react'

interface ImportSummary {
  characters: number
  schedules: number
  raids: number
  economics: number
  rewards: number
  achievements: number
  gems: number
  guides: number
  missions: number
  errors: string[]
}

interface ImportResult {
  success: boolean
  summary: ImportSummary
  data: {
    charactersFound: number
    schedulesFound: number
    raidsFound: number
    economicsFound: number
    rewardsFound: number
    achievementsFound: number
    gemsFound: number
    guidesFound: number
    missionsFound: number
  }
}

export function ExcelImport() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setError(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError('請選擇要匯入的 Excel 檔案')
      return
    }

    setImporting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/excel-import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '匯入失敗')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '匯入過程中發生錯誤')
    } finally {
      setImporting(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Excel 檔案匯入
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">選擇 Excel 檔案</label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={importing}
              />
              {file && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={importing}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileSpreadsheet className="w-4 h-4" />
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={!file || importing}
            >
              {importing ? (
                <>載入中...</>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  開始匯入
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                匯入完成
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">發現的角色</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{result.data.charactersFound}</Badge>
                    <span className="text-sm">→ 匯入 {result.summary.characters}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">發現的日程</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{result.data.schedulesFound}</Badge>
                    <span className="text-sm">→ 匯入 {result.summary.schedules}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">發現的副本</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{result.data.raidsFound}</Badge>
                    <span className="text-sm">→ 匯入 {result.summary.raids}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">發現的經濟數據</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{result.data.economicsFound}</Badge>
                    <span className="text-sm">→ 匯入 {result.summary.economics}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">發現的獎勵</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{result.data.rewardsFound}</Badge>
                    <span className="text-sm">→ 匯入 {result.summary.rewards}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">發現的成就</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{result.data.achievementsFound}</Badge>
                    <span className="text-sm">→ 匯入 {result.summary.achievements}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">發現的寶石數據</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{result.data.gemsFound}</Badge>
                    <span className="text-sm">→ 匯入 {result.summary.gems}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">發現的委託</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{result.data.missionsFound}</Badge>
                    <span className="text-sm">→ 匯入 {result.summary.missions}</span>
                  </div>
                </div>
              </div>

              {result.summary.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-destructive">
                    匯入錯誤 ({result.summary.errors.length})
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {result.summary.errors.map((error, index) => (
                      <div key={index} className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>支援的工作表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              '暱稱', '裝等表', '天界', '夢幻', '象牙塔', '瘟疫',
              '收益金', '副本獎勵表', '島之心', '巨人之心', '奧菲斯之星',
              '寶石比價系統', '艾波娜委託', '攻略指南'
            ].map(sheet => (
              <Badge key={sheet} variant="outline" className="justify-center">
                {sheet}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}