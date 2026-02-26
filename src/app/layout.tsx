import type { Metadata, Viewport } from "next";
import Script from "next/script";
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
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
          integrity="sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Ber76k"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
