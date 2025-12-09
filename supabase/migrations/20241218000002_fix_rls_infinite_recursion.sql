-- Fix infinite recursion in user_profiles RLS policy
-- The "Admins can view all profiles" policy was querying user_profiles
-- within the RLS policy for user_profiles, causing infinite recursion

-- Drop the problematic policy
drop policy if exists "Admins can view all profiles" on public.user_profiles;

-- Create a function to check if user is admin (bypasses RLS)
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
    and role = 'ADMIN'
  );
end;
$$;

-- Recreate the admin policy using the function
create policy "Admins can view all profiles" on public.user_profiles
  for select using (public.is_admin());

-- Grant execute permission to authenticated users
grant execute on function public.is_admin() to authenticated;
