import { Metadata } from "next";

export const metadata: Metadata = {
  title: "さくせいくん｜持続化補助金 計画書下書きAI モニター募集",
  robots: { index: false, follow: false },
};

export default function LpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
