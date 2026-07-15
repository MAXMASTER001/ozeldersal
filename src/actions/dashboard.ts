"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  
  if (!session || !session.user || (session.user as any).role !== "TEACHER") {
    return { error: "Yetkisiz erişim." };
  }

  const userId = session.user.id;
  const bio = formData.get("bio") as string;
  const experience = parseInt(formData.get("experience") as string, 10);
  const subject = formData.get("subject") as string;
  const locationType = formData.get("locationType") as string;
  const price = parseInt(formData.get("price") as string, 10);

  if (!bio || isNaN(experience) || !subject || !locationType || isNaN(price)) {
    return { error: "Lütfen gerekli alanları doğru doldurun." };
  }

  try {
    await prisma.teacherProfile.update({
      where: { userId },
      data: { bio, experience }
    });

    // Update the first listing for simplicity in MVP
    const listing = await prisma.listing.findFirst({ where: { userId } });
    if (listing) {
      await prisma.listing.update({
        where: { id: listing.id },
        data: { subject, locationType, price }
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/search");
    return { success: true };
  } catch (error) {
    console.error("Dashboard Update Error:", error);
    return { error: "Profil güncellenirken hata oluştu." };
  }
}

export async function toggleListingStatus(isActive: boolean) {
  const session = await auth();
  
  if (!session || !session.user || session.user.role !== "TEACHER") {
    return { error: "Yetkisiz erişim." };
  }

  try {
    const listing = await prisma.listing.findFirst({ where: { userId: session.user.id } });
    if (listing) {
      await prisma.listing.update({
        where: { id: listing.id },
        data: { isActive }
      });
      revalidatePath("/dashboard");
      revalidatePath("/search");
      return { success: true };
    }
    return { error: "İlan bulunamadı." };
  } catch (error) {
    console.error("Toggle Listing Error:", error);
    return { error: "İlan durumu güncellenemedi." };
  }
}
