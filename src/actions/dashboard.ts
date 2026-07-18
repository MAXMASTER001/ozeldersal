"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireTeacher() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    return null;
  }
  return session.user;
}

const profileSchema = z.object({
  bio: z.string().min(20, "Biyografi en az 20 karakter olmalıdır.").max(300, "Biyografi en fazla 300 karakter olabilir."),
  experience: z.number().int().min(0).max(70),
  university: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  graduationYear: z.number().int().min(1950).max(2030).optional().nullable(),
  location: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
});

export async function updateProfile(input: unknown) {
  const user = await requireTeacher();
  if (!user) return { error: "Yetkisiz erişim." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Lütfen alanları doğru doldurun." };
  }

  try {
    await prisma.teacherProfile.update({
      where: { userId: user.id },
      data: {
        bio: parsed.data.bio,
        experience: parsed.data.experience,
        university: parsed.data.university || null,
        department: parsed.data.department || null,
        graduationYear: parsed.data.graduationYear || null,
        location: parsed.data.location || null,
        ...(parsed.data.photoUrl ? { photoUrl: parsed.data.photoUrl } : {}),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/search");
    revalidatePath(`/teacher/${user.id}`);
    return { success: true };
  } catch (error) {
    console.error("Dashboard Update Error:", error);
    return { error: "Profil güncellenirken hata oluştu." };
  }
}

const listingSchema = z.object({
  subject: z.string().min(1, "Branş seçiniz."),
  level: z.string().min(1, "Seviye seçiniz."),
  levels: z.string().optional(),
  locationType: z.string().min(1),
  location: z.string().optional().nullable(),
  price: z.number().int().min(1, "Geçerli bir ücret giriniz.").max(100000),
});

export async function createListing(input: unknown) {
  const user = await requireTeacher();
  if (!user) return { error: "Yetkisiz erişim." };

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Lütfen alanları doğru doldurun." };
  }

  if ((parsed.data.locationType === "Sadece Yüz yüze" || parsed.data.locationType === "Yüz yüze & Online") && !parsed.data.location) {
    return { error: "Yüz yüze ders için konum seçmelisiniz." };
  }

  try {
    await prisma.listing.create({
      data: {
        userId: user.id,
        subject: parsed.data.subject,
        level: parsed.data.level,
        levels: parsed.data.levels || "",
        locationType: parsed.data.locationType,
        location: parsed.data.location || null,
        price: parsed.data.price,
      },
    });
    revalidatePath("/dashboard");
    revalidatePath("/search");
    return { success: true };
  } catch (error) {
    console.error("Create Listing Error:", error);
    return { error: "İlan oluşturulurken hata oluştu." };
  }
}

export async function updateListing(listingId: string, input: unknown) {
  const user = await requireTeacher();
  if (!user) return { error: "Yetkisiz erişim." };

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Lütfen alanları doğru doldurun." };
  }

  try {
    // Verify ownership
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.userId !== user.id) {
      return { error: "İlan bulunamadı." };
    }

    await prisma.listing.update({
      where: { id: listingId },
      data: {
        subject: parsed.data.subject,
        level: parsed.data.level,
        levels: parsed.data.levels || "",
        locationType: parsed.data.locationType,
        location: parsed.data.location || null,
        price: parsed.data.price,
      },
    });
    revalidatePath("/dashboard");
    revalidatePath("/search");
    return { success: true };
  } catch (error) {
    console.error("Update Listing Error:", error);
    return { error: "İlan güncellenirken hata oluştu." };
  }
}

export async function deleteListing(listingId: string) {
  const user = await requireTeacher();
  if (!user) return { error: "Yetkisiz erişim." };

  try {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.userId !== user.id) {
      return { error: "İlan bulunamadı." };
    }

    await prisma.listing.delete({ where: { id: listingId } });
    revalidatePath("/dashboard");
    revalidatePath("/search");
    return { success: true };
  } catch (error) {
    console.error("Delete Listing Error:", error);
    return { error: "İlan silinirken hata oluştu." };
  }
}

export async function toggleListingStatus(listingId: string, isActive: boolean) {
  const user = await requireTeacher();
  if (!user) return { error: "Yetkisiz erişim." };

  try {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.userId !== user.id) {
      return { error: "İlan bulunamadı." };
    }

    await prisma.listing.update({
      where: { id: listingId },
      data: { isActive },
    });
    revalidatePath("/dashboard");
    revalidatePath("/search");
    return { success: true };
  } catch (error) {
    console.error("Toggle Listing Error:", error);
    return { error: "İlan durumu güncellenemedi." };
  }
}
