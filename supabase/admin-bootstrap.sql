-- Run this after creating the admin account through the app or Supabase Auth.
-- Replace the email with the admin email you used.

update public.profiles
set role = 'admin',
    status = 'active',
    updated_at = now()
where email = 'joetech.dev.systems@gmail.com';

select id, email, full_name, role, status
from public.profiles
where email = 'joetech.dev.systems@gmail.com';
