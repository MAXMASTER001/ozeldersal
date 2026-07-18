"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getUnreadNotificationCount() {
  const session = await auth();
  if (!session?.user?.id) return { count: 0 };

  const count = await prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });
  return { count };
}

export async function markNotificationRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Oturum açmanız gerekiyor." };

  try {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId: session.user.id },
      data: { isRead: true },
    });
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("Mark Notification Error:", error);
    return { error: "Bildirim güncellenemedi." };
  }
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Oturum açmanız gerekiyor." };

  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("Mark All Notifications Error:", error);
    return { error: "Bildirimler güncellenemedi." };
  }
}
