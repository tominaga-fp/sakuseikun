"use client";

import { useEffect, useRef } from "react";

const CTA_HREF = "#pricing";
const MONTHLY_URL = "https://buy.stripe.com/4gM7sL0BL5c61xz0tQdQQ05";
const YEARLY_URL = "https://buy.stripe.com/00wcN53NX9smdghb8udQQ04";

export default function LpPage() {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mainRef.current) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((x) => {
          if (x.isIntersecting) x.target.classList.add("on");
        }),
      { threshold: 0.08 }
    );
    mainRef.current.querySelectorAll(".fi").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=DM+Sans:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
:root {
  --navy: #0f2346;
  --navy-mid: #1a3560;
  --gold: #b8860b;
  --gold-light: #d4a017;
  --blue-accent: #2563eb;
  --blue-light: #eff6ff;
  --ink: #111827;
  --ink-mid: #374151;
  --ink-light: #6b7280;
  --border: #e5e7eb;
  --bg: #f9fafb;
  --white: #ffffff;
  --green: #166534;
  --green-bg: #f0fdf4;
  --red-bg: #7a1a1a;
}
html{scroll-behavior:smooth;}
.lp-root *{margin:0;padding:0;box-sizing:border-box;}
.lp-root{font-family:'Noto Sans JP',sans-serif;background:var(--white);color:var(--ink);overflow-x:hidden;line-height:1.8;-webkit-font-smoothing:antialiased;font-size:18px;}

/* HEADER */
.lp-root .header{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);padding:16px 32px;display:flex;align-items:center;justify-content:space-between;}
.lp-root .logo{font-family:'DM Sans',sans-serif;font-weight:700;font-size:22px;color:var(--navy);letter-spacing:-0.02em;display:flex;align-items:center;gap:8px;text-decoration:none;}
.lp-root .logo-badge{background:var(--navy);color:var(--gold);font-size:15px;font-weight:900;padding:4px 11px;border-radius:4px;}
.lp-root .header-nav{display:flex;align-items:center;gap:24px;}
.lp-root .header-nav a{font-size:16px;color:var(--ink-mid);text-decoration:none;font-weight:500;transition:color 0.15s;}
.lp-root .header-nav a:hover{color:var(--navy);}
.lp-root .btn-sm{background:var(--navy);color:#fff;font-size:15px;font-weight:700;padding:10px 22px;border-radius:8px;text-decoration:none;transition:all 0.2s;}
.lp-root .btn-sm:hover{background:var(--navy-mid);transform:translateY(-1px);}

/* HERO */
.lp-root .hero{padding:80px 32px 96px;background:linear-gradient(135deg,#f8faff 0%,#ffffff 50%,#fdf8ec 100%);position:relative;overflow:hidden;}
.lp-root .hero::before{content:'';position:absolute;top:0;right:0;width:600px;height:600px;background:radial-gradient(circle at 70% 30%,rgba(37,99,235,0.06) 0%,transparent 60%);pointer-events:none;}
.lp-root .hero::after{content:'';position:absolute;bottom:0;left:0;width:400px;height:400px;background:radial-gradient(circle,rgba(184,134,11,0.05) 0%,transparent 60%);pointer-events:none;}
.lp-root .hero-inner{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr 420px;gap:72px;align-items:center;position:relative;z-index:1;}
.lp-root .hero-eyebrow{font-size:15px;color:var(--ink-light);font-weight:600;letter-spacing:0.1em;margin-bottom:12px;}
.lp-root .hero-title{font-family:'DM Sans',sans-serif;font-weight:700;font-size:clamp(34px,4vw,52px);color:var(--ink);line-height:1.2;margin-bottom:20px;letter-spacing:-0.02em;}
.lp-root .hero-title span{color:var(--navy);}
.lp-root .hero-sub{font-size:19px;color:var(--ink-mid);line-height:1.9;}

/* PRICE CARD */
.lp-root .hero-price-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:32px 28px;box-shadow:0 20px 60px rgba(0,0,0,0.1),0 4px 16px rgba(0,0,0,0.06);animation:lpFloatUp 0.8s ease both 0.3s;}
@keyframes lpFloatUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.lp-root .price-card-heading{font-family:'DM Sans',sans-serif;font-size:20px;font-weight:700;color:var(--navy);margin-bottom:6px;}
.lp-root .price-card-sub{font-size:15px;color:var(--ink-light);margin-bottom:20px;line-height:1.7;}
.lp-root .plan-row{border:1.5px solid var(--border);border-radius:10px;padding:14px 16px;margin-bottom:12px;}
.lp-root .plan-row.recommended{border-color:var(--navy);background:linear-gradient(135deg,#f0f4ff 0%,#ffffff 100%);}
.lp-root .plan-label{font-size:13px;font-weight:700;color:var(--ink-light);margin-bottom:4px;display:flex;align-items:center;gap:8px;}
.lp-root .plan-badge{background:var(--gold);color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;}
.lp-root .plan-price{font-family:'DM Sans',sans-serif;font-size:26px;font-weight:700;color:var(--navy);line-height:1;}
.lp-root .plan-price span{font-size:14px;font-weight:400;color:var(--ink-light);}
.lp-root .plan-limit{font-size:13px;color:var(--ink-mid);margin-top:4px;}
.lp-root .cta-btn{width:100%;background:var(--navy);color:#fff;border:none;border-radius:10px;padding:17px;font-size:17px;font-weight:700;font-family:'Noto Sans JP',sans-serif;cursor:pointer;letter-spacing:0.04em;margin-top:6px;transition:all 0.2s;}
.lp-root .cta-btn:hover{background:var(--navy-mid);transform:translateY(-1px);}
.lp-root .form-note{text-align:center;font-size:14px;color:var(--ink-light);margin-top:10px;}

/* SUPERVISION */
.lp-root .supervision-bar{background:var(--bg);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:14px 32px;}
.lp-root .supervision-inner{max-width:1080px;margin:0 auto;display:flex;align-items:center;gap:16px;justify-content:center;}
.lp-root .supervision-label{font-size:13px;font-weight:700;color:var(--ink-light);letter-spacing:0.08em;}
.lp-root .supervision-name{font-size:16px;font-weight:700;color:var(--navy);}

/* STATS */
.lp-root .stats-sec{background:var(--navy);padding:52px 32px;}
.lp-root .stats-inner{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:32px;text-align:center;}
.lp-root .stat-num{font-family:'DM Sans',sans-serif;font-size:clamp(34px,5vw,54px);font-weight:700;color:var(--gold);line-height:1;margin-bottom:10px;}
.lp-root .stat-label{font-size:17px;color:rgba(255,255,255,0.65);}

/* COMMON */
.lp-root .sec-inner{max-width:1080px;margin:0 auto;}
.lp-root .sec-eyebrow{font-size:14px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--blue-accent);margin-bottom:14px;display:block;}
.lp-root .sec-title{font-family:'DM Sans',sans-serif;font-weight:700;font-size:clamp(30px,3.5vw,42px);color:var(--ink);line-height:1.3;margin-bottom:56px;letter-spacing:-0.02em;}

/* FEATURES */
.lp-root .features-sec{padding:100px 32px;background:var(--white);}
.lp-root .features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:28px;}
.lp-root .feature-card{background:var(--bg);border:1px solid var(--border);border-radius:16px;padding:32px 28px;transition:all 0.2s;}
.lp-root .feature-card:hover{border-color:var(--navy);box-shadow:0 8px 24px rgba(15,35,70,0.08);transform:translateY(-2px);}
.lp-root .feature-icon{width:54px;height:54px;background:var(--navy);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:20px;}
.lp-root .feature-card h3{font-size:19px;font-weight:700;color:var(--ink);margin-bottom:10px;}
.lp-root .feature-card p{font-size:16px;color:var(--ink-mid);line-height:1.85;}

/* HOW */
.lp-root .how-sec{padding:100px 32px;background:var(--bg);}
.lp-root .how-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:32px;}
.lp-root .how-step{background:#fff;border:1px solid var(--border);border-radius:16px;padding:36px 28px;text-align:center;}
.lp-root .step-num{width:80px;height:80px;background:var(--navy);color:var(--gold);font-family:'DM Sans',sans-serif;font-weight:700;font-size:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;}
.lp-root .how-step h3{font-size:19px;font-weight:700;color:var(--ink);margin-bottom:10px;}
.lp-root .how-step p{font-size:16px;color:var(--ink-mid);line-height:1.85;}

/* DIFF */
.lp-root .diff-sec{padding:100px 32px;background:var(--white);}
.lp-root .diff-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;}
.lp-root .diff-card{border-radius:16px;padding:36px 32px;border:2px solid var(--border);}
.lp-root .diff-card.good{border-color:var(--navy);background:linear-gradient(135deg,#f0f4ff 0%,#ffffff 100%);}
.lp-root .diff-card.bad{background:var(--bg);}
.lp-root .diff-card-header{display:flex;align-items:center;gap:10px;margin-bottom:24px;}
.lp-root .diff-tag{font-size:13px;font-weight:700;padding:5px 14px;border-radius:999px;}
.lp-root .diff-tag.good{background:var(--navy);color:var(--gold);}
.lp-root .diff-tag.bad{background:var(--border);color:var(--ink-mid);}
.lp-root .diff-card h3{font-size:20px;font-weight:700;color:var(--ink);}
.lp-root .diff-list{list-style:none;display:grid;gap:14px;}
.lp-root .diff-list li{display:flex;align-items:flex-start;gap:12px;font-size:17px;color:var(--ink-mid);line-height:1.75;}
.lp-root .diff-list li::before{content:'\\2713';color:var(--navy);font-weight:700;flex-shrink:0;margin-top:2px;}
.lp-root .diff-card.bad .diff-list li::before{content:'\\2715';color:#9ca3af;}

/* BONUS */
.lp-root .bonus-sec{padding:100px 32px;background:var(--bg);}
.lp-root .bonus-box{background:linear-gradient(135deg,#fdf8ec 0%,#fffbf0 100%);border:2px solid #e8d88a;border-radius:20px;padding:56px 48px;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;}
.lp-root .bonus-tag{display:inline-block;background:var(--gold);color:#fff;font-size:14px;font-weight:700;padding:5px 16px;border-radius:999px;margin-bottom:16px;letter-spacing:0.08em;}
.lp-root .bonus-title{font-family:'DM Sans',sans-serif;font-size:clamp(24px,2.8vw,32px);font-weight:700;color:var(--navy);line-height:1.4;margin-bottom:20px;}
.lp-root .bonus-text{font-size:17px;color:var(--ink-mid);line-height:2.1;}
.lp-root .bonus-text p{margin-bottom:14px;}
.lp-root .bonus-text p:last-child{margin-bottom:0;font-weight:700;color:var(--navy);}
.lp-root .bonus-visual{background:#fff;border:1px solid #e8d88a;border-radius:16px;padding:32px 28px;}
.lp-root .bonus-visual-title{font-size:17px;font-weight:700;color:var(--navy);margin-bottom:20px;display:flex;align-items:center;gap:8px;}
.lp-root .bonus-item{display:flex;align-items:flex-start;gap:12px;font-size:16px;color:var(--ink-mid);line-height:1.75;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #f0e8c8;}
.lp-root .bonus-item:last-child{margin-bottom:0;padding-bottom:0;border-bottom:none;}
.lp-root .bonus-item-num{background:var(--gold);color:#fff;font-size:12px;font-weight:700;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}

/* PRICING */
.lp-root .pricing-sec{padding:100px 32px;background:var(--white);}
.lp-root .pricing-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;max-width:760px;margin:0 auto;}
.lp-root .pricing-card{border:2px solid var(--border);border-radius:20px;padding:40px 36px;}
.lp-root .pricing-card.recommended{border-color:var(--navy);position:relative;}
.lp-root .pricing-rec-badge{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--navy);color:var(--gold);font-size:13px;font-weight:700;padding:5px 20px;border-radius:999px;white-space:nowrap;}
.lp-root .pricing-plan-name{font-size:15px;font-weight:700;color:var(--ink-light);letter-spacing:0.1em;margin-bottom:12px;}
.lp-root .pricing-price{font-family:'DM Sans',sans-serif;font-size:clamp(32px,4vw,46px);font-weight:700;color:var(--navy);line-height:1;margin-bottom:6px;}
.lp-root .pricing-price span{font-size:16px;font-weight:400;color:var(--ink-light);}
.lp-root .pricing-per{font-size:14px;color:var(--ink-light);margin-bottom:20px;}
.lp-root .pricing-limit{font-size:16px;font-weight:700;color:var(--ink);margin-bottom:20px;padding:12px 16px;background:var(--bg);border-radius:8px;}
.lp-root .pricing-features{list-style:none;display:grid;gap:10px;margin-bottom:32px;}
.lp-root .pricing-features li{font-size:15px;color:var(--ink-mid);display:flex;align-items:flex-start;gap:8px;}
.lp-root .pricing-features li::before{content:'\\2713';color:var(--navy);font-weight:700;flex-shrink:0;}
.lp-root .pricing-cta{display:block;width:100%;background:var(--navy);color:#fff;font-size:16px;font-weight:700;font-family:'Noto Sans JP',sans-serif;padding:16px;border-radius:10px;text-decoration:none;text-align:center;transition:all 0.2s;}
.lp-root .pricing-cta:hover{background:var(--navy-mid);transform:translateY(-1px);}
.lp-root .pricing-note{font-size:13px;color:var(--ink-light);margin-top:32px;text-align:center;line-height:2.2;}

/* FAQ */
.lp-root .faq-sec{padding:100px 32px;background:var(--bg);}
.lp-root .faq-list{display:grid;gap:14px;}
.lp-root .faq-item{background:#fff;border:1px solid var(--border);border-radius:12px;padding:28px 28px;}
.lp-root .faq-q{font-size:19px;font-weight:700;color:var(--ink);margin-bottom:12px;display:flex;align-items:flex-start;gap:12px;}
.lp-root .faq-q-mark{background:var(--navy);color:var(--gold);font-size:14px;font-weight:700;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}
.lp-root .faq-a{font-size:17px;color:var(--ink-mid);line-height:2;padding-left:40px;}

/* CTA */
.lp-root .cta-sec{padding:100px 32px;background:linear-gradient(135deg,var(--navy) 0%,var(--navy-mid) 100%);text-align:center;position:relative;overflow:hidden;}
.lp-root .cta-sec::before{content:'';position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:radial-gradient(circle,rgba(184,134,11,0.12) 0%,transparent 60%);}
.lp-root .cta-sec h2{font-family:'DM Sans',sans-serif;font-weight:700;font-size:clamp(30px,4vw,46px);color:#fff;line-height:1.3;margin-bottom:16px;letter-spacing:-0.02em;position:relative;z-index:1;}
.lp-root .cta-sec p{font-size:19px;color:rgba(255,255,255,0.72);margin-bottom:40px;line-height:1.9;position:relative;z-index:1;}
.lp-root .btn-cta{display:inline-flex;align-items:center;gap:8px;background:var(--gold);color:#fff;font-size:22px;font-weight:700;padding:22px 56px;border-radius:12px;text-decoration:none;transition:all 0.2s;box-shadow:0 4px 20px rgba(184,134,11,0.35);position:relative;z-index:1;}
.lp-root .btn-cta:hover{background:var(--gold-light);transform:translateY(-2px);}
.lp-root .cta-note{font-size:14px;color:rgba(255,255,255,0.4);margin-top:16px;position:relative;z-index:1;}

/* FOOTER */
.lp-root .lp-footer{background:var(--ink);padding:36px;text-align:center;}
.lp-root .footer-links{display:flex;gap:24px;justify-content:center;flex-wrap:wrap;margin-bottom:16px;}
.lp-root .footer-links a{font-size:14px;color:rgba(255,255,255,0.3);text-decoration:none;transition:color 0.2s;}
.lp-root .footer-links a:hover{color:rgba(255,255,255,0.6);}
.lp-root .footer-copy{font-size:14px;color:rgba(255,255,255,0.2);}

/* FADE */
.lp-root .fi{opacity:0;transform:translateY(16px);transition:opacity 0.5s ease,transform 0.5s ease;}
.lp-root .fi.on{opacity:1;transform:translateY(0);}

/* RESPONSIVE */
@media(max-width:900px){
  .lp-root .hero-inner{grid-template-columns:1fr;gap:48px;}
  .lp-root .diff-grid{grid-template-columns:1fr;}
  .lp-root .bonus-box{grid-template-columns:1fr;gap:32px;padding:36px 24px;}
  .lp-root .stats-inner{grid-template-columns:1fr;gap:24px;}
  .lp-root .header-nav{display:none;}
  .lp-root .pricing-grid{grid-template-columns:1fr;}
}
@media(max-width:600px){
  .lp-root .header{padding:14px 18px;}
  .lp-root .hero{padding:56px 20px 72px;}
  .lp-root .features-sec,.lp-root .how-sec,.lp-root .diff-sec,.lp-root .bonus-sec,.lp-root .faq-sec,.lp-root .cta-sec{padding:72px 20px;}
  .lp-root .hero-title{font-size:clamp(28px,8vw,40px);}
}
`,
        }}
      />

      <div className="lp-root" ref={mainRef}>
        {/* HEADER */}
        <header className="header">
          <a href="#" className="logo">
            <img src="/icon.png" alt="" width={32} height={32} style={{ borderRadius: '6px' }} />
            補助金計画書さくせいくん
          </a>
          <nav className="header-nav">
            <a href="#features">機能</a>
            <a href="#how">使い方</a>
            <a href="#pricing">料金</a>
            <a href="#faq">FAQ</a>
            <a href="/login">ログイン</a>
            <a href={CTA_HREF} className="btn-sm" style={{ color: '#ffffff' }}>
              申し込む
            </a>
          </nav>
        </header>

        {/* HERO */}
        <section className="hero">
          <div className="hero-inner">
            <div style={{ animation: "lpFloatUp 0.7s ease both 0.1s" }}>
              <p className="hero-eyebrow">
                補助金業務に携わる行政書士の方へ
              </p>
              <h1 className="hero-title">
                持続化補助金の計画書下書きを、
                <br />
                <span>AIが即座に生成する。</span>
              </h1>
              <p className="hero-sub">
                ヒアリング情報を入力するだけで、様式2準拠の経営計画書・補助事業計画書の下書きテキストを出力。構成・初稿の作業時間を大幅に圧縮します。
              </p>
            </div>

            {/* Right: Pricing summary */}
            <div>
              <div className="hero-price-card">
                <p className="price-card-heading">料金プラン</p>
                <p className="price-card-sub">
                  月払い・年払いの2プラン。案件数に合わせてお選びください。
                </p>
                <div className="plan-row">
                  <div className="plan-label">月額プラン</div>
                  <div className="plan-price">¥29,800<span> / 月（税込）</span></div>
                  <div className="plan-limit">毎月3件まで</div>
                </div>
                <div className="plan-row recommended">
                  <div className="plan-label">
                    年額プラン
                    <span className="plan-badge">50% OFF</span>
                  </div>
                  <div className="plan-price">¥178,800<span> / 年（税込）</span></div>
                  <div className="plan-limit">年間30件まで・月換算¥14,900</div>
                </div>
                <a
                  href={CTA_HREF}
                  className="cta-btn"
                  style={{ display: "block", textAlign: "center", textDecoration: "none" }}
                >
                  今すぐ申し込む →
                </a>
                <p className="form-note" style={{ marginTop: "10px" }}>
                  ご不明な点はお気軽にお問い合わせください。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SUPERVISION */}
        <div className="supervision-bar">
          <div className="supervision-inner">
            <span className="supervision-label">監修</span>
            <span className="supervision-name">クルーズ行政書士事務所　太田吉博</span>
          </div>
        </div>

        {/* STATS */}
        <section className="stats-sec">
          <div className="stats-inner">
            <div className="fi">
              <div className="stat-num">様式2</div>
              <div className="stat-label">完全準拠の出力形式</div>
            </div>
            <div className="fi">
              <div className="stat-num">15項目</div>
              <div className="stat-label">採点ロジック組み込み済み</div>
            </div>
            <div className="fi">
              <div className="stat-num">第19回</div>
              <div className="stat-label">最新公募要領に対応</div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-sec" id="features">
          <div className="sec-inner">
            <h2 className="sec-title fi">さくせいくんの機能</h2>
            <div className="features-grid">
              <div className="feature-card fi">
                <div className="feature-icon">📝</div>
                <h3>様式2準拠の下書き生成</h3>
                <p>
                  経営計画書・補助事業計画書の全項目を出力。第19回公募要領に完全対応しています。
                </p>
              </div>
              <div className="feature-card fi">
                <div className="feature-icon">💬</div>
                <h3>チャットで修正・追記</h3>
                <p>
                  「ここをもう少し具体的に」とチャットで指示するだけ。繰り返し調整が可能です。
                </p>
              </div>
              <div className="feature-card fi">
                <div className="feature-icon">📂</div>
                <h3>案件ごとの履歴保存</h3>
                <p>
                  複数顧客の計画書を案件ごとに管理。過去の会話もいつでも確認できます。
                </p>
              </div>
              <div className="feature-card fi">
                <div className="feature-icon">🔒</div>
                <h3>安心のセキュリティ</h3>
                <p>
                  入力情報は計画書生成のみに使用。第三者への提供・販売は一切行いません。
                </p>
              </div>
              <div className="feature-card fi">
                <div className="feature-icon">🌐</div>
                <h3>HP情報の自動読み取り</h3>
                <p>
                  URLを入力するだけで事業者のHP情報を自動取得。入力の手間を省きます。
                </p>
              </div>
              <div className="feature-card fi">
                <div className="feature-icon">📱</div>
                <h3>PCでもスマホでも</h3>
                <p>
                  ブラウザがあればどこでも使えます。外出先での確認・修正にも対応。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SCREEN MOCK */}
        <section style={{ padding: "100px 32px", background: "var(--white)" }}>
          <div className="sec-inner">
            <h2 className="sec-title fi">実際の画面</h2>
            <div
              className="fi"
              style={{
                background: "#1e293b",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
              }}
            >
              {/* Browser bar */}
              <div
                style={{
                  background: "#0f172a",
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", gap: "6px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f57" }} />
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#febc2e" }} />
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#28c840" }} />
                </div>
                <div
                  style={{
                    background: "#1e293b",
                    borderRadius: "6px",
                    padding: "5px 16px",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.4)",
                    flex: 1,
                    maxWidth: "320px",
                  }}
                >
                  sakuseikun.jp
                </div>
              </div>
              {/* App header */}
              <div
                style={{
                  background: "#f8f7f4",
                  borderBottom: "1px solid #e5e7eb",
                  padding: "10px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ background: "#0f2346", color: "#b8860b", fontSize: "11px", fontWeight: 900, padding: "3px 8px", borderRadius: "4px" }}>
                    さ
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f2346" }}>
                    補助金計画書 さくせいくん
                  </span>
                  <span style={{ fontSize: "11px", color: "#6b7280" }}>
                    運営：とみながFP事務所
                  </span>
                </div>
                <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#6b7280" }}>
                  <span style={{ color: "#0f2346", fontWeight: 700 }}>残り2件</span>
                  <span>ログアウト</span>
                </div>
              </div>
              {/* App banner */}
              <div
                style={{
                  background: "#f0f4f8",
                  borderBottom: "1px solid #e5e7eb",
                  padding: "7px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#374151",
                  fontWeight: 500,
                }}
              >
                第19回公募対応
              </div>
              {/* App body */}
              <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 220px", minHeight: "420px", background: "#fff" }}>
                {/* Left panel */}
                <div style={{ borderRight: "1px solid #e5e7eb", padding: "16px", background: "#f9fafb" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: "12px" }}>入力パネル</div>
                  <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>HP URL</div>
                  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "7px 10px", fontSize: "12px", color: "#9ca3af", marginBottom: "10px" }}>
                    https://example.com
                  </div>
                  <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>社名・屋号</div>
                  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "7px 10px", fontSize: "12px", color: "#9ca3af", marginBottom: "10px" }}>
                    例：株式会社山田商店
                  </div>
                  <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>ヒアリング</div>
                  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "7px 10px", fontSize: "12px", color: "#374151", marginBottom: "12px", lineHeight: 1.6, minHeight: "72px" }}>
                    飲食店・創業8年・従業員3名・券売機導入で会計効率化を検討中...
                  </div>
                  <div style={{ background: "#0f2346", color: "#fff", borderRadius: "8px", padding: "9px", textAlign: "center", fontSize: "13px", fontWeight: 700 }}>
                    情報を送信
                  </div>
                  <div style={{ marginTop: "14px", fontSize: "11px", color: "#374151", fontWeight: 700 }}>経営計画</div>
                  <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px", lineHeight: 1.8 }}>
                    ○ 1-1. 自社の概要<br />
                    ○ 1-2. 売上・利益の状況<br />
                    ○ 1-3. 経営課題<br />
                    ○ 2-1. 市場の動向
                  </div>
                </div>
                {/* Chat panel */}
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f2346", borderBottom: "2px solid #0f2346", paddingBottom: "10px", marginBottom: "-13px" }}>💬 AIチャット</div>
                    <div style={{ fontSize: "13px", color: "#6b7280", marginLeft: "16px" }}>📋 項目別</div>
                  </div>
                  <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "14px", fontSize: "13px", color: "#374151", lineHeight: 1.75, border: "1px solid #e5e7eb" }}>
                    こんにちは。持続化補助金（第19回）の事業計画書作成をサポートするAIです。<br /><br />
                    ヒアリング情報をもとに、計画書の下書きを一緒に作り上げていきます。
                  </div>
                  <div style={{ background: "#eff6ff", borderRadius: "10px", padding: "14px", fontSize: "13px", color: "#1e40af", lineHeight: 1.75, border: "1px solid #bfdbfe" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", marginBottom: "6px" }}>✓ 下書き生成完了</div>
                    【経営計画 1-1. 自社の概要】株式会社〇〇は、2016年の創業以来、地域密着型の飲食業を営んでおり、ラーメン専門店として地域顧客から高い支持を得ている...
                  </div>
                  <div style={{ marginTop: "auto", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#9ca3af" }}>
                    メッセージを入力...
                  </div>
                </div>
                {/* Right scoring panel */}
                <div style={{ borderLeft: "1px solid #e5e7eb", padding: "16px", background: "#f9fafb" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: "4px", textAlign: "center" }}>完成度チェック</div>
                  <div style={{ textAlign: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "36px", fontWeight: 700, color: "#dc2626" }}>0</span>
                    <span style={{ fontSize: "16px", color: "#6b7280" }}>/75</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", textAlign: "center", marginBottom: "12px" }}>ドラフト生成後に表示されます</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {[
                      "#1 直近の数値を表で示しているか",
                      "#2 課題を機会損失金額で定量化",
                      "#3 市場データを出典付きで引用",
                      "#4 ターゲットを具体的に定義",
                      "#5 強みを数値根拠で示している",
                    ].map((item) => (
                      <div key={item} style={{ fontSize: "11px", color: "#374151", display: "flex", justifyContent: "space-between" }}>
                        <span>{item}</span>
                        <span style={{ color: "#9ca3af" }}>0/5</span>
                      </div>
                    ))}
                    <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px", textAlign: "center" }}>… 全15項目</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW */}
        <section className="how-sec" id="how">
          <div className="sec-inner">
            <h2 className="sec-title fi">使い方はとっても簡単</h2>
            <img
              src="/steps.png"
              alt="使い方はとっても簡単"
              style={{ width: "100%", height: "auto", borderRadius: "16px" }}
            />
          </div>
        </section>

        {/* DIFF */}
        <section className="diff-sec">
          <div className="sec-inner">
            <h2 className="sec-title fi">汎用AIとの違い</h2>
            <div className="diff-grid">
              <div className="diff-card good fi">
                <div className="diff-card-header">
                  <span className="diff-tag good">さくせいくん</span>
                  <h3>補助金専用設計</h3>
                </div>
                <ul className="diff-list">
                  <li>様式2準拠の構成で自動出力</li>
                  <li>15項目の採点ロジックを組み込み済み</li>
                  <li>根拠のない数値は出力しない設計</li>
                  <li>案件ごとの履歴保存に対応</li>
                  <li>プロンプト設定・工夫が不要</li>
                </ul>
              </div>
              <div className="diff-card bad fi">
                <div className="diff-card-header">
                  <span className="diff-tag bad">汎用AI（ChatGPT等）</span>
                  <h3>汎用目的の設計</h3>
                </div>
                <ul className="diff-list">
                  <li>様式2の構成は自分で指示が必要</li>
                  <li>採点ロジックは非対応</li>
                  <li>根拠のない数値を平気で出力する</li>
                  <li>履歴保存は非対応</li>
                  <li>毎回プロンプトの工夫が必要</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* VOICES */}
        <section style={{ padding: "100px 32px", background: "var(--bg)" }}>
          <div className="sec-inner">
            <h2 className="sec-title fi">ご利用者の声</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
              {[
                {
                  text: "今回のように全文を一気に作成させる機能には感動いたしました。AIは弊所も積極的に利用していますが、打合せの音声・動画から起こせるという部分も大変興味深いです。御社の開発には大きな期待をしています。",
                  role: "行政書士",
                },
                {
                  text: "文案がサクッと作れてよかったです。文章の内容もそのまま使えるわけではないですが、大幅修正ではなく行けそうなので、効率化としてとてもいいと思います。",
                  role: "行政書士（監修）",
                },
                {
                  text: "ツボを押さえた文章を構築してもらえたので助かりました。補助金向けの文章品質が汎用AIとは違うと感じました。",
                  role: "行政書士法人",
                },
                {
                  text: "時間がない中、ひとまず商工会議所に提出できました。簡単にドラフトができたのは助かりました。",
                  role: "行政書士法人",
                },
                {
                  text: "ChatGPT・Geminiでは全然見当違いな回答で使えなかったですが、このシステムはしっかりしています。様式に準拠した出力がされるので便利です。",
                  role: "行政書士",
                },
                {
                  text: "ヒアリング内容を入力するだけで、ある程度の計画書が出来上がります。作業工程が大幅に省略化されました。",
                  role: "行政書士",
                },
              ].map((v, i) => (
                <div key={i} className="fi" style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "16px", padding: "32px 28px" }}>
                  <div style={{ fontSize: "32px", color: "var(--gold)", lineHeight: 1, marginBottom: "16px" }}>"</div>
                  <p style={{ fontSize: "16px", color: "var(--ink-mid)", lineHeight: 2, marginBottom: "20px" }}>{v.text}</p>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--navy)" }}>{v.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DEVELOPER */}
        <section style={{ padding: "100px 32px", background: "var(--white)" }}>
          <div className="sec-inner">
            <h2 className="sec-title fi">開発者について</h2>
            <div
              className="fi"
              style={{
                background: "var(--white)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "48px 44px",
              }}
            >
              <div style={{ fontSize: "17px", color: "var(--ink-mid)", lineHeight: 2.1, marginBottom: "32px" }}>
                <p style={{ margin: '0 0 1em' }}>中小企業のFPとして財務・経営改善に携わり、<br />補助金を6年研究してきた知見をAIに組み込んだWebツールです。</p>
                <p style={{ margin: 0 }}>エンジニアでもない私が、現場感覚を損なわずに作り上げました。</p>
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px", fontSize: "15px", color: "var(--ink-light)" }}>
                とみながFP事務所　富永淳一
              </div>
            </div>
          </div>
        </section>

        {/* BONUS */}
        <section className="bonus-sec" id="bonus">
          <div className="sec-inner">
            <div className="bonus-box fi">
              <div>
                <span className="bonus-tag">ご契約特典</span>
                <h2 className="bonus-title">
                  持続化補助金
                  <br />
                  採択ヒアリングシート
                </h2>
                <div className="bonus-text">
                  <p>
                    ご契約の特典として、「持続化補助金 採択ヒアリングシート」をお渡しします。
                  </p>
                  <p>
                    審査員の採点項目と対応した質問リスト。これ1枚で、ヒアリングが60分でまとまり、入力に必要な情報が漏れなく揃います。
                  </p>
                  <p>ツールの下書き精度は、ヒアリングの質で決まります。</p>
                </div>
              </div>
              <div className="bonus-visual">
                <div className="bonus-visual-title">📋 ヒアリングシートの構成</div>
                <div className="bonus-item">
                  <span className="bonus-item-num">1</span>
                  <span>企業実態と収益構造（様式2 / 1-1・1-2対応）</span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-item-num">2</span>
                  <span>経営資源の深掘りと課題の特定（1-3・3対応）</span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-item-num">3</span>
                  <span>外部環境と戦略的ポジショニング（2-1・2-2対応）</span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-item-num">4</span>
                  <span>補助事業の具体性・実現可能性（2-2・2-3対応）</span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-item-num">5</span>
                  <span>投資対効果と社会的意義（4-1・4-2対応）</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="pricing-sec" id="pricing">
          <div className="sec-inner">
            <h2 className="sec-title fi" style={{ textAlign: "center" }}>料金プラン</h2>
            <div className="pricing-grid fi">
              {/* Monthly */}
              <div className="pricing-card">
                <div className="pricing-plan-name">月額プラン</div>
                <div className="pricing-price">¥29,800<span> / 月（税込）</span></div>
                <div className="pricing-limit">毎月3件まで</div>
                <ul className="pricing-features">
                  <li>毎月1日に3件付与</li>
                  <li>未使用分の翌月繰り越しなし</li>
                  <li>追加1件 ¥9,800</li>
                  <li>ヒアリングシート（ご契約特典）</li>
                  <li>過去の会話履歴はすべて保存</li>
                </ul>
                <a href={MONTHLY_URL} className="pricing-cta">月払いで申し込む</a>
              </div>
              {/* Annual */}
              <div className="pricing-card recommended">
                <div className="pricing-rec-badge">おすすめ・50% OFF</div>
                <div className="pricing-plan-name">年額プラン</div>
                <div className="pricing-price">¥178,800<span> / 年（税込）</span></div>
                <div className="pricing-per" style={{ color: "var(--gold)", fontWeight: 700 }}>月換算 ¥14,900（月額の50%OFF）</div>
                <div className="pricing-limit">年間30件まで</div>
                <ul className="pricing-features">
                  <li>年間30件を自由に使える</li>
                  <li>月をまたいでも件数が減らない</li>
                  <li>追加1件 ¥9,800</li>
                  <li>ヒアリングシート（ご契約特典）</li>
                  <li>過去の会話履歴はすべて保存</li>
                </ul>
                <a href={YEARLY_URL} className="pricing-cta">年払いで申し込む</a>
              </div>
            </div>
            <div className="pricing-note fi">
              ※ 月3件を超える場合は1件¥9,800で追加できます。<br />
              ※ 月払いは毎月1日課金。解約は前月20日までにご連絡ください。<br />
              ※ 料金は税込表記です。
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="faq-sec" id="faq">
          <div className="sec-inner">
            <h2 className="sec-title fi">よくある質問</h2>
            <div className="faq-list">
              <div className="faq-item fi">
                <p className="faq-q">
                  <span className="faq-q-mark">Q</span>
                  生成された計画書はそのまま提出できますか？
                </p>
                <p className="faq-a">
                  さくせいくんは「下書き・たたき台」を生成するツールです。行政書士が内容を確認・加筆・修正したうえでご利用ください。申請書類の最終責任はご利用者様にあります。
                </p>
              </div>
              <div className="faq-item fi">
                <p className="faq-q">
                  <span className="faq-q-mark">Q</span>
                  月3件を超えた場合はどうなりますか？
                </p>
                <p className="faq-a">
                  超過した分は1件¥9,800（税込）で追加購入できます。既存の会話の続きは件数を消費しません。新しい会話（新案件）を作成するときのみカウントされます。
                </p>
              </div>
              <div className="faq-item fi">
                <p className="faq-q">
                  <span className="faq-q-mark">Q</span>
                  年額プランの30件はどのように使えますか？
                </p>
                <p className="faq-a">
                  年間を通じて自由に30件まで使えます。月をまたいでもカウントはリセットされません。繁忙期にまとめて使うことができます。
                </p>
              </div>
              <div className="faq-item fi">
                <p className="faq-q">
                  <span className="faq-q-mark">Q</span>
                  第19回以外にも使えますか？
                </p>
                <p className="faq-a">
                  現在は第19回に対応した設計です。第20回以降の公募要領が発表され次第、順次対応してまいります。
                </p>
              </div>
              <div className="faq-item fi">
                <p className="faq-q">
                  <span className="faq-q-mark">Q</span>
                  入力した顧客情報は安全ですか？
                </p>
                <p className="faq-a">
                  入力いただいた情報は計画書生成のみに使用します。第三者への提供・販売は一切行いません。
                </p>
              </div>
              <div className="faq-item fi">
                <p className="faq-q">
                  <span className="faq-q-mark">Q</span>
                  解約はいつでもできますか？
                </p>
                <p className="faq-a">
                  月払いは前月20日までにご連絡いただければ翌月から停止できます。年払いは契約期間満了をもって終了となります（途中解約による返金は対応しておりません）。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-sec">
          <h2 className="fi">補助金計画書の初稿作業を、もっとスマートに。</h2>
          <p className="fi">
            様式2準拠・15項目採点ロジック搭載。<br />
            クルーズ行政書士事務所　太田吉博 監修。
          </p>
          <a href={CTA_HREF} className="btn-cta fi">
            今すぐ申し込む →
          </a>
          <p className="cta-note">
            補助金業務に携わる行政書士の方へ ／ 持続化補助金 第19回対応
          </p>
        </section>

        {/* FOOTER */}
        <footer className="lp-footer">
          <div className="footer-links">
            <a href="/tokushoho">特定商取引法に基づく表記</a>
            <a href="/privacy-policy">プライバシーポリシー</a>
          </div>
          <p className="footer-copy">
            © 2026 とみながFP事務所　富永淳一　All Rights Reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
