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

// 使用モデル。切り替え時はここだけ変更する
const MODEL = "claude-sonnet-5";

// 出力上限。Sonnet 5 は新しいトークナイザーを使い、同じ日本語文章でも
// 旧モデル比で約30%多くトークンを消費するため、旧設定16,000から引き上げ
// （計画書が途中で切れるのを防ぐ。実際に使わなければ課金されない）
const MAX_TOKENS = 24000;

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

  // 有料プランのホワイトリスト（5/1有料化移行後）
  // ここにないplan_typeは全てブロック
  const planType = profile.plan_type ?? "free";
  const ALLOWED_PLANS = ["annual_50", "monthly_3", "monthly_1", "yearly"];
  if (!isAdmin && !profile.is_monitor && !ALLOWED_PLANS.includes(planType)) {
    return NextResponse.json(
      { error: "有料プランへのご登録が必要です" },
      { status: 403 }
    );
  }

  // カウントリセット判定（継続サブスクプランのみ）
  const now = new Date();
  const resetAt = new Date(profile.period_reset_at);
  const isSubscriptionPlan = planType !== "free" && planType !== "basic";
  let freshUsageCount = profile.usage_count ?? 0;

  if (now >= resetAt && isSubscriptionPlan) {
    // annual_50: 年次リセット（reset_at の1年後）、それ以外: 翌月1日
    const nextReset = planType === "annual_50"
      ? new Date(resetAt.getFullYear() + 1, resetAt.getMonth(), resetAt.getDate())
      : new Date(now.getFullYear(), now.getMonth() + 1, 1);
    await supabase
      .from("profiles")
      .update({ usage_count: 0, period_reset_at: nextReset.toISOString() })
      .eq("id", user.id);
    freshUsageCount = 0;
  }

  const { messages, turnCount: clientTurnCount } = (await request.json()) as {
    messages: ChatMessage[];
    turnCount?: number;
  };

  // 会話ターン数チェック（フロントから受け取った全体カウントを優先）
  const TURN_LIMIT = 40;
  const TURN_WARNING = 35;
  const userMessages = messages.filter((m) => m.role === "user");
  const turnCount = clientTurnCount ?? userMessages.length;

  // 新しい会話の1ターン目: カウントチェック＆消費（admin/is_monitor除く）
  if (turnCount === 1 && !isAdmin && !profile.is_monitor) {
    const usageLimit = profile.usage_limit ?? 1;
    const extraCount = profile.extra_count ?? 0;
    const remaining = usageLimit - freshUsageCount + extraCount;

    if (remaining <= 0) {
      return NextResponse.json(
        { error: "利用上限に達しました。追加購入またはプランの変更をご検討ください。" },
        { status: 429 }
      );
    }

    const updateData = extraCount > 0
      ? { extra_count: extraCount - 1 }
      : { usage_count: freshUsageCount + 1 };
    await supabase.from("profiles").update(updateData).eq("id", user.id);
  }

  if (turnCount > TURN_LIMIT) {
    return NextResponse.json(
      {
        error:
          "この会話は上限（40往復）に達しました。新しい会話を開始してください。",
      },
      { status: 429 }
    );
  }

  const remainingTurns = TURN_LIMIT - turnCount;

  try {
    const secondToLastIdx = messages.length - 2;
    const mappedMessages = messages.map((m, idx) => {
      if (idx === secondToLastIdx) {
        return {
          role: m.role,
          content: [
            {
              type: "text" as const,
              text: m.content,
              // 会話履歴も1時間TTL。長い中断で履歴全体が再書き込みになるのを防ぐ
              cache_control: { type: "ephemeral" as const, ttl: "1h" as const },
            },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    const stream = await anthropic.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Sonnet 5 は thinking を省略すると自動でアダプティブ思考がONになる。
      // 応答が遅くなりVercelの60秒制限に近づくため、まずは旧モデル(Sonnet 4.5)と
      // 同じ挙動になるよう明示的に無効化する。
      // 採点の甘さ改善のため思考を有効化する場合は adaptive に変更して検証すること。
      thinking: { type: "disabled" },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          // 1時間TTL: ユーザーがヒアリング内容を入力・貼り付ける間に
          // 標準の5分TTLだとキャッシュが切れ、毎回プロンプト全体の
          // 書き込みコストが再発生するため
          cache_control: { type: "ephemeral", ttl: "1h" },
        },
      ],
      messages: mappedMessages,
    });

    // アクション判定
    const lastUserMessage = userMessages[userMessages.length - 1]?.content ?? "";
    const action =
      turnCount === 1
        ? "session_start"
        : lastUserMessage.includes("ドラフトを生成")
          ? "generate_plan"
          : "chat_message";

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
        // トークン数を取得してログ記録
        // input_tokens はキャッシュされなかった残りのみ。実際の入力総量は
        // input + cache_creation + cache_read の合計になる
        const finalMessage = await stream.finalMessage();
        const usage = finalMessage.usage;

        await supabase.from("usage_logs").insert({
          user_id: user.id,
          action,
          count_used: 0,
          input_tokens: usage.input_tokens,
          output_tokens: usage.output_tokens,
          cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0,
          cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
          model: finalMessage.model,
          turn_count: turnCount,
        });

        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Remaining-Turns": String(remainingTurns),
        "X-Turn-Warning": turnCount >= TURN_WARNING ? "true" : "false",
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
