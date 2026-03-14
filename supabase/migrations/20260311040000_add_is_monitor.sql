-- profilesテーブルにis_monitorカラムを追加
-- is_monitor=true のユーザーは件数制限なし（無制限利用可能）
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_monitor BOOLEAN NOT NULL DEFAULT false;
