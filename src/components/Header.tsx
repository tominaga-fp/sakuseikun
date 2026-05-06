"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Profile } from "@/types/database";

interface Notification {
  id: string;
  title: string;
  body: string;
  created_at: string;
  target_user_id: string | null;
}

export default function Header({ profile }: { profile: Profile | null }) {
  const supabase = createClient();
  const router = useRouter();

  const isMonitor = profile?.is_monitor ?? false;
  const isUnlimited = profile?.role === "admin" || isMonitor;
  const initialCount = isUnlimited ? Infinity : Math.max(0, (profile?.usage_limit ?? 1) - (profile?.usage_count ?? 0) + (profile?.extra_count ?? 0));
  const [displayCount, setDisplayCount] = useState(initialCount);

  // 通知
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  useEffect(() => {
    if (!profile?.id) return;
    const fetchNotifications = async () => {
      const { data: notifs } = await supabase
        .from("notifications")
        .select("*")
        .or(`target_user_id.is.null,target_user_id.eq.${profile.id}`)
        .order("created_at", { ascending: false })
        .limit(20);

      const { data: reads } = await supabase
        .from("notification_reads")
        .select("notification_id")
        .eq("user_id", profile.id);

      if (notifs) setNotifications(notifs);
      if (reads) setReadIds(new Set(reads.map(r => r.notification_id)));
    };
    fetchNotifications();
  }, [profile?.id]);

  // ベル外クリックで閉じる
  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bellOpen]);

  const handleBellClick = async () => {
    setBellOpen(prev => !prev);
    if (!bellOpen && unreadCount > 0 && profile?.id) {
      // 未読を既読に
      const unread = notifications.filter(n => !readIds.has(n.id));
      const inserts = unread.map(n => ({ user_id: profile.id, notification_id: n.id }));
      await supabase.from("notification_reads").upsert(inserts, { ignoreDuplicates: true });
      setReadIds(new Set(notifications.map(n => n.id)));
    }
  };

  // Listen for count updates from PlanBuilder
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<number>).detail;
      setDisplayCount(detail);
    };
    window.addEventListener("remaining-count-update", handler);
    return () => window.removeEventListener("remaining-count-update", handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isFree = (profile?.plan_type ?? "free") === "free" && profile?.role !== "admin";
  const ALLOWED_PLANS = ["annual_50", "monthly_3", "monthly_1", "yearly"];
  const isBlockedUser = !isUnlimited && !ALLOWED_PLANS.includes(profile?.plan_type ?? "free");
  const extraPurchaseUrl = `https://www.firstpay.jp/new/eyJwYXltZW50VHlwZSI6IkVBQ0hUSU1FIiwicGF5dGltZXMiOjEsInJlbWFya3MiOiIiLCJwcm9kdWN0cyI6W3siaWQiOjE4MDEzLCJhbW91bnQiOjF9XX0=?redirect_url=${encodeURIComponent(`https://sakuseikun-nine.vercel.app/payment/extra?user_id=${profile?.id ?? ""}`)}`;

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="font-bold text-lg flex items-center gap-2">
            <Image src="/icon.png" alt="" width={36} height={36} className="h-9 w-9 rounded-none" />
            補助金計画書<span className="text-shu">さくせいくん</span>
          </Link>
          <span className="text-[10px] text-gray-400 hidden sm:inline">運営：とみながFP事務所</span>
        </div>

        <div className="flex items-center gap-4">
          {profile?.role === "admin" && (
            <Link href="/admin" className="text-sm text-gray-600 hover:text-shu transition-colors">
              管理者画面
            </Link>
          )}
          <span className="text-sm text-gray-500">
            {isUnlimited ? "無制限" : `残り ${displayCount}件`}
          </span>
          {profile?.role !== "admin" && (
            <button
              onClick={() => {
                if (isBlockedUser) {
                  window.dispatchEvent(new CustomEvent("show-plan-required-modal"));
                  return;
                }
                if (!isFree) window.open(extraPurchaseUrl, "_blank");
              }}
              disabled={isFree}
              className={`text-xs font-bold px-3 py-1 rounded-md border transition-all ${
                isFree
                  ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                  : "border-yellow-500 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 cursor-pointer"
              }`}
            >
              1件追加（¥9,800）
            </button>
          )}

          {/* ベルアイコン */}
          {profile && (
            <div ref={bellRef} style={{ position: "relative" }}>
              <button
                onClick={handleBellClick}
                style={{
                  position: "relative",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  color: unreadCount > 0 ? "#0f2346" : "#9ca3af",
                  fontSize: "20px",
                  lineHeight: 1,
                }}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: "#dc2626",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: 700,
                    borderRadius: "9999px",
                    minWidth: "16px",
                    height: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                    padding: "0 3px",
                  }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  width: "300px",
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  zIndex: 1000,
                  overflow: "hidden",
                }}>
                  <div style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f3f4f6",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "#0f2346",
                  }}>
                    お知らせ
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "24px 16px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>
                      お知らせはありません
                    </div>
                  ) : (
                    <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                      {notifications.map((n) => {
                        const isRead = readIds.has(n.id);
                        const dateStr = new Date(n.created_at).toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
                        return (
                          <div key={n.id} style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #f3f4f6",
                            background: isRead ? "white" : "#eff6ff",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                              {!isRead && (
                                <span style={{
                                  width: "7px", height: "7px", borderRadius: "50%",
                                  background: "#2563eb", flexShrink: 0,
                                }} />
                              )}
                              <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151", flex: 1 }}>
                                {n.title}
                              </span>
                              <span style={{ fontSize: "11px", color: "#9ca3af", flexShrink: 0 }}>{dateStr}</span>
                            </div>
                            <p style={{ fontSize: "12px", color: "#6b7280", margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                              {n.body}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <span className="text-sm text-gray-600 hidden sm:inline">
            {profile?.display_name
              || [profile?.last_name, profile?.first_name].filter(Boolean).join(" ")
              || profile?.email
              || ""}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-shu transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
