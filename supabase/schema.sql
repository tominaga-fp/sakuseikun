-- ============================================
-- 補助金計画書さくせいくん - Supabase テーブル設計
-- ============================================

-- 1. profiles テーブル（ユーザー情報）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'agent')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  monthly_count INTEGER NOT NULL DEFAULT 0,
  monthly_limit INTEGER NOT NULL DEFAULT 1,
  count_reset_at TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  agent_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. plan_documents テーブル（計画書）
CREATE TABLE plan_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  business_type TEXT NOT NULL DEFAULT '',
  content JSONB NOT NULL DEFAULT '{}',
  generated_text TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. usage_logs テーブル（利用ログ）
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  count_used INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. agent_rewards テーブル（代理店報酬）
CREATE TABLE agent_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_amount INTEGER NOT NULL DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- インデックス
-- ============================================
CREATE INDEX idx_plan_documents_user_id ON plan_documents(user_id);
CREATE INDEX idx_plan_documents_status ON plan_documents(status);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX idx_agent_rewards_agent_id ON agent_rewards(agent_id);
CREATE INDEX idx_profiles_agent_code ON profiles(agent_code) WHERE agent_code IS NOT NULL;
CREATE INDEX idx_profiles_referred_by ON profiles(referred_by) WHERE referred_by IS NOT NULL;

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_rewards ENABLE ROW LEVEL SECURITY;

-- profiles ポリシー
CREATE POLICY "ユーザーは自分のプロフィールを閲覧可能"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "管理者は全プロフィールを閲覧可能"
  ON profiles FOR SELECT
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "管理者は全プロフィールを更新可能"
  ON profiles FOR UPDATE
  USING (
    (auth.jwt() ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "ユーザーは自分のプロフィールを更新可能"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- plan_documents ポリシー
CREATE POLICY "ユーザーは自分の計画書を閲覧可能"
  ON plan_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは計画書を作成可能"
  ON plan_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分の計画書を更新可能"
  ON plan_documents FOR UPDATE
  USING (auth.uid() = user_id);

-- usage_logs ポリシー
CREATE POLICY "ユーザーは自分のログを閲覧可能"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ユーザーはログを作成可能"
  ON usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- agent_rewards ポリシー
CREATE POLICY "代理店は自分の報酬を閲覧可能"
  ON agent_rewards FOR SELECT
  USING (auth.uid() = agent_id);

CREATE POLICY "管理者は全報酬を閲覧可能"
  ON agent_rewards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- トリガー: 新規ユーザー登録時にプロフィール自動作成
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  referral TEXT;
  agent_id UUID;
BEGIN
  referral := NEW.raw_user_meta_data->>'referral_code';

  -- 紹介コードがあれば代理店IDを取得
  IF referral IS NOT NULL AND referral != '' THEN
    SELECT id INTO agent_id FROM profiles WHERE agent_code = referral;
  END IF;

  INSERT INTO public.profiles (id, email, referred_by)
  VALUES (NEW.id, NEW.email, agent_id);

  -- 紹介元がある場合、報酬レコードを作成
  IF agent_id IS NOT NULL THEN
    INSERT INTO public.agent_rewards (agent_id, referred_user_id, reward_amount)
    VALUES (agent_id, NEW.id, 1000);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- トリガー: updated_at 自動更新
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER plan_documents_updated_at
  BEFORE UPDATE ON plan_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
