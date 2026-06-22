-- ============================================================
-- Demo Accounts Setup
-- Run in Supabase SQL Editor AFTER all 3 migrations
-- ============================================================

-- Step 1: Create auth users via Supabase Dashboard
-- Go to Authentication → Users → Add user (do NOT use SQL for this)
--
-- Account 1 — Owner/Admin
--   Email:    owner@americannailsspa.com
--   Password: Demo@ANS2024!
--
-- Account 2 — Staff
--   Email:    staff@americannailsspa.com
--   Password: Staff@ANS2024!
--
-- Account 3 — Demo Customer
--   Email:    customer@demo.com
--   Password: Customer@ANS2024!

-- Step 2: After creating the users in the dashboard, run this SQL
-- to set their roles (replace the UUIDs with the actual user IDs
-- shown after creation in Authentication → Users)

-- UPDATE profiles SET role = 'owner', full_name = 'Demo Owner' WHERE id = '<owner-user-id>';
-- UPDATE profiles SET role = 'staff', full_name = 'Demo Staff' WHERE id = '<staff-user-id>';

-- Or use this if you know the emails:
UPDATE profiles
SET role = 'owner', first_name = 'Demo', last_name = 'Owner'
WHERE id = (SELECT id FROM auth.users WHERE email = 'owner@americannailsspa.com');

UPDATE profiles
SET role = 'staff', first_name = 'Demo', last_name = 'Staff'
WHERE id = (SELECT id FROM auth.users WHERE email = 'staff@americannailsspa.com');

UPDATE profiles
SET role = 'customer', first_name = 'Demo', last_name = 'Customer'
WHERE id = (SELECT id FROM auth.users WHERE email = 'customer@demo.com');
