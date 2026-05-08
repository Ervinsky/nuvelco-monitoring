-- =====================================================
-- Create Test User for NUVELCO System
-- Run this in Supabase SQL Editor
-- =====================================================

-- Note: Supabase doesn't allow direct password insertion via SQL
-- You need to either:
-- 1. Disable email confirmation in Supabase Dashboard (Authentication > Settings)
-- 2. Use the signup form on the login page
-- 3. Create user via Supabase Dashboard (Authentication > Users > Add User)

-- After creating the auth user, this will ensure the profile exists:
INSERT INTO users (id, name, role)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', 'Test Admin'),
  COALESCE(raw_user_meta_data->>'role', 'admin')
FROM auth.users
WHERE email = 'admin@nuvelco.com'
ON CONFLICT (id) DO NOTHING;

-- To check existing users:
SELECT * FROM auth.users;
SELECT * FROM users;
