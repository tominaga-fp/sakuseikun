ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_chat_sessions_is_pinned ON chat_sessions(is_pinned);
