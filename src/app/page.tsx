import { prisma } from "@/lib/prisma";
import { HomeClient, PopularTeacher, Testimonial } from "@/components/home/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Fetch popular teachers
  // Get top 3 teachers with the highest averageRating who have an active listing
  const popularProfiles = await prisma.teacherProfile.findMany({
    where: {
      averageRating: { gt: 0 },
      user: {
        listings: { some: { isActive: true } }
      }
    },
    orderBy: { averageRating: 'desc' },
    take: 3,
    include: {
      user: {
        include: {
          listings: { where: { isActive: true }, take: 1 }
        }
      }
    }
  });

  const popularTeachers: PopularTeacher[] = popularProfiles.map(profile => ({
    id: profile.user.id,
    name: profile.user.name,
    subject: profile.user.listings[0]?.subject || "Genel Ders",
    price: profile.user.listings[0]?.price || 0,
    averageRating: profile.averageRating,
    reviewCount: profile.reviewCount,
  }));

  // 2. Fetch testimonials
  // Get 3 latest 5-star reviews
  const latestReviews = await prisma.review.findMany({
    where: { rating: 5, comment: { not: null, not: "" } },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      student: { select: { name: true } }
    }
  });

  const testimonials: Testimonial[] = latestReviews.map(review => ({
    id: review.id,
    text: review.comment!,
    author: review.student.name,
    role: "Öğrenci",
  }));

  return <HomeClient popularTeachers={popularTeachers} testimonials={testimonials} />;
}
