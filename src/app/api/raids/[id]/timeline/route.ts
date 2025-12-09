import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const supabase = createClient()

    // 驗證用戶認證
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: timeline, error } = await supabase
      .from('raid_timeline')
      .select('*')
      .eq('raid_id', params.id)
      .order('created_at')

    if (error) {
      console.error('Error fetching raid timeline:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(timeline)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const supabase = createClient()

    // 驗證用戶認證和權限
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !['ADMIN', 'SCHEDULER'].includes(profile?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 檢查副本是否存在
    const { data: raid, error: raidError } = await supabase
      .from('raids')
      .select('id')
      .eq('id', params.id)
      .single()

    if (raidError || !raid) {
      return NextResponse.json({ error: 'Raid not found' }, { status: 404 })
    }

    const body = await request.json()
    const { gate, status = 'PENDING', notes } = body

    if (!gate) {
      return NextResponse.json({ error: 'Gate is required' }, { status: 400 })
    }

    // 檢查是否已存在相同關卡
    const { data: existing } = await supabase
      .from('raid_timeline')
      .select('id')
      .eq('raid_id', params.id)
      .eq('gate', gate)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Gate already exists' }, { status: 409 })
    }

    // 創建新的關卡記錄
    const { data: timelineEntry, error } = await supabase
      .from('raid_timeline')
      .insert([{
        raid_id: params.id,
        gate,
        status,
        notes,
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating timeline entry:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(timelineEntry, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}