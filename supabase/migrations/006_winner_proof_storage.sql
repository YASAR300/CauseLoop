-- ============================================================
-- Migration: 006_winner_proof_storage.sql
-- CauseLoop — Storage configuration for winner proof uploads
-- ============================================================

BEGIN;

-- 1. Register the storage bucket for winner proofs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'winner-proofs',
  'winner-proofs',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated read on winner-proofs" ON storage.objects;
DROP POLICY IF EXISTS "Allow winner to upload proof" ON storage.objects;
DROP POLICY IF EXISTS "Allow winner to update proof" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin full access to winner-proofs" ON storage.objects;

-- 3. Select policy: authenticated users can read proof images
CREATE POLICY "Allow authenticated read on winner-proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'winner-proofs');

-- 4. Insert policy: users can upload proof images only for winner records they own
CREATE POLICY "Allow winner to upload proof"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'winner-proofs' AND
  split_part(name, '/', 1) ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AND
  (split_part(name, '/', 1))::uuid IN (
    SELECT id FROM public.winners
    WHERE user_id = auth.uid()
  )
);

-- 5. Update policy: users can edit/overwrite their uploaded proofs
CREATE POLICY "Allow winner to update proof"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'winner-proofs' AND
  split_part(name, '/', 1) ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AND
  (split_part(name, '/', 1))::uuid IN (
    SELECT id FROM public.winners
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'winner-proofs' AND
  split_part(name, '/', 1) ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' AND
  (split_part(name, '/', 1))::uuid IN (
    SELECT id FROM public.winners
    WHERE user_id = auth.uid()
  )
);

-- 6. Admin full access policy: admins can select/insert/update/delete any proof
CREATE POLICY "Allow admin full access to winner-proofs"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'winner-proofs' AND
  public.is_admin()
)
WITH CHECK (
  bucket_id = 'winner-proofs' AND
  public.is_admin()
);

COMMIT;
