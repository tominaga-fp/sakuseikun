import { createClient } from "@/lib/supabase-server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

async function verifyAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const PAID_PLANS = ["annual_50", "monthly_3", "monthly_1", "yearly"];

export async function POST(request: Request) {
  const adminSupabase = await verifyAdmin();
  if (!adminSupabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, body, target_user_id, paid_only } = await request.json();
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "タイトルと本文は必須です" }, { status: 400 });
  }

  // 有料ユーザーのみ: 個別レコードをまとめてinsert
  if (paid_only) {
    const { data: paidUsers } = await adminSupabase
      .from("profiles")
      .select("id")
      .in("plan_type", PAID_PLANS);

    if (!paidUsers || paidUsers.length === 0) {
      return NextResponse.json({ error: "有料ユーザーが見つかりません" }, { status: 400 });
    }

    const inserts = paidUsers.map(u => ({
      title: title.trim(),
      body: body.trim(),
      target_user_id: u.id,
    }));

    const { error } = await adminSupabase.from("notifications").insert(inserts);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ count: paidUsers.length });
  }

  const { data, error } = await adminSupabase
    .from("notifications")
    .insert({ title: title.trim(), body: body.trim(), target_user_id: target_user_id || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function GET() {
  const adminSupabase = await verifyAdmin();
  if (!adminSupabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await adminSupabase
    .from("notifications")
    .select("*, target_user:profiles!notifications_target_user_id_fkey(email)")
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json(data ?? []);
}

export async function DELETE(request: Request) {
  const adminSupabase = await verifyAdmin();
  if (!adminSupabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  await adminSupabase.from("notifications").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
