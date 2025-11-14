-- Secure Role Management Enhancement
-- This migration addresses security vulnerabilities in role assignment

-- First, add new role types to support expanded RBAC
ALTER TABLE public.users 
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('doctor', 'nurse', 'admin', 'lab_technician', 'pharmacist', 'receptionist'));

-- Create a table to track role change requests and invitations
CREATE TABLE IF NOT EXISTS public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  invited_role TEXT NOT NULL CHECK (invited_role IN ('doctor', 'nurse', 'lab_technician', 'pharmacist', 'receptionist')),
  invited_by_id UUID NOT NULL REFERENCES public.users(id),
  invitation_token UUID DEFAULT gen_random_uuid() UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by_id UUID REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, expired, revoked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Only admins can view invitations
CREATE POLICY "user_invitations_select" ON public.user_invitations 
  FOR SELECT USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Only admins can create invitations
CREATE POLICY "user_invitations_insert" ON public.user_invitations 
  FOR INSERT WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Only admins can update invitations
CREATE POLICY "user_invitations_update" ON public.user_invitations 
  FOR UPDATE USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE INDEX idx_user_invitations_email ON public.user_invitations(email);
CREATE INDEX idx_user_invitations_token ON public.user_invitations(invitation_token);
CREATE INDEX idx_user_invitations_status ON public.user_invitations(status);

-- Create role change audit table
CREATE TABLE IF NOT EXISTS public.role_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  old_role TEXT NOT NULL,
  new_role TEXT NOT NULL,
  changed_by_id UUID NOT NULL REFERENCES public.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.role_changes ENABLE ROW LEVEL SECURITY;

-- Only admins can view role changes
CREATE POLICY "role_changes_select" ON public.role_changes 
  FOR SELECT USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Only admins can record role changes
CREATE POLICY "role_changes_insert" ON public.role_changes 
  FOR INSERT WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE INDEX idx_role_changes_user ON public.role_changes(user_id);
CREATE INDEX idx_role_changes_created_at ON public.role_changes(created_at DESC);

-- Update the handle_new_user function to prevent admin role self-assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  invitation_record RECORD;
BEGIN
  -- Check if there's a valid invitation for this email
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE email = new.email
    AND status = 'pending'
    AND expires_at > NOW()
  LIMIT 1;

  -- If invitation exists, use the invited role
  -- Otherwise, default to 'doctor' (never allow 'admin' from signup)
  IF invitation_record IS NOT NULL THEN
    user_role := invitation_record.invited_role;
    
    -- Mark invitation as accepted
    UPDATE public.user_invitations
    SET status = 'accepted',
        accepted_at = NOW(),
        accepted_by_id = new.id,
        updated_at = NOW()
    WHERE id = invitation_record.id;
  ELSE
    -- Default to doctor role, ignore any role from metadata
    -- Admin role can ONLY be assigned through invitation or by existing admin
    user_role := 'doctor';
  END IF;

  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', 'New User'),
    user_role
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Function to change user role (only callable by admins)
CREATE OR REPLACE FUNCTION public.change_user_role(
  target_user_id UUID,
  new_role TEXT,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role TEXT;
  target_user_old_role TEXT;
  operation_user_id UUID;
BEGIN
  -- Get the current user's ID
  operation_user_id := auth.uid();
  
  -- Get the role of the user making the change
  SELECT role INTO current_user_role
  FROM public.users
  WHERE id = operation_user_id;
  
  -- Only admins can change roles
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can change user roles';
  END IF;
  
  -- Get the target user's current role
  SELECT role INTO target_user_old_role
  FROM public.users
  WHERE id = target_user_id;
  
  IF target_user_old_role IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Validate the new role
  IF new_role NOT IN ('doctor', 'nurse', 'admin', 'lab_technician', 'pharmacist', 'receptionist') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;
  
  -- Prevent changing your own role
  IF target_user_id = operation_user_id THEN
    RAISE EXCEPTION 'Cannot change your own role';
  END IF;
  
  -- Update the user's role
  UPDATE public.users
  SET role = new_role,
      updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Record the role change in audit log
  INSERT INTO public.role_changes (user_id, old_role, new_role, changed_by_id, reason)
  VALUES (target_user_id, target_user_old_role, new_role, operation_user_id, reason);
  
  RETURN TRUE;
END;
$$;

-- Add RLS policy to prevent users from changing their own role via direct update
DROP POLICY IF EXISTS "users_update_own" ON public.users;

CREATE POLICY "users_update_own" ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (
      -- Users can update their own profile but not their role
      role = (SELECT role FROM public.users WHERE id = auth.uid())
      OR
      -- Unless they are admin (handled separately)
      (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    )
  );

-- Add policy for admins to update other users
CREATE POLICY "users_update_admin" ON public.users 
  FOR UPDATE 
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
