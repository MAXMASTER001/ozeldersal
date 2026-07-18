import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { Search, User } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

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
      className="h-full antialiased"
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
              <Link href="/" className="flex items-center">
                <span className="font-extrabold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                  özeldersal
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <nav className="flex items-center gap-4">
              <Link href="/search" className="text-sm font-medium hover:text-neutral-600 flex items-center gap-1">
                <Search size={16} /> Öğretmen Bul
              </Link>
              {session ? (
                <>
                  <NotificationBell />
                  <UserMenu user={session.user} />
                </>
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
