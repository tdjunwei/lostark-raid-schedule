'use client'

import { useState, useEffect } from 'react'
import { JobCard } from './job-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type Job = Database['public']['Tables']['jobs']['Row'] & {
  category: Database['public']['Tables']['job_categories']['Row']
}

type JobCategory = Database['public']['Tables']['job_categories']['Row']

interface JobSelectorProps {
  selectedJobId?: string
  onJobSelect?: (job: Job | null) => void
  filterByRole?: 'DPS' | 'SUPPORT'
  filterByCategory?: string
}

export function JobSelector({
  selectedJobId,
  onJobSelect,
  filterByRole,
  filterByCategory
}: JobSelectorProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [categories, setCategories] = useState<JobCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(filterByCategory || 'all')
  const [selectedRole, setSelectedRole] = useState<string>(filterByRole || 'all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load categories
      const { data: categoriesData } = await supabase
        .from('job_categories')
        .select('*')
        .order('name')
      
      if (categoriesData) setCategories(categoriesData)
      
      // Load jobs with categories
      const { data: jobsData } = await supabase
        .from('jobs')
        .select(`
          *,
          category:job_categories (*)
        `)
        .order('name')
      
      if (jobsData) setJobs(jobsData as Job[])
    } catch (error) {
      console.error('Error loading job data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job => {
    const categoryMatch = selectedCategory === 'all' || job.category_id === selectedCategory
    const roleMatch = selectedRole === 'all' || job.role === selectedRole
    const searchMatch = searchQuery === '' ||
      job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && roleMatch && searchMatch
  })

  const selectedJob = jobs.find(job => job.id === selectedJobId)

  if (loading) {
    return <div className="flex justify-center p-8">載入中...</div>
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜尋職業名稱、分類或描述..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium">職業分類</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="選擇職業分類" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分類</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium">職業定位</label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="選擇定位" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部定位</SelectItem>
              <SelectItem value="DPS">DPS</SelectItem>
              <SelectItem value="SUPPORT">SUPPORT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selected job info */}
      {selectedJob && (
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: selectedJob.category.color }}
              />
              <div>
                <span className="font-medium">{selectedJob.name}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  ({selectedJob.category.name})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={selectedJob.role === 'SUPPORT' ? 'secondary' : 'default'}>
                {selectedJob.role}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onJobSelect?.(null)}
              >
                清除選擇
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Job grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map(job => (
          <JobCard
            key={job.id}
            job={job}
            selected={job.id === selectedJobId}
            onClick={onJobSelect}
          />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          沒有符合條件的職業
        </div>
      )}
    </div>
  )
}