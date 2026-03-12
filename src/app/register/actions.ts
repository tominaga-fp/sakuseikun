"use server";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const NOTIFY_TO = "jtominaga@tominaga-fp.com";
const FROM_EMAIL = "noreply@sakuseikun.com";

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function notifyNewUser(data: {
  email: string;
  lastName: string;
  firstName: string;
  companyName: string;
  userType: string;
}) {
  if (!SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY未設定のため通知メールをスキップ");
    return;
  }

  const { email, lastName, firstName, companyName, userType } = data;

  const formattedDate = new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });

  const htmlContent = `
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
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: NOTIFY_TO }] }],
        from: { email: FROM_EMAIL, name: "さくせいくん" },
        subject: `【さくせいくん】新規登録: ${lastName}${firstName} (${email})`,
        content: [{ type: "text/html", value: htmlContent }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("SendGrid送信エラー:", res.status, errText);
    } else {
      console.log("新規ユーザー通知送信完了:", email);
    }
  } catch (err) {
    console.error("通知メール送信エラー:", err);
  }
}
