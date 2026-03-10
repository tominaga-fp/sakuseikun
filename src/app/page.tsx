import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          補助金計画書
          <span className="text-shu">さくせいくん</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          持続化補助金の計画書作成をAIがサポート。
          <br />
          質問に答えるだけで、計画書のたたき台が完成します。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="btn-shu text-center text-lg py-3 px-8">
            ログインして始める
          </Link>
        </div>
      </div>
      <footer className="absolute bottom-6 text-sm text-gray-400">
        &copy; 2026 補助金計画書さくせいくん
      </footer>
    </div>
  );
}
