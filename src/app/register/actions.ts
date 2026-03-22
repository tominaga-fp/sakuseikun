"use server";

import { createClient } from "@supabase/supabase-js";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const NOTIFY_TO = "jtominaga@tominaga-fp.com";
const FROM_EMAIL = "info@sakuseikun.jp";

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendMail(to: string, subject: string, htmlContent: string) {
  console.log("[sendMail] 開始 to:", to, "subject:", subject);

  if (!SENDGRID_API_KEY) {
    console.error("[sendMail] SENDGRID_API_KEY未設定 - 送信スキップ");
    return;
  }
  console.log("[sendMail] SENDGRID_API_KEY確認OK, FROM:", FROM_EMAIL);

  const body = JSON.stringify({
    personalizations: [{ to: [{ email: to }] }],
    from: { email: FROM_EMAIL, name: "補助金計画書さくせいくん（とみながFP事務所）" },
    subject,
    content: [{ type: "text/html", value: htmlContent }],
  });

  let res: Response;
  try {
    res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body,
    });
  } catch (fetchErr) {
    console.error("[sendMail] fetchエラー:", fetchErr);
    return;
  }

  if (!res.ok) {
    const errText = await res.text();
    console.error("[sendMail] SendGridエラー status:", res.status, "body:", errText);
  } else {
    console.log("[sendMail] 送信成功 status:", res.status, "to:", to);
  }
}

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
}) {
  const apiKey = process.env.SYSTEME_IO_API_KEY;
  if (!apiKey) {
    console.log("[addSystemeContact] SYSTEME_IO_API_KEY未設定 - スキップ");
    return;
  }
  try {
    // 1. コンタクト作成
    const res = await fetch("https://api.systeme.io/api/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        email: data.email,
        fields: [
          { slug: "first_name", value: `${data.lastName} ${data.firstName}` },
        ],
      }),
    });

    let contactId: number;
    if (res.status === 422) {
      // メール重複の場合は既存コンタクトを検索
      console.log("[addSystemeContact] 422 メール重複 - 既存コンタクトを取得");
      const searchRes = await fetch(
        `https://api.systeme.io/api/contacts?email=${encodeURIComponent(data.email)}`,
        { headers: { "X-API-Key": apiKey } }
      );
      if (!searchRes.ok) {
        console.error("[addSystemeContact] 既存コンタクト取得エラー:", searchRes.status);
        return;
      }
      const searchData = await searchRes.json();
      const existing = (searchData.items ?? [])[0];
      if (!existing) {
        console.error("[addSystemeContact] 既存コンタクトが見つかりません");
        return;
      }
      contactId = existing.id;
      console.log("[addSystemeContact] 既存コンタクト取得成功 id:", contactId);
    } else if (!res.ok) {
      const errText = await res.text();
      console.error("[addSystemeContact] コンタクト作成エラー status:", res.status, "body:", errText);
      return;
    } else {
      const contact = await res.json();
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
    if (!tagRes.ok) {
      const errText = await tagRes.text();
      console.error("[addSystemeContact] タグ付与エラー status:", tagRes.status, "body:", errText);
    } else {
      console.log("[addSystemeContact] タグ付与成功 tagId:", tagId);
    }
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

    console.log("[registerUser] ユーザー作成成功 - メール送信開始");

    // ユーザー作成成功後に通知メールをここで送信
    // （セッション確立前に呼ぶことでミドルウェアのリダイレクト問題を回避）
    await Promise.all([
      notifyNewUser({
        email: data.email,
        lastName: data.lastName,
        firstName: data.firstName,
        companyName: data.companyName,
        userType: data.userType,
      }),
      addSystemeContact({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      }),
    ]);

    return { error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[registerUser] 予期しないエラー:", message);
    return { error: message };
  }
}

export async function notifyNewUser(data: {
  email: string;
  lastName: string;
  firstName: string;
  companyName: string;
  userType: string;
}) {
  const { email, lastName, firstName, companyName, userType } = data;
  console.log("[notifyNewUser] 呼び出し開始 email:", email);

  const formattedDate = new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });

  // 1. 管理者への通知メール
  const adminHtml = `
    <h2>新規ユーザー登録通知</h2>
    <table style="border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:6px 12px;font-weight:bold;">メール</td><td style="padding:6px 12px;">${escapeHtml(email)}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;">氏名</td><td style="padding:6px 12px;">${escapeHtml(lastName)} ${escapeHtml(firstName)}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;">会社名</td><td style="padding:6px 12px;">${escapeHtml(companyName) || "未入力"}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;">利用者区分</td><td style="padding:6px 12px;">${userType === "business" ? "自社で申請" : "他社の申請支援"}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;">登録日時</td><td style="padding:6px 12px;">${formattedDate}</td></tr>
    </table>
  `;

  try {
    console.log("[notifyNewUser] 管理者通知メール送信開始");
    await sendMail(NOTIFY_TO, `【さくせいくん】新規登録: ${lastName}${firstName} (${email})`, adminHtml);
    console.log("[notifyNewUser] 管理者通知メール送信完了");
  } catch (err) {
    console.error("[notifyNewUser] エラー:", err);
  }
}
