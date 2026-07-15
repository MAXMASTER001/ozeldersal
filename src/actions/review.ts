"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addReview(teacherProfileId: string, rating: number, comment: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Yorum yapmak için giriş yapmalısınız." };
  }

  if (rating < 1 || rating > 5) {
    return { error: "Puan 1 ile 5 arasında olmalıdır." };
  }

  try {
    // Determine if user has already reviewed this teacher
    const existingReview = await prisma.review.findUnique({
      where: {
        studentId_teacherProfileId: {
          studentId: session.user.id,
          teacherProfileId,
        },
      },
    });

    if (existingReview) {
      return { error: "Bu öğretmene daha önce yorum yaptınız." };
    }

    // Perform transaction to add review and update teacher profile average
    await prisma.$transaction(async (tx) => {
      // 1. Create the review
      await tx.review.create({
        data: {
          studentId: session.user.id!,
          teacherProfileId,
          rating,
          comment,
        },
      });

      // 2. Fetch all reviews for this teacher to calculate new average
      const aggregates = await tx.review.aggregate({
        where: { teacherProfileId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      // 3. Update the teacher profile with new stats
      await tx.teacherProfile.update({
        where: { id: teacherProfileId },
        data: {
          averageRating: aggregates._avg.rating || 0,
          reviewCount: aggregates._count.rating || 0,
        },
      });
    });

    revalidatePath(`/teacher/${teacherProfileId}`);
    revalidatePath(`/search`);
    revalidatePath(`/`);
    
    return { success: true };
  } catch (error) {
    console.error("Add review error:", error);
    return { error: "Yorum eklenirken bir hata oluştu." };
  }
}

export async function getTeacherReviews(teacherProfileId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: { teacherProfileId },
      include: {
        student: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, reviews };
  } catch (error) {
    console.error("Get reviews error:", error);
    return { error: "Yorumlar getirilirken hata oluştu.", reviews: [] };
  }
}
