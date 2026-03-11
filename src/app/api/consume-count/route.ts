import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  if (isAdmin) {
    return NextResponse.json({ consumed: false, reason: "admin" });
  }

  const extraCount = profile?.extra_count ?? 0;
  const currentCount = profile?.monthly_count ?? 0;
  const remainingCount =
    (profile?.monthly_limit ?? 0) - currentCount + extraCount;

  if (remainingCount <= 0) {
    return NextResponse.json(
      { error: "今月の生成件数が上限に達しました。" },
      { status: 429 }
    );
  }

  const monthlyRemaining = (profile?.monthly_limit ?? 0) - currentCount;
  const updateFields: Record<string, number> = {
    monthly_count: currentCount + 1,
  };
  if (monthlyRemaining <= 0 && extraCount > 0) {
    updateFields.extra_count = extraCount - 1;
  }

  await supabase.from("profiles").update(updateFields).eq("id", user.id);

  await supabase.from("usage_logs").insert({
    user_id: user.id,
    action: "session_start",
    count_used: 1,
  });

  return NextResponse.json({ consumed: true });
}
