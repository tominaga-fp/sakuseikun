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
      .select("role, monthly_count, monthly_limit, extra_count, is_monitor")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "プロフィール取得失敗", consumed: false },
        { status: 500 }
      );
    }

    // admin・is_monitor は常に消費なしでOK
    if (profile.role === "admin" || profile.is_monitor) {
      return NextResponse.json({ consumed: false, ok: true });
    }

    // 残り件数 = monthly_limit - monthly_count + extra_count
    const remaining = (profile.monthly_limit ?? 1) - (profile.monthly_count ?? 0) + (profile.extra_count ?? 0);

    if (remaining <= 0) {
      return NextResponse.json(
        { error: "上限到達", consumed: false, ok: false },
        { status: 429 }
      );
    }

    // extra_count > 0 ならextra_countから消費、そうでなければmonthly_countを+1
    const extraCount = profile.extra_count ?? 0;
    const monthlyCount = profile.monthly_count ?? 0;
    const updateData = extraCount > 0
      ? { extra_count: extraCount - 1 }
      : { monthly_count: monthlyCount + 1 };

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
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
