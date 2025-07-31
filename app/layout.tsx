import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MyQueryClientProvider } from "@/provider/queryclientprovider";
import { EdgeStoreProvider } from "@/lib/edgestore";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "Ylsix - Plateforme de recrutement nouvelle génération | RH & Conformité mondiale",
  description:
    "Recrutez des talents dans 150+ pays avec Ylsix. Tableau Kanban, diffusion multi-canal, collaboration d'équipe et conformité RH. Plateforme complète pour optimiser vos recrutements et gérer vos équipes mondiales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <MyQueryClientProvider>
            <EdgeStoreProvider>{children}</EdgeStoreProvider>
          </MyQueryClientProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
