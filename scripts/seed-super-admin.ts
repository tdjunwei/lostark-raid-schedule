import dotenv from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少必要的環境變數')
  console.error(`
請確保 .env.local 文件包含以下變數：
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY

當前值：
  - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl || '未設置'}
  - SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '已設置' : '未設置'}
  `)
  process.exit(1)
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

interface SuperAdminConfig {
  email: string
  password: string
  name: string
}

const SUPER_ADMIN: SuperAdminConfig = {
  email: 'tdjunwei@gmail.com',
  password: 'QZb]BQV]em%3',
  name: 'Super Admin',
}

async function createSuperAdmin() {
  console.log('開始創建Super Admin用戶...\n')

  try {
    // Check if user already exists in auth.users
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('❌ 檢查現有用戶時出錯:', listError.message)
      process.exit(1)
    }

    const existingUser = existingUsers?.users.find(u => u.email === SUPER_ADMIN.email)

    let userId: string

    if (existingUser) {
      console.log(`ℹ️  用戶 ${SUPER_ADMIN.email} 已存在於 auth.users`)
      userId = existingUser.id

      // Update password if user exists
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: SUPER_ADMIN.password,
        email_confirm: true,
      })

      if (updateError) {
        console.error('❌ 更新用戶密碼時出錯:', updateError.message)
        process.exit(1)
      }

      console.log('✓ 已更新用戶密碼')
    } else {
      // Create new user in auth.users
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: SUPER_ADMIN.email,
        password: SUPER_ADMIN.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: SUPER_ADMIN.name,
        },
      })

      if (createError || !newUser.user) {
        console.error('❌ 創建用戶時出錯:', createError?.message)
        process.exit(1)
      }

      userId = newUser.user.id
      console.log(`✓ 已創建用戶 ${SUPER_ADMIN.email} (ID: ${userId})`)
    }

    // Check if user_profile exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('id, role')
      .eq('id', userId)
      .single()

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('❌ 檢查用戶資料時出錯:', profileCheckError.message)
      process.exit(1)
    }

    if (existingProfile) {
      // Update existing profile to SUPER_ADMIN
      if (existingProfile.role === 'SUPER_ADMIN') {
        console.log(`ℹ️  用戶已經是 SUPER_ADMIN 角色`)
      } else {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            role: 'SUPER_ADMIN',
            name: SUPER_ADMIN.name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (updateError) {
          console.error('❌ 更新用戶資料時出錯:', updateError.message)
          process.exit(1)
        }

        console.log(`✓ 已將用戶角色從 ${existingProfile.role} 更新為 SUPER_ADMIN`)
      }
    } else {
      // Create new user_profile with SUPER_ADMIN role
      const { error: insertError } = await supabase.from('user_profiles').insert({
        id: userId,
        email: SUPER_ADMIN.email,
        name: SUPER_ADMIN.name,
        role: 'SUPER_ADMIN',
      })

      if (insertError) {
        console.error('❌ 創建用戶資料時出錯:', insertError.message)
        process.exit(1)
      }

      console.log('✓ 已創建用戶資料並設置為 SUPER_ADMIN 角色')
    }

    // Verify the final state
    const { data: finalProfile, error: verifyError } = await supabase
      .from('user_profiles')
      .select('id, email, name, role')
      .eq('id', userId)
      .single()

    if (verifyError || !finalProfile) {
      console.error('❌ 驗證用戶資料時出錯:', verifyError?.message)
      process.exit(1)
    }

    console.log('\n✅ Super Admin 用戶創建/更新成功！')
    console.log('\n用戶資訊：')
    console.log(`  Email: ${finalProfile.email}`)
    console.log(`  Name: ${finalProfile.name}`)
    console.log(`  Role: ${finalProfile.role}`)
    console.log(`  ID: ${finalProfile.id}`)
    console.log('\n登入資訊：')
    console.log(`  Email: ${SUPER_ADMIN.email}`)
    console.log(`  Password: ${SUPER_ADMIN.password}`)
    console.log('\n⚠️  請妥善保管登入資訊，不要將密碼提交到版本控制系統！')
  } catch (error) {
    console.error('❌ 發生未預期的錯誤:', error)
    process.exit(1)
  }
}

// Run the seed
createSuperAdmin()
