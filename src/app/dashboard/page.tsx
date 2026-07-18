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
      listings: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!user || !user.teacherProfile || user.listings.length === 0) {
    redirect("/onboarding");
  }

  // Weekly profile views (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyViews = await prisma.profileView.count({
    where: {
      teacherProfileId: user.teacherProfile.id,
      createdAt: { gte: sevenDaysAgo },
    },
  });

  const profile = user.teacherProfile;

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Öğretmen Paneli</h1>
      <DashboardClient profile={profile} listings={user.listings} weeklyViews={weeklyViews} />
    </div>
  );
}
