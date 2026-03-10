"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              referral_code: referralCode || null,
            },
          },
        });
        if (error) throw error;
        setMessage("確認メールを送信しました。メールを確認してください。");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card-washi w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          補助金計画書<span className="text-shu">さくせいくん</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shu focus:border-transparent outline-none bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shu focus:border-transparent outline-none bg-white"
              required
              minLength={6}
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium mb-1">
                紹介コード（任意）
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shu focus:border-transparent outline-none bg-white"
                placeholder="お持ちの方のみ入力"
              />
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          {message && (
            <p className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
              {message}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-shu w-full">
            {loading
              ? "処理中..."
              : isSignUp
                ? "新規登録"
                : "ログイン"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setMessage("");
            }}
            className="text-shu text-sm hover:underline"
          >
            {isSignUp
              ? "アカウントをお持ちの方はこちら"
              : "新規登録はこちら"}
          </button>
        </div>
      </div>
    </div>
  );
}
