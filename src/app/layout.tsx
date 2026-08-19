import type { Metadata } from "next";
import Script from "next/script";
import { PostHogProvider } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sakuseikun.jp"),
  title: "行政書士のAI活用なら さくせいくん｜持続化補助金の計画書を自動生成",
  description: "持続化補助金 第20回公募（2026年12月15日締切）対応。ヒアリング情報を入力するだけで、様式2準拠の事業計画書の下書きをAIが自動生成します。行政書士事務所のDX・業務効率化を支援するAI特化ツール「さくせいくん」。",
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
    description: "持続化補助金 第20回公募（2026年12月15日締切）対応。ヒアリング情報を入力するだけで、様式2準拠の事業計画書の下書きをAIが自動生成します。行政書士事務所のDX・業務効率化を支援するAI特化ツール「さくせいくん」。",
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