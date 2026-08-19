"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase-browser";
import { Profile, PlanDocument } from "@/types/database";

// ─── Design tokens ───
const COLORS = {
  ink: "#0a0c10",
  paper: "#f5f2eb",
  accent: "#0f2346",
  accentDark: "#0a1830",
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
  blue50: "#eff6ff",
  blue600: "#2563eb",
} as const;

const FONT_MONO = "'IBM Plex Mono', monospace";
const FONT_BODY = "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif";

// ─── Types ───
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatSessionItem {
  id: string;
  title: string | null;
  created_at: string;
  is_pinned: boolean;
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
  { id: "3", label: "3. 自社の強み・弱み" },
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
// system_prompt.ts の自動セルフチェック表と1対1で対応させること。
// プロンプト側の項目を増減したら、必ずここも合わせる（第20回で15→17項目に拡張）
const SCORE_ITEMS = [
  { id: 1, section: "1-2", label: "直近の数値を表で示しているか" },
  { id: 2, section: "1-3", label: "課題を機会損失金額で定量化しているか" },
  { id: 3, section: "2-1", label: "市場データを出典付きで引用しているか" },
  { id: 4, section: "2-2", label: "ターゲットを具体的に定義しているか" },
  { id: 5, section: "3", label: "強みを数値根拠で示しているか" },
  { id: 6, section: "3", label: "競合比較表で優位性を示しているか" },
  { id: 7, section: "3", label: "弱みと補助事業が論理的に直結しているか" },
  { id: 8, section: "4-1", label: "KPIを因数分解して示しているか" },
  { id: 9, section: "4-2", label: "工程表に担当者・金額・設備名があるか" },
  { id: 10, section: "補2-2", label: "課題→補助事業→効果の因果関係があるか" },
  { id: 11, section: "補2-3", label: "取組に何を・いつ・誰が・どのようにがあるか" },
  { id: 12, section: "補2-3", label: "デジタル活用が具体的に記載されているか" },
  { id: 13, section: "補4-1", label: "来店数・雇用増・賃上げ金額を数値で明記しているか" },
  { id: 14, section: "補4-2", label: "売上高・売上総利益・営業利益を3年分の表で示しているか" },
  { id: 15, section: "補4-2", label: "売上高・売上総利益の増加根拠を客観的データで示しているか" },
  { id: 16, section: "補2-3", label: "取得資産を事業終了後も継続使用すると明記しているか" },
  { id: 17, section: "全体", label: "全文断定型で統一されているか" },
] as const;

// 満点（SCORE_ITEMS 各項目5点）
const SCORE_MAX = SCORE_ITEMS.length * 5;
// 判定しきい値：system_prompt.ts の「目安」と一致させること
const SCORE_GOOD = Math.round(SCORE_MAX * 0.8); // 68点＝商工会議所に持ち込める初稿
const SCORE_WARN = Math.round(SCORE_MAX * 0.6); // 51点以下＝情報不足

type ScoreStatus = "pass" | "warn" | "none";

interface ScoreEntry {
  status: ScoreStatus;
  score: number;
  reason: string;
}

// ─── Fix 2: SWOT / 戦略整理メモ parsing ───
function parseStrategyMemo(text: string): string | null {
  // Try multiple patterns the AI uses
  const patterns = [
    /＜Step A[：:]?\s*戦略整理メモ＞\s*\n([\s\S]*?)(?=\n---|\n＜Step B|$)/,
    /【戦略整理メモ】\s*\n([\s\S]*?)(?=\n---|\n【|$)/,
    /【計画書作成の方向性】\s*\n([\s\S]*?)(?=\n---|\n【|$)/,
    /### ＜Step A[：:]?[^＞]*＞\s*\n([\s\S]*?)(?=\n---|\n###\s*＜Step B|$)/,
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m && m[1].trim().length > 30) return m[1].trim();
  }
  return null;
}

// ─── Fix 3: Supplementary content extraction ───
interface SectionParts {
  body: string;
  checkItems: string | null; // 📋審査基準チェック
}

function extractSupplementary(rawContent: string): SectionParts {
  let body = rawContent;
  const checkChunks: string[] = [];

  // ── Block removal: 【審査基準セルフチェック】 ──
  body = body.replace(/(?:\n---\s*)?\n?【審査基準セルフチェック】[\s\S]*$/g, (m) => {
    checkChunks.push(m.replace(/^[\n\s-]+/, "").trim());
    return "";
  });

  // ── Block removal: 【強化が必要な箇所】 ──
  body = body.replace(/(?:\n---\s*)?\n?【強化が必要な箇所】[\s\S]*?(?=\n---|\n【|$)/g, (m) => {
    checkChunks.push(m.replace(/^[\n\s-]+/, "").trim());
    return "";
  });

  // ── Line removal: 合計: XX点/XX点 and （目安： lines ──
  body = body.replace(/^.*合計[：:]\s*\d+.*\/\d+点.*$/gm, (m) => {
    checkChunks.push(m.trim());
    return "";
  });
  body = body.replace(/^.*（目安[：:].*$/gm, (m) => {
    checkChunks.push(m.trim());
    return "";
  });

  // ── Line-level scoring/checklist extraction ──
  const lines = body.split("\n");
  const filteredLines: string[] = [];
  const scoreLines: string[] = [];
  let inScoreTable = false;

  for (const line of lines) {
    const isScoreLine =
      /^\s*\|?\s*項目\d+/.test(line) ||
      /^\s*\|?\s*\d+\s*\|.*[✅⚠️❌].*\/5/.test(line) ||
      /^\s*[✅⚠️❌]\s.*\/5/.test(line) ||
      /^\s*\|\s*#\s*\|.*審査項目/.test(line);

    // Table separator rows that belong to a score table
    const isTableSep = /^\s*\|[-\s:|]+\|\s*$/.test(line);

    if (isScoreLine) {
      inScoreTable = true;
      scoreLines.push(line);
    } else if (isTableSep && inScoreTable) {
      scoreLines.push(line);
    } else {
      inScoreTable = false;
      filteredLines.push(line);
    }
  }
  if (scoreLines.length > 0) {
    checkChunks.push(scoreLines.join("\n").trim());
  }
  body = filteredLines.join("\n");

  // ── Inline 【📊要データ補完】 tags: keep in body (rendered as yellow spans) ──
  // Do NOT remove these — they stay in body text for highlighting

  // Clean up excessive blank lines
  body = body.replace(/\n{3,}/g, "\n\n").trim();

  const checkItems = checkChunks.length > 0 ? checkChunks.join("\n\n") : null;

  return { body, checkItems };
}

// ─── Strip scoring/check blocks from chat bubble text ───
function stripScoringBlocks(text: string): string {
  let t = text;
  // 【情報充足度チェック】 block (including markdown table until next heading or end)
  t = t.replace(/(?:\n---\s*)?\n?【情報充足度チェック】[\s\S]*?(?=\n##|\n【(?!📊)[^\n]*】|$)/g, "");
  // 【審査基準セルフチェック】 block
  t = t.replace(/(?:\n---\s*)?\n?【審査基準セルフチェック】[\s\S]*?(?=\n##|\n【(?!📊)[^\n]*】|$)/g, "");
  // 【強化が必要な箇所】 block
  t = t.replace(/(?:\n---\s*)?\n?【強化が必要な箇所】[\s\S]*?(?=\n##|\n【(?!📊)[^\n]*】|$)/g, "");
  // 【📊 市場データ補完ガイド】 is NOT stripped — it remains visible in the chat bubble
  // 合計: ○点/85点 line（分母は \d+ で受けるので項目数が変わっても動く）
  t = t.replace(/^.*合計[：:]\s*\d*○?\d*\s*点?\s*[/／]\s*\d+点.*$/gm, "");
  // （目安：...） line
  t = t.replace(/^.*（目安[：:].*$/gm, "");
  // 補助金制度や申請に関するご質問は... line (at end of scoring block)
  t = t.replace(/^補助金制度や申請に関するご質問はこのチャットでそのまま聞いてください。\s*$/gm, "");
  // Scoring table rows: | # | ... | ✅/⚠️/❌ | /5 |
  t = t.replace(/^\s*\|?\s*\d+\s*\|.*[✅⚠️❌].*\/5.*$/gm, "");
  t = t.replace(/^\s*\|\s*#\s*\|.*審査項目.*$/gm, "");
  // Scoring table header row: | # | 様式の該当箇所 | ...
  t = t.replace(/^\s*\|\s*#\s*\|.*様式の該当箇所.*$/gm, "");
  // Clean up excessive blank lines
  t = t.replace(/\n{3,}/g, "\n\n").trim();
  return t;
}

// ─── Section parsing ───
function parseSections(text: string): Record<string, string> {
  const result: Record<string, string> = {};

  // ドラフト部分（【経営計画】or【経営計画書】以降）のみをパース対象とする
  const keieiMatch = text.match(/【経営計画(?:書)?】/);
  if (!keieiMatch) return result;
  const draftText = text.slice(keieiMatch.index!);

  const keieiPart = draftText.split(/【補助事業計画(?:書)?】/)[0] || draftText;
  // Match both "3-1." (hyphenated) and "3." (single digit) section headings
  // 否定先読み (?!\s*\d-\d\.) でグループ見出し(直後にサブセクションが続く単独の N.)をスキップ
  const keieiRegex = /(?:^|\n)(?:\*{0,2}#{0,3}\s*)?(\d(?:-\d)?)\.\s*(.+?)(?:\*{0,2})\s*\n(?!\s*\d-\d\.)([\s\S]*?)(?=(?:\n(?:\*{0,2}#{0,3}\s*)?\d(?:-\d)?\.)|$)/g;
  let match;
  while ((match = keieiRegex.exec(keieiPart)) !== null) {
    const id = match[1];
    const content = match[3].trim();
    if (content) {
      result[id] = content;
    }
  }

  const hojoMatch = draftText.match(/【補助事業計画(?:書)?】/);
  if (!hojoMatch) return result;
  const hojoPart = draftText.slice(hojoMatch.index!);

  const nameMatch = hojoPart.match(/\*{0,2}1\.\s*補助事業で行う事業名\*{0,2}\s*\n([\s\S]*?)(?=\n\*{0,2}\d)/);
  if (nameMatch) result["hojo-name"] = nameMatch[1].trim();

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
  const scores: ScoreEntry[] = Array.from({ length: SCORE_ITEMS.length }, () => ({
    status: "none" as ScoreStatus,
    score: 0,
    reason: "",
  }));

  // 得点セルは「5」「5/5」「5 / 5」のいずれの形式でも拾う。
  // プロンプトのテンプレートが「| /5 |」のためモデルは数字だけを埋めることが多く、
  // 以前は N/5 形式しか受け付けず全項目0点になっていた。
  const tableRegex =
    /\|\s*(\d+)\s*\|[^|]*\|[^|]*\|\s*(✅|⚠️|❌|—)\s*\|\s*(\d+)\s*(?:\/\s*5)?\s*\|\s*(.*?)\s*\|/g;
  let match;
  while ((match = tableRegex.exec(text)) !== null) {
    const idx = parseInt(match[1]) - 1;
    if (idx >= 0 && idx < SCORE_ITEMS.length) {
      const symbol = match[2];
      scores[idx] = {
        status: symbol === "✅" ? "pass" : symbol === "⚠️" ? "warn" : "none",
        score: Math.min(parseInt(match[3]), 5),
        reason: match[4].trim(),
      };
    }
  }

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

// ─── Collapsible panel sub-component ───
function CollapsiblePanel({
  label,
  content,
  bgColor,
  borderColor,
  labelColor,
  defaultOpen = false,
}: {
  label: string;
  content: string;
  bgColor: string;
  borderColor: string;
  labelColor: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        marginTop: "12px",
        border: `1px solid ${borderColor}`,
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "8px 12px",
          background: bgColor,
          border: "none",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: 700,
          color: labelColor,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {label}
        <span style={{ fontSize: "10px", color: COLORS.gray400 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div
          style={{
            padding: "12px",
            fontSize: "12px",
            lineHeight: "1.7",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: COLORS.ink,
            background: COLORS.white,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// ─── Component ───
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function PlanBuilder({ profile, existingPlans }: PlanBuilderProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sessionIdRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countConsumedRef = useRef(false);

  // Left panel inputs
  const [hpUrl, setHpUrl] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [hearing, setHearing] = useState("");
  const businessTypeRef = useRef("");

  // Center tabs
  const [centerTab, setCenterTab] = useState<"chat" | "sections">("chat");
  const [activeSectionId, setActiveSectionId] = useState<string>("1-1");

  // Fix 2: SWOT memo toggle
  const [swotOpen, setSwotOpen] = useState(true);

  const isAdmin = profile?.role === "admin";
  const isCampaignActive = new Date() <= new Date('2026-04-30T23:59:59+09:00');
  const isMonitor = isCampaignActive ? true : !!profile?.is_monitor;
  const isUnlimited = isAdmin || isMonitor;
  const isFree = (profile?.plan_type ?? "free") === "free" && !isUnlimited;
  // 許可プラン以外は全てブロック（free/basic/旧プラン含む）
  const ALLOWED_PLANS = ["annual_50", "monthly_3", "monthly_1", "yearly"];
  const isCampaignExpired = !isUnlimited && !ALLOWED_PLANS.includes(profile?.plan_type ?? "free");
  const [showCampaignExpiredModal, setShowCampaignExpiredModal] = useState(false);
  const [remainingCount, setRemainingCount] = useState(
    isUnlimited ? Infinity : Math.max(0, (profile?.usage_limit ?? 1) - (profile?.usage_count ?? 0) + (profile?.extra_count ?? 0))
  );
  const [showCountModal, setShowCountModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<false | "copy" | "newSession">(false);
  const [sessionList, setSessionList] = useState<ChatSessionItem[]>([]);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [savingSessionId, setSavingSessionId] = useState<string | null>(null);
  const [menuSessionId, setMenuSessionId] = useState<string | null>(null);
  const pendingMessageRef = useRef<string | null>(null);

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
  const strategyMemo = useMemo(() => parseStrategyMemo(allAssistantText), [allAssistantText]);

  // ─── Session list ───
  const fetchSessions = useCallback(async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from("chat_sessions")
      .select("id, title, created_at, is_pinned")
      .eq("user_id", profile.id)
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(50);
    if (data) setSessionList(data as ChatSessionItem[]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const handleSwitchSession = async (sessionId: string) => {
    if (sessionId === sessionIdRef.current || loading) return;
    const { data } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();
    if (data && Array.isArray(data.messages)) {
      sessionIdRef.current = data.id;
      const msgs = data.messages as ChatMessage[];
      setMessages(msgs);
      setCenterTab("chat");
      // 既存セッションはカウント消費済みとみなす
      countConsumedRef.current = true;
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    await supabase.from("chat_sessions").delete().eq("id", sessionId);
    if (sessionIdRef.current === sessionId) {
      sessionIdRef.current = null;
      setMessages([]);
      await startNewChat();
    }
    fetchSessions();
  };

  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    const trimmed = newTitle.trim() || "新しい会話";
    setSavingSessionId(sessionId);
    setSessionList(prev => prev.map(s => s.id === sessionId ? { ...s, title: trimmed } : s));
    setEditingSessionId(null);
    await supabase.from("chat_sessions").update({ title: trimmed }).eq("id", sessionId);
    setSavingSessionId(null);
  };

  const handlePinSession = async (sessionId: string, currentPinned: boolean) => {
    const next = !currentPinned;
    setSessionList(prev => {
      const updated = prev.map(s => s.id === sessionId ? { ...s, is_pinned: next } : s);
      return [...updated].sort((a, b) => {
        if (a.is_pinned === b.is_pinned) return 0;
        return a.is_pinned ? -1 : 1;
      });
    });
    await supabase.from("chat_sessions").update({ is_pinned: next }).eq("id", sessionId);
  };

  // ─── Session persistence ───
  const saveSession = useCallback(async (msgs: ChatMessage[]) => {
    if (!profile?.id || msgs.length === 0) return;

    // 挨拶文のみ（assistantメッセージ1件だけ）の場合はセッション保存しない
    const hasUserMessage = msgs.some((m) => m.role === "user");
    if (!hasUserMessage && !sessionIdRef.current) return;

    const title = businessTypeRef.current.trim() || "新しい会話";

    if (sessionIdRef.current) {
      // titleはINSERT時のみ設定。手動リネーム後に上書きしないようUPDATEでは含めない
      await supabase
        .from("chat_sessions")
        .update({ messages: msgs, updated_at: new Date().toISOString() })
        .eq("id", sessionIdRef.current);
    } else {
      const { data } = await supabase
        .from("chat_sessions")
        .insert({ user_id: profile.id, messages: msgs, title })
        .select("id")
        .single();
      if (data) sessionIdRef.current = data.id;
    }
    fetchSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, fetchSessions]);

  const debouncedSave = useCallback((msgs: ChatMessage[]) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveSession(msgs), 1500);
  }, [saveSession]);

  // Auto-save on messages change
  useEffect(() => {
    if (sessionLoaded && messages.length > 0) {
      debouncedSave(messages);
    }
  }, [messages, sessionLoaded, debouncedSave]);

  // メニューの外クリックで閉じる
  useEffect(() => {
    if (!menuSessionId) return;
    const close = () => setMenuSessionId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuSessionId]);

  // ─── Scroll ───
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ─── API (with continuation support) ───
  const sendToAPIWithAppend = async (msgs: ChatMessage[], appendToLast = false): Promise<string> => {
    const totalTurnCount = msgs.filter(m => m.role === 'user').length;
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs.slice(-20), turnCount: totalTurnCount }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "送信に失敗しました");
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let newText = "";

    if (reader) {
      if (!appendToLast) {
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      }

      // Capture the prefix to append to
      let prefix = "";
      if (appendToLast) {
        // We need the current last message content as prefix
        setMessages((prev) => {
          prefix = prev[prev.length - 1]?.content || "";
          return prev;
        });
        // Small delay to ensure state is read
        await new Promise((r) => setTimeout(r, 0));
        setMessages((prev) => {
          prefix = prev[prev.length - 1]?.content || "";
          return prev;
        });
      }

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          newText += chunk;
          const combined = appendToLast ? prefix + newText : newText;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: combined };
            return updated;
          });
        }
      }
    }

    return newText;
  };

  // ─── Auto-continuation disabled ───
  // 自動続行は無効化。ユーザーが手動で「続けてください」と送信した場合のみ続行する。

  // ─── Init greeting ───
  const startNewChat = async () => {
    setMessages([]);
    setError("");
    setLoading(true);


    const initialMessages: ChatMessage[] = [
      { role: "user", content: "計画書の作成を始めたいです。" },
    ];

    try {
      const assistantText = await sendToAPIWithAppend(initialMessages, false);
      setMessages([{ role: "assistant", content: assistantText }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadOrStartChat = async () => {
      if (!profile?.id) {
        startNewChat();
        setSessionLoaded(true);
        return;
      }

      const { data: rows } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", profile.id)
        .order("updated_at", { ascending: false })
        .limit(1);
      const data = rows?.[0] ?? null;

      if (data && Array.isArray(data.messages) && data.messages.length > 0) {
        sessionIdRef.current = data.id;
        const msgs = data.messages as ChatMessage[];
        setMessages(msgs);
        countConsumedRef.current = true;
      } else {
        startNewChat();
      }
      setSessionLoaded(true);
    };

    loadOrStartChat();
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewSession = async () => {
    // キャンペーン期間終了チェック（無料会員）
    if (isCampaignExpired) {
      setShowCampaignExpiredModal(true);
      return;
    }
    // 残り0件ならモーダル表示してブロック
    if (!isUnlimited && remainingCount <= 0) {
      setShowUpgradeModal("newSession");
      return;
    }

    countConsumedRef.current = false;
    sessionIdRef.current = null;
    setHpUrl("");
    setBusinessType(""); businessTypeRef.current = "";
    setHearing("");
    setCenterTab("chat");
    await startNewChat();
  };

  // ─── Core send (auto-continue disabled) ───
  const sendWithContinuation = async (newMessages: ChatMessage[]) => {

    setError("");
    setLoading(true);

    try {
      await sendToAPIWithAppend(newMessages, false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // ─── Consume count ───
  // 実際の消費はgenerate APIの1ターン目でサーバー側が行う。ここは表示更新のみ。
  const consumeCount = () => {
    if (isUnlimited || countConsumedRef.current) return;
    countConsumedRef.current = true;
    const newCount = Math.max(0, remainingCount - 1);
    setRemainingCount(newCount);
    window.dispatchEvent(
      new CustomEvent("remaining-count-update", { detail: newCount })
    );
  };

  // ─── Send message (with first-message count confirm) ───
  const doSendMessage = async (text: string) => {
    // チャット上限チェック
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    if (userMessageCount >= 40) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'この会話は上限（40往復）に達しました。新しい会話を開始してください。'
      }]);
      return;
    }
    if (userMessageCount === 35) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ この会話はあと5往復で終了します。計画書の仕上げを進めるか、新しい会話を始めてください。'
      }]);
    }

    const userMessage: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await sendWithContinuation(newMessages);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // キャンペーン期間終了チェック（無料会員）
    if (isCampaignExpired) {
      setShowCampaignExpiredModal(true);
      return;
    }

    // 初回メッセージ → 確認モーダル
    if (!countConsumedRef.current && !isUnlimited) {
      pendingMessageRef.current = trimmed;
      setShowCountModal(true);
      return;
    }

    await doSendMessage(trimmed);
  };

  const handleCountConfirm = async () => {
    setShowCountModal(false);
    consumeCount();
    const text = pendingMessageRef.current;
    pendingMessageRef.current = null;
    if (text) {
      await doSendMessage(text);
    }
  };

  // ─── Generate all sections (no confirm modal, direct send) ───
  const handleGenerateAll = async () => {
    if (loading) return;

    // キャンペーン期間終了チェック（無料会員）
    if (isCampaignExpired) {
      setShowCampaignExpiredModal(true);
      return;
    }

    let prompt = "1\n\n";
    if (hpUrl.trim()) {
      prompt += `STEP1のHP URL: ${hpUrl.trim()}\n\n`;
      // サーバーサイドでHPコンテンツを取得
      try {
        const hpRes = await fetch("/api/fetch-hp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: hpUrl.trim() }),
        });
        if (hpRes.ok) {
          const hpData = await hpRes.json();
          prompt += `【以下はHPから取得した実際のテキスト内容です。この内容のみを根拠に情報を抽出してください。ここに記載のない情報は【要確認】としてください。】\n${hpData.content}\n\n`;
        }
      } catch {
        // HP取得失敗時はURL情報のみで継続
      }
    }
    if (businessType.trim()) {
      prompt += `社名・屋号: ${businessType.trim()}\n\n`;
    }
    if (hearing.trim()) {
      prompt += `STEP2のヒアリング文字起こし:\n${hearing.trim()}\n\n`;
    }
    prompt += "上記の情報をもとに、不足があれば質問してください。情報が十分であれば、まず経営計画書のドラフトを生成してください。";

    // 初回メッセージ → 確認モーダル
    if (!countConsumedRef.current && !isUnlimited) {
      pendingMessageRef.current = prompt;
      setShowCountModal(true);
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: prompt };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    await sendWithContinuation(newMessages);
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

  const scorePercent = Math.round((totalScore / SCORE_MAX) * 100);

  const extraUrl = `https://buy.stripe.com/6oU9AT4S19sm7VX0tQdQQ06?client_reference_id=${profile?.id ?? ""}`;

  // ─── Headerの1件追加ボタンからのモーダル表示イベント ───
  useEffect(() => {
    const handler = () => setShowCampaignExpiredModal(true);
    window.addEventListener("show-plan-required-modal", handler);
    return () => window.removeEventListener("show-plan-required-modal", handler);
  }, []);

  // ─── Free plan copy/keyboard/contextmenu block ───
  useEffect(() => {
    if (!isFree) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setShowUpgradeModal("copy");
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.stopPropagation();
        e.preventDefault();
        setShowUpgradeModal("copy");
      }
    };
    document.addEventListener("copy", handleCopy, { capture: true });
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener("copy", handleCopy, { capture: true });
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [isFree]);

  // ─── Render ───
  return (
    <>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 16px",
        marginBottom: "8px",
        borderRadius: "8px",
        background: `${COLORS.accent}0a`,
        border: `1px solid ${COLORS.accent}30`,
        fontFamily: FONT_BODY,
      }}
    >
      <span style={{ fontSize: "12px", color: COLORS.accent, fontWeight: 600 }}>
        持続化補助金 第20回対応
      </span>
    </div>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr 300px",
        gap: "16px",
        height: isFree ? "calc(100vh - 150px)" : "calc(100vh - 100px)",
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
            padding: "12px 16px",
            borderBottom: `1px solid ${COLORS.gray200}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "14px", color: COLORS.ink }}>
            入力パネル
          </span>
          <button
            onClick={handleNewSession}
            disabled={loading}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              border: `1px solid ${COLORS.gray300}`,
              background: COLORS.white,
              color: COLORS.gray600,
              fontSize: "11px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            + 新しい会話
          </button>
        </div>

        {/* Session history list */}
        {sessionList.length > 0 && (
          <div
            style={{
              maxHeight: "160px",
              overflowY: "auto",
              borderBottom: `1px solid ${COLORS.gray200}`,
              padding: "4px 8px",
            }}
          >
            {sessionList.map((s) => {
              const isActive = sessionIdRef.current === s.id;
              const isEditing = editingSessionId === s.id;
              const isSaving = savingSessionId === s.id;
              const isMenuOpen = menuSessionId === s.id;
              const dateStr = new Date(s.created_at).toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
              const label = (s.title || "新しい会話").slice(0, 20);
              return (
                <div
                  key={s.id}
                  style={{ position: "relative" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 6px",
                      borderRadius: "6px",
                      background: isActive ? `${COLORS.accent}12` : "transparent",
                      cursor: isEditing ? "default" : "pointer",
                      transition: "background 0.15s",
                    }}
                    onClick={() => { if (!isEditing && !isMenuOpen) handleSwitchSession(s.id); }}
                    onMouseEnter={(e) => { if (!isActive && !isEditing) (e.currentTarget as HTMLDivElement).style.background = COLORS.gray100; }}
                    onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    {s.is_pinned && (
                      <span style={{ fontSize: "9px", color: COLORS.gold, flexShrink: 0 }}>📌</span>
                    )}
                    {isEditing ? (
                      <input
                        autoFocus
                        disabled={isSaving}
                        defaultValue={s.title || "新しい会話"}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameSession(s.id, editingTitle || (s.title || "新しい会話"));
                          if (e.key === "Escape") setEditingSessionId(null);
                        }}
                        onBlur={() => handleRenameSession(s.id, editingTitle || (s.title || "新しい会話"))}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          flex: 1,
                          fontSize: "11px",
                          border: `1px solid ${COLORS.accent}`,
                          borderRadius: "3px",
                          padding: "1px 4px",
                          outline: "none",
                          background: "white",
                          color: COLORS.gray600,
                          opacity: isSaving ? 0.5 : 1,
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          flex: 1,
                          fontSize: "11px",
                          color: isActive ? COLORS.accent : COLORS.gray600,
                          fontWeight: isActive ? 700 : 400,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span style={{ color: COLORS.gray400, marginRight: "4px" }}>{dateStr}</span>
                        {label}
                      </span>
                    )}
                    {!isEditing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuSessionId(isMenuOpen ? null : s.id);
                        }}
                        style={{
                          border: "none",
                          background: "none",
                          color: COLORS.gray400,
                          fontSize: "14px",
                          cursor: "pointer",
                          padding: "0 2px",
                          lineHeight: 1,
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = COLORS.gray600; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = COLORS.gray400; }}
                      >
                        ⋯
                      </button>
                    )}
                  </div>
                  {isMenuOpen && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "100%",
                        zIndex: 100,
                        background: "white",
                        border: `1px solid ${COLORS.gray200}`,
                        borderRadius: "6px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                        minWidth: "120px",
                        overflow: "hidden",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {[
                        {
                          label: s.is_pinned ? "ピン解除" : "ピン止め",
                          icon: "📌",
                          action: () => { handlePinSession(s.id, s.is_pinned); setMenuSessionId(null); },
                          color: COLORS.gray700,
                        },
                        {
                          label: "名前の変更",
                          icon: "✏️",
                          action: () => { setEditingTitle(s.title || "新しい会話"); setEditingSessionId(s.id); setMenuSessionId(null); },
                          color: COLORS.gray700,
                        },
                        {
                          label: "削除",
                          icon: "🗑️",
                          action: () => { handleDeleteSession(s.id); setMenuSessionId(null); },
                          color: COLORS.red600,
                        },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={item.action}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            width: "100%",
                            padding: "7px 12px",
                            border: "none",
                            background: "none",
                            fontSize: "12px",
                            color: item.color,
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = COLORS.gray100; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                        >
                          <span>{item.icon}</span>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

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

          {/* 社名・屋号 */}
          <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: 600, color: COLORS.gray600 }}>
            社名・屋号
          </label>
          <input
            type="text"
            value={businessType}
            onChange={(e) => { setBusinessType(e.target.value); businessTypeRef.current = e.target.value; }}
            placeholder="例：株式会社山田商店、山田屋"
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
            情報を送信
          </button>

          {/* Section navigation */}
          {([
            { title: "経営計画", items: KEIEI_SECTIONS },
            { title: "補助事業計画", items: HOJO_SECTIONS },
          ] as const).map((group) => (
            <div key={group.title} style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: COLORS.gray500, marginBottom: "4px", letterSpacing: "0.5px" }}>
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
        {/* Fix 2: SWOT / 戦略整理メモ collapsible card */}
        {strategyMemo && (
          <div
            style={{
              borderBottom: `1px solid ${COLORS.gray200}`,
              background: `${COLORS.gold}08`,
            }}
          >
            <button
              onClick={() => setSwotOpen(!swotOpen)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 16px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: COLORS.gold,
              }}
            >
              📋 戦略整理メモ / SWOT
              <span style={{ fontSize: "11px", color: COLORS.gray400 }}>{swotOpen ? "▲ 閉じる" : "▼ 開く"}</span>
            </button>
            {swotOpen && (
              <div
                style={{
                  padding: "0 16px 12px 16px",
                  fontSize: "12px",
                  lineHeight: "1.8",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: COLORS.ink,
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                {strategyMemo}
              </div>
            )}
          </div>
        )}

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
                      wordBreak: "break-word",
                      ...(msg.role === "user"
                        ? {
                            whiteSpace: "pre-wrap",
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
                    className={msg.role === "assistant" ? "assistant-md" : undefined}
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{stripScoringBlocks(msg.content)}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
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
              <p style={{ margin: "4px 0 0", fontSize: "11px", color: COLORS.gray400, textAlign: "center" }}>
                応答が途中で止まった場合は「続けて」と入力してください
              </p>
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

            {/* Section content (Fix 3: with supplementary panels) */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: COLORS.ink, margin: 0 }}>
                  {ALL_SECTIONS.find((s) => s.id === activeSectionId)?.label}
                </h3>
                {sections[activeSectionId] && (
                  <button
                    onClick={() => {
                      if (isFree) {
                        setShowUpgradeModal("copy");
                      } else {
                        copySection(extractSupplementary(sections[activeSectionId]).body);
                      }
                    }}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "6px",
                      border: `1px solid ${COLORS.gray300}`,
                      background: COLORS.white,
                      fontSize: "12px",
                      cursor: isFree ? "not-allowed" : "pointer",
                      color: COLORS.gray600,
                      opacity: isFree ? 0.5 : 1,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isFree) {
                        (e.target as HTMLButtonElement).style.borderColor = COLORS.accent;
                        (e.target as HTMLButtonElement).style.color = COLORS.accent;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isFree) {
                        (e.target as HTMLButtonElement).style.borderColor = COLORS.gray300;
                        (e.target as HTMLButtonElement).style.color = COLORS.gray600;
                      }
                    }}
                  >
                    コピー
                  </button>
                )}
              </div>

              {sections[activeSectionId] ? (
                (() => {
                  const parts = extractSupplementary(sections[activeSectionId]);
                  return (
                    <>
                      {/* Main body */}
                      <div
                        className="section-md"
                        style={{
                          fontSize: "13px",
                          lineHeight: "1.8",
                          wordBreak: "break-word",
                          color: COLORS.ink,
                          ...(isFree ? { userSelect: "none" as const } : {}),
                        }}
                        onContextMenu={isFree ? (e) => e.preventDefault() : undefined}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {parts.body}
                        </ReactMarkdown>
                      </div>

                      {/* Fix 3: 📋 Scoring checklist panel */}
                      {parts.checkItems && (
                        <CollapsiblePanel
                          label="📋 審査基準チェック"
                          content={parts.checkItems}
                          bgColor={COLORS.blue50}
                          borderColor={COLORS.blue600}
                          labelColor={COLORS.blue600}
                        />
                      )}
                    </>
                  );
                })()
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
            充足度チェック
          </div>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 800,
              fontFamily: FONT_MONO,
              color:
                totalScore >= SCORE_GOOD
                  ? COLORS.green600
                  : totalScore >= SCORE_WARN
                    ? COLORS.gold
                    : COLORS.red600,
              lineHeight: 1,
            }}
          >
            {totalScore}
            <span style={{ fontSize: "16px", fontWeight: 500, color: COLORS.gray400 }}>/{SCORE_MAX}</span>
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
                  totalScore >= SCORE_GOOD
                    ? COLORS.green600
                    : totalScore >= SCORE_WARN
                      ? COLORS.gold
                      : totalScore > 0
                        ? COLORS.red600
                        : COLORS.gray300,
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <div style={{ fontSize: "11px", color: COLORS.gray400, marginTop: "4px" }}>
            {totalScore >= SCORE_GOOD
              ? "商工会議所に持ち込める初稿レベル"
              : totalScore >= SCORE_WARN
                ? "情報追加で改善可能"
                : totalScore > 0
                  ? "情報不足 — 追加ヒアリング推奨"
                  : "ドラフト生成後に表示されます"}
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

      {/* Count consume confirmation modal */}
      {showCountModal && (
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
          onClick={() => { setShowCountModal(false); pendingMessageRef.current = null; }}
        >
          <div
            style={{
              background: COLORS.white,
              borderRadius: "12px",
              padding: "28px 32px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "15px", fontWeight: 700, color: COLORS.ink, marginBottom: "16px" }}>
              カウント消費の確認
            </div>
            <div style={{ fontSize: "14px", color: COLORS.gray600, lineHeight: 1.7, marginBottom: "24px" }}>
              この会話で1件消費します。<br />
              残り{remainingCount}件 → {Math.max(0, remainingCount - 1)}件になります。<br />
              よろしいですか？
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowCountModal(false); pendingMessageRef.current = null; }}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: `1px solid ${COLORS.gray300}`,
                  background: COLORS.white,
                  color: COLORS.gray600,
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleCountConfirm}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: COLORS.accent,
                  color: COLORS.white,
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                はい
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade modal */}
      {showUpgradeModal && (() => {
        const isNewSession = showUpgradeModal === "newSession";
        const title = isNewSession ? "生成件数が上限に達しました" : "機能制限中";
        const body = isNewSession
          ? "1件追加（¥9,800）するとすぐに利用再開できます。"
          : "コピーするには1件追加（¥9,800）が必要です。";
        return (
          <div
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
            onClick={() => setShowUpgradeModal(false)}
          >
            <div style={{ background: COLORS.white, borderRadius: "12px", padding: "28px 32px", maxWidth: "400px", width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: COLORS.ink, marginBottom: "12px" }}>{title}</div>
              <div style={{ fontSize: "13px", color: COLORS.gray600, lineHeight: 1.7, marginBottom: "24px" }}>{body}</div>
              <div style={{ fontSize: "11px", color: COLORS.accent, fontWeight: 600, marginBottom: "16px" }}>※ 持続化補助金 第20回対応</div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button onClick={() => setShowUpgradeModal(false)} style={{ padding: "8px 20px", borderRadius: "8px", border: `1px solid ${COLORS.gray300}`, background: COLORS.white, color: COLORS.gray600, fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>閉じる</button>
                <button onClick={() => { window.open(extraUrl, "_blank"); setShowUpgradeModal(false); }} style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: COLORS.accent, color: COLORS.white, fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>1件追加（¥9,800）</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 有料プラン登録必要モーダル */}
      {showCampaignExpiredModal && (
        <div
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
          onClick={() => setShowCampaignExpiredModal(false)}
        >
          <div style={{ background: COLORS.white, borderRadius: "12px", padding: "28px 32px", maxWidth: "440px", width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: COLORS.ink, marginBottom: "12px" }}>有料プランへのご登録が必要です</div>
            <div style={{ fontSize: "13px", color: COLORS.gray600, lineHeight: 1.7, marginBottom: "24px" }}>
              さくせいくんをご利用いただくには有料プランへのご登録が必要です。
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowCampaignExpiredModal(false)} style={{ padding: "8px 20px", borderRadius: "8px", border: `1px solid ${COLORS.gray300}`, background: COLORS.white, color: COLORS.gray600, fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>閉じる</button>
            </div>
          </div>
        </div>
      )}

      {/* Bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        .assistant-md p { margin: 0.5em 0; }
        .assistant-md p:first-child { margin-top: 0; }
        .assistant-md p:last-child { margin-bottom: 0; }
        .assistant-md ul, .assistant-md ol { padding-left: 1.5em; margin: 0.5em 0; }
        .assistant-md li { margin: 0.2em 0; }
        .assistant-md table { border-collapse: collapse; width: 100%; margin: 0.5em 0; font-size: 12px; }
        .assistant-md th { background: #f5f2eb; padding: 6px; border: 1px solid #d1d5db; font-weight: 600; text-align: left; }
        .assistant-md td { padding: 6px; border: 1px solid #d1d5db; }
        .assistant-md h1, .assistant-md h2, .assistant-md h3 { margin: 0.6em 0 0.3em; font-size: 14px; font-weight: 700; }
        .assistant-md code { background: #f3f4f6; padding: 1px 4px; border-radius: 3px; font-size: 12px; }
        .assistant-md pre { background: #f3f4f6; padding: 8px; border-radius: 6px; overflow-x: auto; margin: 0.5em 0; }
        .assistant-md pre code { background: none; padding: 0; }
        .assistant-md strong { font-weight: 700; }
        .assistant-md hr { border: none; border-top: 1px solid #e5e7eb; margin: 0.8em 0; }
        .section-md p { margin: 0.4em 0; }
        .section-md p:first-child { margin-top: 0; }
        .section-md p:last-child { margin-bottom: 0; }
        .section-md ul, .section-md ol { padding-left: 1.5em; margin: 0.4em 0; }
        .section-md li { margin: 0.2em 0; }
        .section-md table { border-collapse: collapse; width: 100%; margin: 0.5em 0; font-size: 12px; }
        .section-md th { background: #f5f2eb; padding: 6px; border: 1px solid #ccc; text-align: left; }
        .section-md td { padding: 6px; border: 1px solid #ccc; }
        .section-md h1, .section-md h2, .section-md h3, .section-md strong { font-weight: inherit; font-size: inherit; }
        .section-md code { background: #f3f4f6; padding: 1px 4px; border-radius: 3px; font-size: 12px; }
        .section-md pre { background: #f3f4f6; padding: 8px; border-radius: 6px; overflow-x: auto; margin: 0.5em 0; }
        .section-md pre code { background: none; padding: 0; }
        .section-md hr { border: none; border-top: 1px solid #e5e7eb; margin: 0.6em 0; }
      `}</style>
    </div>
    </>
  );
}
