"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/actions/auth";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) return setMessage("Geçersiz bağlantı.");
    const result = await resetPassword(token, password);
    setMessage(result.error || "Şifreniz yenilendi. Giriş yapabilirsiniz.");
  }
  return <main className="flex-1 flex items-center justify-center p-4"><form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"><h1 className="text-2xl font-bold">Yeni şifre</h1><input className="mt-5 w-full rounded-md border p-3" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="En az 8 karakter" /><button className="mt-4 w-full rounded-md bg-black px-4 py-3 text-white" type="submit">Şifreyi yenile</button>{message && <p className="mt-4 text-sm">{message}</p>}<p className="mt-5 text-sm"><Link href="/login" className="underline">Girişe dön</Link></p></form></main>;
}
