CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  target_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE notification_reads (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_id uuid NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, notification_id)
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分宛 or 全体通知のみ閲覧可
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT
  USING (target_user_id IS NULL OR target_user_id = auth.uid());

-- 管理者はすべて操作可（service roleでバイパス）
CREATE POLICY "Users can view their reads" ON notification_reads FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can mark as read" ON notification_reads FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_notifications_target ON notifications(target_user_id);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notification_reads_user ON notification_reads(user_id);
