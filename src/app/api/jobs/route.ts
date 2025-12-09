import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const role = searchParams.get('role')

    const supabase = createClient()

    let query = supabase
      .from('jobs')
      .select(`
        id,
        name,
        role,
        logo,
        description,
        created_at,
        category:job_categories (
          id,
          name,
          color,
          icon
        )
      `)
      .order('name')

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (role && (role === 'DPS' || role === 'SUPPORT')) {
      query = query.eq('role', role as 'DPS' | 'SUPPORT')
    }

    const { data: jobs, error } = await query

    if (error) {
      console.error('Error fetching jobs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}