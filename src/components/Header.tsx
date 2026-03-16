"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Profile } from "@/types/database";

export default function Header({ profile }: { profile: Profile | null }) {
  const supabase = createClient();
  const router = useRouter();

  const isMonitor = profile?.is_monitor ?? false;
  const isUnlimited = profile?.role === "admin" || isMonitor;
  const initialCount = isUnlimited ? Infinity : Math.max(0, (profile?.monthly_limit ?? 1) - (profile?.monthly_count ?? 0) + (profile?.extra_count ?? 0));
  const [displayCount, setDisplayCount] = useState(initialCount);

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
  const extraPurchaseUrl = `https://www.firstpay.jp/new/eyJwYXltZW50VHlwZSI6IkVBQ0hUSU1FIiwicGF5dGltZXMiOjEsInJlbWFya3MiOiIiLCJwcm9kdWN0cyI6W3siaWQiOjE4MDEzLCJhbW91bnQiOjF9XX0=?redirect_url=${encodeURIComponent(`https://sakuseikun-nine.vercel.app/payment/extra?user_id=${profile?.id ?? ""}`)}`;

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="font-bold text-lg flex items-center gap-2">
            <Image src="/app-icon.png" alt="" width={32} height={32} className="h-8 w-8" />
            補助金計画書<span className="text-shu">さくせいくん</span>
          </Link>
          <span className="text-[10px] text-gray-400 hidden sm:inline">運営：とみながFP事務所</span>
        </div>

        <div className="flex items-center gap-4">
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className="text-sm text-gray-600 hover:text-shu transition-colors"
            >
              管理者画面
            </Link>
          )}
          <span className="text-sm text-gray-500">
            {isUnlimited ? "無制限（4/30まで）" : `残り ${displayCount}件`}
          </span>
          {profile?.role !== "admin" && (
            <button
              onClick={() => {
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
