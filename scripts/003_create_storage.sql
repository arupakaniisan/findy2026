-- ============================================================
-- 003_create_storage.sql
-- Supabase Storage 設定
-- ============================================================

-- photosバケット作成
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  false,
  52428800,  -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Storageポリシー: 認証済みユーザーのみアップロード可能
CREATE POLICY "photos_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos' AND auth.role() = 'authenticated'
  );

-- Storageポリシー: 認証済みユーザーのみ閲覧可能
CREATE POLICY "photos_download" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'photos' AND auth.role() = 'authenticated'
  );

-- Storageポリシー: 自分のファイルのみ削除可能
CREATE POLICY "photos_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]
  );
