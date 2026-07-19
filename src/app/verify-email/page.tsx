import Link from "next/link";
import { redirect } from "next/navigation";
import { verifyEmail } from "@/actions/auth";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await searchParams;
  if (!token) {
    return <main className="flex-1 flex items-center justify-center p-4"><div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center text-neutral-950 shadow-sm dark:border-red-900 dark:bg-neutral-900 dark:text-neutral-50"><h1 className="text-2xl font-bold">Doğrulama bağlantısı geçersiz</h1><p className="mt-3 text-neutral-600 dark:text-neutral-400">{error === "invalid" ? "Bu bağlantı kullanılmış veya süresi dolmuş olabilir. Yeni bir doğrulama e-postası isteyin." : "Doğrulama bağlantısında gerekli bilgi bulunamadı."}</p><p className="mt-5 text-sm"><Link href="/register" className="text-orange-600 underline dark:text-orange-400">Kayıt sayfasına dön</Link></p></div></main>;
  }
  const verificationToken = token;
  async function verify() {
    "use server";
    const result = await verifyEmail(verificationToken);
    if (result.success) redirect("/login?verified=1");
    redirect("/verify-email?error=invalid");
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
