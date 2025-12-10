import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/supabase'
import { config } from 'dotenv'
import { resolve } from 'path'

// 加載環境變量
config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 錯誤：缺少必要的環境變量')
  console.error('\n請在 .env.local 中添加：')
  console.error('NEXT_PUBLIC_SUPABASE_URL=你的supabase url')
  console.error('SUPABASE_SERVICE_ROLE_KEY=你的service role key')
  console.error('\n如何獲取Service Role Key：')
  console.error('1. 前往 https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api')
  console.error('2. 在 "Project API keys" 部分找到 "service_role" key')
  console.error('3. 複製並添加到 .env.local')
  process.exit(1)
}

// 使用service role key來繞過RLS限制
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface RaidGateInfo {
  gate: number
  mode: 'SOLO' | 'NORMAL' | 'HARD'
  minItemLevel: number
  activeGold: number
  boundGold: number
  soloCoin?: number
}

interface RaidData {
  nameEn: string
  nameZh: string
  type: Database['public']['Enums']['raid_type']
  maxPlayers: number
  requiredSupport: number
  requiredDps: number
  totalGates: number
  goldCapItemLevel: number | null
  gates: RaidGateInfo[]
}

const raidsData: RaidData[] = [
  // Valtan 佛坦
  {
    nameEn: 'Valtan',
    nameZh: '佛坦',
    type: 'CELESTIAL', // 暫時使用現有的類型
    maxPlayers: 8,
    requiredSupport: 2,
    requiredDps: 6,
    totalGates: 2,
    goldCapItemLevel: 1600,
    gates: [
      // Solo mode
      { gate: 1, mode: 'SOLO', minItemLevel: 1415, activeGold: 0, boundGold: 450, soloCoin: 50 },
      { gate: 2, mode: 'SOLO', minItemLevel: 1415, activeGold: 0, boundGold: 800, soloCoin: 70 },
      // Normal mode
      { gate: 1, mode: 'NORMAL', minItemLevel: 1415, activeGold: 150, boundGold: 450 },
      { gate: 2, mode: 'NORMAL', minItemLevel: 1415, activeGold: 200, boundGold: 800 },
      // Hard mode
      { gate: 1, mode: 'HARD', minItemLevel: 1445, activeGold: 200, boundGold: 700 },
      { gate: 2, mode: 'HARD', minItemLevel: 1445, activeGold: 350, boundGold: 1450 },
    ]
  },
  // Vykas 魅魔
  {
    nameEn: 'Vykas',
    nameZh: '魅魔',
    type: 'CELESTIAL',
    maxPlayers: 8,
    requiredSupport: 2,
    requiredDps: 6,
    totalGates: 2,
    goldCapItemLevel: 1600,
    gates: [
      // Solo mode
      { gate: 1, mode: 'SOLO', minItemLevel: 1430, activeGold: 0, boundGold: 550, soloCoin: 60 },
      { gate: 2, mode: 'SOLO', minItemLevel: 1430, activeGold: 0, boundGold: 900, soloCoin: 100 },
      // Normal mode
      { gate: 1, mode: 'NORMAL', minItemLevel: 1430, activeGold: 150, boundGold: 500 },
      { gate: 2, mode: 'NORMAL', minItemLevel: 1430, activeGold: 200, boundGold: 950 },
      // Hard mode
      { gate: 1, mode: 'HARD', minItemLevel: 1460, activeGold: 200, boundGold: 800 },
      { gate: 2, mode: 'HARD', minItemLevel: 1460, activeGold: 500, boundGold: 1800 },
    ]
  },
  // Kakul-Saydon 小丑
  {
    nameEn: 'Kakul-Saydon',
    nameZh: '小丑',
    type: 'CELESTIAL',
    maxPlayers: 4,
    requiredSupport: 1,
    requiredDps: 3,
    totalGates: 3,
    goldCapItemLevel: 1610,
    gates: [
      // Solo mode
      { gate: 1, mode: 'SOLO', minItemLevel: 1475, activeGold: 0, boundGold: 800, soloCoin: 60 },
      { gate: 2, mode: 'SOLO', minItemLevel: 1475, activeGold: 0, boundGold: 800, soloCoin: 90 },
      { gate: 3, mode: 'SOLO', minItemLevel: 1475, activeGold: 0, boundGold: 1600, soloCoin: 150 },
      // Normal mode
      { gate: 1, mode: 'NORMAL', minItemLevel: 1475, activeGold: 500, boundGold: 500 },
      { gate: 2, mode: 'NORMAL', minItemLevel: 1475, activeGold: 500, boundGold: 500 },
      { gate: 3, mode: 'NORMAL', minItemLevel: 1475, activeGold: 1000, boundGold: 1000 },
    ]
  },
  // Brelshaza 夢幻
  {
    nameEn: 'Brelshaza',
    nameZh: '夢幻',
    type: 'DREAM',
    maxPlayers: 8,
    requiredSupport: 2,
    requiredDps: 6,
    totalGates: 4,
    goldCapItemLevel: 1620,
    gates: [
      // Solo mode
      { gate: 1, mode: 'SOLO', minItemLevel: 1490, activeGold: 0, boundGold: 1600, soloCoin: 150 },
      { gate: 2, mode: 'SOLO', minItemLevel: 1490, activeGold: 0, boundGold: 1600, soloCoin: 150 },
      { gate: 3, mode: 'SOLO', minItemLevel: 1490, activeGold: 0, boundGold: 1600, soloCoin: 150 },
      { gate: 4, mode: 'SOLO', minItemLevel: 1490, activeGold: 0, boundGold: 2000, soloCoin: 250 },
      // Normal mode
      { gate: 1, mode: 'NORMAL', minItemLevel: 1490, activeGold: 1500, boundGold: 500 },
      { gate: 2, mode: 'NORMAL', minItemLevel: 1490, activeGold: 1500, boundGold: 500 },
      { gate: 3, mode: 'NORMAL', minItemLevel: 1490, activeGold: 1500, boundGold: 500 },
      { gate: 4, mode: 'NORMAL', minItemLevel: 1520, activeGold: 1900, boundGold: 600 },
      // Hard mode
      { gate: 1, mode: 'HARD', minItemLevel: 1540, activeGold: 2500, boundGold: 0 },
      { gate: 2, mode: 'HARD', minItemLevel: 1540, activeGold: 2500, boundGold: 0 },
      { gate: 3, mode: 'HARD', minItemLevel: 1540, activeGold: 2500, boundGold: 0 },
      { gate: 4, mode: 'HARD', minItemLevel: 1560, activeGold: 3000, boundGold: 0 },
    ]
  },
  // Kayangel 天界
  {
    nameEn: 'Kayangel',
    nameZh: '天界',
    type: 'CELESTIAL',
    maxPlayers: 4,
    requiredSupport: 1,
    requiredDps: 3,
    totalGates: 3,
    goldCapItemLevel: 1640,
    gates: [
      // Solo mode
      { gate: 1, mode: 'SOLO', minItemLevel: 1540, activeGold: 0, boundGold: 800, soloCoin: 100 },
      { gate: 2, mode: 'SOLO', minItemLevel: 1540, activeGold: 0, boundGold: 1200, soloCoin: 150 },
      { gate: 3, mode: 'SOLO', minItemLevel: 1540, activeGold: 0, boundGold: 2400, soloCoin: 200 },
      // Normal mode
      { gate: 1, mode: 'NORMAL', minItemLevel: 1540, activeGold: 1000, boundGold: 0 },
      { gate: 2, mode: 'NORMAL', minItemLevel: 1540, activeGold: 1500, boundGold: 0 },
      { gate: 3, mode: 'NORMAL', minItemLevel: 1540, activeGold: 3000, boundGold: 0 },
      // Hard mode
      { gate: 1, mode: 'HARD', minItemLevel: 1580, activeGold: 2000, boundGold: 0 },
      { gate: 2, mode: 'HARD', minItemLevel: 1580, activeGold: 2500, boundGold: 0 },
      { gate: 3, mode: 'HARD', minItemLevel: 1580, activeGold: 4000, boundGold: 0 },
    ]
  },
  // Akkan 瘟疫
  {
    nameEn: 'Akkan',
    nameZh: '瘟疫',
    type: 'PLAGUE',
    maxPlayers: 8,
    requiredSupport: 2,
    requiredDps: 6,
    totalGates: 3,
    goldCapItemLevel: 1680,
    gates: [
      // Solo mode
      { gate: 1, mode: 'SOLO', minItemLevel: 1580, activeGold: 0, boundGold: 1200, soloCoin: 150 },
      { gate: 2, mode: 'SOLO', minItemLevel: 1580, activeGold: 0, boundGold: 2000, soloCoin: 200 },
      { gate: 3, mode: 'SOLO', minItemLevel: 1580, activeGold: 0, boundGold: 3600, soloCoin: 400 },
      // Normal mode
      { gate: 1, mode: 'NORMAL', minItemLevel: 1580, activeGold: 1500, boundGold: 0 },
      { gate: 2, mode: 'NORMAL', minItemLevel: 1580, activeGold: 2500, boundGold: 0 },
      { gate: 3, mode: 'NORMAL', minItemLevel: 1580, activeGold: 4500, boundGold: 0 },
      // Hard mode
      { gate: 1, mode: 'HARD', minItemLevel: 1600, activeGold: 2000, boundGold: 0 },
      { gate: 2, mode: 'HARD', minItemLevel: 1600, activeGold: 3000, boundGold: 0 },
      { gate: 3, mode: 'HARD', minItemLevel: 1600, activeGold: 7000, boundGold: 0 },
    ]
  },
  // Ivory Tower 象牙塔
  {
    nameEn: 'Ivory Tower',
    nameZh: '象牙塔',
    type: 'IVORY_TOWER',
    maxPlayers: 4,
    requiredSupport: 1,
    requiredDps: 3,
    totalGates: 3,
    goldCapItemLevel: 1660,
    gates: [
      // Solo mode
      { gate: 1, mode: 'SOLO', minItemLevel: 1540, activeGold: 0, boundGold: 1200, soloCoin: 200 },
      { gate: 2, mode: 'SOLO', minItemLevel: 1540, activeGold: 0, boundGold: 2000, soloCoin: 250 },
      { gate: 3, mode: 'SOLO', minItemLevel: 1540, activeGold: 0, boundGold: 4000, soloCoin: 450 },
      // Normal mode
      { gate: 1, mode: 'NORMAL', minItemLevel: 1540, activeGold: 1500, boundGold: 0 },
      { gate: 2, mode: 'NORMAL', minItemLevel: 1540, activeGold: 2500, boundGold: 0 },
      { gate: 3, mode: 'NORMAL', minItemLevel: 1540, activeGold: 5000, boundGold: 0 },
      // Hard mode
      { gate: 1, mode: 'HARD', minItemLevel: 1580, activeGold: 2000, boundGold: 0 },
      { gate: 2, mode: 'HARD', minItemLevel: 1580, activeGold: 3500, boundGold: 0 },
      { gate: 3, mode: 'HARD', minItemLevel: 1580, activeGold: 9500, boundGold: 0 },
    ]
  },
  // Thaemine 卡門
  {
    nameEn: 'Thaemine',
    nameZh: '卡門',
    type: 'CELESTIAL',
    maxPlayers: 8,
    requiredSupport: 2,
    requiredDps: 6,
    totalGates: 4,
    goldCapItemLevel: 1620,
    gates: [
      // Solo mode (only 3 gates)
      { gate: 1, mode: 'SOLO', minItemLevel: 1490, activeGold: 0, boundGold: 2800, soloCoin: 250 },
      { gate: 2, mode: 'SOLO', minItemLevel: 1490, activeGold: 0, boundGold: 3200, soloCoin: 300 },
      { gate: 3, mode: 'SOLO', minItemLevel: 1490, activeGold: 0, boundGold: 4400, soloCoin: 500 },
      // Normal mode (only 3 gates)
      { gate: 1, mode: 'NORMAL', minItemLevel: 1490, activeGold: 3500, boundGold: 0 },
      { gate: 2, mode: 'NORMAL', minItemLevel: 1490, activeGold: 4000, boundGold: 0 },
      { gate: 3, mode: 'NORMAL', minItemLevel: 1490, activeGold: 5500, boundGold: 0 },
      // Hard mode (all 4 gates)
      { gate: 1, mode: 'HARD', minItemLevel: 1540, activeGold: 5000, boundGold: 0 },
      { gate: 2, mode: 'HARD', minItemLevel: 1540, activeGold: 6000, boundGold: 0 },
      { gate: 3, mode: 'HARD', minItemLevel: 1540, activeGold: 9000, boundGold: 0 },
      { gate: 4, mode: 'HARD', minItemLevel: 1620, activeGold: 23000, boundGold: 0 },
    ]
  },
  // Echidna 初魅
  {
    nameEn: 'Echidna',
    nameZh: '初魅',
    type: 'CELESTIAL',
    maxPlayers: 8,
    requiredSupport: 2,
    requiredDps: 6,
    totalGates: 2,
    goldCapItemLevel: null, // 還沒限制
    gates: [
      // Solo mode not available yet
      // Normal mode
      { gate: 1, mode: 'NORMAL', minItemLevel: 1540, activeGold: 5000, boundGold: 0 },
      { gate: 2, mode: 'NORMAL', minItemLevel: 1540, activeGold: 10000, boundGold: 0 },
      // Hard mode
      { gate: 1, mode: 'HARD', minItemLevel: 1580, activeGold: 8000, boundGold: 0 },
      { gate: 2, mode: 'HARD', minItemLevel: 1580, activeGold: 14000, boundGold: 0 },
    ]
  },
]

async function seedRaids() {
  console.log('開始插入Lost Ark副本數據...')

  for (const raid of raidsData) {
    console.log(`\n處理副本: ${raid.nameZh} (${raid.nameEn})`)

    // 為每個模式創建一個raid記錄
    const modes = Array.from(new Set(raid.gates.map(g => g.mode)))

    for (const mode of modes) {
      const gatesForMode = raid.gates.filter(g => g.mode === mode)
      const firstGate = gatesForMode[0]

      // 構建副本名稱
      const modeName = mode === 'SOLO' ? '單人' : mode === 'NORMAL' ? '普通' : '困難'
      const raidName = `${raid.nameZh} ${modeName}`

      // 計算總獎勵
      const totalActiveGold = gatesForMode.reduce((sum, g) => sum + g.activeGold, 0)
      const totalBoundGold = gatesForMode.reduce((sum, g) => sum + g.boundGold, 0)

      // 插入raid記錄
      const { data: raidData, error: raidError } = await supabase
        .from('raids')
        .insert({
          name: raidName,
          type: raid.type,
          mode: mode,
          gate: `1-${gatesForMode.length}`,
          scheduled_time: new Date().toISOString(), // 默認時間，實際使用時會更新
          min_item_level: firstGate.minItemLevel,
          max_players: raid.maxPlayers,
          required_dps: raid.requiredDps,
          required_support: raid.requiredSupport,
          active_gold_reward: totalActiveGold,
          bound_gold_reward: totalBoundGold,
          notes: `${raid.nameEn} | 金幣上限裝等: ${raid.goldCapItemLevel || '無限制'}`,
        })
        .select()
        .single()

      if (raidError) {
        console.error(`  ❌ 插入失敗 (${raidName}):`, raidError.message)
      } else {
        console.log(`  ✓ ${raidName} - 總計: ${totalActiveGold}活金 + ${totalBoundGold}綁定金`)
      }
    }
  }

  console.log('\n✅ 所有副本數據插入完成！')
}

// 執行seed
seedRaids().catch(console.error)
