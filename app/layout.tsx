import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  display: "swap",
  variable: "--font-noto-sans-thai",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Jula's Herb - CRM Rewards",
  description: "แลกสิทธิพิเศษสำหรับคุณ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${notoSansThai.variable} antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#f2f4f7]">
        <ClientShell>
          {children}
        </ClientShell>
      </body>
    </html>
  );
}
