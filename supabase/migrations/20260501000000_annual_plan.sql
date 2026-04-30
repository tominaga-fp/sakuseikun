-- ============================================
-- 2026-05-01 有料化移行スクリプト
-- Supabase SQL Editor で実行すること
-- ============================================

-- 1. 有料会員4名を annual_50 プランに設定
--    年間50件 / count_reset_at = 翌年5/1
UPDATE profiles SET
  plan_type        = 'annual_50',
  monthly_limit    = 50,
  monthly_count    = 0,
  extra_count      = 0,
  count_reset_at   = '2027-05-01 00:00:00+09:00',
  is_active        = true
WHERE email IN (
  'hisakun623@gmail.com',
  'mail@nannoshinichiro.com',
  'prime0622@clock.ocn.ne.jp',
  'boss@hassin.net'
);

-- 確認: 4件になっているはず
SELECT email, plan_type, monthly_limit, monthly_count, count_reset_at
FROM profiles
WHERE email IN (
  'hisakun623@gmail.com',
  'mail@nannoshinichiro.com',
  'prime0622@clock.ocn.ne.jp',
  'boss@hassin.net'
);

-- 2. その他全員: カウントリセット + 制限0（使えなくする）
--    is_active = true のまま（ログインは可能）
--    データ（計画書・チャット履歴）は削除しない
UPDATE profiles SET
  monthly_count  = 0,
  monthly_limit  = 0,
  extra_count    = 0
WHERE email NOT IN (
  'hisakun623@gmail.com',
  'mail@nannoshinichiro.com',
  'prime0622@clock.ocn.ne.jp',
  'boss@hassin.net'
)
AND role != 'admin';

-- 確認: 対象外ユーザーの件数
SELECT COUNT(*), plan_type
FROM profiles
WHERE email NOT IN (
  'hisakun623@gmail.com',
  'mail@nannoshinichiro.com',
  'prime0622@clock.ocn.ne.jp',
  'boss@hassin.net'
)
AND role != 'admin'
GROUP BY plan_type;
