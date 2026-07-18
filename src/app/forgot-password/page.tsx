"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await requestPasswordReset(email);
    setSubmitted(true);
  }
  return <main className="flex-1 flex items-center justify-center p-4"><form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-neutral-950 dark:text-neutral-50 shadow-sm"><h1 className="text-2xl font-bold">Şifre sıfırla</h1><p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">E-posta adresinizi girin. Hesap varsa bir sıfırlama bağlantısı göndeririz.</p><input className="mt-5 w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent p-3 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ornek@email.com" /><button className="mt-4 w-full rounded-md bg-orange-500 px-4 py-3 text-white hover:bg-orange-600" type="submit">Bağlantı gönder</button>{submitted && <p className="mt-4 text-sm text-green-700 dark:text-green-400">E-posta adresi kayıtlıysa bağlantı gönderildi.</p>}<p className="mt-5 text-sm"><Link href="/login" className="text-orange-600 dark:text-orange-400 underline">Girişe dön</Link></p></form></main>;
}
