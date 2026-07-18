import Link from "next/link";
import { verifyEmail } from "@/actions/auth";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token) return <main className="flex-1 p-8 text-center">Geçersiz doğrulama bağlantısı.</main>;
  const verificationToken = token;
  async function verify() {
    "use server";
    await verifyEmail(verificationToken);
  }
  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <form action={verify} className="w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center text-neutral-950 dark:text-neutral-50 shadow-sm">
        <h1 className="text-2xl font-bold">E-posta doğrulama</h1>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">Hesabınızı etkinleştirmek için aşağıdaki düğmeye basın.</p>
        <button className="mt-6 w-full rounded-md bg-orange-500 px-4 py-3 font-medium text-white hover:bg-orange-600" type="submit">E-posta adresimi doğrula</button>
        <p className="mt-5 text-sm"><Link href="/login" className="text-orange-600 dark:text-orange-400 underline">Girişe dön</Link></p>
      </form>
    </main>
  );
}
