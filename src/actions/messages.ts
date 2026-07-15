"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function sendMessage(receiverId: string, content: string) {
  const session = await auth();
  
  if (!session || !session.user) {
    return { error: "Oturum açmanız gerekiyor." };
  }

  if (!content.trim()) {
    return { error: "Mesaj boş olamaz." };
  }

  try {
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content
      }
    });

    revalidatePath("/messages");
    return { success: true, message };
  } catch (error) {
    console.error("SendMessage Error:", error);
    return { error: "Mesaj gönderilemedi." };
  }
}
