"use client";

import { useState, useMemo } from "react";
import { Profile, AgentReward } from "@/types/database";

interface SaleRow {
  id: string;
  user_id: string;
  amount: number;
  plan_type: string;
  payment_date: string;
  user?: { email: string; last_name: string | null; first_name: string | null } | null;
}

interface AdminPanelProps {
  users: Profile[];
  agents: Profile[];
  rewards: (AgentReward & { agent?: { email: string; display_name: string | null } })[];
  sales: SaleRow[];
}

export default function AdminPanel({ users, agents, rewards, sales }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"users" | "agents" | "rewards" | "sales">("users");
  const [userList, setUserList] = useState(users);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // 編集モーダル
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [editLastName, setEditLastName] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // user_typeフィルター
  const [userTypeFilter, setUserTypeFilter] = useState<"all" | "business" | "consultant">("all");

  // 紹介コードフィルター
  const [referralFilter, setReferralFilter] = useState("");

  // 売上フィルター
  const [salesFilterMonth, setSalesFilterMonth] = useState("");

  const openEditModal = (u: Profile) => {
    setEditUser(u);
    setEditLastName(u.last_name || "");
    setEditFirstName(u.first_name || "");
    setEditCompanyName(u.company_name || "");
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setEditSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editUser.id,
          last_name: editLastName,
          first_name: editFirstName,
          company_name: editCompanyName,
        }),
      });
      if (res.ok) {
        setUserList((prev) =>
          prev.map((u) =>
            u.id === editUser.id
              ? { ...u, last_name: editLastName, first_name: editFirstName, company_name: editCompanyName }
              : u
          )
        );
        setEditUser(null);
      }
    } finally {
      setEditSaving(false);
    }
  };

  const addExtraCount = async (userId: string) => {
    setActionLoading(userId + "-extra");
    try {
      const target = userList.find((u) => u.id === userId);
      if (!target) return;
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, extra_count: (target.extra_count ?? 0) + 1 }),
      });
      if (res.ok) {
        setUserList((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, extra_count: (u.extra_count ?? 0) + 1 } : u
          )
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const toggleUserActive = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, is_active: !currentStatus }),
      });
      if (res.ok) {
        setUserList((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, is_active: !currentStatus } : u
          )
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const toggleMonitor = async (userId: string, current: boolean) => {
    setActionLoading(userId + "-monitor");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, is_monitor: !current }),
      });
      if (res.ok) {
        setUserList((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, is_monitor: !current } : u
          )
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const exportCSV = () => {
    const headers = [
      "id", "email", "last_name", "first_name", "company_name", "user_type",
      "role", "is_active", "is_monitor", "monthly_count", "monthly_limit",
      "extra_count", "plan_type", "count_reset_at", "referral_code", "agent_code", "referred_by",
      "created_at", "updated_at",
    ];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };
    const rows = filteredUserList.map((u) =>
      headers.map((h) => escape((u as unknown as Record<string, unknown>)[h])).join(",")
    );
    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUserList = useMemo(() => {
    let list = userList;
    if (userTypeFilter !== "all") {
      list = list.filter((u) => u.user_type === userTypeFilter);
    }
    if (referralFilter.trim()) {
      const q = referralFilter.trim().toLowerCase();
      list = list.filter((u) => u.referral_code?.toLowerCase().includes(q));
    }
    return list;
  }, [userList, userTypeFilter, referralFilter]);

  const updateUserRole = async (userId: string, role: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      if (res.ok) {
        setUserList((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, role: role as Profile["role"] } : u
          )
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  // 売上集計
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const salesMonthOptions = useMemo(() => {
    const months = new Set<string>();
    sales.forEach((s) => {
      if (s.payment_date) months.add(s.payment_date.slice(0, 7));
    });
    return Array.from(months).sort().reverse();
  }, [sales]);

  const filteredSales = useMemo(() => {
    if (!salesFilterMonth) return sales;
    return sales.filter((s) => s.payment_date?.startsWith(salesFilterMonth));
  }, [sales, salesFilterMonth]);

  const currentMonthTotal = useMemo(() => {
    return sales
      .filter((s) => s.payment_date?.startsWith(currentMonth))
      .reduce((sum, s) => sum + (s.amount ?? 0), 0);
  }, [sales, currentMonth]);

  const totalSales = useMemo(() => {
    return sales.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  }, [sales]);

  const tabs = [
    { key: "users" as const, label: `ユーザー管理（${userList.length}）` },
    { key: "sales" as const, label: `売上管理（${sales.length}）` },
    { key: "agents" as const, label: `代理店（${agents.length}）` },
    { key: "rewards" as const, label: "報酬管理" },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
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
        <a
          href="/admin/affiliates"
          className="px-4 py-2 rounded-lg font-medium transition-colors bg-white/60 text-gray-600 hover:bg-white"
        >
          アフィリエイト管理
        </a>
      </div>

      {activeTab === "users" && (
        <div className="card-washi overflow-x-auto">
          {/* フィルター・エクスポート */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <label className="text-sm text-gray-500">ユーザー種別：</label>
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value as "all" | "business" | "consultant")}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">すべて（{userList.length}）</option>
              <option value="business">事業者（{userList.filter((u) => u.user_type === "business").length}）</option>
              <option value="consultant">コンサルタント（{userList.filter((u) => u.user_type === "consultant").length}）</option>
            </select>
            <label className="text-sm text-gray-500">紹介コード：</label>
            <input
              type="text"
              value={referralFilter}
              onChange={(e) => setReferralFilter(e.target.value)}
              placeholder="コードで絞り込み"
              className="text-sm border rounded px-2 py-1 w-40"
            />
            <button
              onClick={exportCSV}
              className="ml-auto text-xs px-4 py-1.5 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
            >
              CSVエクスポート
            </button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2">メール</th>
                <th className="text-left py-3 px-2">氏名</th>
                <th className="text-left py-3 px-2">会社名</th>
                <th className="text-center py-3 px-2">種別</th>
                <th className="text-left py-3 px-2">紹介コード</th>
                <th className="text-left py-3 px-2">ロール</th>
                <th className="text-center py-3 px-2">残数</th>
                <th className="text-center py-3 px-2">モニター</th>
                <th className="text-center py-3 px-2">状態</th>
                <th className="text-center py-3 px-2">登録日</th>
                <th className="text-center py-3 px-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUserList.map((u) => {
                const remaining = u.is_monitor
                  ? "無制限"
                  : `${Math.max(0, (u.monthly_limit ?? 1) - (u.monthly_count ?? 0) + (u.extra_count ?? 0))}`;
                return (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="py-3 px-2">{u.email}</td>
                    <td className="py-3 px-2">{[u.last_name, u.first_name].filter(Boolean).join(" ") || "—"}</td>
                    <td className="py-3 px-2">{u.company_name || "—"}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        u.user_type === "consultant"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {u.user_type === "consultant" ? "コンサル" : "事業者"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs text-gray-600 font-mono">{u.referral_code || "—"}</td>
                    <td className="py-3 px-2">
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                        className="text-xs border rounded px-1 py-0.5"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                        <option value="agent">agent</option>
                      </select>
                    </td>
                    <td className="py-3 px-2 text-center font-medium">
                      {remaining}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => toggleMonitor(u.id, u.is_monitor ?? false)}
                        disabled={actionLoading === u.id + "-monitor"}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          u.is_monitor ? "bg-shu" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            u.is_monitor ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          u.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.is_active ? "有効" : "無効"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-gray-500">
                      {new Date(u.created_at).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => toggleUserActive(u.id, u.is_active)}
                          disabled={actionLoading === u.id}
                          className={`text-xs px-3 py-1 rounded ${
                            u.is_active
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {u.is_active ? "無効化" : "有効化"}
                        </button>
                        <button
                          onClick={() => addExtraCount(u.id)}
                          disabled={actionLoading === u.id + "-extra"}
                          className="text-xs px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          +1件追加
                        </button>
                        <button
                          onClick={() => openEditModal(u)}
                          className="text-xs px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          編集
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "sales" && (
        <div>
          {/* サマリー */}
          <div className="card-washi mb-4">
            <div className="flex items-center gap-8 flex-wrap">
              <div>
                <span className="text-sm text-gray-500">当月売上合計</span>
                <span className="ml-3 text-2xl font-bold text-shu">
                  {currentMonthTotal.toLocaleString()}円
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500">累計売上合計</span>
                <span className="ml-3 text-2xl font-bold">
                  {totalSales.toLocaleString()}円
                </span>
              </div>
            </div>
          </div>

          <div className="card-washi overflow-x-auto">
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm text-gray-500">月別フィルター：</label>
              <select
                value={salesFilterMonth}
                onChange={(e) => setSalesFilterMonth(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="">すべて</option>
                {salesMonthOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {filteredSales.length === 0 ? (
              <p className="text-center text-gray-500 py-8">売上データがありません</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2">決済日</th>
                    <th className="text-left py-3 px-2">メール</th>
                    <th className="text-left py-3 px-2">氏名</th>
                    <th className="text-right py-3 px-2">金額</th>
                    <th className="text-center py-3 px-2">プラン</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100">
                      <td className="py-3 px-2">
                        {new Date(s.payment_date).toLocaleDateString("ja-JP")}
                      </td>
                      <td className="py-3 px-2">{s.user?.email ?? "—"}</td>
                      <td className="py-3 px-2">
                        {[s.user?.last_name, s.user?.first_name].filter(Boolean).join(" ") || "—"}
                      </td>
                      <td className="py-3 px-2 text-right font-medium">
                        {(s.amount ?? 0).toLocaleString()}円
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          s.plan_type === "basic"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {s.plan_type === "basic" ? "ベーシック" : "追加"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === "agents" && (
        <div className="space-y-4">
          {agents.length === 0 ? (
            <div className="card-washi text-center text-gray-500">
              代理店ユーザーがいません
            </div>
          ) : (
            agents.map((agent) => (
              <div key={agent.id} className="card-washi">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{agent.display_name || agent.email}</h3>
                    <p className="text-sm text-gray-500">
                      紹介コード: <span className="font-mono text-shu">{agent.agent_code}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "rewards" && (
        <div className="card-washi overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2">代理店</th>
                <th className="text-center py-3 px-2">報酬額</th>
                <th className="text-center py-3 px-2">支払状態</th>
                <th className="text-center py-3 px-2">日時</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((r) => (
                <tr key={r.id} className="border-b border-gray-100">
                  <td className="py-3 px-2">
                    {r.agent?.display_name || r.agent?.email || r.agent_id}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {r.reward_amount.toLocaleString()}円
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        r.is_paid
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {r.is_paid ? "支払済" : "未払い"}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center text-gray-500">
                    {new Date(r.created_at).toLocaleDateString("ja-JP")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 編集モーダル */}
      {editUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setEditUser(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "28px 32px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-1">ユーザー情報編集</h3>
            <p className="text-sm text-gray-500 mb-4">{editUser.email}</p>

            <label className="block text-xs font-medium text-gray-600 mb-1">姓</label>
            <input
              type="text"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
            />

            <label className="block text-xs font-medium text-gray-600 mb-1">名</label>
            <input
              type="text"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
            />

            <label className="block text-xs font-medium text-gray-600 mb-1">会社名</label>
            <input
              type="text"
              value={editCompanyName}
              onChange={(e) => setEditCompanyName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-5"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setEditUser(null)}
                className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={saveEdit}
                disabled={editSaving}
                className="px-4 py-2 rounded-lg bg-shu text-white text-sm font-medium hover:bg-shu-dark disabled:opacity-50"
              >
                {editSaving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
