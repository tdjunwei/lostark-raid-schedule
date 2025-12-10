'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { Search, Check } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Job = Database['public']['Tables']['jobs']['Row'] & {
  category: Database['public']['Tables']['job_categories']['Row']
}

interface JobAutocompleteProps {
  onJobSelect: (job: Job | null) => void
  selectedJob: Job | null
}

export function JobAutocomplete({ onJobSelect, selectedJob }: JobAutocompleteProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 載入所有職業
  useEffect(() => {
    loadJobs()
  }, [])

  // 更新搜索結果
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredJobs(jobs)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = jobs.filter(
        job =>
          job.name.toLowerCase().includes(query) ||
          job.category.name.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query)
      )
      setFilteredJobs(filtered)
    }
  }, [searchQuery, jobs])

  // 點擊外部關閉下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          category:job_categories(*)
        `)
        .order('name')

      if (error) throw error
      setJobs(data as Job[])
      setFilteredJobs(data as Job[])
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJobSelect = (job: Job) => {
    onJobSelect(job)
    setSearchQuery(job.name)
    setShowDropdown(false)
  }

  const handleInputChange = (value: string) => {
    setSearchQuery(value)
    setShowDropdown(true)
    if (value === '' && selectedJob) {
      onJobSelect(null)
    }
  }

  const handleInputFocus = () => {
    setShowDropdown(true)
    if (selectedJob && searchQuery === '') {
      setSearchQuery(selectedJob.name)
    }
  }

  // 初始化時如果有選中的職業，設置搜索框
  useEffect(() => {
    if (selectedJob && searchQuery === '') {
      setSearchQuery(selectedJob.name)
    }
  }, [selectedJob])

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="搜尋職業名稱、分類或描述..."
          className="pl-9"
        />
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-background border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">載入中...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">找不到相關職業</div>
          ) : (
            <div className="py-2">
              {filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => handleJobSelect(job)}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors ${
                      isSelected ? 'bg-muted' : ''
                    }`}
                  >
                    {/* 職業圖標 */}
                    <div
                      className="w-10 h-10 rounded-lg flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
                      style={{
                        backgroundColor: job.role === 'SUPPORT' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      }}
                    >
                      <img
                        src={job.logo || '/placeholder-job.png'}
                        alt={job.name}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>

                    {/* 職業資訊 */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{job.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            job.role === 'SUPPORT'
                              ? 'bg-green-500/10 text-green-600'
                              : 'bg-red-500/10 text-red-600'
                          }`}
                        >
                          {job.role === 'SUPPORT' ? '輔助' : '輸出'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">{job.category.name}</div>
                    </div>

                    {/* 選中標記 */}
                    {isSelected && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 顯示已選擇的職業 */}
      {selectedJob && !showDropdown && (
        <div className="mt-2 p-3 bg-muted rounded-lg flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex-shrink-0 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
            style={{
              backgroundColor: selectedJob.role === 'SUPPORT' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            }}
          >
            <img
              src={selectedJob.logo || '/placeholder-job.png'}
              alt={selectedJob.name}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <div>
            <div className="font-medium">{selectedJob.name}</div>
            <div className="text-sm text-muted-foreground">
              {selectedJob.category.name} • {selectedJob.role === 'SUPPORT' ? '輔助' : '輸出'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
