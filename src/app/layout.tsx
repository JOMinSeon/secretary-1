import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://axai.co.kr'),
  title: {
    default: "axAI Secretary | 소상공인 AI 영수증 비서",
    template: "%s | axAI Secretary",
  },
  description: "영수증 사진 한 장으로 3초 만에 장부 작성하고, 숨은 환급금까지 찾아가는 AI 세무 비서 서비스입니다.",
  keywords: ["AI 영수증", "소상공인 장부", "세무 비서", "부가세 신고", "경비 처리", "axAI", "자동 장부"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://axai.co.kr",
    title: "axAI Secretary | 소상공인 AI 영수증 비서",
    description: "영수증 사진 한 장으로 3초 만에 장부 작성하고, 숨은 환급금까지 찾아가는 AI 세무 비서 시스템.",
    siteName: "axAI Secretary",
  },
  twitter: {
    card: "summary_large_image",
    title: "axAI Secretary | 소상공인 AI 영수증 비서",
    description: "영수증 사진 한 장으로 3초 만에 장부 작성하고, 숨은 환급금까지 찾아가세요.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} antialiased`}>
        <AppLayout>{children}</AppLayout>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9434023098844146"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
