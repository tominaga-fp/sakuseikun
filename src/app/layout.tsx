import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "補助金計画書さくせいくん",
  description: "持続化補助金の計画書を簡単に作成できるWebサービス",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="washi-bg min-h-screen antialiased">{children}</body>
    </html>
  );
}
