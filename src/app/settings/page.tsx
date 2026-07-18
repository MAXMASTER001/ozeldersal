import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsClient from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Hesap Ayarları</h1>
      <SettingsClient user={user} />
    </div>
  );
}
