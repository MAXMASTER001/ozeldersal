"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      } else {
        toast.success("Başarıyla giriş yapıldı.");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white text-neutral-950 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-sm dark:shadow-black/30">
        <h1 className="text-2xl font-bold mb-2">Giriş Yap</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">Özel ders platformuna hoş geldiniz.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">E-posta</label>
            <Input name="email" type="email" required placeholder="ornek@email.com" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Şifre</label>
            <Input name="password" type="password" required placeholder="••••••••" />
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>

        <p className="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-6">
          Hesabınız yok mu? <Link href="/register" className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">Kayıt Ol</Link>
        </p>
        <p className="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-3">
          <Link href="/forgot-password" className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">Şifremi unuttum</Link>
        </p>
      </div>
    </div>
  );
}
