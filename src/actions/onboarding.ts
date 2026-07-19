"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requiredPhoneSchema } from "@/lib/validation";
import { z } from "zod";

const onboardingSchema = z.object({
  subjects: z.array(z.string()).min(1, "En az bir branş seçin."),
  levels: z.array(z.string()).min(1, "En az bir seviye seçin."),
  experience: z.number().int().min(0).max(70),
  locationType: z.string().min(1),
  location: z.string().optional().nullable(),
  price: z.number().int().min(1, "Ücret giriniz.").max(100000),
  university: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  graduationYear: z.number().int().min(1950).max(2030).optional().nullable(),
  bio: z.string().min(20, "Biyografi en az 20 karakter olmalıdır.").max(300, "Biyografi en fazla 300 karakter olabilir."),
  photoUrl: z.string().optional().nullable(),
  phone: requiredPhoneSchema,
});

export async function completeOnboarding(input: unknown) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "TEACHER") {
    return { error: "Yetkisiz erişim. Sadece öğretmenler profil oluşturabilir." };
  }

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
      || parsed.error.issues[0]?.message;
    return { error: firstError || "Lütfen tüm gerekli alanları doldurun." };
  }

  const data = parsed.data;
  const userId = session.user.id;

  if ((data.locationType === "Sadece Yüz yüze" || data.locationType === "Yüz yüze & Online") && !data.location) {
    return { error: "Yüz yüze ders için konum seçmelisiniz." };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { phone: data.phone },
    });

    // 1. Create or update TeacherProfile
    await prisma.teacherProfile.upsert({
      where: { userId },
      update: {
        bio: data.bio,
        experience: data.experience,
        photoUrl: data.photoUrl || undefined,
        university: data.university || null,
        department: data.department || null,
        graduationYear: data.graduationYear || null,
        location: data.location || null,
      },
      create: {
        userId,
        bio: data.bio,
        experience: data.experience,
        photoUrl: data.photoUrl || null,
        university: data.university || null,
        department: data.department || null,
        graduationYear: data.graduationYear || null,
        location: data.location || null,
      },
    });

    // 2. Create one listing per subject
    const [primaryLevel, ...restLevels] = data.levels;
    await prisma.listing.createMany({
      data: data.subjects.map((subject) => ({
        userId,
        subject,
        level: primaryLevel,
        levels: restLevels.join(","),
        locationType: data.locationType,
        location: data.location || null,
        price: data.price,
      })),
    });

    return { success: true };
  } catch (error) {
    console.error("Onboarding Error:", error);
    return { error: "Profil kaydedilirken bir hata oluştu." };
  }
}
