export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: "user" | "admin" | "agent";
  is_active: boolean;
  monthly_count: number;
  monthly_limit: number;
  extra_count: number;
  plan_type: "free" | "monthly_1" | "monthly_3" | "yearly";
  count_reset_at: string;
  agent_code: string | null;
  referred_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanDocument {
  id: string;
  user_id: string;
  title: string;
  business_type: string;
  content: Record<string, string>;
  generated_text: string | null;
  status: "draft" | "generating" | "completed";
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  action: string;
  count_used: number;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string | null;
  messages: { role: "user" | "assistant"; content: string }[];
  section_contents: Record<string, string>;
  scores: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AgentReward {
  id: string;
  agent_id: string;
  referred_user_id: string;
  reward_amount: number;
  is_paid: boolean;
  created_at: string;
}
