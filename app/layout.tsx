import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Momento - イベント写真共有",
  description: "大切な瞬間を、みんなで残す。",
  manifest: "/manifest.json",
  themeColor: "#3D2B1F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="grain-overlay">
        {children}
      </body>
    </html>
  );
}
