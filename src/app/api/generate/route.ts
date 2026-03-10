import { createClient } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT, buildUserPrompt } from "../../../../prompts/system_prompt";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  // プロフィール取得・カウントチェック
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  if (!profile?.is_active && !isAdmin) {
    return NextResponse.json(
      { error: "アカウントが無効です" },
      { status: 403 }
    );
  }

  // 月次カウントリセット判定
  const now = new Date();
  const resetAt = new Date(profile.count_reset_at);
  let currentCount = profile.monthly_count;

  if (now >= resetAt) {
    const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    await supabase
      .from("profiles")
      .update({ monthly_count: 0, count_reset_at: nextReset.toISOString() })
      .eq("id", user.id);
    currentCount = 0;
  }

  if (currentCount >= profile.monthly_limit && !isAdmin) {
    return NextResponse.json(
      { error: "今月のカウント上限に達しました" },
      { status: 429 }
    );
  }

  const { formData } = await request.json();

  try {
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(formData) }],
    });

    // カウント増加
    await supabase
      .from("profiles")
      .update({ monthly_count: currentCount + 1 })
      .eq("id", user.id);

    // 利用ログ
    await supabase.from("usage_logs").insert({
      user_id: user.id,
      action: "generate_plan",
      count_used: 1,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let fullText = "";
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            fullText += text;
            controller.enqueue(encoder.encode(text));
          }
        }

        // 計画書保存
        await supabase.from("plan_documents").insert({
          user_id: user.id,
          title: formData.business_name || "無題の計画書",
          business_type: formData.business_type || "",
          content: formData,
          generated_text: fullText,
          status: "completed",
        });

        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: "計画書の生成に失敗しました" },
      { status: 500 }
    );
  }
}
