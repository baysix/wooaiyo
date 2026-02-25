import type { Metadata, Viewport } from "next";
import { LoadingProvider } from "@/components/ui/global-loading";
import "./globals.css";

export const metadata: Metadata = {
  title: "우아이요 - 우리 아파트는 이게 있어요",
  description: "아파트 단지 주민들의 나눔·대여·중고거래 플랫폼",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}
