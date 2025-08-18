import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Check if user has admin permissions
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, category_id, role = 'DPS', logo, description } = body

    if (!name || !category_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .insert([{ name, category_id, role, logo, description }])
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
      .single()

    if (error) {
      console.error('Error creating job:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}