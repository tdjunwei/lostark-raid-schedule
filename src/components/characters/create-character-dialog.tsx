'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { JobAutocomplete } from '@/components/jobs/job-autocomplete'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type Job = Database['public']['Tables']['jobs']['Row'] & {
  category: Database['public']['Tables']['job_categories']['Row']
}

interface CreateCharacterDialogProps {
  onClose: () => void
  onSuccess: () => void
}

export function CreateCharacterDialog({ onClose, onSuccess }: CreateCharacterDialogProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [nickname, setNickname] = useState('')
  const [itemLevel, setItemLevel] = useState('')
  const [role, setRole] = useState<'DPS' | 'SUPPORT'>('DPS')
  const [isMain, setIsMain] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 當選擇職業時，自動設定默認定位
  useEffect(() => {
    if (selectedJob) {
      setRole(selectedJob.role as 'DPS' | 'SUPPORT')
    }
  }, [selectedJob])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 驗證
    if (!selectedJob) {
      setError('請選擇職業')
      return
    }
    if (!nickname.trim()) {
      setError('請輸入角色名稱')
      return
    }
    if (!itemLevel || parseInt(itemLevel) < 1490) {
      setError('裝備分數最低為 1490')
      return
    }

    setLoading(true)

    try {
      // 取得當前使用者
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('未登入')
      }

      // 檢查使用者 profile 是否存在，如果不存在則創建
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        // 自動創建 user_profile
        const { error: createProfileError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || user.email!.split('@')[0],
            role: 'PLAYER'
          })

        if (createProfileError) {
          console.error('Error creating user profile:', createProfileError)
          throw new Error('無法創建使用者資料')
        }
      }

      // 創建角色
      const { error: insertError } = await supabase
        .from('characters')
        .insert({
          user_id: user.id,
          nickname: nickname.trim(),
          item_level: parseInt(itemLevel),
          job_id: selectedJob.id,
          is_main: isMain,
          notes: notes.trim() || null,
        })

      if (insertError) {
        // 處理重複角色名稱錯誤
        if (insertError.code === '23505') {
          throw new Error('你已經有同名的角色了')
        }
        throw insertError
      }

      // 成功
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error creating character:', err)
      setError(err.message || '創建角色失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="mb-4">
          <h2 className="text-xl font-bold">新增角色</h2>
          <p className="text-muted-foreground">選擇角色的職業和填寫基本資訊</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 角色名稱 */}
          <div className="space-y-2">
            <Label htmlFor="nickname">角色名稱 *</Label>
            <Input
              id="nickname"
              placeholder="輸入角色暱稱"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>

          {/* 裝備分數 */}
          <div className="space-y-2">
            <Label htmlFor="itemLevel">裝備分數 *</Label>
            <Input
              id="itemLevel"
              type="number"
              min="1490"
              placeholder="1490"
              value={itemLevel}
              onChange={(e) => setItemLevel(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">最低裝等為 1490</p>
          </div>

          {/* 定位選擇 */}
          <div className="space-y-2">
            <Label htmlFor="role">定位</Label>
            <Select value={role} onValueChange={(value) => setRole(value as 'DPS' | 'SUPPORT')}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DPS">DPS (輸出)</SelectItem>
                <SelectItem value="SUPPORT">SUPPORT (輔助)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              默認與職業定位一致，可以手動調整
            </p>
          </div>

          {/* 主角色 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isMain"
              checked={isMain}
              onCheckedChange={(checked) => setIsMain(checked as boolean)}
            />
            <Label htmlFor="isMain" className="cursor-pointer">
              設為主角色
            </Label>
          </div>

          {/* 備註 */}
          <div className="space-y-2">
            <Label htmlFor="notes">備註（可選）</Label>
            <Input
              id="notes"
              placeholder="角色相關備註"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* 職業選擇 */}
          <div className="space-y-2">
            <Label>職業選擇 *</Label>
            <JobAutocomplete
              onJobSelect={(job) => setSelectedJob(job)}
              selectedJob={selectedJob}
            />
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 按鈕 */}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? '創建中...' : '創建角色'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              取消
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
