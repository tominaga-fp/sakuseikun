"use client";

import Link from "next/link";
import Footer from "@/components/Footer";

export default function TokushohoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#f5f2eb" }}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            補助金計画書<span className="text-shu">さくせいくん</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">特定商取引法に基づく表記</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-bold mb-6">特定商取引法に基づく表記</h2>

          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-bold text-gray-600 align-top w-40">販売事業者</td>
                  <td className="py-3">とみながFP事務所</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-bold text-gray-600 align-top">運営責任者</td>
                  <td className="py-3">富永淳一</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-bold text-gray-600 align-top">所在地</td>
                  <td className="py-3">東京都多摩市<br />（詳細住所はご請求に応じて開示いたします）</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-bold text-gray-600 align-top">メールアドレス</td>
                  <td className="py-3">
                    <a href="mailto:jtominaga@tominaga-fp.com" className="text-shu hover:underline">
                      jtominaga@tominaga-fp.com
                    </a>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-bold text-gray-600 align-top">サービス名</td>
                  <td className="py-3">補助金計画書さくせいくん</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-bold text-gray-600 align-top">販売URL</td>
                  <td className="py-3">https://sakuseikun.jp/</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-bold text-gray-600 align-top">販売価格</td>
                  <td className="py-3">
                    <ul className="space-y-1">
                      <li>月額プラン：29,800円／月（月3件まで）</li>
                      <li>年額プラン：148,000円／年（月3件まで）</li>
                      <li>追加1件：9,800円／件</li>
                    </ul>
                    <p className="mt-1 text-gray-500">（税込）</p>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-bold text-gray-600 align-top">支払方法</td>
                  <td className="py-3">クレジットカード決済（VISA・Mastercard・American Express・JCB）</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-bold text-gray-600 align-top">支払時期</td>
                  <td className="py-3">お申し込み時に即時決済。月額・年額プランは期間満了後に自動更新されます。</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-bold text-gray-600 align-top">サービス提供時期</td>
                  <td className="py-3">お申し込み・決済完了後、即時ご利用いただけます。</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-bold text-gray-600 align-top">返品・キャンセル</td>
                  <td className="py-3">デジタルコンテンツの性質上、いかなる場合においても返金・キャンセルには応じられません。解約手続き後は当月末日（月額）または満期日（年額）までご利用いただけます。</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-bold text-gray-600 align-top">解約方法</td>
                  <td className="py-3">
                    メール（
                    <a href="mailto:jtominaga@tominaga-fp.com" className="text-shu hover:underline">
                      jtominaga@tominaga-fp.com
                    </a>
                    ）にてお申し込みください。
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-bold text-gray-600 align-top">動作環境</td>
                  <td className="py-3">インターネット接続環境および最新版のWebブラウザ（Chrome・Safari・Firefox・Edge推奨）</td>
                </tr>
              </tbody>
            </table>
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
