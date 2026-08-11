import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Education Agency SaaS Platform",
  description: "Multi-tenant portal for managing study abroad students, agents, applications, and documents.",
};

import GlobalAnnouncements from "@/components/GlobalAnnouncements";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50" suppressHydrationWarning>
      <body className={`${inter.className} min-h-full flex flex-col text-slate-900 antialiased`} suppressHydrationWarning>
        <ToastProvider>
          <GlobalAnnouncements />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
