import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const dayOfWeek = searchParams.get('dayOfWeek')

    const supabase = createClient()

    // 驗證用戶認證
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('schedules')
      .select('*')
      .order('day_of_week, start_time')

    // 如果指定了用戶ID，只返回該用戶的排程
    if (userId) {
      query = query.eq('user_id', userId)
    }

    // 如果指定了星期，只返回該天的排程
    if (dayOfWeek !== null) {
      query = query.eq('day_of_week', parseInt(dayOfWeek))
    }

    const { data: schedules, error } = await query

    if (error) {
      console.error('Error fetching schedules:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // 驗證用戶認證
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { day_of_week, start_time, end_time, available = true, note } = body

    // 驗證必要欄位
    if (day_of_week === undefined || !start_time || !end_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 驗證時間格式和邏輯
    if (start_time >= end_time) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
    }

    // 檢查時間衝突
    const { data: existingSchedules, error: conflictError } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', user.id)
      .eq('day_of_week', day_of_week)

    if (conflictError) {
      console.error('Error checking conflicts:', conflictError)
      return NextResponse.json({ error: 'Conflict check failed' }, { status: 500 })
    }

    const hasConflict = existingSchedules.some(schedule =>
      start_time < schedule.end_time && end_time > schedule.start_time
    )

    if (hasConflict) {
      return NextResponse.json({ error: 'Schedule conflicts with existing schedule' }, { status: 409 })
    }

    // 創建新排程
    const { data: schedule, error } = await supabase
      .from('schedules')
      .insert([{
        user_id: user.id,
        day_of_week,
        start_time,
        end_time,
        available,
        note: note || null,
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating schedule:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}