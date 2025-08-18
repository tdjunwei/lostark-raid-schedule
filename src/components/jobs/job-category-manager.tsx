'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type JobCategory = Database['public']['Tables']['job_categories']['Row']

interface JobCategoryManagerProps {
  onCategorySelect?: (category: JobCategory) => void
}

export function JobCategoryManager({ onCategorySelect }: JobCategoryManagerProps) {
  const [categories, setCategories] = useState<JobCategory[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState({ name: '', color: '#FF6B6B', icon: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('job_categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newCategory.name.trim()) return

    try {
      const response = await fetch('/api/admin/job-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      })

      if (!response.ok) throw new Error('創建失敗')

      const category = await response.json()
      setCategories(prev => [...prev, category])
      setNewCategory({ name: '', color: '#FF6B6B', icon: '' })
      setIsCreating(false)
    } catch (error) {
      console.error('Error creating category:', error)
      alert('創建職業分類失敗')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這個職業分類嗎？')) return

    try {
      const { error } = await supabase
        .from('job_categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      setCategories(prev => prev.filter(cat => cat.id !== id))
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('刪除失敗')
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">載入中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">職業分類管理</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增分類
        </Button>
      </div>

      {/* Create form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>新增職業分類</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">分類名稱</label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="例如：男戰士"
              />
            </div>
            <div>
              <label className="text-sm font-medium">代表顏色</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                  className="w-8 h-8 rounded border"
                />
                <Input
                  value={newCategory.color}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#FF6B6B"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">圖標路徑</label>
              <Input
                value={newCategory.icon}
                onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="/icons/categories/male-warrior.png"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>
                創建
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => (
          <Card 
            key={category.id} 
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => onCategorySelect?.(category)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingId(category.id)
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(category.id)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline">{category.color}</Badge>
                {category.icon && (
                  <p className="text-sm text-muted-foreground truncate">
                    {category.icon}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          還沒有職業分類，點擊上方按鈕新增一個吧！
        </div>
      )}
    </div>
  )
}