import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "補助金計画書さくせいくん",
  description: "持続化補助金の計画書を簡単に作成できるWebサービス",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-JZFBG99C1V"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-JZFBG99C1V');
        `}
      </Script>
      <body className="washi-bg min-h-screen antialiased">{children}</body>
    </html>
  );
}
