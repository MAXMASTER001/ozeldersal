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
      <form action={verify} className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">E-posta doğrulama</h1>
        <p className="mt-3 text-neutral-600">Hesabınızı etkinleştirmek için aşağıdaki düğmeye basın.</p>
        <button className="mt-6 w-full rounded-md bg-black px-4 py-3 font-medium text-white" type="submit">E-posta adresimi doğrula</button>
        <p className="mt-5 text-sm"><Link href="/login" className="underline">Girişe dön</Link></p>
      </form>
    </main>
  );
}
