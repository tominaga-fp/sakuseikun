import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "補助金計画書さくせいくん",
  description: "持続化補助金の計画書を簡単に作成できるWebサービス",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180" },
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
