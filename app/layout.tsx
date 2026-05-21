import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GOTCHI — ダイエットたまごっち",
  description: "体重を記録してキャラを育てる習慣管理アプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
