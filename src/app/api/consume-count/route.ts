import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "認証が必要です", consumed: false },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, monthly_count, monthly_limit, extra_count")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "プロフィール取得失敗", consumed: false },
        { status: 500 }
      );
    }

    // admin は常に消費なしでOK
    if (profile.role === "admin") {
      return NextResponse.json({ consumed: false, ok: true });
    }

    const currentCount = profile.monthly_count ?? 0;
    const monthlyLimit = profile.monthly_limit ?? 0;
    const extraCount = profile.extra_count ?? 0;
    const remaining = monthlyLimit - currentCount + extraCount;

    if (remaining <= 0) {
      return NextResponse.json(
        { error: "上限到達", consumed: false, ok: false },
        { status: 429 }
      );
    }

    // カウント消費: monthly_limitを超えた分はextra_countから引く
    const monthlyRemaining = monthlyLimit - currentCount;
    const updateFields: Record<string, number> = {
      monthly_count: currentCount + 1,
    };
    if (monthlyRemaining <= 0 && extraCount > 0) {
      updateFields.extra_count = extraCount - 1;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateFields)
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "カウント更新失敗", consumed: false },
        { status: 500 }
      );
    }

    await supabase.from("usage_logs").insert({
      user_id: user.id,
      action: "session_start",
      count_used: 1,
    });

    return NextResponse.json({ consumed: true, ok: true });
  } catch (e) {
    console.error("consume-count error:", e);
    return NextResponse.json(
      { error: "サーバーエラー", consumed: false },
      { status: 500 }
    );
  }
}
