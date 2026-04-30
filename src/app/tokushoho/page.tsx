export default function TokushohoPage() {
  return (
    <>
      <style>{`
        :root { --navy:#0f2346; --gold:#b8860b; --ink:#1a1a1a; --ink-mid:#4a4a4a; --ink-light:#8a8a8a; --border:#e0e0e0; --bg:#f9f9f9; --white:#ffffff; }
        .tk-body { font-family:'Noto Sans JP',sans-serif; background:var(--bg); color:var(--ink); line-height:1.8; }
        .tk-header { background:var(--navy); padding:14px 32px; display:flex; align-items:center; }
        .tk-logo { font-family:'Noto Serif JP',serif; font-weight:700; font-size:17px; color:var(--white); text-decoration:none; }
        .tk-logo em { font-style:normal; color:#d4a017; }
        .tk-hero { background:var(--navy); padding:48px 32px 56px; border-bottom:3px solid var(--gold); }
        .tk-hero-inner { max-width:760px; margin:0 auto; }
        .tk-hero h1 { font-family:'Noto Serif JP',serif; font-weight:700; font-size:clamp(22px,3vw,30px); color:var(--white); }
        .tk-hero p { font-size:13px; color:rgba(255,255,255,0.5); margin-top:8px; }
        .tk-content { max-width:760px; margin:0 auto; padding:56px 32px; }
        .tk-table-wrap { background:var(--white); border:1px solid var(--border); margin-bottom:48px; }
        .tk-table { width:100%; border-collapse:collapse; }
        .tk-table th { background:#f5f5f5; font-weight:700; font-size:14px; color:var(--navy); padding:16px 20px; text-align:left; border-bottom:1px solid var(--border); border-right:1px solid var(--border); width:200px; vertical-align:top; white-space:nowrap; }
        .tk-table td { font-size:14px; color:var(--ink-mid); padding:16px 20px; border-bottom:1px solid var(--border); line-height:1.85; vertical-align:top; }
        .tk-table tr:last-child th, .tk-table tr:last-child td { border-bottom:none; }
        .tk-note { font-size:12px; color:var(--ink-light); margin-top:6px; line-height:1.7; }
        .tk-footer { background:var(--navy); padding:32px; text-align:center; }
        .tk-footer-links { display:flex; gap:20px; justify-content:center; flex-wrap:wrap; margin-bottom:14px; }
        .tk-footer-links a { font-size:12px; color:rgba(255,255,255,0.35); text-decoration:none; }
        .tk-footer-copy { font-size:11px; color:rgba(255,255,255,0.2); }
        @media(max-width:600px){
          .tk-content{padding:36px 18px;} .tk-header{padding:12px 16px;} .tk-hero{padding:36px 18px 44px;}
          .tk-table th{width:130px;white-space:normal;} .tk-table th,.tk-table td{padding:14px;font-size:13px;}
        }
      `}</style>
      <div className="tk-body">
        <header className="tk-header">
          <a href="/" className="tk-logo">補助金計画書<em>さくせいくん</em></a>
        </header>
        <div className="tk-hero">
          <div className="tk-hero-inner">
            <h1>特定商取引法に基づく表記</h1>
            <p>最終更新日：2026年4月27日</p>
          </div>
        </div>
        <div className="tk-content">
          <div className="tk-table-wrap">
            <table className="tk-table">
              <tbody>
                <tr><th>販売業者</th><td>とみながFP事務所</td></tr>
                <tr><th>運営責任者</th><td>富永淳一</td></tr>
                <tr><th>所在地</th><td>〒104-0061 東京都中央区銀座1丁目12番4号 N&E BLD.6F</td></tr>
                <tr><th>電話番号</th><td>お客様からのご請求がありましたら、遅滞なく電磁的記録（メール等）にて開示いたします。</td></tr>
                <tr><th>お問い合わせ</th><td>メール：jtominaga@tominaga-fp.com<br /><p className="tk-note">※電話でのサポート・受付は行っておりません。記録の残るメールにてお問い合わせいただきますようお願いいたします。</p></td></tr>
                <tr><th>サイトURL</th><td>https://sakuseikun.jp</td></tr>
                <tr><th>販売価格</th><td>以下のプランからお選びいただけます（税込）<br /><br />【通常価格】<br />・月額プラン：29,800円/月<br />・年額プラン：178,800円/年<br /><br />【2026年4月限定 特別年間プラン】<br />・ご利用者さま特別価格：60,000円/年（年間50件まで作成可能）<br />・アンケート回答者さま特別価格：50,000円/年（年間50件まで作成可能）<br />※4月中にお申込みいただいた方は、更新時も同価格で継続いただけます。<br /><br />【2026年5月1日〜6月30日 一般価格】<br />・年額プラン：98,000円/年<br /><br /><p className="tk-note">2026年7月1日以降の価格は、第20回公募開始に合わせて別途ご案内いたします。年間プランの作成可能件数を超える場合のお取り扱いについては、別途ご案内いたします。</p></td></tr>
                <tr><th>商品代金以外に<br />必要な費用</th><td>・本サービスのご利用に必要なインターネット接続費用・通信費用<br />・クレジットカード決済の場合、カード会社指定の手数料</td></tr>
                <tr><th>引き渡し時期</th><td>登録完了および決済完了後、即時ご利用いただけます。<br />ただし「2026年4月限定 特別年間プラン」については、お申込み完了後、契約開始日（2026年5月1日）からご利用開始となります。</td></tr>
                <tr><th>お支払い方法</th><td>クレジットカード決済（VISA・Mastercard・JCB・American Express）<br />決済代行：Stripe（Stripe, Inc.）</td></tr>
                <tr><th>お支払いの時期</th><td>・月額プラン：お申し込み時に即時決済。以降、毎月同日に自動更新。<br />・年額プラン：お申し込み時に即時決済。以降、1年ごとに自動更新。<br />・2026年4月限定 特別年間プラン：お申し込み時に即時決済。契約開始日は2026年5月1日。以降、1年ごとに自動更新（4月中お申込みの方は更新時も同価格を適用）。</td></tr>
                <tr><th>動作環境</th><td>インターネットに接続されたPC・スマートフォン・タブレットとモダンブラウザ（Google Chrome・Safari・Firefox・Microsoft Edge等）があればご利用いただけます。特別なソフトウェアのインストールは不要です。</td></tr>
                <tr><th>返品・キャンセル<br />について</th><td>本サービスはデジタルサービスの性質上、お申し込み後のキャンセル・返金には一切応じられません。まずは無料体験にてご確認のうえ、お申し込みください。<br /><br />・月額プランの解約は前月20日までにメールにてお申し込みください。<br />・年額プランの解約は契約満了日の30日前までにメールにてお申し込みください。<br />・解約後のデータは完全に削除されます。<br />・採択結果に関わらず返金は一切行いません。</td></tr>
                <tr><th>クーリング・オフ</th><td>本サービスは、お客様の自発的なインターネット通信販売であるため、特定商取引法に規定されるクーリング・オフ制度の適用対象外となります。</td></tr>
                <tr><th>個人情報の<br />取り扱い</th><td>お客様からいただいた個人情報は、本サービスの提供・運営のみに使用します。第三者への提供・販売は一切行いません。詳細は<a href="/privacy-policy" style={{color:'var(--navy)'}}>プライバシーポリシー</a>をご確認ください。</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <footer className="tk-footer">
          <div className="tk-footer-links">
            <a href="/">ホームページ</a>
            <a href="/tokushoho">特定商取引法に基づく表記</a>
            <a href="/privacy-policy">プライバシーポリシー</a>
          </div>
          <p className="tk-footer-copy">© 2026 とみながFP事務所・富永淳一 All Rights Reserved.</p>
        </footer>
      </div>
    </>
  );
}
