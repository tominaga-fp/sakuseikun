import { createClient } from "@/lib/supabase-server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import AffiliatePanel from "./AffiliatePanel";

export default async function AffiliatesPage() {
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

  const adminSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // アフィリエイト紹介一覧（紹介者・被紹介者プロフィール付き）
  const { data: affiliates } = await adminSupabase
    .from("affiliates")
    .select("*, affiliate_user:profiles!affiliates_affiliate_user_id_fkey(id, email, last_name, first_name), referred_user:profiles!affiliates_referred_user_id_fkey(id, email, last_name, first_name)")
    .order("created_at", { ascending: false });

  // 報酬明細（紹介者・被紹介者プロフィール付き）
  const { data: payments } = await adminSupabase
    .from("affiliate_payments")
    .select("*, affiliate_user:profiles!affiliate_payments_affiliate_user_id_fkey(id, email, last_name, first_name), referred_user:profiles!affiliate_payments_referred_user_id_fkey(id, email, last_name, first_name)")
    .order("payment_date", { ascending: false });

  return (
    <div className="min-h-screen">
      <Header profile={profile} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <a href="/admin" className="text-sm text-gray-500 hover:text-shu">&larr; 管理画面に戻る</a>
          <h1 className="text-2xl font-bold">アフィリエイト管理</h1>
        </div>
        <AffiliatePanel
          affiliates={affiliates ?? []}
          payments={payments ?? []}
        />
      </main>
    </div>
  );
}
