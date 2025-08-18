'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Database } from '@/types/supabase'

type Job = Database['public']['Tables']['jobs']['Row'] & {
  category: Database['public']['Tables']['job_categories']['Row']
}

interface JobCardProps {
  job: Job
  onClick?: (job: Job) => void
  selected?: boolean
}

export function JobCard({ job, onClick, selected }: JobCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onClick?.(job)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{job.name}</CardTitle>
          <Badge variant={job.role === 'SUPPORT' ? 'secondary' : 'default'}>
            {job.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-full flex-shrink-0"
            style={{ backgroundColor: job.category.color }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {job.category.name}
            </p>
            {job.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {job.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}