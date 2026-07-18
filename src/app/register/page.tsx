"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await registerUser(formData);

      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        router.push("/login");
      }
    } catch {
      setError("Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white text-neutral-950 dark:bg-neutral-900 dark:text-neutral-50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-sm dark:shadow-black/30">
        <h1 className="text-2xl font-bold mb-2">Kayıt Ol</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">Kayıttan sonra hesabınızı e-posta bağlantısıyla etkinleştireceksiniz.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <div>
            <label className="text-sm font-medium mb-1 block">Ad Soyad</label>
            <Input name="name" required placeholder="Örn: Ayşe Yılmaz" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">E-posta</label>
            <Input name="email" type="email" required placeholder="ornek@email.com" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Şifre</label>
            <Input name="password" type="password" required placeholder="••••••••" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Hesap Türü</label>
            <select name="role" required className="w-full border border-neutral-200 dark:border-neutral-700 rounded-md p-3 text-sm bg-transparent outline-none focus:border-orange-500">
              <option value="STUDENT">Öğrenci / Veli</option>
              <option value="TEACHER">Öğretmen</option>
            </select>
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Kayıt olunuyor..." : "Kayıt Ol"}
          </Button>
        </form>

        <p className="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-6">
          Zaten hesabınız var mı? <Link href="/login" className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}
