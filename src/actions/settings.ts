"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { changePasswordSchema, phoneSchema } from "@/lib/validation";
import { z } from "zod";

const updateAccountSchema = z.object({
  name: z.string().min(2, { message: "Ad Soyad en az 2 karakter olmalıdır." }).max(100),
  phone: phoneSchema,
});

export async function updateAccount(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Oturum açmanız gerekiyor." };
  }

  const parsed = updateAccountSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError || "Lütfen alanları doğru doldurun." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
      },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Update Account Error:", error);
    return { error: "Bilgiler güncellenirken bir hata oluştu." };
  }
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Oturum açmanız gerekiyor." };
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError || "Lütfen alanları doğru doldurun." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { error: "Kullanıcı bulunamadı." };

    const match = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!match) {
      return { error: "Mevcut şifreniz hatalı." };
    }

    const hashed = await bcrypt.hash(parsed.data.newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    });

    return { success: true };
  } catch (error) {
    console.error("Change Password Error:", error);
    return { error: "Şifre değiştirilirken bir hata oluştu." };
  }
}

export async function switchRole(newRole: "TEACHER" | "STUDENT") {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Oturum açmanız gerekiyor." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: newRole },
    });

    // If becoming a teacher, ensure they go through onboarding if no profile yet
    if (newRole === "TEACHER") {
      const profile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (!profile) {
        return { success: true, redirect: "/onboarding" };
      }
      return { success: true, redirect: "/dashboard" };
    }

    return { success: true, redirect: "/" };
  } catch (error) {
    console.error("Switch Role Error:", error);
    return { error: "Rol değiştirilirken bir hata oluştu." };
  }
}
