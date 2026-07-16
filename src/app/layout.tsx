import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { MessageSquare, Search, User, Settings } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Özel Ders Al",
  description: "Radikal minimalist özel ders eşleştirme platformu",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <header className="w-full border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
                <img src="/logo.png" alt="Özel Ders Logo" className="w-8 h-8 rounded-xl" />
                ÖzelDers.
              </Link>
              <div className="flex items-center gap-4">
                <nav className="flex items-center gap-4">
              <Link href="/search" className="text-sm font-medium hover:text-neutral-600 flex items-center gap-1">
                <Search size={16} /> Öğretmen Bul
              </Link>
              {session ? (
                <UserMenu user={session.user} />
              ) : (
                <Link href="/login">
                  <Button size="sm" className="flex items-center gap-1">
                    <User size={16} /> Giriş Yap
                  </Button>
                </Link>
              )}
                </nav>
                <ThemeToggle />
              </div>
            </div>
          </header>
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
