import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "行政書士のAI活用なら さくせいくん｜持続化補助金の計画書を自動生成",
  description: "ヒアリング情報を入力するだけで様式2準拠の計画書下書きを即座に生成。行政書士のAI活用を支援する持続化補助金特化ツール。第19回対応・モニター期間中は無制限無料。",
  alternates: { canonical: "https://sakuseikun.jp" },
  openGraph: {
    title: "行政書士のAI活用なら さくせいくん｜持続化補助金の計画書を自動生成",
    description: "ヒアリング情報を入力するだけで様式2準拠の計画書下書きを即座に生成。行政書士のAI活用を支援する持続化補助金特化ツール。第19回対応・モニター期間中は無制限無料。",
    images: [{ url: "/ogp.png", width: 1200, height: 630 }],
    url: "https://sakuseikun.jp",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/ogp.png"],
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
        {children}
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