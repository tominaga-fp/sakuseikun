-- usage_logs にキャッシュトークンとモデル名を記録する
--
-- 背景:
-- 既存の input_tokens は Anthropic API 仕様上「キャッシュされなかった残り」のみで、
-- システムプロンプトや会話履歴はカウントに含まれない。
-- そのため実際のAPI原価を算出できなかった。
--   実際の入力総量 = input_tokens + cache_creation_input_tokens + cache_read_input_tokens
--
-- model 列は Sonnet 4.5 → Sonnet 5 移行の前後比較に使う。
-- 既存行は NULL のままとし、埋め戻しは行わない（記録開始前のため値が存在しない）。

ALTER TABLE usage_logs
  ADD COLUMN IF NOT EXISTS cache_creation_input_tokens integer,
  ADD COLUMN IF NOT EXISTS cache_read_input_tokens integer,
  ADD COLUMN IF NOT EXISTS model text;

COMMENT ON COLUMN usage_logs.input_tokens IS 'キャッシュされなかった入力トークン（新規ユーザーメッセージ分）。総入力量ではない';
COMMENT ON COLUMN usage_logs.cache_creation_input_tokens IS 'キャッシュ書き込みトークン。1時間TTLのため基本入力単価の2倍で課金';
COMMENT ON COLUMN usage_logs.cache_read_input_tokens IS 'キャッシュ読み取りトークン。基本入力単価の0.1倍で課金。長い会話ではここが原価の主因';
COMMENT ON COLUMN usage_logs.model IS 'この呼び出しで実際に使われたモデルID（APIレスポンス由来）';
