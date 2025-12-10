-- Add SUPER_ADMIN role support
-- Note: SUPER_ADMIN enum value is added in initial_schema.sql

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'SUPER_ADMIN'
  );
$$;

-- Create function to check if user is admin or super admin
CREATE OR REPLACE FUNCTION is_admin_or_super()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  );
$$;

-- Update existing is_admin function to include super admin check
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_admin_or_super() TO authenticated, anon;

-- Add RLS policy for super admin to manage all user profiles
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON user_profiles;
CREATE POLICY "Super admins can manage all profiles"
ON user_profiles
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Add RLS policy for super admin to manage all users
DROP POLICY IF EXISTS "Super admins can view all users" ON auth.users;
CREATE POLICY "Super admins can view all users"
ON auth.users
FOR SELECT
USING (is_super_admin());

COMMENT ON FUNCTION is_super_admin() IS 'Check if the current user has SUPER_ADMIN role';
COMMENT ON FUNCTION is_admin_or_super() IS 'Check if the current user has ADMIN or SUPER_ADMIN role';
