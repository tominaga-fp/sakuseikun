"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { registerUser } from "./actions";
import Footer from "@/components/Footer";

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMonitor = searchParams.get("ref") === "monitor";
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [userType, setUserType] = useState<"business" | "consultant">("consultant");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== passwordConfirm) {
      setError("パスワードが一致しません");
      return;
    }
    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      return;
    }
    if (!agreed) {
      setError("利用規約への同意が必要です");
      return;
    }

    setLoading(true);

    try {
      // Admin API でユーザー作成（email_confirm: true により確認メール送信なし）
      const { error: registerError } = await registerUser({
        email, password, lastName, firstName, companyName, userType,
        referralCode, isMonitor,
      });
      if (registerError) throw new Error(registerError);

      // クライアント側でサインインしてセッションを取得
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      setMessage("登録が完了しました。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => router.push("/dashboard"), 1500);
      return () => clearTimeout(timer);
    }
  }, [message, router]);

  const isFormValid =
    lastName.trim() &&
    firstName.trim() &&
    email.trim() &&
    password.length >= 8 &&
    passwordConfirm === password &&
    agreed;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#f5f2eb" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            補助金計画書<span className="text-shu">さくせいくん</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">無料アカウント作成</p>
          <p className="text-xs text-shu font-semibold mt-2">第19回限定・2026年4月30日まで有効</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {message ? (
            <div className="text-center py-4">
              <div className="text-green-600 text-sm bg-green-50 p-4 rounded-lg">
                {message}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 姓・名 */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shu focus:border-transparent outline-none bg-white text-sm"
                    required
                    placeholder="山田"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shu focus:border-transparent outline-none bg-white text-sm"
                    required
                    placeholder="太郎"
                  />
                </div>
              </div>

              {/* 会社名・屋号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  会社名・屋号
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shu focus:border-transparent outline-none bg-white text-sm"
                  placeholder="株式会社○○ / ○○商店"
                />
              </div>

              {/* 利用者区分 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  利用者区分 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value="consultant"
                      checked={userType === "consultant"}
                      onChange={() => setUserType("consultant")}
                      className="accent-[#0f2346]"
                    />
                    <span className="text-sm text-gray-700">他社の申請支援</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="userType"
                      value="business"
                      checked={userType === "business"}
                      onChange={() => setUserType("business")}
                      className="accent-[#0f2346]"
                    />
                    <span className="text-sm text-gray-700">自社で申請</span>
                  </label>
                </div>
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shu focus:border-transparent outline-none bg-white text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  ※ Gmailまたはドメインメールでのご登録を推奨します。Yahoo!メール・iCloudメール等は確認メールが届かない場合があります。
                </p>
              </div>

              {/* パスワード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード（8文字以上） <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shu focus:border-transparent outline-none bg-white text-sm pr-12"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs select-none"
                  >
                    {showPassword ? "非表示" : "表示"}
                  </button>
                </div>
              </div>

              {/* パスワード確認 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード（確認） <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shu focus:border-transparent outline-none bg-white text-sm"
                  required
                  minLength={8}
                />
                {passwordConfirm && password !== passwordConfirm && (
                  <p className="text-red-500 text-xs mt-1">パスワードが一致しません</p>
                )}
              </div>

              {/* 紹介コード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  紹介コード（任意）
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shu focus:border-transparent outline-none bg-white text-sm"
                  placeholder="お持ちの方のみ入力"
                />
              </div>

              {/* 利用規約同意 */}
              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 accent-[#0f2346]"
                  />
                  <span className="text-sm text-gray-600">
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-shu hover:underline"
                    >
                      利用規約
                    </a>
                    ・
                    <a
                      href="https://tominaga-fp.com/sakuseikun/privacy-policy/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-shu hover:underline"
                    >
                      プライバシーポリシー
                    </a>
                    に同意する
                  </span>
                </label>
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="btn-shu w-full py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "登録中..." : "無料アカウントを作成"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-500">アカウントをお持ちの方は</span>
          <Link href="/login" className="text-sm text-shu hover:underline ml-1">
            ログイン
          </Link>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
