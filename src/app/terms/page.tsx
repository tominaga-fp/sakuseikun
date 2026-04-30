"use client";

import Link from "next/link";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#f5f2eb" }}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            補助金計画書<span className="text-shu">さくせいくん</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">利用規約</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-bold mb-1">補助金計画書さくせいくん 利用規約</h2>
          <p className="text-sm text-gray-500 mb-6">最終更新日：2026年4月27日</p>

          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <section>
              <h3 className="font-bold mb-1">第1条（サービスの概要）</h3>
              <p>本サービスは、小規模事業者持続化補助金の申請に必要な計画書の下書きテキストを生成するWebツールです。本サービスが生成するテキストはあくまでも「下書き・たたき台」であり、完成品ではありません。最終的な申請書類の確認・修正・完成および申請手続きは、ご利用者様ご自身の責任において行ってください。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第2条（利用条件）</h3>
              <p>ご利用には本規約への同意およびアカウント登録が必要です。正確な氏名・法人名・メールアドレスをご入力ください。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第3条（禁止事項）</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>本サービスを第三者に転売・再配布・共有する行為</li>
                <li>生成コンテンツの商業目的での無断転用</li>
                <li>違法行為・不正行為への利用</li>
                <li>システムへの過度な負荷をかける行為</li>
                <li>その他、当方が不適切と判断する行為</li>
              </ol>
            </section>

            <section>
              <h3 className="font-bold mb-1">第4条（料金・プラン）</h3>
              <p className="mb-2">本サービスの料金プランは以下のとおりです（税込）。</p>
              <p className="font-semibold mt-2">【通常価格】</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>月額プラン：29,800円／月</li>
                <li>年額プラン：178,800円／年</li>
              </ul>
              <p className="font-semibold mt-3">【2026年4月限定 特別年間プラン】</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>ご利用者さま特別価格：60,000円／年（年間50件まで作成可能）</li>
                <li>アンケート回答者さま特別価格：50,000円／年（年間50件まで作成可能）</li>
              </ul>
              <p className="font-semibold mt-3">【2026年5月1日〜6月30日 一般価格】</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>年額プラン：98,000円／年</li>
              </ul>
              <p className="mt-3">お支払いはクレジットカード決済のみ（決済代行：Stripe）。前払いとし、お申し込み時に即時決済されます。月の途中からご契約の場合も日割り計算は行いません。2026年7月1日以降の価格体系については、別途ご案内いたします。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第5条（自動更新・解約）</h3>
              <p>月額・年額プランは、解約手続きがない限り期間満了後に自動更新されます。</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>月額プランの解約：前月20日までにメール（jtominaga@tominaga-fp.com）にてお申し込みください。</li>
                <li>年額プランの解約：契約満了日の30日前までにメールにてお申し込みください。</li>
                <li>解約受付後、当月末日（月額）または満期日（年額）までご利用いただけます。以降はログインできなくなります。</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold mb-1">第6条（更新時の価格据え置き特典）</h3>
              <p>2026年4月中に「2026年4月限定 特別年間プラン」へお申込みいただいたユーザー様については、解約せずに自動更新を継続される限り、更新時も同価格（60,000円／年または50,000円／年）を据え置きで適用いたします。一度解約された場合、本特典は失効し、再契約時は当時の通常価格が適用されます。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第7条（年間利用件数）</h3>
              <p>「2026年4月限定 特別年間プラン」の年間利用可能件数は50件です。契約期間中に上限に達した場合の取扱いは、別途当方が定めて告知します。未使用件数の繰り越しはできません。月額プラン・通常年額プランの利用件数は、別途定めて告知いたします。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第8条（返金）</h3>
              <p>いかなる場合においても返金には応じられません。補助金の採択・不採択にかかわらず返金は行いません。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第9条（データの取り扱い）</h3>
              <p>当方はデータの保存・バックアップを保証しません。重要なデータはご自身で保存してください。解約後は満期日をもってデータを完全削除します。削除後の復元には応じられません。再入会は新規登録から可能です。</p>
              <p className="mt-2 font-semibold">2026年4月30日のデータリセットについて：</p>
              <p>無料キャンペーン期間（〜2026年4月30日）中に作成されたデータについて、有料プランへお申込みいただいた方のデータは引き続き保持されます。有料プランへお申込みされなかった方のデータは、2026年4月30日をもってすべて削除されます。お手元に残しておきたいデータがある場合は、4月30日までにコピー・保存をお願いいたします。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第10条（キャンペーン終了後の無料会員）</h3>
              <p>キャンペーン期間終了後、無料会員はログインできますが計画書の生成はできません。生成を再開するには有料プランへのご登録が必要です。アカウント情報は保持されますが、第9条に従い無料会員のデータは削除される場合があります。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第11条（ご紹介プラン）</h3>
              <p>有料プラン契約中のユーザーさまから新規有料契約者をご紹介いただいた場合、ご紹介者さまへ以下の還元を行います。</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>ご紹介された方が月払い契約の場合：初月料金の50%</li>
                <li>ご紹介された方が年払い契約の場合：初年度料金の20%</li>
              </ul>
              <p className="mt-2">還元時期・方法は当方が別途お知らせします。ご紹介された方が解約・返金等を行った場合、還元は取り消されることがあります。自己紹介・不正な紹介行為が判明した場合、還元の取消しおよびアカウント停止を行うことがあります。本プランの内容は予告なく変更・終了する場合があります。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第12条（免責事項）</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>本サービスは、AIが生成する補助金計画書の「下書き・たたき台」を提供するものであり、補助金の採択・不採択を保証するものではありません。</li>
                <li>本サービスが生成する文章の正確性・完全性・有用性・特定目的への適合性についていかなる保証もいたしません。最終的な内容確認・修正・申請手続きはご利用者様の責任で行ってください。</li>
                <li>本サービスの利用または利用不能により生じたいかなる損害（直接損害・間接損害・逸失利益等を含む）についても、当方は責任を負いません。</li>
                <li>システム障害・第三者サービス（Supabase、Anthropic、Stripe、Resend等）の障害・仕様変更によるサービス停止・データ消失について、当方は責任を負いません。</li>
                <li>当方が損害賠償責任を負う場合、その総額はご利用者様が直近12か月間に当方へ支払った金額を上限とします。</li>
              </ol>
            </section>

            <section>
              <h3 className="font-bold mb-1">第13条（サービスの変更・終了・価格改定）</h3>
              <p>事前通知なくサービス内容の変更・停止・終了を行う場合があります。価格改定を行う場合、原則として30日前までに本サービス上またはメール等で告知します。ただし第6条に定める「更新時の価格据え置き特典」対象者については、本特典の条件を維持します。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第14条（規約の変更）</h3>
              <p>必要に応じて本規約を変更できます。変更後は本サービス上に掲載した時点から効力を生じます。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第15条（準拠法・管轄）</h3>
              <p>本規約は日本法に準拠します。紛争については東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第16条（お問い合わせ）</h3>
              <p>事業者名：とみながFP事務所</p>
              <p>責任者：富永淳一</p>
              <p>メール：<a href="mailto:jtominaga@tominaga-fp.com" className="text-shu hover:underline">jtominaga@tominaga-fp.com</a></p>
            </section>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/register" className="text-sm text-shu hover:underline">
            新規登録に戻る
          </Link>
        </div>
        <Footer />
      </div>
    </div>
  );
}
