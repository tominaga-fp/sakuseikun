-- profilesに紹介コード（テキストそのまま保存）カラムを追加
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- handle_new_userトリガーを更新（referral_codeをそのまま保存）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  referral TEXT;
  agent_id UUID;
BEGIN
  referral := NEW.raw_user_meta_data->>'referral_code';

  IF referral IS NOT NULL AND referral != '' THEN
    SELECT id INTO agent_id FROM profiles WHERE agent_code = referral;
  END IF;

  INSERT INTO public.profiles (id, email, last_name, first_name, company_name, user_type, referral_code, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'company_name',
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'business'),
    referral,
    agent_id
  );

  IF agent_id IS NOT NULL THEN
    INSERT INTO public.agent_rewards (agent_id, referred_user_id, reward_amount)
    VALUES (agent_id, NEW.id, 1000);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
