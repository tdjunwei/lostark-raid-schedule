import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const DEBUG_REALTIME = process.env.NODE_ENV === 'development'

type Tables = Database['public']['Tables']
type RaidRow = Tables['raids']['Row']
type RaidTimelineRow = Tables['raid_timeline']['Row'] 
type ScheduleRow = Tables['schedules']['Row']

interface RealtimeCallbacks {
  onRaidUpdate?: (raid: RaidRow) => void
  onTimelineUpdate?: (timeline: RaidTimelineRow) => void
  onScheduleUpdate?: (schedule: ScheduleRow) => void
  onPresenceUpdate?: (presences: any[]) => void
  onError?: (error: any) => void
}

export class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map()
  private callbacks: RealtimeCallbacks = {}

  constructor(callbacks: RealtimeCallbacks = {}) {
    this.callbacks = callbacks
  }

  // 訂閱副本更新
  subscribeToRaids(raidIds?: string[]) {
    const channelName = 'raids'
    
    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName)
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'raids',
          filter: raidIds ? `id=in.(${raidIds.join(',')})` : undefined,
        },
        (payload) => {
          DEBUG_REALTIME && console.log('Raid updated:', payload)
          
          switch (payload.eventType) {
            case 'INSERT':
            case 'UPDATE':
              this.callbacks.onRaidUpdate?.(payload.new as RaidRow)
              break
            case 'DELETE':
              // 處理刪除事件
              break
          }
        }
      )
      .subscribe((status) => {
        DEBUG_REALTIME && console.log('Raids channel status:', status)
        if (status === 'SUBSCRIBED') {
          DEBUG_REALTIME && console.log('Successfully subscribed to raids updates')
        }
      })

    this.channels.set(channelName, channel)
    return channel
  }

  // 訂閱副本時間線更新
  subscribeToRaidTimeline(raidId: string) {
    const channelName = `raid-timeline-${raidId}`
    
    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName)
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'raid_timeline',
          filter: `raid_id=eq.${raidId}`,
        },
        (payload) => {
          DEBUG_REALTIME && console.log('Timeline updated:', payload)
          
          switch (payload.eventType) {
            case 'INSERT':
            case 'UPDATE':
              this.callbacks.onTimelineUpdate?.(payload.new as RaidTimelineRow)
              break
            case 'DELETE':
              // 處理刪除事件
              break
          }
        }
      )
      .subscribe((status) => {
        DEBUG_REALTIME && console.log('Timeline channel status:', status)
        if (status === 'SUBSCRIBED') {
          DEBUG_REALTIME && console.log(`Successfully subscribed to timeline updates for raid ${raidId}`)
        }
      })

    this.channels.set(channelName, channel)
    return channel
  }

  // 訂閱日程更新
  subscribeToSchedules() {
    const channelName = 'schedules'
    
    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName)
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules',
        },
        (payload) => {
          DEBUG_REALTIME && console.log('Schedule updated:', payload)
          
          switch (payload.eventType) {
            case 'INSERT':
            case 'UPDATE':
              this.callbacks.onScheduleUpdate?.(payload.new as ScheduleRow)
              break
            case 'DELETE':
              // 處理刪除事件
              break
          }
        }
      )
      .subscribe((status) => {
        DEBUG_REALTIME && console.log('Schedules channel status:', status)
        if (status === 'SUBSCRIBED') {
          DEBUG_REALTIME && console.log('Successfully subscribed to schedule updates')
        }
      })

    this.channels.set(channelName, channel)
    return channel
  }

  // 訂閱用戶在線狀態
  subscribeToPresence(channelName: string, userId: string, metadata: any = {}) {
    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName)
    }

    const channel = supabase
      .channel(channelName, {
        config: {
          presence: {
            key: userId,
          },
        },
      })
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        DEBUG_REALTIME && console.log('Presence sync:', newState)
        
        const presences = Object.keys(newState).map(key => ({
          userId: key,
          ...newState[key][0],
        }))
        
        this.callbacks.onPresenceUpdate?.(presences)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        DEBUG_REALTIME && console.log('User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        DEBUG_REALTIME && console.log('User left:', key, leftPresences)
      })
      .subscribe(async (status) => {
        DEBUG_REALTIME && console.log('Presence channel status:', status)
        
        if (status === 'SUBSCRIBED') {
          // 發送用戶在線狀態
          const presenceTrackStatus = await channel.track({
            userId,
            joinedAt: new Date().toISOString(),
            ...metadata,
          })
          
          DEBUG_REALTIME && console.log('Presence track status:', presenceTrackStatus)
        }
      })

    this.channels.set(channelName, channel)
    return channel
  }

  // 發送自定義事件
  async sendEvent(channelName: string, eventName: string, payload: any) {
    const channel = this.channels.get(channelName)
    if (!channel) {
      console.warn(`Channel ${channelName} not found`)
      return
    }

    try {
      await channel.send({
        type: 'broadcast',
        event: eventName,
        payload,
      })
    } catch (error) {
      console.error('Error sending event:', error)
      this.callbacks.onError?.(error)
    }
  }

  // 監聽自定義事件
  subscribeToBroadcast(channelName: string, eventName: string, callback: (payload: any) => void) {
    const channel = this.channels.get(channelName)
    if (!channel) {
      console.warn(`Channel ${channelName} not found`)
      return
    }

    channel.on('broadcast', { event: eventName }, (payload) => {
      callback(payload.payload)
    })
  }

  // 取消訂閱特定頻道
  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName)
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(channelName)
      DEBUG_REALTIME && console.log(`Unsubscribed from ${channelName}`)
    }
  }

  // 取消所有訂閱
  unsubscribeAll() {
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel)
      DEBUG_REALTIME && console.log(`Unsubscribed from ${name}`)
    })
    this.channels.clear()
  }

  // 更新回調函數
  updateCallbacks(newCallbacks: Partial<RealtimeCallbacks>) {
    this.callbacks = { ...this.callbacks, ...newCallbacks }
  }

  // 獲取連接狀態
  getChannelStatus(channelName: string): string {
    const channel = this.channels.get(channelName)
    return channel?.state || 'disconnected'
  }

  // 獲取所有頻道狀態
  getAllChannelStatuses(): Record<string, string> {
    const statuses: Record<string, string> = {}
    this.channels.forEach((channel, name) => {
      statuses[name] = channel.state
    })
    return statuses
  }
}