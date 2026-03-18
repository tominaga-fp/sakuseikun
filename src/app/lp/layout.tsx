import { Metadata } from "next";

export const metadata: Metadata = {
  title: "さくせいくん｜持続化補助金 計画書下書きAI モニター募集",
  robots: { index: false, follow: false },
  icons: {
    icon: '/icon.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'さくせいくん｜持続化補助金 計画書下書きAI',
    description: 'ヒアリング情報を入力するだけで、様式2準拠の経営計画書・補助事業計画書の下書きを即座に生成。',
    images: [{ url: '/ogp.png', width: 1200, height: 630 }],
    url: 'https://sakuseikun.jp',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/ogp.png'],
  },
};

export default function LpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
