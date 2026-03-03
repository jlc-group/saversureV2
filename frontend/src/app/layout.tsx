import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saversure Admin",
  description: "Multi-Tenant Loyalty & Reward Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
