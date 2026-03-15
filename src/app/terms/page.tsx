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
          <p className="text-sm text-gray-500 mb-6">最終更新日：2026年3月</p>

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
              <h3 className="font-bold mb-1">第4条（料金・支払い）</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>月額プラン：29,800円／月（月3件まで）</li>
                <li>年額プラン：148,000円／年（月3件まで）</li>
                <li>追加1件：9,800円／件</li>
              </ul>
              <p className="mt-2">お支払いはクレジットカード決済のみ。前払いとし、お申し込み時に即時決済されます。月の途中からご契約の場合も日割り計算は行いません。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第5条（自動更新）</h3>
              <p>月額・年額プランは、解約手続きがない限り期間満了後に自動更新されます。解約はメール（jtominaga@tominaga-fp.com）にてお申し込みください。解約受付後、当月末日（月額）または満期日（年額）までご利用いただけます。以降はログインできなくなります。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第6条（月間利用件数）</h3>
              <p>月間利用可能件数（月3件）は毎月1日にリセットされます。未使用件数の繰り越しはできません。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第7条（返金）</h3>
              <p>いかなる場合においても返金には応じられません。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第8条（データの取り扱い）</h3>
              <p>当方はデータの保存・バックアップを保証しません。重要なデータはご自身で保存してください。解約後は満期日をもってデータを完全削除します。削除後の復元には応じられません。再入会は新規登録から可能です。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第9条（キャンペーン終了後の無料会員）</h3>
              <p>キャンペーン期間終了後、無料会員はログインできますが計画書の生成はできません。生成を再開するには有料プランへのご登録が必要です。作成済みのデータは保持されます。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第10条（免責事項）</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>採択結果を保証しません。</li>
                <li>本サービスの利用により生じたいかなる損害についても責任を負いません。</li>
                <li>システム障害・第三者サービスの障害によるサービス停止について責任を負いません。</li>
              </ol>
            </section>

            <section>
              <h3 className="font-bold mb-1">第11条（サービスの変更・終了）</h3>
              <p>事前通知なくサービス内容の変更・停止・終了を行う場合があります。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第12条（規約の変更）</h3>
              <p>必要に応じて本規約を変更できます。変更後は本サービス上に掲載した時点から効力を生じます。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第13条（準拠法・管轄）</h3>
              <p>本規約は日本法に準拠します。紛争については東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第14条（お問い合わせ）</h3>
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
