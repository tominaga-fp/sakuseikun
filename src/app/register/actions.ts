"use server";

import { createClient } from "@supabase/supabase-js";

const SYSTEME_TAG_NAME = "さくせいくん19回無料登録";

async function getOrCreateSystemeTagId(apiKey: string): Promise<number | null> {
  // タグ一覧を取得して名前で検索
  const listRes = await fetch("https://api.systeme.io/api/tags?limit=100", {
    headers: { "X-API-Key": apiKey },
  });
  if (listRes.ok) {
    const listData = await listRes.json();
    const items: { id: number; name: string }[] = listData.items ?? [];
    const found = items.find((t) => t.name === SYSTEME_TAG_NAME);
    if (found) return found.id;
  }

  // 存在しなければ作成
  const createRes = await fetch("https://api.systeme.io/api/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
    body: JSON.stringify({ name: SYSTEME_TAG_NAME }),
  });
  if (!createRes.ok) {
    const errText = await createRes.text();
    console.error("[getOrCreateSystemeTagId] タグ作成エラー:", createRes.status, errText);
    return null;
  }
  const tagData = await createRes.json();
  return tagData.id ?? null;
}

async function addSystemeContact(data: {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
}) {
  const apiKey = process.env.SYSTEME_IO_API_KEY;
  if (!apiKey) {
    console.log("[addSystemeContact] SYSTEME_IO_API_KEY未設定 - スキップ");
    return;
  }
  try {
    const fields: { slug: string; value: string }[] = [
      { slug: "surname", value: data.lastName },
      { slug: "first_name", value: data.firstName },
    ];
    if (data.companyName) {
      fields.push({ slug: "company_name", value: data.companyName });
    }
    console.log("[addSystemeContact] 送信データ:", JSON.stringify({ email: data.email, fields }));

    // 1. コンタクト作成
    const res = await fetch("https://api.systeme.io/api/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        email: data.email,
        fields,
      }),
    });
    const resText = await res.text();
    console.log("[addSystemeContact] コンタクト作成 status:", res.status, "body:", resText);

    let contactId: number;
    if (res.status === 422) {
      // bodyを解析してメール重複か否かを判別
      let resJson: Record<string, unknown> = {};
      try { resJson = JSON.parse(resText); } catch { /* ignore */ }
      const isDuplicate =
        JSON.stringify(resJson).toLowerCase().includes("email") &&
        (JSON.stringify(resJson).toLowerCase().includes("already") ||
          JSON.stringify(resJson).toLowerCase().includes("exist") ||
          JSON.stringify(resJson).toLowerCase().includes("unique"));

      if (!isDuplicate) {
        console.error("[addSystemeContact] 422バリデーションエラー（メール重複以外）:", resText);
        return;
      }

      console.log("[addSystemeContact] 422 メール重複 - 既存コンタクトを検索");
      const searchRes = await fetch(
        `https://api.systeme.io/api/contacts?email=${encodeURIComponent(data.email)}`,
        { headers: { "X-API-Key": apiKey } }
      );
      const searchText = await searchRes.text();
      console.log("[addSystemeContact] 検索 status:", searchRes.status, "body:", searchText);
      if (!searchRes.ok) {
        console.error("[addSystemeContact] 既存コンタクト取得エラー");
        return;
      }
      const searchData = JSON.parse(searchText);
      const existing = (searchData.items ?? [])[0];
      if (!existing) {
        console.error("[addSystemeContact] 既存コンタクトが見つかりません items:", JSON.stringify(searchData.items));
        return;
      }
      contactId = existing.id;
      console.log("[addSystemeContact] 既存コンタクト取得成功 id:", contactId);
    } else if (!res.ok) {
      console.error("[addSystemeContact] コンタクト作成失敗 status:", res.status);
      return;
    } else {
      const contact = JSON.parse(resText);
      contactId = contact.id;
      console.log("[addSystemeContact] コンタクト作成成功 id:", contactId);
    }

    // 2. タグID取得または作成
    const tagId = await getOrCreateSystemeTagId(apiKey);
    if (!tagId) {
      console.error("[addSystemeContact] タグID取得失敗");
      return;
    }

    // 3. タグをコンタクトに付与
    const tagRes = await fetch(`https://api.systeme.io/api/contacts/${contactId}/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ tagId }),
    });
    const tagResText = await tagRes.text();
    console.log("[addSystemeContact] タグ付与 status:", tagRes.status, "body:", tagResText);
  } catch (err) {
    console.error("[addSystemeContact] fetchエラー:", err);
  }
}

export async function registerUser(data: {
  email: string;
  password: string;
  lastName: string;
  firstName: string;
  companyName: string;
  userType: string;
  referralCode: string;
  isMonitor: boolean;
}): Promise<{ error: string | null }> {
  console.log("[registerUser] 開始 email:", data.email);

  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await adminClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        last_name: data.lastName,
        first_name: data.firstName,
        company_name: data.companyName,
        user_type: data.userType,
        referral_code: data.referralCode || null,
        ...(data.isMonitor ? { is_monitor: true } : {}),
      },
    });

    if (error) {
      console.error("[registerUser] ユーザー作成エラー:", error.message);
      return { error: error.message };
    }

    console.log("[registerUser] ユーザー作成成功 - Systeme連携開始");

    // Systeme.io へのコンタクト登録（管理者通知メールはSendGrid廃止に伴い削除）
    await addSystemeContact({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      companyName: data.companyName,
    });

    return { error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[registerUser] 予期しないエラー:", message);
    return { error: message };
  }
}
