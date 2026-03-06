import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { LoadingProvider } from "@/components/ui/global-loading";
import PushProvider from "@/components/push-provider";
import { getAuthFromCookie } from "@/lib/auth";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await getAuthFromCookie();

  return (
    <html lang="ko">
      <body className="antialiased">
        <LoadingProvider>
          {children}
        </LoadingProvider>
        <PushProvider userId={auth?.userId ?? null} />
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
