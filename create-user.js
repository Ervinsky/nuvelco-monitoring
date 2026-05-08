// Script to create a test user in Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fxoaqhunismtqaaetdjk.supabase.co'
const supabaseKey = 'sb_publishable_5WavWfbZcfFxSiQWomw8_w_GeZpjV-r'
const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUser() {
  console.log('Creating test user...')
  
  try {
    // Sign up a new user
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@nuvelco.com',
      password: 'admin123',
      options: {
        data: {
          name: 'Admin User',
          role: 'admin'
        }
      }
    })

    if (error) {
      console.error('Error creating user:', error.message)
      return
    }

    console.log('User created successfully!')
    console.log('User ID:', data.user?.id)
    console.log('Email:', data.user?.email)
    console.log('Session:', data.session ? 'Active (email confirmation disabled)' : 'Pending (email confirmation required)')
    
    if (!data.session) {
      console.log('\n⚠️  Email confirmation is required!')
      console.log('To fix this:')
      console.log('1. Go to Supabase Dashboard > Authentication > Settings')
      console.log('2. Turn OFF "Enable email confirmations"')
      console.log('3. Run this script again or sign up through the app')
    } else {
      console.log('\n✅ You can now log in with:')
      console.log('   Email: admin@nuvelco.com')
      console.log('   Password: admin123')
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

createTestUser()
