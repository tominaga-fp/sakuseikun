import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "補助金計画書さくせいくん｜持続化補助金の計画書をAIで作成",
  description: "行政書士・中小企業向け。持続化補助金の事業計画書をAIが自動作成。第19回対応・4月30日まで無料で使い放題。",
  alternates: { canonical: "https://sakuseikun.jp" },
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