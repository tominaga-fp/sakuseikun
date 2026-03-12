"use client";

import { useState } from "react";
import { Profile, AgentReward } from "@/types/database";

interface AdminPanelProps {
  users: Profile[];
  agents: Profile[];
  rewards: (AgentReward & { agent?: { email: string; display_name: string | null } })[];
}

export default function AdminPanel({ users, agents, rewards }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"users" | "agents" | "rewards">("users");
  const [userList, setUserList] = useState(users);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const tabs = [
    { key: "users" as const, label: `ユーザー管理（${userList.length}）` },
    { key: "agents" as const, label: `代理店（${agents.length}）` },
    { key: "rewards" as const, label: "報酬管理" },
  ];

  return (
    <div>
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

      {activeTab === "users" && (
        <div className="card-washi overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2">メール</th>
                <th className="text-left py-3 px-2">氏名</th>
                <th className="text-left py-3 px-2">会社名</th>
                <th className="text-left py-3 px-2">ロール</th>
                <th className="text-center py-3 px-2">カウント</th>
                <th className="text-center py-3 px-2">状態</th>
                <th className="text-center py-3 px-2">登録日</th>
                <th className="text-center py-3 px-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((u) => (
                <tr key={u.id} className="border-b border-gray-100">
                  <td className="py-3 px-2">{u.email}</td>
                  <td className="py-3 px-2">{[u.last_name, u.first_name].filter(Boolean).join(" ") || "—"}</td>
                  <td className="py-3 px-2">{u.company_name || "—"}</td>
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
                  <td className="py-3 px-2 text-center">
                    {u.monthly_count}/{u.monthly_limit}
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
}
