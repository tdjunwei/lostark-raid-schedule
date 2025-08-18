import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const limit = searchParams.get('limit')

    const supabase = createServerSupabaseClient()

    let query = supabase
      .from('raids')
      .select(`
        id,
        name,
        type,
        mode,
        gate,
        scheduled_time,
        status,
        max_players,
        required_dps,
        required_support,
        min_item_level,
        phase1_cost,
        phase2_cost,
        phase3_cost,
        phase4_cost,
        active_gold_reward,
        bound_gold_reward,
        notes,
        created_by,
        created_at,
        updated_at
      `)
      .order('scheduled_time', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data: raids, error } = await query

    if (error) {
      console.error('Error fetching raids:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(raids)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      type,
      mode = 'NORMAL',
      gate,
      scheduled_time,
      max_players = 8,
      required_dps = 0,
      required_support = 0,
      min_item_level,
      phase1_cost,
      phase2_cost,
      phase3_cost,
      phase4_cost,
      active_gold_reward,
      bound_gold_reward,
      notes
    } = body

    // Validate required fields
    if (!name || !type || !scheduled_time || !min_item_level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create new raid
    const { data: raid, error } = await supabase
      .from('raids')
      .insert([{
        name,
        type,
        mode,
        gate,
        scheduled_time,
        status: 'PLANNED',
        max_players,
        required_dps,
        required_support,
        min_item_level,
        phase1_cost,
        phase2_cost,
        phase3_cost,
        phase4_cost,
        active_gold_reward,
        bound_gold_reward,
        notes,
        created_by: user.id
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating raid:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(raid, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}