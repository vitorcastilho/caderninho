import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DensityProvider } from "@/client/components/layout/DensityProvider";
import { Toaster } from "@/client/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Caderninho",
  description: "Gestão financeira pessoal e familiar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="antialiased cursor-default" data-density="spacious">
        <DensityProvider>
          {children}
          <Toaster />
        </DensityProvider>
      </body>
    </html>
  );
}
