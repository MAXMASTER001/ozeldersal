import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "TEACHER") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      teacherProfile: true,
      listings: true
    }
  });

  if (!user || !user.teacherProfile || user.listings.length === 0) {
    redirect("/onboarding");
  }

  const profile = user.teacherProfile;
  const listing = user.listings[0];

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Profil Ayarları</h1>
      <DashboardClient profile={profile} listing={listing} />
    </div>
  );
}
