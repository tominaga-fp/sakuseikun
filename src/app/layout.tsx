import type { Metadata } from "next";
import Script from "next/script";
import { PostHogProvider } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sakuseikun.jp"),
  title: "行政書士のAI活用なら さくせいくん｜持続化補助金の計画書を自動生成",
  description: "ヒアリング情報を入力するだけで持続化補助金の様式2準拠の計画書下書きを即座に生成。行政書士事務所のDX・業務効率化を支援するAI特化ツール「さくせいくん」。第19回公募対応済み・モニター期間中は無制限無料でご利用いただけます。",
  keywords: [
    '持続化補助金',
    '計画書作成',
    'AI',
    '行政書士',
    '補助金申請',
    '様式2',
    '事業計画書',
    '自動生成',
    'さくせいくん',
    'AI活用',
    '行政書士DX',
    'AI計画書',
  ],
  authors: [{ name: '富永淳一', url: 'https://sakuseikun.jp' }],
  alternates: { canonical: "https://sakuseikun.jp" },
  openGraph: {
    title: "行政書士のAI活用なら さくせいくん｜持続化補助金の計画書を自動生成",
    description: "ヒアリング情報を入力するだけで持続化補助金の様式2準拠の計画書下書きを即座に生成。行政書士事務所のDX・業務効率化を支援するAI特化ツール「さくせいくん」。第19回公募対応済み・モニター期間中は無制限無料でご利用いただけます。",
    images: [{ url: "/ogp.png", width: 1200, height: 630 }],
    url: "https://sakuseikun.jp",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/ogp.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="washi-bg min-h-screen antialiased">
        <PostHogProvider>
        {children}
        </PostHogProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-V5DVEQ2B1M"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-V5DVEQ2B1M');
          `}
        </Script>
      </body>
    </html>
  );
}