import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const supabase = createClient()

    const { data: job, error } = await supabase
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
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching job:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}