import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TelegramScript from "@/components/TelegramScript";
import Providers from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Telegram Web App",
  description: "Sales Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className={inter.className}>
        <Providers>
          <TelegramScript />
          {children}
        </Providers>
      </body>
    </html>
  );
}
