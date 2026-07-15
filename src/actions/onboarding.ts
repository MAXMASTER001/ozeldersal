"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function completeOnboarding(formData: FormData) {
  const session = await auth();
  
  if (!session || !session.user || session.user.role !== "TEACHER") {
    return { error: "Yetkisiz erişim. Sadece öğretmenler profil oluşturabilir." };
  }

  const userId = session.user.id;
  const bio = formData.get("bio") as string;
  const experience = parseInt(formData.get("experience") as string, 10);
  const subject = formData.get("subject") as string;
  const level = "Genel"; // Simplified for this example, could be a select in UI
  const locationType = formData.get("locationType") as string;
  const price = parseInt(formData.get("price") as string, 10);

  if (!bio || !experience || !subject || !locationType || !price) {
    return { error: "Lütfen tüm gerekli alanları doldurun." };
  }

  try {
    // 1. Create or update TeacherProfile
    await prisma.teacherProfile.upsert({
      where: { userId },
      update: { bio, experience },
      create: { userId, bio, experience }
    });

    // 2. Create Listing
    await prisma.listing.create({
      data: {
        userId,
        subject,
        level,
        locationType,
        price
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Onboarding Error:", error);
    return { error: "Profil kaydedilirken bir hata oluştu." };
  }
}
