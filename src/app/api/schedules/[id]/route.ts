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

    const { data: schedule, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching schedule:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    // 檢查權限：只有排程所有者或管理員可以查看
    if (schedule.user_id !== user.id) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const supabase = createClient()

    // 驗證用戶認證
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 檢查排程是否存在和權限
    const { data: existingSchedule, error: fetchError } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    if (existingSchedule.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { day_of_week, start_time, end_time, available, note } = body

    // 驗證時間邏輯
    if (start_time && end_time && start_time >= end_time) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
    }

    // 檢查時間衝突（排除當前排程）
    if (day_of_week !== undefined && start_time && end_time) {
      const { data: otherSchedules, error: conflictError } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', user.id)
        .eq('day_of_week', day_of_week)
        .neq('id', params.id)

      if (conflictError) {
        return NextResponse.json({ error: 'Conflict check failed' }, { status: 500 })
      }

      const hasConflict = otherSchedules.some(schedule =>
        start_time < schedule.end_time && end_time > schedule.start_time
      )

      if (hasConflict) {
        return NextResponse.json({ error: 'Schedule conflicts with existing schedule' }, { status: 409 })
      }
    }

    // 更新排程
    const updateData: any = {}
    if (day_of_week !== undefined) updateData.day_of_week = day_of_week
    if (start_time) updateData.start_time = start_time
    if (end_time) updateData.end_time = end_time
    if (available !== undefined) updateData.available = available
    if (note !== undefined) updateData.note = note

    const { data: schedule, error } = await supabase
      .from('schedules')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating schedule:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const supabase = createClient()

    // 驗證用戶認證
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 檢查排程是否存在和權限
    const { data: existingSchedule, error: fetchError } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    if (existingSchedule.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 刪除排程
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting schedule:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Schedule deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}