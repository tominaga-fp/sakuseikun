"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setMessage("パスワードリセット用のメールを送信しました。メールを確認してください。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#f5f2eb" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            補助金計画書<span className="text-shu">さくせいくん</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">パスワードリセット</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {message ? (
            <div className="text-center py-4">
              <div className="text-green-600 text-sm bg-green-50 p-4 rounded-lg mb-4">
                {message}
              </div>
              <Link href="/login" className="text-sm text-shu hover:underline">
                ログインページへ戻る
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-gray-600">
                登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shu focus:border-transparent outline-none bg-white text-sm"
                  required
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-shu w-full py-2.5 text-sm"
              >
                {loading ? "送信中..." : "リセットメールを送信"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-gray-500 hover:text-shu hover:underline">
            ログインページへ戻る
          </Link>
        </div>
        <Footer />
      </div>
    </div>
  );
}
