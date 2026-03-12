"use server";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const NOTIFY_TO = "jtominaga@tominaga-fp.com";
const FROM_EMAIL = "jtominaga@tominaga-fp.com";

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
    <div style="max-width:600px;margin:0 auto;font-family:sans-serif;color:#333;">
      <h2 style="color:#c8401a;">登録が完了しました</h2>
      <p>${escapeHtml(lastName)} ${escapeHtml(firstName)} 様</p>
      <p>補助金計画書<strong>さくせいくん</strong>へのご登録ありがとうございます。</p>
      <p>メール認証が完了しましたら、以下のURLからログインしてご利用いただけます。</p>
      <p style="margin:24px 0;">
        <a href="https://sakuseikun-nine.vercel.app/login"
           style="background:#c8401a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          ログインする
        </a>
      </p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="font-size:12px;color:#999;">
        このメールは「さくせいくん」から自動送信されています。<br />
        ご不明な点がございましたら jtominaga@tominaga-fp.com までお問い合わせください。
      </p>
    </div>
  `;

  try {
    await Promise.all([
      sendMail(NOTIFY_TO, `【さくせいくん】新規登録: ${lastName}${firstName} (${email})`, adminHtml),
      sendMail(email, "【さくせいくん】登録が完了しました", userHtml),
    ]);
  } catch (err) {
    console.error("通知メール送信エラー:", err);
  }
}
