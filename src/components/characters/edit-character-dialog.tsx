'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { JobSelector } from '@/components/jobs/job-selector'
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

type Character = Database['public']['Tables']['characters']['Row'] & {
  job: Job
}

interface EditCharacterDialogProps {
  character: Character
  onClose: () => void
  onSuccess: () => void
}

export function EditCharacterDialog({ character, onClose, onSuccess }: EditCharacterDialogProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(character.job)
  const [nickname, setNickname] = useState(character.nickname)
  const [itemLevel, setItemLevel] = useState(character.item_level.toString())
  const [role, setRole] = useState<'DPS' | 'SUPPORT'>(character.job.role as 'DPS' | 'SUPPORT')
  const [isMain, setIsMain] = useState(character.is_main || false)
  const [notes, setNotes] = useState(character.notes || '')
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
      // 更新角色
      const { error: updateError } = await supabase
        .from('characters')
        .update({
          nickname: nickname.trim(),
          item_level: parseInt(itemLevel),
          job_id: selectedJob.id,
          is_main: isMain,
          notes: notes.trim() || null,
        })
        .eq('id', character.id)

      if (updateError) {
        // 處理重複角色名稱錯誤
        if (updateError.code === '23505') {
          throw new Error('你已經有同名的角色了')
        }
        throw updateError
      }

      // 成功
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error updating character:', err)
      setError(err.message || '更新角色失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`確定要刪除角色「${character.nickname}」嗎？此操作無法復原。`)) {
      return
    }

    setLoading(true)
    try {
      const { error: deleteError } = await supabase
        .from('characters')
        .delete()
        .eq('id', character.id)

      if (deleteError) {
        throw deleteError
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error deleting character:', err)
      setError(err.message || '刪除角色失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-background p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
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
          <h2 className="text-xl font-bold">編輯角色</h2>
          <p className="text-muted-foreground">修改角色的職業和基本資訊</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 職業選擇 */}
          <div className="space-y-2">
            <Label>職業選擇 *</Label>
            <JobSelector
              onJobSelect={(job) => setSelectedJob(job)}
              selectedJobId={selectedJob?.id}
            />
            {selectedJob && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  已選擇：<span className="font-medium">{selectedJob.name}</span>
                  <span className="ml-2 text-muted-foreground">
                    ({selectedJob.category.name} • {selectedJob.role})
                  </span>
                </p>
              </div>
            )}
          </div>

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

          {/* 錯誤訊息 */}
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 按鈕 */}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? '更新中...' : '更新角色'}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              刪除角色
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
