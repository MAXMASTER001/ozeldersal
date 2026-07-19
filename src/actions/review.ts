"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function validateReview(rating: number, comment: string) {
  if (rating < 1 || rating > 5) return "Puan 1 ile 5 arasında olmalıdır.";
  if (comment.trim().length > 1_000) return "Yorum en fazla 1000 karakter olabilir.";
  return null;
}

async function refreshReviewPages(teacherUserId: string) {
  revalidatePath(`/teacher/${teacherUserId}`);
  revalidatePath("/search");
  revalidatePath("/");
}

export async function addReview(teacherProfileId: string, teacherUserId: string, rating: number, comment: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Yorum yapmak için giriş yapmalısınız." };
  }

  const validationError = validateReview(rating, comment);
  if (validationError) return { error: validationError };

  try {
    const teacher = await prisma.teacherProfile.findUnique({ where: { id: teacherProfileId }, select: { userId: true } });
    if (!teacher) return { error: "Öğretmen profili bulunamadı." };
    if (teacher.userId === session.user.id) return { error: "Kendi profilinize yorum yapamazsınız." };

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
          comment: comment.trim() || null,
        },
      });

      await tx.notification.create({
        data: {
          userId: teacher.userId,
          type: "REVIEW",
          title: "Yeni değerlendirme",
          body: `Bir öğrenci profiliniz için ${rating} yıldız verdi.`,
          link: `/teacher/${teacher.userId}`,
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

    await refreshReviewPages(teacherUserId);
    
    return { success: true };
  } catch (error) {
    console.error("Add review error:", error);
    return { error: "Yorum eklenirken bir hata oluştu." };
  }
}

export async function updateReview(reviewId: string, teacherProfileId: string, teacherUserId: string, rating: number, comment: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Yorum düzenlemek için giriş yapmalısınız." };

  const validationError = validateReview(rating, comment);
  if (validationError) return { error: validationError };

  try {
    const review = await prisma.review.findFirst({ where: { id: reviewId, studentId: session.user.id, teacherProfileId } });
    if (!review) return { error: "Yalnızca kendi yorumunuzu düzenleyebilirsiniz." };

    await prisma.$transaction(async (tx) => {
      await tx.review.update({ where: { id: review.id }, data: { rating, comment: comment.trim() || null } });
      const aggregates = await tx.review.aggregate({ where: { teacherProfileId }, _avg: { rating: true }, _count: { rating: true } });
      await tx.teacherProfile.update({ where: { id: teacherProfileId }, data: { averageRating: aggregates._avg.rating || 0, reviewCount: aggregates._count.rating || 0 } });
    });

    await refreshReviewPages(teacherUserId);
    return { success: true };
  } catch (error) {
    console.error("Update review error:", error);
    return { error: "Yorum güncellenirken bir hata oluştu." };
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
