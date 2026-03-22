"use client";

import Link from "next/link";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#f5f2eb" }}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            補助金計画書<span className="text-shu">さくせいくん</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">プライバシーポリシー</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-bold mb-1">プライバシーポリシー</h2>
          <p className="text-sm text-gray-500 mb-6">最終更新日：2026年3月</p>

          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <section>
              <h3 className="font-bold mb-1">第1条（個人情報）</h3>
              <p>「個人情報」とは、個人情報保護法にいう「個人情報」を指し、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日その他の記述等により特定の個人を識別できるもの（他の情報と容易に照合することができ、それにより特定の個人を識別することができることとなるものを含む）を意味します。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第2条（個人情報の収集方法）</h3>
              <p>当方はユーザーが利用登録をする際にメールアドレスなどの個人情報をお尋ねすることがあります。クレジットカード情報は決済代行会社（ファーストペイメント株式会社）が管理しており、当方のサーバーには保存されません。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第3条（個人情報を収集・利用する目的）</h3>
              <p>当方が個人情報を収集・利用する目的は以下のとおりです。</p>
              <ol className="list-decimal pl-5 space-y-1 mt-2">
                <li>サービスの提供・運営のため</li>
                <li>ユーザーからのお問い合わせに回答するため</li>
                <li>新機能・キャンペーン等の情報をメールでお知らせするため</li>
                <li>メンテナンス・重要なお知らせなど必要に応じた連絡のため</li>
                <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
                <li>有料サービスのご利用に際して、料金をご請求するため</li>
                <li>上記の利用目的に付随する目的</li>
              </ol>
            </section>

            <section>
              <h3 className="font-bold mb-1">第4条（外部サービスへのデータ送信）</h3>
              <p>本サービスは以下の外部サービスを利用しています。入力された情報は計画書生成の目的のみに使用し、第三者への販売・提供は一切行いません。</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><span className="font-medium">Supabase</span>：ユーザー認証・データベース管理のため。ヒアリング情報・会話履歴を保存します。</li>
                <li><span className="font-medium">Anthropic Claude API</span>：計画書の下書き生成のため。ヒアリング情報をAI処理に使用します。</li>
                <li><span className="font-medium">SendGrid</span>：メール送信処理のため。</li>
                <li><span className="font-medium">ファーストペイメント株式会社</span>：決済処理のため。</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold mb-1">第5条（個人情報の第三者提供）</h3>
              <p>当方は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。</p>
              <ol className="list-decimal pl-5 space-y-1 mt-2">
                <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
              </ol>
            </section>

            <section>
              <h3 className="font-bold mb-1">第6条（個人情報の開示）</h3>
              <p>当方は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあります。</p>
              <ol className="list-decimal pl-5 space-y-1 mt-2">
                <li>本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合</li>
                <li>当方の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
                <li>その他法令に違反することとなる場合</li>
              </ol>
            </section>

            <section>
              <h3 className="font-bold mb-1">第7条（個人情報の訂正および削除）</h3>
              <p>ユーザーは、当方の保有する自己の個人情報が誤った情報である場合には、当方が定める手続きにより、個人情報の訂正、追加または削除を請求することができます。当方は、ユーザーから前項の請求を受けてその請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の訂正等を行います。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第8条（個人情報の利用停止等）</h3>
              <p>当方は、本人から、個人情報が利用目的の範囲を超えて取り扱われているという理由または不正の手段により取得されたものであるという理由により、その利用の停止または消去を求められた場合には、遅滞なく必要な調査を行い、その結果に基づき、個人情報の利用停止等を行い、その旨本人に通知します。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第9条（プライバシーポリシーの変更）</h3>
              <p>本ポリシーの内容は、ユーザーに通知することなく変更することができます。当方が別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。</p>
            </section>

            <section>
              <h3 className="font-bold mb-1">第10条（お問い合わせ窓口）</h3>
              <p>本ポリシーに関するお問い合わせは、下記までお願いいたします。</p>
              <div className="mt-2 space-y-1">
                <p>事業者名：とみながFP事務所</p>
                <p>責任者：富永淳一</p>
                <p>所在地：東京都多摩市（詳細はご請求に応じて開示いたします）</p>
                <p>メール：<a href="mailto:jtominaga@tominaga-fp.com" className="text-shu hover:underline">jtominaga@tominaga-fp.com</a></p>
              </div>
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
