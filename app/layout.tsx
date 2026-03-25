import type { Metadata } from "next";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "场景化日语学习",
  description: "按旅行与生活场景学习常用日语的轻量工具"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}
