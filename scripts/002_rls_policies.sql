-- ============================================================
-- 002_rls_policies.sql
-- Row Level Security ポリシー設定
-- ============================================================

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- イベント参加者はお互いのプロフィールを閲覧できる
CREATE POLICY "profiles_select_member" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_members em1
      JOIN event_members em2 ON em1.event_id = em2.event_id
      WHERE em1.user_id = auth.uid() AND em2.user_id = profiles.id
    )
  );

-- events: 参加者のみ閲覧可能
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_member" ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_members
      WHERE event_id = events.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "events_insert" ON events
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "events_update_owner" ON events
  FOR UPDATE USING (auth.uid() = created_by);

-- 招待コードでイベントを検索できる（未参加でも）
CREATE POLICY "events_select_by_invite" ON events
  FOR SELECT USING (invite_code IS NOT NULL);

-- event_members
ALTER TABLE event_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select" ON event_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_members em
      WHERE em.event_id = event_members.event_id AND em.user_id = auth.uid()
    )
  );

CREATE POLICY "members_insert" ON event_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "members_delete_own" ON event_members
  FOR DELETE USING (auth.uid() = user_id);

-- photos: 参加者のみ閲覧・投稿可能
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "photos_select" ON photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_members
      WHERE event_id = photos.event_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "photos_insert" ON photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM event_members
      WHERE event_id = photos.event_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "photos_delete_own" ON photos
  FOR DELETE USING (auth.uid() = user_id);
