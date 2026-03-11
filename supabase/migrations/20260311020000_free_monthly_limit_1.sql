-- 新規ユーザーのデフォルトを1に変更
ALTER TABLE profiles ALTER COLUMN monthly_limit SET DEFAULT 1;

-- 既存freeユーザーのmonthly_limitを1に修正
UPDATE profiles SET monthly_limit = 1 WHERE plan_type = 'free';
