"use client";

import { useState, useMemo } from "react";

interface UserRef {
  id: string;
  email: string;
  last_name: string | null;
  first_name: string | null;
}

interface AffiliateRow {
  id: string;
  affiliate_user_id: string;
  referred_user_id: string;
  created_at: string;
  affiliate_user: UserRef;
  referred_user: UserRef;
}

interface PaymentRow {
  id: string;
  affiliate_user_id: string;
  referred_user_id: string;
  amount: number;
  reward: number;
  rate: number;
  payment_date: string;
  paid: boolean;
  paid_at: string | null;
  created_at: string;
  affiliate_user: UserRef;
  referred_user: UserRef;
}

interface Props {
  affiliates: AffiliateRow[];
  payments: PaymentRow[];
}

function userName(u: UserRef | null): string {
  if (!u) return "—";
  const name = [u.last_name, u.first_name].filter(Boolean).join(" ");
  return name || u.email;
}

function formatMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function AffiliatePanel({ affiliates, payments: initialPayments }: Props) {
  const [activeTab, setActiveTab] = useState<"affiliators" | "details">("affiliators");
  const [paymentList, setPaymentList] = useState(initialPayments);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState("");

  // 月別選択肢を生成
  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    paymentList.forEach((p) => {
      if (p.payment_date) months.add(p.payment_date.slice(0, 7));
    });
    return Array.from(months).sort().reverse();
  }, [paymentList]);

  // 今月の情報
  const now = new Date();
  const currentMonth = formatMonth(now);
  const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const deadlineStr = `${nextMonthEnd.getFullYear()}年${nextMonthEnd.getMonth() + 1}月${nextMonthEnd.getDate()}日`;

  // 今月締め分（未払い）
  const currentMonthUnpaid = useMemo(() => {
    return paymentList
      .filter((p) => p.payment_date?.startsWith(currentMonth) && !p.paid)
      .reduce((sum, p) => sum + (p.reward ?? 0), 0);
  }, [paymentList, currentMonth]);

  // アフィリエイター別集計
  const affiliatorSummary = useMemo(() => {
    const map = new Map<string, {
      user: UserRef;
      referralCount: number;
      unpaidThisMonth: number;
      totalReward: number;
      totalPaid: number;
    }>();

    // 紹介件数
    affiliates.forEach((a) => {
      const uid = a.affiliate_user_id;
      if (!map.has(uid)) {
        map.set(uid, {
          user: a.affiliate_user,
          referralCount: 0,
          unpaidThisMonth: 0,
          totalReward: 0,
          totalPaid: 0,
        });
      }
      map.get(uid)!.referralCount += 1;
    });

    // 報酬集計
    paymentList.forEach((p) => {
      const uid = p.affiliate_user_id;
      if (!map.has(uid)) {
        map.set(uid, {
          user: p.affiliate_user,
          referralCount: 0,
          unpaidThisMonth: 0,
          totalReward: 0,
          totalPaid: 0,
        });
      }
      const entry = map.get(uid)!;
      entry.totalReward += p.reward ?? 0;
      if (p.paid) {
        entry.totalPaid += p.reward ?? 0;
      }
      if (p.payment_date?.startsWith(currentMonth) && !p.paid) {
        entry.unpaidThisMonth += p.reward ?? 0;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalReward - a.totalReward);
  }, [affiliates, paymentList, currentMonth]);

  // 明細フィルター
  const filteredPayments = useMemo(() => {
    if (!filterMonth) return paymentList;
    return paymentList.filter((p) => p.payment_date?.startsWith(filterMonth));
  }, [paymentList, filterMonth]);

  const markAsPaid = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      if (res.ok) {
        setPaymentList((prev) =>
          prev.map((p) =>
            p.id === paymentId
              ? { ...p, paid: true, paid_at: new Date().toISOString() }
              : p
          )
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { key: "affiliators" as const, label: `アフィリエイター一覧（${affiliatorSummary.length}）` },
    { key: "details" as const, label: `明細（${paymentList.length}）` },
  ];

  return (
    <div>
      {/* サマリー */}
      <div className="card-washi mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">今月締め分（未払い）</span>
            <span className="ml-3 text-2xl font-bold text-shu">
              {currentMonthUnpaid.toLocaleString()}円
            </span>
          </div>
          <div className="text-sm text-gray-500">
            支払期限：{deadlineStr}
          </div>
        </div>
      </div>

      {/* タブ */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-shu text-white"
                : "bg-white/60 text-gray-600 hover:bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* アフィリエイター一覧 */}
      {activeTab === "affiliators" && (
        <div className="card-washi overflow-x-auto">
          {affiliatorSummary.length === 0 ? (
            <p className="text-center text-gray-500 py-8">アフィリエイターがいません</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2">氏名</th>
                  <th className="text-left py-3 px-2">メール</th>
                  <th className="text-center py-3 px-2">紹介件数</th>
                  <th className="text-right py-3 px-2">当月未払い</th>
                  <th className="text-right py-3 px-2">累計報酬</th>
                  <th className="text-right py-3 px-2">支払済み</th>
                </tr>
              </thead>
              <tbody>
                {affiliatorSummary.map((a) => (
                  <tr key={a.user.id} className="border-b border-gray-100">
                    <td className="py-3 px-2">{userName(a.user)}</td>
                    <td className="py-3 px-2 text-gray-500">{a.user.email}</td>
                    <td className="py-3 px-2 text-center">{a.referralCount}件</td>
                    <td className="py-3 px-2 text-right font-medium text-shu">
                      {a.unpaidThisMonth.toLocaleString()}円
                    </td>
                    <td className="py-3 px-2 text-right">
                      {a.totalReward.toLocaleString()}円
                    </td>
                    <td className="py-3 px-2 text-right text-gray-500">
                      {a.totalPaid.toLocaleString()}円
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 明細タブ */}
      {activeTab === "details" && (
        <div className="card-washi overflow-x-auto">
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-gray-500">月別フィルター：</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="">すべて</option>
              {monthOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {filteredPayments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">明細がありません</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2">売上日</th>
                  <th className="text-left py-3 px-2">紹介者</th>
                  <th className="text-left py-3 px-2">被紹介者</th>
                  <th className="text-right py-3 px-2">売上</th>
                  <th className="text-center py-3 px-2">報酬率</th>
                  <th className="text-right py-3 px-2">報酬額</th>
                  <th className="text-center py-3 px-2">状態</th>
                  <th className="text-center py-3 px-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="py-3 px-2">
                      {p.payment_date ? new Date(p.payment_date).toLocaleDateString("ja-JP") : "—"}
                    </td>
                    <td className="py-3 px-2">{userName(p.affiliate_user)}</td>
                    <td className="py-3 px-2">{userName(p.referred_user)}</td>
                    <td className="py-3 px-2 text-right">
                      {(p.amount ?? 0).toLocaleString()}円
                    </td>
                    <td className="py-3 px-2 text-center">
                      {((p.rate ?? 0.3) * 100).toFixed(0)}%
                    </td>
                    <td className="py-3 px-2 text-right font-medium">
                      {(p.reward ?? 0).toLocaleString()}円
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          p.paid
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {p.paid ? "支払済" : "未払い"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      {!p.paid && (
                        <button
                          onClick={() => markAsPaid(p.id)}
                          disabled={actionLoading === p.id}
                          className="text-xs px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                        >
                          支払済みにする
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
