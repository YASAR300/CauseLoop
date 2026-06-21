-- ============================================================
-- Migration: Winner Proof Upload and Verification Workflow
-- Description: Add rejection_reason column and configure
--              database policies for winner proof verification
-- ============================================================

BEGIN;

-- Add rejection_reason column to winners table
ALTER TABLE winners 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT 
CHECK (
  rejection_reason IS NULL OR 
  (LENGTH(TRIM(rejection_reason)) >= 10 AND LENGTH(rejection_reason) <= 1000)
);

-- Add column comment
COMMENT ON COLUMN winners.rejection_reason IS 
  'Admin-provided reason for rejection. Must be 10-1000 chars if not NULL.';

-- Create index on verification_status for pending records
CREATE INDEX IF NOT EXISTS idx_winners_verification_pending 
ON winners(verification_status) 
WHERE verification_status = 'pending';

-- --------------------------------------------------------
-- RLS policies for winner proof uploads
-- Users can update proof_image_url on their own winner records
-- --------------------------------------------------------

-- Drop existing conflicting update policies on winners
DROP POLICY IF EXISTS "winners: admin update" ON winners;
DROP POLICY IF EXISTS "Users can upload proof" ON winners;
DROP POLICY IF EXISTS "Admins can update verification status" ON winners;

-- Users can update their own winner record (to set proof_image_url)
CREATE POLICY "Users can upload proof"
ON winners FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- --------------------------------------------------------
-- RLS policy for admin verification and payment actions
-- Admins (role='admin' in profiles) can update verification_status,
-- rejection_reason, and payment_status
-- --------------------------------------------------------

CREATE POLICY "Admins can update verification status"
ON winners FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

COMMIT;
