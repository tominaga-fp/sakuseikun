import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import PlanBuilder from "./PlanBuilder";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  console.log("user.id:", user.id, "profile:", profile, "error:", error);

  if (!profile) {
    return (
      <div className="min-h-screen">
        <Header profile={null} />
        <div className="max-w-2xl mx-auto mt-20 text-center card-washi">
          <h2 className="text-xl font-bold mb-2">プロフィール未設定</h2>
          <p className="text-gray-600">
            プロフィールが見つかりません。管理者にお問い合わせください。
          </p>
        </div>
      </div>
    );
  }

  const { data: plans } = await supabase
    .from("plan_documents")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="min-h-screen">
      <Header profile={profile} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <PlanBuilder profile={profile} existingPlans={plans ?? []} />
      </main>
    </div>
  );
}
