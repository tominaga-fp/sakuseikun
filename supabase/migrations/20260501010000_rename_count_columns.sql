-- ============================================
-- カラム名リネーム: monthly_* → usage_*/period_*
-- 月次プランと年次プランが共存するため、"monthly"という名前をなくす
-- ============================================

-- profiles テーブル
ALTER TABLE profiles RENAME COLUMN monthly_count TO usage_count;
ALTER TABLE profiles RENAME COLUMN monthly_limit TO usage_limit;
ALTER TABLE profiles RENAME COLUMN count_reset_at TO period_reset_at;

-- pending_subscriptions テーブル
ALTER TABLE pending_subscriptions RENAME COLUMN monthly_limit TO usage_limit;
