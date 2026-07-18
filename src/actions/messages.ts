"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { detectContactInfoType } from "@/lib/validation";
import { writeAuditLog } from "@/lib/security";

export async function sendMessage(receiverId: string, content: string) {
  const session = await auth();

  if (!session || !session.user) {
    return { error: "Oturum açmanız gerekiyor." };
  }

  if (!content.trim()) {
    return { error: "Mesaj boş olamaz." };
  }

  if (receiverId === session.user.id) {
    return { error: "Kendinize mesaj gönderemezsiniz." };
  }

  // KVKK: keep phone numbers / emails / links inside the platform
  const contactType = detectContactInfoType(content);
  if (contactType) {
    return {
      error: `Güvenliğiniz için mesajda ${contactType} paylaşımına izin verilmiyor. İletişim platform üzerinden devam etmelidir.`,
    };
  }

  try {
    const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { id: true } });
    if (!receiver) {
      return { error: "Alıcı bulunamadı." };
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
      },
    });

    // Create notification for receiver
    const sender = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } });
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "NEW_MESSAGE",
        title: "Yeni Mesaj",
        body: `${sender?.name || "Bir kullanıcı"} size bir mesaj gönderdi.`,
        link: `/messages?userId=${session.user.id}`,
      },
    });

    revalidatePath("/messages");
    return { success: true, message };
  } catch (error) {
    console.error("SendMessage Error:", error);
    return { error: "Mesaj gönderilemedi." };
  }
}

export async function markConversationRead(partnerId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Oturum açmanız gerekiyor." };

  try {
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: session.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });
    revalidatePath("/messages");
    return { success: true };
  } catch (error) {
    console.error("MarkRead Error:", error);
    return { error: "Mesajlar okundu olarak işaretlenemedi." };
  }
}

export async function reportUser(targetId: string, reason: string, messageId?: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Oturum açmanız gerekiyor." };

  if (!reason.trim()) return { error: "Lütfen bir sebep belirtin." };

  try {
    await prisma.report.create({
      data: {
        reporterId: session.user.id,
        targetId,
        messageId: messageId || null,
        reason,
      },
    });
    await writeAuditLog({ actorId: session.user.id, action: "REPORT_CREATED", targetType: "USER", targetId, metadata: { messageId: messageId || null } });
    return { success: true };
  } catch (error) {
    console.error("Report Error:", error);
    return { error: "Rapor gönderilemedi." };
  }
}

export async function getUnreadMessageCount() {
  const session = await auth();
  if (!session?.user?.id) return { count: 0 };

  const count = await prisma.message.count({
    where: { receiverId: session.user.id, isRead: false },
  });
  return { count };
}
