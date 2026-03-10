"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Profile, PlanDocument } from "@/types/database";

// ─── Design tokens ───
const COLORS = {
  ink: "#0a0c10",
  paper: "#f5f2eb",
  accent: "#c8401a",
  accentDark: "#a33415",
  gold: "#b8860b",
  goldLight: "#d4a017",
  white: "#ffffff",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  green100: "#dcfce7",
  green600: "#16a34a",
  yellow100: "#fef9c3",
  yellow600: "#ca8a04",
  red100: "#fee2e2",
  red600: "#dc2626",
} as const;

const FONT_MONO = "'IBM Plex Mono', monospace";
const FONT_BODY = "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif";

// ─── Types ───
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface PlanBuilderProps {
  profile: Profile | null;
  existingPlans: PlanDocument[];
}

// ─── Section definitions (様式2完全準拠) ───
const KEIEI_SECTIONS = [
  { id: "1-1", label: "1-1. 自社の概要" },
  { id: "1-2", label: "1-2. 売上・利益の状況" },
  { id: "1-3", label: "1-3. 経営課題" },
  { id: "2-1", label: "2-1. 市場の動向" },
  { id: "2-2", label: "2-2. 顧客ニーズ" },
  { id: "3-1", label: "3-1. 自社の強み" },
  { id: "3-2", label: "3-2. 商品・サービスの強み・弱み" },
  { id: "4-1", label: "4-1. 経営方針・目標" },
  { id: "4-2", label: "4-2. 今後のプラン" },
] as const;

const HOJO_SECTIONS = [
  { id: "hojo-name", label: "事業名（30字以内）" },
  { id: "hojo-2-1", label: "補助2-1. 事業の概要" },
  { id: "hojo-2-2", label: "補助2-2. 背景・目的" },
  { id: "hojo-2-3", label: "補助2-3. 具体的な取組" },
  { id: "hojo-3-1", label: "補助3-1. 背景・目的（生産性向上・任意）" },
  { id: "hojo-3-2", label: "補助3-2. 具体的な取組（生産性向上・任意）" },
  { id: "hojo-4-1", label: "補助4-1. 取組の効果" },
  { id: "hojo-4-2", label: "補助4-2. 効果の試算" },
] as const;

const ALL_SECTIONS = [...KEIEI_SECTIONS, ...HOJO_SECTIONS];

// ─── Score criteria (15 items, 5pts each = 75) ───
const SCORE_ITEMS = [
  { id: 1, section: "1-2", label: "直近の数値を表で示しているか" },
  { id: 2, section: "1-3", label: "課題を機会損失金額で定量化しているか" },
  { id: 3, section: "2-1", label: "市場データを出典付きで引用しているか" },
  { id: 4, section: "2-2", label: "ターゲットを具体的に定義しているか" },
  { id: 5, section: "3-1", label: "強みを数値根拠で示しているか" },
  { id: 6, section: "3-2", label: "競合比較表で優位性を示しているか" },
  { id: 7, section: "3-2", label: "弱みと補助事業が論理的に直結しているか" },
  { id: 8, section: "4-1", label: "KPIを因数分解して示しているか" },
  { id: 9, section: "4-2", label: "工程表に担当者・金額・設備名があるか" },
  { id: 10, section: "補2-2", label: "課題→補助事業→効果の因果関係があるか" },
  { id: 11, section: "補2-3", label: "取組に何を・いつ・誰が・どのようにがあるか" },
  { id: 12, section: "補2-3", label: "デジタル活用が具体的に記載されているか" },
  { id: 13, section: "補4-1", label: "波及効果を数値で予測しているか" },
  { id: 14, section: "補4-2", label: "売上・利益を3年分の表で示しているか" },
  { id: 15, section: "全体", label: "全文断定型で統一されているか" },
] as const;

type ScoreStatus = "pass" | "warn" | "none";

interface ScoreEntry {
  status: ScoreStatus;
  score: number;
  reason: string;
}

// ─── Section parsing ───
function parseSections(text: string): Record<string, string> {
  const result: Record<string, string> = {};

  // ── 経営計画セクション (1-1 ~ 4-2) ──
  // Match **1-1. ...** or ## 1-1. ... etc. before 【補助事業計画】
  const keieiPart = text.split(/【補助事業計画】/)[0] || text;
  const keieiRegex = /(?:^|\n)(?:\*{0,2}#{0,3}\s*)?(\d-\d)\.\s*(.+?)(?:\*{0,2})\s*\n([\s\S]*?)(?=(?:\n(?:\*{0,2}#{0,3}\s*)?\d-\d\.)|$)/g;
  let match;
  while ((match = keieiRegex.exec(keieiPart)) !== null) {
    const id = match[1];
    const content = match[3].trim();
    if (content) {
      result[id] = content;
    }
  }

  // ── 補助事業計画セクション ──
  const hojoStart = text.indexOf("【補助事業計画】");
  if (hojoStart === -1) return result;
  const hojoPart = text.slice(hojoStart);

  // 事業名 (30字以内)
  const nameMatch = hojoPart.match(/\*{0,2}1\.\s*補助事業で行う事業名\*{0,2}\s*\n([\s\S]*?)(?=\n\*{0,2}\d)/);
  if (nameMatch) result["hojo-name"] = nameMatch[1].trim();

  // 補助事業の番号付きセクション: 2-1, 2-2, 2-3, 3-1, 3-2, 4-1, 4-2
  const hojoNumRegex = /(?:^|\n)(?:\*{0,2}#{0,3}\s*)?(\d-\d)\.\s*(.+?)(?:\*{0,2})\s*\n([\s\S]*?)(?=(?:\n(?:\*{0,2}#{0,3}\s*)?\d-\d\.)|$)/g;
  while ((match = hojoNumRegex.exec(hojoPart)) !== null) {
    const id = match[1];
    const content = match[3].trim();
    if (content) {
      result[`hojo-${id}`] = content;
    }
  }

  return result;
}

// ─── Score parsing ───
function parseScores(text: string): ScoreEntry[] {
  const scores: ScoreEntry[] = Array.from({ length: 15 }, () => ({
    status: "none" as ScoreStatus,
    score: 0,
    reason: "",
  }));

  // Look for the self-check table in assistant messages
  const tableRegex = /\|\s*(\d+)\s*\|[^|]*\|[^|]*\|\s*(✅|⚠️|❌|—)\s*\|\s*(\d+)\/5\s*\|\s*(.*?)\s*\|/g;
  let match;
  while ((match = tableRegex.exec(text)) !== null) {
    const idx = parseInt(match[1]) - 1;
    if (idx >= 0 && idx < 15) {
      const symbol = match[2];
      scores[idx] = {
        status: symbol === "✅" ? "pass" : symbol === "⚠️" ? "warn" : "none",
        score: parseInt(match[3]),
        reason: match[4].trim(),
      };
    }
  }

  // Also try to extract total score
  return scores;
}

function getTotalScore(scores: ScoreEntry[]): number {
  return scores.reduce((sum, s) => sum + s.score, 0);
}

function parseImprovementHints(text: string): string[] {
  const hints: string[] = [];
  const hintsMatch = text.match(/【強化が必要な箇所】([\s\S]*?)(?=このドラフト|$)/);
  if (hintsMatch) {
    const lines = hintsMatch[1].split("\n").filter((l) => l.trim().startsWith("・"));
    for (const line of lines) {
      hints.push(line.trim().replace(/^・\s*/, ""));
    }
  }
  return hints;
}

// ─── Component ───
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function PlanBuilder({ profile, existingPlans }: PlanBuilderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Left panel inputs
  const [hpUrl, setHpUrl] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [hearing, setHearing] = useState("");

  // Center tabs
  const [centerTab, setCenterTab] = useState<"chat" | "sections">("chat");
  const [activeSectionId, setActiveSectionId] = useState<string>("1-1");

  const isAdmin = profile?.role === "admin";
  const remainingCount = (profile?.monthly_limit ?? 0) - (profile?.monthly_count ?? 0);

  // ─── Derived data ───
  const allAssistantText = useMemo(() => {
    return messages
      .filter((m) => m.role === "assistant")
      .map((m) => m.content)
      .join("\n\n");
  }, [messages]);

  const sections = useMemo(() => parseSections(allAssistantText), [allAssistantText]);
  const scores = useMemo(() => parseScores(allAssistantText), [allAssistantText]);
  const totalScore = useMemo(() => getTotalScore(scores), [scores]);
  const hints = useMemo(() => parseImprovementHints(allAssistantText), [allAssistantText]);

  // ─── Scroll ───
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ─── API ───
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
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          fullText += chunk;
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

  // ─── Init greeting ───
  const startNewChat = async () => {
    setMessages([]);
    setError("");
    setLoading(true);

    const initialMessages: ChatMessage[] = [
      { role: "user", content: "計画書の作成を始めたいです。" },
    ];

    try {
      const assistantText = await sendToAPI(initialMessages);
      setMessages([{ role: "assistant", content: assistantText }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length === 0) {
      startNewChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Send message ───
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

  // ─── Generate all sections ───
  const handleGenerateAll = async () => {
    if (loading) return;

    let prompt = "1\n\n";
    if (hpUrl.trim()) {
      prompt += `STEP1のHP URL: ${hpUrl.trim()}\n\n`;
    }
    if (businessType.trim()) {
      prompt += `業種・補助事業概要: ${businessType.trim()}\n\n`;
    }
    if (hearing.trim()) {
      prompt += `STEP2のヒアリング文字起こし:\n${hearing.trim()}\n\n`;
    }
    prompt += "上記の情報をもとに、不足があれば質問してください。情報が十分であれば全項目のドラフトを一気に生成してください。";

    const userMessage: ChatMessage = { role: "user", content: prompt };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setError("");
    setLoading(true);

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
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  const copySection = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const scorePercent = Math.round((totalScore / 75) * 100);

  // ─── Render ───
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr 300px",
        gap: "16px",
        height: "calc(100vh - 100px)",
        fontFamily: FONT_BODY,
        color: COLORS.ink,
      }}
    >
      {/* ════════ LEFT PANEL ════════ */}
      <div
        style={{
          background: COLORS.white,
          borderRadius: "12px",
          border: `1px solid ${COLORS.gray200}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: `1px solid ${COLORS.gray200}`,
            fontWeight: 700,
            fontSize: "14px",
            color: COLORS.ink,
          }}
        >
          入力パネル
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {/* HP URL */}
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: 600, color: COLORS.gray600 }}>
            HP URL
          </label>
          <input
            type="url"
            value={hpUrl}
            onChange={(e) => setHpUrl(e.target.value)}
            placeholder="https://example.com"
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "8px",
              border: `1px solid ${COLORS.gray300}`,
              fontSize: "13px",
              fontFamily: FONT_MONO,
              marginBottom: "12px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {/* 業種・補助事業概要 */}
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: 600, color: COLORS.gray600 }}>
            業種・補助事業概要
          </label>
          <input
            type="text"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            placeholder="例：飲食業、券売機導入"
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "8px",
              border: `1px solid ${COLORS.gray300}`,
              fontSize: "13px",
              marginBottom: "12px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {/* ヒアリング */}
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: 600, color: COLORS.gray600 }}>
            ヒアリング
          </label>
          <textarea
            value={hearing}
            onChange={(e) => setHearing(e.target.value)}
            placeholder="打ち合わせの文字起こしを貼り付け..."
            rows={5}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "8px",
              border: `1px solid ${COLORS.gray300}`,
              fontSize: "13px",
              resize: "vertical",
              marginBottom: "16px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {/* Generate button */}
          <button
            onClick={handleGenerateAll}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              background: loading ? COLORS.gray400 : COLORS.accent,
              color: COLORS.white,
              fontWeight: 700,
              fontSize: "14px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "20px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.target as HTMLButtonElement).style.background = COLORS.accentDark;
            }}
            onMouseLeave={(e) => {
              if (!loading) (e.target as HTMLButtonElement).style.background = COLORS.accent;
            }}
          >
            ⚡ 全項目を生成
          </button>

          {/* Section navigation */}
          {([
            { title: "経営計画", items: KEIEI_SECTIONS },
            { title: "補助事業計画", items: HOJO_SECTIONS },
          ] as const).map((group) => (
            <div key={group.title} style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.gray500, marginBottom: "4px", textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>
                {group.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                {group.items.map((sec) => {
                  const hasContent = !!sections[sec.id];
                  const isActive = centerTab === "sections" && activeSectionId === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setCenterTab("sections");
                        setActiveSectionId(sec.id);
                      }}
                      style={{
                        textAlign: "left",
                        padding: "5px 8px",
                        borderRadius: "6px",
                        border: "none",
                        background: isActive ? `${COLORS.accent}15` : "transparent",
                        color: isActive ? COLORS.accent : hasContent ? COLORS.ink : COLORS.gray400,
                        fontSize: "11px",
                        fontWeight: isActive ? 700 : 400,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <span style={{ marginRight: "4px" }}>{hasContent ? "●" : "○"}</span>
                      {sec.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════ CENTER PANEL ════════ */}
      <div
        style={{
          background: COLORS.white,
          borderRadius: "12px",
          border: `1px solid ${COLORS.gray200}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: `1px solid ${COLORS.gray200}`,
          }}
        >
          {(
            [
              { key: "chat", label: "💬 AIチャット" },
              { key: "sections", label: "📄 項目別" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCenterTab(tab.key)}
              style={{
                flex: 1,
                padding: "12px",
                border: "none",
                borderBottom: centerTab === tab.key ? `2px solid ${COLORS.accent}` : "2px solid transparent",
                background: centerTab === tab.key ? COLORS.white : COLORS.gray50,
                color: centerTab === tab.key ? COLORS.accent : COLORS.gray500,
                fontWeight: centerTab === tab.key ? 700 : 500,
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {centerTab === "chat" ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      borderRadius: "16px",
                      padding: "10px 14px",
                      fontSize: "13px",
                      lineHeight: "1.7",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      ...(msg.role === "user"
                        ? {
                            background: COLORS.accent,
                            color: COLORS.white,
                            borderBottomRightRadius: "4px",
                          }
                        : {
                            background: COLORS.gray50,
                            border: `1px solid ${COLORS.gray200}`,
                            color: COLORS.ink,
                            borderBottomLeftRadius: "4px",
                          }),
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && messages[messages.length - 1]?.role !== "assistant" && (
                <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "12px" }}>
                  <div
                    style={{
                      background: COLORS.gray50,
                      border: `1px solid ${COLORS.gray200}`,
                      borderRadius: "16px",
                      borderBottomLeftRadius: "4px",
                      padding: "10px 14px",
                      display: "flex",
                      gap: "6px",
                    }}
                  >
                    {[0, 1, 2].map((j) => (
                      <span
                        key={j}
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: COLORS.gray400,
                          display: "inline-block",
                          animation: "bounce 1s infinite",
                          animationDelay: `${j * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: "0 16px 8px 16px" }}>
                <p
                  style={{
                    background: COLORS.red100,
                    color: COLORS.red600,
                    fontSize: "13px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                  }}
                >
                  {error}
                </p>
              </div>
            )}

            {/* Input */}
            <div style={{ padding: "12px 16px", borderTop: `1px solid ${COLORS.gray200}` }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="メッセージを入力..."
                  rows={1}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: `1px solid ${COLORS.gray300}`,
                    fontSize: "13px",
                    resize: "none",
                    outline: "none",
                    fontFamily: FONT_BODY,
                    boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    background: loading || !input.trim() ? COLORS.gray300 : COLORS.accent,
                    color: COLORS.white,
                    fontWeight: 600,
                    fontSize: "13px",
                    border: "none",
                    cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                    flexShrink: 0,
                    transition: "background 0.2s",
                  }}
                >
                  送信
                </button>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                {!isAdmin && (
                  <span style={{ fontSize: "11px", color: COLORS.gray400 }}>
                    残り{remainingCount}カウント
                  </span>
                )}
                <button
                  onClick={startNewChat}
                  disabled={loading}
                  style={{
                    fontSize: "11px",
                    color: COLORS.gray400,
                    background: "none",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    marginLeft: "auto",
                  }}
                >
                  会話をリセット
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ─── Sections tab ─── */
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* Sub-tab list */}
            <div
              style={{
                width: "200px",
                borderRight: `1px solid ${COLORS.gray200}`,
                overflowY: "auto",
                padding: "8px",
                flexShrink: 0,
              }}
            >
              {([
                { title: "経営計画", items: KEIEI_SECTIONS },
                { title: "補助事業計画", items: HOJO_SECTIONS },
              ] as const).map((group) => (
                <div key={group.title} style={{ marginBottom: "10px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: COLORS.gray500, padding: "4px 10px", letterSpacing: "0.5px" }}>
                    {group.title}
                  </div>
                  {group.items.map((sec) => {
                    const hasContent = !!sections[sec.id];
                    const isActive = activeSectionId === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => setActiveSectionId(sec.id)}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "none",
                          background: isActive ? `${COLORS.accent}12` : "transparent",
                          color: isActive ? COLORS.accent : hasContent ? COLORS.ink : COLORS.gray400,
                          fontSize: "11px",
                          fontWeight: isActive ? 700 : 400,
                          cursor: "pointer",
                          marginBottom: "1px",
                          transition: "all 0.15s",
                        }}
                      >
                        <span style={{ marginRight: "4px" }}>{hasContent ? "✅" : "—"}</span>
                        {sec.label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Section content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: COLORS.ink, margin: 0 }}>
                  {ALL_SECTIONS.find((s) => s.id === activeSectionId)?.label}
                </h3>
                {sections[activeSectionId] && (
                  <button
                    onClick={() => copySection(sections[activeSectionId])}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "6px",
                      border: `1px solid ${COLORS.gray300}`,
                      background: COLORS.white,
                      fontSize: "12px",
                      cursor: "pointer",
                      color: COLORS.gray600,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.borderColor = COLORS.accent;
                      (e.target as HTMLButtonElement).style.color = COLORS.accent;
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.borderColor = COLORS.gray300;
                      (e.target as HTMLButtonElement).style.color = COLORS.gray600;
                    }}
                  >
                    コピー
                  </button>
                )}
              </div>

              {sections[activeSectionId] ? (
                <div
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.8",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    color: COLORS.ink,
                  }}
                >
                  {sections[activeSectionId]}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: COLORS.gray400,
                    fontSize: "13px",
                    marginTop: "60px",
                  }}
                >
                  このセクションはまだ生成されていません。
                  <br />
                  チャットで情報を入力するか「⚡ 全項目を生成」を実行してください。
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ════════ RIGHT PANEL — SCORE ════════ */}
      <div
        style={{
          background: COLORS.white,
          borderRadius: "12px",
          border: `1px solid ${COLORS.gray200}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px",
            borderBottom: `1px solid ${COLORS.gray200}`,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 600, color: COLORS.gray500, marginBottom: "8px" }}>
            採点スコア
          </div>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 800,
              fontFamily: FONT_MONO,
              color: totalScore >= 60 ? COLORS.green600 : totalScore >= 45 ? COLORS.gold : COLORS.red600,
              lineHeight: 1,
            }}
          >
            {totalScore}
            <span style={{ fontSize: "16px", fontWeight: 500, color: COLORS.gray400 }}>/75</span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              marginTop: "12px",
              height: "8px",
              borderRadius: "4px",
              background: COLORS.gray100,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${scorePercent}%`,
                borderRadius: "4px",
                background:
                  totalScore >= 60
                    ? COLORS.green600
                    : totalScore >= 45
                      ? COLORS.gold
                      : totalScore > 0
                        ? COLORS.red600
                        : COLORS.gray300,
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <div style={{ fontSize: "11px", color: COLORS.gray400, marginTop: "4px" }}>
            {totalScore >= 60
              ? "商工会議所に持ち込める初稿レベル"
              : totalScore >= 45
                ? "情報追加で改善可能"
                : totalScore > 0
                  ? "情報不足 — 追加ヒアリング推奨"
                  : "ドラフト生成後に採点されます"}
          </div>
        </div>

        {/* Score items list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
          {SCORE_ITEMS.map((item, idx) => {
            const entry = scores[idx];
            const icon = entry.status === "pass" ? "✅" : entry.status === "warn" ? "⚠️" : "—";
            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  padding: "8px 4px",
                  borderBottom: idx < SCORE_ITEMS.length - 1 ? `1px solid ${COLORS.gray100}` : "none",
                }}
              >
                <span style={{ fontSize: "14px", flexShrink: 0, width: "20px", textAlign: "center" }}>
                  {icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "11px", lineHeight: "1.5", color: COLORS.ink }}>
                    <span
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: "10px",
                        color: COLORS.gray400,
                        marginRight: "4px",
                      }}
                    >
                      #{item.id}
                    </span>
                    {item.label}
                  </div>
                  {entry.reason && (
                    <div style={{ fontSize: "10px", color: COLORS.gray500, marginTop: "2px" }}>
                      {entry.reason}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: "12px",
                    fontWeight: 700,
                    color:
                      entry.score >= 4
                        ? COLORS.green600
                        : entry.score >= 3
                          ? COLORS.gold
                          : entry.score > 0
                            ? COLORS.red600
                            : COLORS.gray300,
                    flexShrink: 0,
                  }}
                >
                  {entry.score}/5
                </span>
              </div>
            );
          })}
        </div>

        {/* Improvement hints */}
        {hints.length > 0 && (
          <div
            style={{
              padding: "12px",
              borderTop: `1px solid ${COLORS.gray200}`,
              background: `${COLORS.gold}08`,
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.gold, marginBottom: "6px" }}>
              💡 改善ヒント
            </div>
            {hints.slice(0, 5).map((hint, i) => (
              <div
                key={i}
                style={{
                  fontSize: "11px",
                  color: COLORS.gray600,
                  lineHeight: "1.5",
                  marginBottom: "4px",
                  paddingLeft: "8px",
                  borderLeft: `2px solid ${COLORS.gold}`,
                }}
              >
                {hint}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bounce animation */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap');
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
