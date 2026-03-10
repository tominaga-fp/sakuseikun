"use client";

import { useState } from "react";
import { Profile, PlanDocument } from "@/types/database";

const FORM_FIELDS = [
  {
    key: "business_name",
    label: "事業所名（屋号）",
    type: "text",
    placeholder: "例：山田商店",
  },
  {
    key: "business_type",
    label: "業種",
    type: "text",
    placeholder: "例：小売業、飲食業、美容業",
  },
  {
    key: "business_description",
    label: "事業概要（現在どのような事業を行っていますか？）",
    type: "textarea",
    placeholder: "例：地元の食材を使ったお弁当の製造・販売を行っている。開業して5年目。",
  },
  {
    key: "current_challenges",
    label: "現在の課題・困りごと",
    type: "textarea",
    placeholder: "例：集客が伸び悩んでいる、設備が古くなった、新規顧客の獲得が難しい",
  },
  {
    key: "plan_content",
    label: "補助金で実施したい取り組み",
    type: "textarea",
    placeholder: "例：ホームページ作成、チラシ作成、新メニュー開発、店舗改装",
  },
  {
    key: "target_customers",
    label: "ターゲット顧客",
    type: "textarea",
    placeholder: "例：30〜50代の主婦層、近隣のオフィスワーカー",
  },
  {
    key: "expected_effect",
    label: "期待される効果",
    type: "textarea",
    placeholder: "例：売上20%増加、新規顧客月10名獲得",
  },
  {
    key: "budget",
    label: "補助金申請予定額（万円）",
    type: "text",
    placeholder: "例：50",
  },
] as const;

interface PlanBuilderProps {
  profile: Profile | null;
  existingPlans: PlanDocument[];
}

export default function PlanBuilder({ profile, existingPlans }: PlanBuilderProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");

  const isAdmin = profile?.role === "admin";
  console.log("profile.role:", profile?.role, "isAdmin:", isAdmin);
  const remainingCount = (profile?.monthly_limit ?? 0) - (profile?.monthly_count ?? 0);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!isAdmin && remainingCount <= 0) {
      setError("今月のカウント上限に達しました。");
      return;
    }

    const requiredFields = ["business_name", "business_type", "business_description", "plan_content"];
    const missing = requiredFields.filter((f) => !formData[f]?.trim());
    if (missing.length > 0) {
      setError("事業所名、業種、事業概要、実施したい取り組みは必須です。");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedText("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "生成に失敗しました");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            setGeneratedText((prev) => prev + decoder.decode(value));
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* タブ */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("new")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "new"
              ? "bg-shu text-white"
              : "bg-white/60 text-gray-600 hover:bg-white"
          }`}
        >
          新規作成
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "history"
              ? "bg-shu text-white"
              : "bg-white/60 text-gray-600 hover:bg-white"
          }`}
        >
          作成履歴（{existingPlans.length}）
        </button>
      </div>

      {activeTab === "new" ? (
        <div className="space-y-6">
          {/* 入力フォーム */}
          <div className="card-washi">
            <h2 className="text-lg font-bold mb-4">計画書の情報を入力</h2>
            <div className="space-y-4">
              {FORM_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium mb-1">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={formData[field.key] ?? ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shu focus:border-transparent outline-none bg-white resize-y"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[field.key] ?? ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shu focus:border-transparent outline-none bg-white"
                    />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <p className="mt-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-shu w-full mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  生成中...
                </span>
              ) : (
                isAdmin ? "計画書を生成する" : `計画書を生成する（残り${remainingCount}カウント）`
              )}
            </button>
          </div>

          {/* 生成結果 */}
          {generatedText && (
            <div className="card-washi">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">生成結果</h2>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedText)}
                  className="text-sm text-shu hover:underline"
                >
                  コピー
                </button>
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed bg-white p-4 rounded-lg border">
                {generatedText}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 作成履歴 */
        <div className="space-y-4">
          {existingPlans.length === 0 ? (
            <div className="card-washi text-center text-gray-500">
              まだ計画書がありません
            </div>
          ) : (
            existingPlans.map((plan) => (
              <div key={plan.id} className="card-washi">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">
                      {plan.title || plan.business_type || "無題"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(plan.created_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      plan.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {plan.status === "completed" ? "完了" : "下書き"}
                  </span>
                </div>
                {plan.generated_text && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                    {plan.generated_text.slice(0, 200)}...
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
