import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationsClient } from "@/components/notifications/NotificationsClient";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Mark all as read when the page is viewed
  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Bildirimler</h1>
      <NotificationsClient notifications={notifications} />
    </div>
  );
}
