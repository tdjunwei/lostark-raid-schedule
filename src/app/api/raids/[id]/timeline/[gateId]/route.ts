import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; gateId: string } }
) {
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

    // 檢查關卡是否存在
    const { data: existingGate, error: gateError } = await supabase
      .from('raid_timeline')
      .select('*')
      .eq('id', params.gateId)
      .eq('raid_id', params.id)
      .single()

    if (gateError || !existingGate) {
      return NextResponse.json({ error: 'Gate not found' }, { status: 404 })
    }

    const body = await request.json()
    const { status, notes } = body

    const updateData: any = {}

    if (status) {
      updateData.status = status
      
      // 根據狀態設定時間
      if (status === 'IN_PROGRESS' && !existingGate.start_time) {
        updateData.start_time = new Date().toISOString()
      } else if (status === 'COMPLETED') {
        updateData.completed_at = new Date().toISOString()
        if (!existingGate.start_time) {
          updateData.start_time = new Date().toISOString()
        }
      } else if (status === 'FAILED') {
        if (!existingGate.start_time) {
          updateData.start_time = new Date().toISOString()
        }
      } else if (status === 'PENDING') {
        // 重置狀態時清除時間
        updateData.start_time = null
        updateData.completed_at = null
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    // 更新關卡狀態
    const { data: updatedGate, error } = await supabase
      .from('raid_timeline')
      .update(updateData)
      .eq('id', params.gateId)
      .select()
      .single()

    if (error) {
      console.error('Error updating gate status:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 檢查是否所有關卡都完成，更新副本狀態
    if (status === 'COMPLETED') {
      const { data: allGates } = await supabase
        .from('raid_timeline')
        .select('status')
        .eq('raid_id', params.id)

      const allCompleted = allGates?.every(gate => 
        gate.id === params.gateId ? status === 'COMPLETED' : gate.status === 'COMPLETED'
      )

      if (allCompleted) {
        await supabase
          .from('raids')
          .update({ status: 'COMPLETED' })
          .eq('id', params.id)
      }
    }

    return NextResponse.json(updatedGate)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; gateId: string } }
) {
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

    if (profileError || profile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 檢查關卡是否存在
    const { data: existingGate, error: gateError } = await supabase
      .from('raid_timeline')
      .select('id')
      .eq('id', params.gateId)
      .eq('raid_id', params.id)
      .single()

    if (gateError || !existingGate) {
      return NextResponse.json({ error: 'Gate not found' }, { status: 404 })
    }

    // 刪除關卡
    const { error } = await supabase
      .from('raid_timeline')
      .delete()
      .eq('id', params.gateId)

    if (error) {
      console.error('Error deleting gate:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Gate deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}