import { createClient } from "@/lib/supabase-server";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "../../../../prompts/system_prompt";

// Vercel Serverless Function のタイムアウト設定（秒）
// Hobby: 最大60秒, Pro: 最大300秒
export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

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

  // 都度決済プラン(free/basic)はリセット対象外、継続サブスクプランのみリセット
  const planType = profile.plan_type ?? "free";
  const isSubscriptionPlan = planType !== "free" && planType !== "basic";

  if (now >= resetAt && isSubscriptionPlan) {
    const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    await supabase
      .from("profiles")
      .update({ monthly_count: 0, count_reset_at: nextReset.toISOString() })
      .eq("id", user.id);
    currentCount = 0;
  }

  const extraCount = profile.extra_count ?? 0;
  const remainingCount = (profile.monthly_limit - currentCount) + extraCount;

  if (remainingCount <= 0 && !isAdmin) {
    return NextResponse.json(
      { error: "今月の生成件数が上限に達しました。追加購入はこちら →" },
      { status: 429 }
    );
  }

  const { messages, type = "chat" } = (await request.json()) as { messages: ChatMessage[]; type?: "chat" | "draft" };

  try {
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    // カウント増加・ログ記録はストリーム完了後にバックグラウンドで実行
    // type='draft' の時のみカウント消費する
    const bgPromises: PromiseLike<unknown>[] = [];

    if (type === "draft") {
      const monthlyRemaining = profile.monthly_limit - currentCount;
      const updateFields: Record<string, number> = { monthly_count: currentCount + 1 };
      if (monthlyRemaining <= 0 && extraCount > 0) {
        updateFields.extra_count = extraCount - 1;
      }
      bgPromises.push(
        supabase
          .from("profiles")
          .update(updateFields)
          .eq("id", user.id),
      );
    }

    bgPromises.push(
      supabase.from("usage_logs").insert({
        user_id: user.id,
        action: type === "draft" ? "draft_generation" : "chat_message",
        count_used: type === "draft" ? 1 : 0,
      }),
    );

    const backgroundTasks = Promise.all(bgPromises);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        // ストリーム完了後にバックグラウンドタスクを待つ
        await backgroundTasks;
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: "生成に失敗しました" },
      { status: 500 }
    );
  }
}
