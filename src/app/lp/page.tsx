"use client";

import { useEffect, useRef } from "react";

const CTA_HREF = "https://sakuseikun.jp/register?ref=monitor";

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

/* ALERT */
.lp-root .alert-bar{background:var(--red-bg);padding:11px 24px;text-align:center;}
.lp-root .alert-bar p{font-size:16px;color:#fff;}
.lp-root .alert-bar span{color:#ffcc66;font-weight:700;}

/* HERO */
.lp-root .hero{padding:80px 32px 96px;background:linear-gradient(135deg,#f8faff 0%,#ffffff 50%,#fdf8ec 100%);position:relative;overflow:hidden;}
.lp-root .hero::before{content:'';position:absolute;top:0;right:0;width:600px;height:600px;background:radial-gradient(circle at 70% 30%,rgba(37,99,235,0.06) 0%,transparent 60%);pointer-events:none;}
.lp-root .hero::after{content:'';position:absolute;bottom:0;left:0;width:400px;height:400px;background:radial-gradient(circle,rgba(184,134,11,0.05) 0%,transparent 60%);pointer-events:none;}
.lp-root .hero-inner{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr 420px;gap:72px;align-items:center;position:relative;z-index:1;}
.lp-root .hero-eyebrow{font-size:15px;color:var(--ink-light);font-weight:600;letter-spacing:0.1em;margin-bottom:12px;}
.lp-root .hero-badge{display:inline-flex;align-items:center;gap:6px;background:var(--blue-light);color:var(--blue-accent);font-size:14px;font-weight:700;padding:6px 16px;border-radius:999px;margin-bottom:24px;border:1px solid rgba(37,99,235,0.15);}
.lp-root .hero-title{font-family:'DM Sans',sans-serif;font-weight:700;font-size:clamp(34px,4vw,52px);color:var(--ink);line-height:1.2;margin-bottom:20px;letter-spacing:-0.02em;}
.lp-root .hero-title span{color:var(--navy);}
.lp-root .hero-sub{font-size:19px;color:var(--ink-mid);line-height:1.9;}

/* FORM CARD */
.lp-root .hero-form-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:32px 28px;box-shadow:0 20px 60px rgba(0,0,0,0.1),0 4px 16px rgba(0,0,0,0.06);animation:lpFloatUp 0.8s ease both 0.3s;}
@keyframes lpFloatUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.lp-root .form-heading{font-family:'DM Sans',sans-serif;font-size:22px;font-weight:700;color:var(--navy);margin-bottom:6px;}
.lp-root .form-sub{font-size:15px;color:var(--ink-light);margin-bottom:16px;line-height:1.7;}
.lp-root .benefit-box{background:var(--green-bg);border-left:3px solid #16a34a;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:20px;}
.lp-root .benefit-row{display:flex;align-items:flex-start;gap:10px;font-size:15px;color:var(--green);line-height:1.6;}
.lp-root .benefit-row+.benefit-row{margin-top:8px;}
.lp-root .benefit-num{background:#16a34a;color:#fff;font-size:12px;font-weight:700;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;}
.lp-root .form-group{margin-bottom:14px;}
.lp-root .form-group label{display:block;font-size:14px;font-weight:700;color:var(--ink-mid);margin-bottom:6px;letter-spacing:0.03em;}
.lp-root .form-group label .req{color:#b91c1c;margin-left:3px;font-weight:400;}
.lp-root .form-control{width:100%;border:1.5px solid var(--border);border-radius:8px;padding:12px 14px;font-size:16px;font-family:'Noto Sans JP',sans-serif;color:var(--ink);background:var(--bg);outline:none;transition:border-color 0.15s;}
.lp-root .form-control:focus{border-color:var(--blue-accent);background:#fff;}
.lp-root .cta-btn{width:100%;background:var(--navy);color:#fff;border:none;border-radius:10px;padding:17px;font-size:17px;font-weight:700;font-family:'Noto Sans JP',sans-serif;cursor:pointer;letter-spacing:0.04em;margin-top:6px;transition:all 0.2s;}
.lp-root .cta-btn:hover{background:var(--navy-mid);transform:translateY(-1px);}
.lp-root .form-note{text-align:center;font-size:14px;color:var(--ink-light);margin-top:10px;}

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
            <a href="#bonus">特典</a>
            <a href="#faq">FAQ</a>
            <a href={CTA_HREF} className="btn-sm" style={{ color: '#ffffff' }}>
              無料登録
            </a>
          </nav>
        </header>

        {/* ALERT */}
        <div className="alert-bar">
          <p>
            📣 モニター限定特典：
            <span>4月30日まで計画書作成が無制限</span>
            ＋ヒアリングシートプレゼント
          </p>
        </div>

        {/* HERO */}
        <section className="hero">
          <div className="hero-inner">
            <div style={{ animation: "lpFloatUp 0.7s ease both 0.1s" }}>
              <p className="hero-eyebrow">
                補助金業務に携わる行政書士の方へ
              </p>
              <div
                style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg,#b8860b,#d4a017)",
                  color: "#fff",
                  fontSize: "22px",
                  fontWeight: 900,
                  padding: "14px 32px",
                  borderRadius: "10px",
                  marginBottom: "24px",
                  letterSpacing: "0.05em",
                  boxShadow: "0 4px 20px rgba(184,134,11,0.4)",
                }}
              >
                🎁 モニター募集中・4月30日まで無制限
              </div>
              <h1 className="hero-title">
                持続化補助金の計画書下書きを、
                <br />
                <span>AIが即座に生成する。</span>
              </h1>
              <p className="hero-sub">
                ヒアリング情報を入力するだけで、様式2準拠の経営計画書・補助事業計画書の下書きテキストを出力。構成・初稿の作業時間を大幅に圧縮します。
              </p>
            </div>

            {/* Right: CTA */}
            <div id="form">
              <div className="hero-form-card">
                <p className="form-heading">無料モニター登録</p>
                <p className="form-sub">
                  登録後すぐにご利用いただけます。クレジットカード不要。
                </p>
                <div className="benefit-box">
                  <div className="benefit-row">
                    <div className="benefit-num">1</div>
                    <span>
                      4月30日まで計画書の作成が<strong>無制限</strong>
                    </span>
                  </div>
                  <div className="benefit-row">
                    <div className="benefit-num">2</div>
                    <span>
                      プロ仕様の<strong>ヒアリングシート</strong>をプレゼント
                    </span>
                  </div>
                </div>
                <a
                  href={CTA_HREF}
                  className="cta-btn"
                  style={{
                    display: "block",
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  無料でモニター登録する →
                </a>
                <p className="form-note">
                  登録は無料です。いつでも解除できます。
                </p>
              </div>
            </div>
          </div>
        </section>

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
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: "#ff5f57",
                    }}
                  />
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: "#febc2e",
                    }}
                  />
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: "#28c840",
                    }}
                  />
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      background: "#0f2346",
                      color: "#b8860b",
                      fontSize: "11px",
                      fontWeight: 900,
                      padding: "3px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    さ
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f2346",
                    }}
                  >
                    補助金計画書 さくせいくん
                  </span>
                  <span style={{ fontSize: "11px", color: "#6b7280" }}>
                    運営：とみながFP事務所
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  <span style={{ color: "#0f2346", fontWeight: 700 }}>
                    無制限（4/30まで）
                  </span>
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
                第19回限定・2026年4月30日まで有効
              </div>
              {/* App body */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "240px 1fr 220px",
                  minHeight: "420px",
                  background: "#fff",
                }}
              >
                {/* Left panel */}
                <div
                  style={{
                    borderRight: "1px solid #e5e7eb",
                    padding: "16px",
                    background: "#f9fafb",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#111827",
                      marginBottom: "12px",
                    }}
                  >
                    入力パネル
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    HP URL
                  </div>
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      padding: "7px 10px",
                      fontSize: "12px",
                      color: "#9ca3af",
                      marginBottom: "10px",
                    }}
                  >
                    https://example.com
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    社名・屋号
                  </div>
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      padding: "7px 10px",
                      fontSize: "12px",
                      color: "#9ca3af",
                      marginBottom: "10px",
                    }}
                  >
                    例：株式会社山田商店
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                      marginBottom: "4px",
                    }}
                  >
                    ヒアリング
                  </div>
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      padding: "7px 10px",
                      fontSize: "12px",
                      color: "#374151",
                      marginBottom: "12px",
                      lineHeight: 1.6,
                      minHeight: "72px",
                    }}
                  >
                    飲食店・創業8年・従業員3名・券売機導入で会計効率化を検討中...
                  </div>
                  <div
                    style={{
                      background: "#0f2346",
                      color: "#fff",
                      borderRadius: "8px",
                      padding: "9px",
                      textAlign: "center",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    情報を送信
                  </div>
                  <div
                    style={{
                      marginTop: "14px",
                      fontSize: "11px",
                      color: "#374151",
                      fontWeight: 700,
                    }}
                  >
                    経営計画
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                      marginTop: "4px",
                      lineHeight: 1.8,
                    }}
                  >
                    ○ 1-1. 自社の概要
                    <br />
                    ○ 1-2. 売上・利益の状況
                    <br />
                    ○ 1-3. 経営課題
                    <br />○ 2-1. 市場の動向
                  </div>
                </div>
                {/* Chat panel */}
                <div
                  style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      borderBottom: "1px solid #e5e7eb",
                      paddingBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#0f2346",
                        borderBottom: "2px solid #0f2346",
                        paddingBottom: "10px",
                        marginBottom: "-13px",
                      }}
                    >
                      💬 AIチャット
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        marginLeft: "16px",
                      }}
                    >
                      📋 項目別
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#f9fafb",
                      borderRadius: "10px",
                      padding: "14px",
                      fontSize: "13px",
                      color: "#374151",
                      lineHeight: 1.75,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    こんにちは。持続化補助金（第19回）の事業計画書作成をサポートするAIです。
                    <br />
                    <br />
                    ヒアリング情報をもとに、計画書の下書きを一緒に作り上げていきます。
                  </div>
                  <div
                    style={{
                      background: "#eff6ff",
                      borderRadius: "10px",
                      padding: "14px",
                      fontSize: "13px",
                      color: "#1e40af",
                      lineHeight: 1.75,
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#2563eb",
                        marginBottom: "6px",
                      }}
                    >
                      ✓ 下書き生成完了
                    </div>
                    【経営計画 1-1.
                    自社の概要】株式会社〇〇は、2016年の創業以来、地域密着型の飲食業を営んでおり、ラーメン専門店として地域顧客から高い支持を得ている...
                  </div>
                  <div
                    style={{
                      marginTop: "auto",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      fontSize: "13px",
                      color: "#9ca3af",
                    }}
                  >
                    メッセージを入力...
                  </div>
                </div>
                {/* Right scoring panel */}
                <div
                  style={{
                    borderLeft: "1px solid #e5e7eb",
                    padding: "16px",
                    background: "#f9fafb",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#111827",
                      marginBottom: "4px",
                      textAlign: "center",
                    }}
                  >
                    完成度チェック
                  </div>
                  <div style={{ textAlign: "center", marginBottom: "12px" }}>
                    <span
                      style={{
                        fontSize: "36px",
                        fontWeight: 700,
                        color: "#dc2626",
                      }}
                    >
                      0
                    </span>
                    <span style={{ fontSize: "16px", color: "#6b7280" }}>
                      /75
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#9ca3af",
                      textAlign: "center",
                      marginBottom: "12px",
                    }}
                  >
                    ドラフト生成後に表示されます
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {[
                      "#1 直近の数値を表で示しているか",
                      "#2 課題を機会損失金額で定量化",
                      "#3 市場データを出典付きで引用",
                      "#4 ターゲットを具体的に定義",
                      "#5 強みを数値根拠で示している",
                    ].map((item) => (
                      <div
                        key={item}
                        style={{
                          fontSize: "11px",
                          color: "#374151",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{item}</span>
                        <span style={{ color: "#9ca3af" }}>0/5</span>
                      </div>
                    ))}
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        marginTop: "4px",
                        textAlign: "center",
                      }}
                    >
                      … 全15項目
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW */}
        <section className="how-sec" id="how">
          <div className="sec-inner">
            <h2 className="sec-title fi">使い方は4ステップ</h2>
            <div className="how-steps">
              <div className="how-step fi">
                <div className="step-num">1</div>
                <h3>無料登録</h3>
                <p>
                  氏名・法人名・メールアドレスで登録完了。モニター期間中は計画書作成が無制限で使えます。
                </p>
              </div>
              <div className="how-step fi">
                <div className="step-num">2</div>
                <h3>情報を入力</h3>
                <p>
                  面談音声の文字起こし・メモ・HPのURLを入力。AIが不足情報を質問してくれます。
                </p>
              </div>
              <div className="how-step fi">
                <div className="step-num">3</div>
                <h3>下書きが生成される</h3>
                <p>
                  様式2準拠の経営計画・補助事業計画のたたき台テキストを即座に出力します。
                </p>
              </div>
              <div className="how-step fi">
                <div className="step-num">4</div>
                <h3>確認・加筆して完成</h3>
                <p>
                  生成された下書きをもとに、専門家として内容を確認・加筆・仕上げて完成させます。
                </p>
              </div>
            </div>
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

        {/* DEVELOPER */}
        <section style={{ padding: "100px 32px", background: "var(--bg)" }}>
          <div className="sec-inner">
            <h2 className="sec-title fi">開発者について</h2>
            <div
              className="fi"
              style={{
                background: "var(--white)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "48px 44px",
                maxWidth: "800px",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--navy)",
                  lineHeight: 1.6,
                  marginBottom: "24px",
                  borderLeft: "4px solid var(--navy)",
                  paddingLeft: "20px",
                }}
              >
                中小企業FPとして資金繰り・経営計画の支援に携わってきた知見と、補助金の徹底研究をベースに、AIと対話しながら作り上げたWebツールです。
              </div>
              <div
                style={{
                  fontSize: "17px",
                  color: "var(--ink-mid)",
                  lineHeight: 2.1,
                  marginBottom: "16px",
                }}
              >
                私はFP（ファイナンシャルプランナー）として、中小企業の資金繰りや事業の収支計画・ビジネスモデルの構築といった「財務・経営改善」に伴走してきました。補助金の審査員が事業計画書で最も厳しく見るのは、整った日本語ではありません。「この事業は投資する価値があるか」「売上目標の数字に根拠はあるか」という、極めてシビアなビジネスと数字のロジックです。
              </div>
              <div
                style={{
                  fontSize: "17px",
                  color: "var(--ink-mid)",
                  lineHeight: 2.1,
                  marginBottom: "32px",
                }}
              >
                そのロジックを体系化し、AIに組み込んだのが補助金計画書さくせいくんです。エンジニアでもない人間が、AIとの対話だけで作り上げたシステム——それが逆に、現場感覚を損なわない設計につながっていると思っています。
              </div>
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: "20px",
                  fontSize: "15px",
                  color: "var(--ink-light)",
                }}
              >
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
                <span className="bonus-tag">無料登録特典</span>
                <h2 className="bonus-title">
                  持続化補助金
                  <br />
                  採択ヒアリングシート
                </h2>
                <div className="bonus-text">
                  <p>
                    無料登録の特典として、「持続化補助金
                    採択ヒアリングシート」をお渡しします。
                  </p>
                  <p>
                    審査員の採点項目と対応した質問リスト。これ1枚で、ヒアリングが60分でまとまり、入力に必要な情報が漏れなく揃います。
                  </p>
                  <p>ツールの下書き精度は、ヒアリングの質で決まります。</p>
                </div>
              </div>
              <div className="bonus-visual">
                <div className="bonus-visual-title">
                  📋 ヒアリングシートの構成
                </div>
                <div className="bonus-item">
                  <span className="bonus-item-num">1</span>
                  <span>
                    企業実態と収益構造（様式2 / 1-1・1-2対応）
                  </span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-item-num">2</span>
                  <span>
                    経営資源の深掘りと課題の特定（1-3・3対応）
                  </span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-item-num">3</span>
                  <span>
                    外部環境と戦略的ポジショニング（2-1・2-2対応）
                  </span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-item-num">4</span>
                  <span>
                    補助事業の具体性・実現可能性（2-2・2-3対応）
                  </span>
                </div>
                <div className="bonus-item">
                  <span className="bonus-item-num">5</span>
                  <span>
                    投資対効果と社会的意義（4-1・4-2対応）
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section style={{padding: '3rem 1rem 2rem', maxWidth: '860px', margin: '0 auto'}}>
          <h2 style={{fontSize: '28px', fontWeight: 500, margin: '0 0 2rem'}}>料金プラン</h2>
          <div style={{background: '#1a2744', borderRadius: '12px', padding: '2rem 2.5rem', marginBottom: '2rem'}}>
            <span style={{display: 'inline-block', background: '#c8a04a', color: '#fff', fontSize: '18px', fontWeight: 500, padding: '8px 20px', borderRadius: '4px', marginBottom: '1rem', letterSpacing: '0.05em'}}>無料モニター募集中</span>
            <p style={{fontSize: '24px', fontWeight: 500, color: '#fff', margin: '0 0 0.75rem'}}>4月30日まで計画書の作成が無制限で体験いただけます</p>
            <p style={{fontSize: '15px', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.7}}>生成されたテキストはそのままご利用可能。まずは品質をお確かめください。</p>
          </div>
          <p style={{fontSize: '11px', color: '#888', margin: '0 0 0.75rem'}}>通常料金（5月以降）</p>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem'}}>
            <div style={{background: '#f5f2eb', border: '0.5px solid #ddd', borderRadius: '8px', padding: '1rem 1.25rem'}}>
              <p style={{fontSize: '11px', color: '#888', margin: '0 0 0.25rem'}}>月額プラン</p>
              <p style={{fontSize: '26px', fontWeight: 500, margin: 0, lineHeight: 1}}>29,800<span style={{fontSize: '12px', fontWeight: 400, color: '#888'}}>円/月</span></p>
              <p style={{fontSize: '11px', color: '#888', margin: '0.25rem 0 0.5rem'}}>月3件まで利用可能</p>
              <p style={{fontSize: '11px', color: '#888', borderTop: '0.5px solid #ddd', paddingTop: '0.5rem', margin: 0}}>毎月安定して受任がある方向け。</p>
            </div>
            <div style={{background: '#f5f2eb', border: '0.5px solid #ddd', borderRadius: '8px', padding: '1rem 1.25rem'}}>
              <p style={{fontSize: '11px', color: '#888', margin: '0 0 0.25rem'}}>年額プラン</p>
              <p style={{fontSize: '26px', fontWeight: 500, margin: 0, lineHeight: 1}}>178,800<span style={{fontSize: '12px', fontWeight: 400, color: '#888'}}>円/年</span></p>
              <p style={{fontSize: '11px', color: '#888', margin: '0.25rem 0 0.5rem'}}>月3件まで ／ 月換算14,900円（月額比50%お得）</p>
              <p style={{fontSize: '11px', color: '#888', borderTop: '0.5px solid #ddd', paddingTop: '0.5rem', margin: 0}}>年間を通じて活用したい方向け。年額なら半額。</p>
            </div>
          </div>
          <div style={{fontSize: '11px', color: '#888', lineHeight: 2.2}}>
            <p style={{margin: 0}}>※ 月3件を超える場合は1件9,800円で追加できます。</p>
            <p style={{margin: 0}}>※ モニター期間中に登録した方が、自動で有料プランに移行されることはありません。</p>
            <p style={{margin: 0}}>※ 料金は税込表記です。</p>
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
                  モニター期間はいつまでですか？
                </p>
                <p className="faq-a">
                  2026年4月30日までです。期間中は計画書の作成が無制限でご利用いただけます。
                </p>
              </div>
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
                  登録にクレジットカードは必要ですか？
                </p>
                <p className="faq-a">
                  不要です。氏名・法人名・メールアドレスだけで登録できます。モニター期間終了後も、自動で有料プランに移行されることはありません。
                </p>
              </div>
              <div className="faq-item fi">
                <p className="faq-q">
                  <span className="faq-q-mark">Q</span>
                  第19回以外にも使えますか？
                </p>
                <p className="faq-a">
                  現在は第19回に対応した設計です。次回以降の公募要領が発表され次第、順次対応してまいります。
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
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-sec">
          <h2 className="fi">まず登録して、試してください。</h2>
          <p className="fi">
            4月30日までモニター特典として計画書作成が無制限。
            <br />
            クレジットカード不要。この驚く品質を確かめてください。
          </p>
          <a href={CTA_HREF} className="btn-cta fi">
            無料でモニター登録する →
          </a>
          <p className="cta-note">
            補助金業務に携わる行政書士の方へ ／ 持続化補助金 第19回対応
          </p>
        </section>

        {/* FOOTER */}
        <footer className="lp-footer">
          <div className="footer-links">
            <a
              href="https://tominaga-fp.com/sakuseikun/tokusyoho/"
              target="_blank"
              rel="noopener noreferrer"
            >
              特定商取引法に基づく表記
            </a>
            <a
              href="https://tominaga-fp.com/sakuseikun/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              プライバシーポリシー
            </a>
          </div>
          <p className="footer-copy">
            © 2026 とみながFP事務所　富永淳一　All Rights Reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
