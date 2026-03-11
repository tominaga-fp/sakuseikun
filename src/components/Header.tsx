"use client";

import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Profile } from "@/types/database";

export default function Header({ profile }: { profile: Profile | null }) {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-lg">
          補助金計画書<span className="text-shu">さくせいくん</span>
        </Link>

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
            残り {Math.max(0, ((profile?.monthly_limit ?? 0) - (profile?.monthly_count ?? 0)) + (profile?.extra_count ?? 0))}件
          </span>
          {profile?.role !== "admin" && (
            (() => {
              const isFree = (profile?.plan_type ?? "free") === "free";
              const extraPurchaseUrl = `https://www.firstpay.jp/new/eyJwYXltZW50VHlwZSI6IkVBQ0hUSU1FIiwicGF5dGltZXMiOjEsInJlbWFya3MiOiIiLCJwcm9kdWN0cyI6W3siaWQiOjE4MDEzLCJhbW91bnQiOjF9XX0=?redirect_url=${encodeURIComponent(`https://sakuseikun-nine.vercel.app/payment/extra?user_id=${profile?.id ?? ""}`)}`;
              return (
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
                  1件追加（¥5,000）
                </button>
              );
            })()
          )}
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
