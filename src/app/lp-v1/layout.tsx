import { Metadata } from "next";

export const metadata: Metadata = {
  title: "さくせいくん LP v1（バックアップ）",
  robots: { index: false, follow: false },
};

export default function LpV1Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
