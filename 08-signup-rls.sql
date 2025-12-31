-- Final consolidated fix for 500 on /auth/v1/signup
-- Idempotent: safe to re-run

-- 1) Ensure RLS is enabled (safe to re-assert)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- 2) Drop existing INSERT policies (only INSERT) to avoid duplicates and recreate minimal required set

-- 2a) user_profiles INSERT policies
DO $pol$
DECLARE
  pol_name text;
BEGIN
  FOR pol_name IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_profiles', pol_name);
  END LOOP;
END
$pol$;

-- Authenticated users can create their own profile
CREATE POLICY "Users can create their own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Trigger/system roles can insert (allow trigger to pass RLS)
CREATE POLICY "Trigger can create user profile (postgres)"
ON public.user_profiles
FOR INSERT
TO postgres
WITH CHECK (true);

CREATE POLICY "Trigger can create user profile (supabase_admin)"
ON public.user_profiles
FOR INSERT
TO supabase_admin
WITH CHECK (true);

CREATE POLICY "Trigger can create user profile (service_role)"
ON public.user_profiles
FOR INSERT
TO service_role
WITH CHECK (true);

-- 2b) email_preferences INSERT policies
DO $pol$
DECLARE
  pol_name text;
BEGIN
  FOR pol_name IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'email_preferences'
      AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.email_preferences', pol_name);
  END LOOP;
END
$pol$;

-- Authenticated users can create their own preferences
CREATE POLICY "Users can create their own email preferences"
ON public.email_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Trigger/system roles can insert email preferences
CREATE POLICY "Trigger can create email preferences (postgres)"
ON public.email_preferences
FOR INSERT
TO postgres
WITH CHECK (true);

CREATE POLICY "Trigger can create email preferences (supabase_admin)"
ON public.email_preferences
FOR INSERT
TO supabase_admin
WITH CHECK (true);

CREATE POLICY "Trigger can create email preferences (service_role)"
ON public.email_preferences
FOR INSERT
TO service_role
WITH CHECK (true);

-- Keep existing SELECT/UPDATE policies on email_preferences as they were defined in schema

-- 3) Harden trigger functions: SECURITY DEFINER + stable search_path + defensive exception handling

-- 3a) Email preferences function
CREATE OR REPLACE FUNCTION public.create_email_preferences_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never fail signup due to preferences insert; log and continue
    RAISE LOG 'create_email_preferences_for_new_user error for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 3b) User profile function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role text;
BEGIN
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'buyer');

  BEGIN
    INSERT INTO public.user_profiles (user_id, role, created_at, updated_at)
    VALUES (NEW.id, _role, COALESCE(NEW.created_at, now()), COALESCE(NEW.created_at, now()))
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      -- Never fail signup due to profile insert; log and continue
      RAISE LOG 'handle_new_user error for %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 4) Recreate triggers with explicit schema-qualification

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS create_email_preferences_on_user_signup ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate email preferences trigger
CREATE TRIGGER create_email_preferences_on_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_email_preferences_for_new_user();

-- Recreate user profiles trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5) Verification

-- Show current triggers on auth.users
SELECT 
  trigger_name,
  event_manipulation,
  event_object_schema,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth' AND event_object_table = 'users'
ORDER BY trigger_name;

-- Show effective policies
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('user_profiles','email_preferences')
ORDER BY tablename, policyname, cmd;