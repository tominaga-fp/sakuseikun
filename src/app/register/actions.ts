"use server";

import { createClient } from "@supabase/supabase-js";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const NOTIFY_TO = "jtominaga@tominaga-fp.com";
const FROM_EMAIL = "info@tominaga-fp.com";

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendMail(to: string, subject: string, htmlContent: string) {
  if (!SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY未設定のためメール送信スキップ");
    return;
  }

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL, name: "さくせいくん" },
      subject,
      content: [{ type: "text/html", value: htmlContent }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("SendGrid送信エラー:", res.status, errText);
  } else {
    console.log("メール送信完了:", to, subject);
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
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await adminClient.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true, // 確認メールを送らずメール認証済みとして登録
    user_metadata: {
      last_name: data.lastName,
      first_name: data.firstName,
      company_name: data.companyName,
      user_type: data.userType,
      referral_code: data.referralCode || null,
      ...(data.isMonitor ? { is_monitor: true } : {}),
    },
  });

  return { error: error?.message ?? null };
}

export async function notifyNewUser(data: {
  email: string;
  lastName: string;
  firstName: string;
  companyName: string;
  userType: string;
}) {
  const { email, lastName, firstName, companyName, userType } = data;

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

  // 2. ユーザー本人への登録完了メール
  const userHtml = `
    <div style="max-width:600px;margin:0 auto;font-family:sans-serif;color:#333;line-height:1.8;">
      <p>${escapeHtml(lastName)} ${escapeHtml(firstName)} 様</p>
      <p>補助金計画書さくせいくんへのご登録ありがとうございます。</p>
      <p>以下のURLからログインしてご利用ください。<br />
        <a href="https://sakuseikun.jp/login" style="color:#0f2346;">https://sakuseikun.jp/login</a>
      </p>
      <p style="margin-top:24px;">＜最初にやること＞<br />
        ① 申請する事業者さんのホームページURLを左の「HP URL」欄に入力<br />
        ② ヒアリングした内容（文字起こし・メモ）を「ヒアリング」欄に貼り付け<br />
        ③「情報を送信」を押すだけで計画書のドラフトが生成されます
      </p>
      <p style="margin-top:24px;">
        ご不明な点はこちらまでご連絡ください。<br />
        <a href="mailto:info@tominaga-fp.com" style="color:#0f2346;">info@tominaga-fp.com</a>
      </p>
      <p>とみながFP事務所　富永淳一</p>
    </div>
  `;

  try {
    await Promise.all([
      sendMail(NOTIFY_TO, `【さくせいくん】新規登録: ${lastName}${firstName} (${email})`, adminHtml),
      sendMail(email, "【さくせいくん】ご登録ありがとうございます", userHtml),
    ]);
  } catch (err) {
    console.error("通知メール送信エラー:", err);
  }
}
