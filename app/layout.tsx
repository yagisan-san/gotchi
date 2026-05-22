import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PIXFIT — ピクセルキャラと一緒にダイエット",
  description: "体重を記録してピクセルキャラを育てる習慣管理アプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
