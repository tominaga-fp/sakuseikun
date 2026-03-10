"use client";

import { useState, useRef, useEffect } from "react";
import { Profile, PlanDocument } from "@/types/database";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface PlanBuilderProps {
  profile: Profile | null;
  existingPlans: PlanDocument[];
}

export default function PlanBuilder({ profile, existingPlans }: PlanBuilderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAdmin = profile?.role === "admin";
  const remainingCount = (profile?.monthly_limit ?? 0) - (profile?.monthly_count ?? 0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初回メッセージ: AIからの挨拶を取得
  const startNewChat = async () => {
    setMessages([]);
    setError("");
    setLoading(true);

    const initialMessages: ChatMessage[] = [
      { role: "user", content: "計画書の作成を始めたいです。" },
    ];

    try {
      const assistantText = await sendToAPI(initialMessages);
      setMessages([
        { role: "assistant", content: assistantText },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // チャット開始時に自動で挨拶を取得
  useEffect(() => {
    if (activeTab === "new" && messages.length === 0) {
      startNewChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const sendToAPI = async (msgs: ChatMessage[]): Promise<string> => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "送信に失敗しました");
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    if (reader) {
      // ストリーミング中のアシスタントメッセージを追加
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          fullText += chunk;
          // 最後のassistantメッセージを更新
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: fullText };
            return updated;
          });
        }
      }
    }

    return fullText;
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    if (!isAdmin && remainingCount <= 0) {
      setError("今月のカウント上限に達しました。");
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setError("");
    setLoading(true);

    // テキストエリアの高さをリセット
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await sendToAPI(newMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // 自動リサイズ
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  const copyDraft = () => {
    // 最後のアシスタントメッセージで計画書を含むものを探す
    const draftMessage = [...messages]
      .reverse()
      .find(
        (m) =>
          m.role === "assistant" &&
          m.content.includes("## 1.") &&
          m.content.includes("企業概要")
      );
    if (draftMessage) {
      navigator.clipboard.writeText(draftMessage.content);
    }
  };

  const hasDraft = messages.some(
    (m) =>
      m.role === "assistant" &&
      m.content.includes("## 1.") &&
      m.content.includes("企業概要")
  );

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
        <div className="flex flex-col" style={{ height: "calc(100vh - 220px)" }}>
          {/* チャットエリア */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-shu text-white rounded-br-sm"
                      : "bg-white border border-gray-200 rounded-bl-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                  <span className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* コピーボタン（ドラフト生成後） */}
          {hasDraft && (
            <div className="py-2 flex justify-center">
              <button
                onClick={copyDraft}
                className="text-sm text-shu hover:underline flex items-center gap-1"
              >
                計画書ドラフトをコピー
              </button>
            </div>
          )}

          {/* エラー */}
          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-2">
              {error}
            </p>
          )}

          {/* 入力エリア */}
          <div className="border-t pt-3">
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="メッセージを入力..."
                rows={1}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-shu focus:border-transparent outline-none bg-white resize-none text-sm"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="btn-shu px-4 py-2 rounded-xl flex-shrink-0 disabled:opacity-50"
              >
                送信
              </button>
            </div>
            {!isAdmin && (
              <p className="text-xs text-gray-400 mt-1 text-right">
                残り{remainingCount}カウント
              </p>
            )}
          </div>

          {/* リセットボタン */}
          {messages.length > 0 && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={startNewChat}
                disabled={loading}
                className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                会話をリセットして最初から
              </button>
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
