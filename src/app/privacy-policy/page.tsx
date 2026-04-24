export default function PrivacyPolicyPage() {
  return (
    <>
      <style>{`
        :root { --navy:#0f2346; --gold:#b8860b; --ink:#1a1a1a; --ink-mid:#4a4a4a; --ink-light:#8a8a8a; --border:#e0e0e0; --bg:#f9f9f9; --white:#ffffff; }
        .pp-body { font-family:'Noto Sans JP',sans-serif; background:var(--bg); color:var(--ink); line-height:1.8; }
        .pp-header { background:var(--navy); padding:14px 32px; display:flex; align-items:center; }
        .pp-logo { font-family:'Noto Serif JP',serif; font-weight:700; font-size:17px; color:var(--white); text-decoration:none; }
        .pp-logo em { font-style:normal; color:#d4a017; }
        .pp-hero { background:var(--navy); padding:48px 32px 56px; border-bottom:3px solid var(--gold); }
        .pp-hero-inner { max-width:760px; margin:0 auto; }
        .pp-hero h1 { font-family:'Noto Serif JP',serif; font-weight:700; font-size:clamp(22px,3vw,30px); color:var(--white); }
        .pp-hero p { font-size:13px; color:rgba(255,255,255,0.5); margin-top:8px; }
        .pp-content { max-width:760px; margin:0 auto; padding:56px 32px; }
        .pp-intro { font-size:15px; color:var(--ink-mid); line-height:2; margin-bottom:40px; padding:24px; background:var(--white); border:1px solid var(--border); border-left:4px solid var(--navy); }
        .pp-article { margin-bottom:36px; }
        .pp-article h2 { font-family:'Noto Serif JP',serif; font-weight:700; font-size:17px; color:var(--navy); margin-bottom:14px; padding-bottom:8px; border-bottom:1px solid var(--border); }
        .pp-article p { font-size:14px; color:var(--ink-mid); line-height:1.95; margin-bottom:12px; }
        .pp-article p:last-child { margin-bottom:0; }
        .pp-article ol, .pp-article ul { font-size:14px; color:var(--ink-mid); line-height:1.95; padding-left:24px; margin-bottom:12px; }
        .pp-article li { margin-bottom:6px; }
        .pp-contact-box { background:var(--white); border:1px solid var(--border); padding:24px; margin-top:16px; }
        .pp-contact-box p { font-size:14px; color:var(--ink-mid); line-height:1.95; margin-bottom:6px; }
        .pp-footer { background:var(--navy); padding:32px; text-align:center; }
        .pp-footer-links { display:flex; gap:20px; justify-content:center; flex-wrap:wrap; margin-bottom:14px; }
        .pp-footer-links a { font-size:12px; color:rgba(255,255,255,0.35); text-decoration:none; }
        .pp-footer-copy { font-size:11px; color:rgba(255,255,255,0.2); }
        @media(max-width:600px){ .pp-content{padding:36px 18px;} .pp-header{padding:12px 16px;} .pp-hero{padding:36px 18px 44px;} }
      `}</style>
      <div className="pp-body">
        <header className="pp-header">
          <a href="/" className="pp-logo">補助金計画書<em>さくせいくん</em></a>
        </header>
        <div className="pp-hero">
          <div className="pp-hero-inner">
            <h1>プライバシーポリシー</h1>
            <p>最終更新日：2026年3月</p>
          </div>
        </div>
        <div className="pp-content">
          <div className="pp-intro">
            とみながFP事務所（以下「当方」といいます）は、補助金計画書さくせいくん（以下「本サービス」といいます）におけるユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシーを定めます。
          </div>
          <div className="pp-article">
            <h2>第1条（個人情報）</h2>
            <p>「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報を指します。</p>
          </div>
          <div className="pp-article">
            <h2>第2条（個人情報の収集方法）</h2>
            <p>当方は、ユーザーが本サービスに利用登録をする際に、メールアドレス等の個人情報をお尋ねすることがあります。また、本サービスのご利用にあたりクレジットカード情報の入力をお願いする場合がありますが、カード情報は決済代行会社（ファーストペイメント株式会社）が管理し、当方のサーバーには保存されません。</p>
          </div>
          <div className="pp-article">
            <h2>第3条（個人情報を収集・利用する目的）</h2>
            <p>当方が個人情報を収集・利用する目的は以下のとおりです。</p>
            <ol>
              <li>本サービスの提供・運営のため</li>
              <li>ユーザーからのお問い合わせに回答するため</li>
              <li>新機能・更新情報・キャンペーン等のお知らせメールを送付するため</li>
              <li>メンテナンス・重要なお知らせなど必要に応じたご連絡のため</li>
              <li>利用規約に違反したユーザーや不正利用の特定・利用停止のため</li>
              <li>有料サービスにおける利用料金の請求のため</li>
              <li>上記の利用目的に付随する目的</li>
            </ol>
          </div>
          <div className="pp-article">
            <h2>第4条（外部サービスへのデータ送信について）</h2>
            <p>本サービスは、以下の外部サービスを利用しており、ユーザーが入力した情報の一部が各サービスに送信される場合があります。</p>
            <ol>
              <li><strong>Supabase（Supabase Inc.）</strong>：ユーザー認証・データベース管理のため。入力されたヒアリング情報・会話履歴を保存します。</li>
              <li><strong>Anthropic Claude API（Anthropic PBC）</strong>：計画書の下書き生成のため。入力されたヒアリング情報をAI処理に使用します。</li>
              <li><strong>Resend（Resend, Inc.）</strong>：パスワードリセット等の認証メール送信のため。</li>
              <li><strong>決済代行会社</strong>：クレジットカード決済処理のため。</li>
            </ol>
            <p>各外部サービスのプライバシーポリシーは各社のウェブサイトからご確認ください。入力いただいた情報は、本サービスの計画書生成の目的のみに使用し、第三者への販売・提供は一切行いません。</p>
            <h3>5. 会話内容の確認について</h3>
            <p>サービスの品質向上、不正利用の防止、障害対応等の目的のため、会話内容を確認する場合があります。</p>
          </div>
          <div className="pp-article">
            <h2>第5条（個人情報の第三者提供）</h2>
            <p>当方は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。</p>
            <ol>
              <li>人の生命・身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
              <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
              <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
            </ol>
          </div>
          <div className="pp-article">
            <h2>第6条（個人情報の開示）</h2>
            <p>当方は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし、開示することにより以下のいずれかに該当する場合は、その全部または一部を開示しないこともあります。</p>
            <ol>
              <li>本人または第三者の生命・身体・財産その他の権利利益を害するおそれがある場合</li>
              <li>当方の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
              <li>その他法令に違反することとなる場合</li>
            </ol>
          </div>
          <div className="pp-article">
            <h2>第7条（個人情報の訂正および削除）</h2>
            <p>ユーザーは、当方の保有する自己の個人情報が誤った情報である場合には、当方に対して個人情報の訂正・追加または削除を請求することができます。当方は、請求に応じる必要があると判断した場合には、遅滞なく当該個人情報の訂正等を行います。</p>
          </div>
          <div className="pp-article">
            <h2>第8条（個人情報の利用停止等）</h2>
            <p>当方は、本人から、個人情報が利用目的の範囲を超えて取り扱われているという理由により、その利用の停止または消去を求められた場合には、遅滞なく必要な調査を行います。調査結果に基づき請求に応じる必要があると判断した場合には、遅滞なく当該個人情報の利用停止等を行います。</p>
          </div>
          <div className="pp-article">
            <h2>第9条（プライバシーポリシーの変更）</h2>
            <p>本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく変更することができます。変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じます。</p>
          </div>
          <div className="pp-article">
            <h2>第10条（お問い合わせ窓口）</h2>
            <p>本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。</p>
            <div className="pp-contact-box">
              <p>事業者名：とみながFP事務所</p>
              <p>責任者：富永淳一</p>
              <p>所在地：〒104-0061 東京都中央区銀座1丁目12番4号 N&E BLD.6F</p>
              <p>メール：jtominaga@tominaga-fp.com</p>
            </div>
          </div>
        </div>
        <footer className="pp-footer">
          <div className="pp-footer-links">
            <a href="/">ホームページ</a>
            <a href="/tokushoho">特定商取引法に基づく表記</a>
            <a href="/privacy-policy">プライバシーポリシー</a>
          </div>
          <p className="pp-footer-copy">© 2026 とみながFP事務所・富永淳一 All Rights Reserved.</p>
        </footer>
      </div>
    </>
  );
}
