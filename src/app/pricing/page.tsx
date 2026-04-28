import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "料金プラン｜補助金計画書さくせいくん",
  robots: { index: true, follow: true },
};

const MONTHLY_URL = "https://buy.stripe.com/4gM7sL0BL5c61xz0tQdQQ05";
const YEARLY_URL = "https://buy.stripe.com/00wcN53NX9smdghb8udQQ04";

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ maxWidth: "760px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "32px" }}>
            <img src="/icon.png" alt="" width={36} height={36} style={{ borderRadius: "8px" }} />
            <span style={{ fontWeight: 700, fontSize: "20px", color: "#0f2346" }}>補助金計画書さくせいくん</span>
          </a>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 700, color: "#111827", marginBottom: "12px", lineHeight: 1.3 }}>
            料金プランを選択してください
          </h1>
          <p style={{ fontSize: "17px", color: "#6b7280", lineHeight: 1.8 }}>
            お支払い完了後にアカウント作成ページへ移動します。
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
          {/* Monthly */}
          <div style={{ background: "#fff", border: "2px solid #e5e7eb", borderRadius: "20px", padding: "36px 32px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.1em", marginBottom: "12px" }}>月額プラン</div>
            <div style={{ fontFamily: "sans-serif", fontSize: "42px", fontWeight: 700, color: "#0f2346", lineHeight: 1, marginBottom: "6px" }}>
              ¥29,800
            </div>
            <div style={{ fontSize: "15px", color: "#6b7280", marginBottom: "20px" }}>/ 月（税込）</div>
            <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "12px 16px", marginBottom: "24px", fontSize: "15px", fontWeight: 700, color: "#111827" }}>
              毎月3件まで
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "grid", gap: "10px" }}>
              {["毎月1日に3件付与", "追加1件 ¥9,800", "ヒアリングシート（特典）", "過去の会話履歴をすべて保存", "カスタマーポータルで解約可能"].map((item) => (
                <li key={item} style={{ fontSize: "14px", color: "#374151", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ color: "#0f2346", fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={MONTHLY_URL}
              style={{ display: "block", width: "100%", background: "#0f2346", color: "#fff", fontWeight: 700, fontSize: "16px", padding: "16px", borderRadius: "10px", textDecoration: "none", textAlign: "center", boxSizing: "border-box" }}
            >
              月額プランで申し込む
            </a>
          </div>

          {/* Annual */}
          <div style={{ background: "#fff", border: "2px solid #0f2346", borderRadius: "20px", padding: "36px 32px", position: "relative" }}>
            <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", background: "#0f2346", color: "#b8860b", fontSize: "13px", fontWeight: 700, padding: "5px 20px", borderRadius: "999px", whiteSpace: "nowrap" }}>
              おすすめ・50% OFF
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.1em", marginBottom: "12px" }}>年額プラン</div>
            <div style={{ fontFamily: "sans-serif", fontSize: "42px", fontWeight: 700, color: "#0f2346", lineHeight: 1, marginBottom: "6px" }}>
              ¥178,800
            </div>
            <div style={{ fontSize: "15px", color: "#6b7280", marginBottom: "4px" }}>/ 年（税込）</div>
            <div style={{ fontSize: "14px", color: "#b8860b", fontWeight: 700, marginBottom: "20px" }}>月換算 ¥14,900（月額の50%OFF）</div>
            <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "12px 16px", marginBottom: "24px", fontSize: "15px", fontWeight: 700, color: "#111827" }}>
              年間30件まで
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "grid", gap: "10px" }}>
              {["年間30件を自由に使える", "月をまたいでも件数が減らない", "追加1件 ¥9,800", "ヒアリングシート（特典）", "過去の会話履歴をすべて保存"].map((item) => (
                <li key={item} style={{ fontSize: "14px", color: "#374151", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ color: "#0f2346", fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={YEARLY_URL}
              style={{ display: "block", width: "100%", background: "#b8860b", color: "#fff", fontWeight: 700, fontSize: "16px", padding: "16px", borderRadius: "10px", textDecoration: "none", textAlign: "center", boxSizing: "border-box" }}
            >
              年額プランで申し込む
            </a>
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af", lineHeight: 2.2 }}>
          <p style={{ margin: 0 }}>※ 月3件を超える場合は1件¥9,800で追加できます。</p>
          <p style={{ margin: 0 }}>※ 解約はマイページ（カスタマーポータル）からいつでも可能。次回更新日をもって終了（返金なし）。</p>
          <p style={{ margin: 0 }}>※ 料金は税込表記です。</p>
        </div>

        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <Link href="/login" style={{ fontSize: "14px", color: "#6b7280" }}>
            すでにアカウントをお持ちの方はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}
