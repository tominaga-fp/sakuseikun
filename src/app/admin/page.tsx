import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import AdminPanel from "./AdminPanel";

export default async function AdminPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: agents } = await supabase
    .from("profiles")
    .select("*, referred_users:profiles!profiles_referred_by_fkey(id, email, created_at)")
    .eq("role", "agent");

  const { data: rewards } = await supabase
    .from("agent_rewards")
    .select("*, agent:profiles!agent_rewards_agent_id_fkey(email, display_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen">
      <Header profile={profile} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">管理者画面</h1>
        <AdminPanel
          users={users ?? []}
          agents={agents ?? []}
          rewards={rewards ?? []}
        />
      </main>
    </div>
  );
}
