import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Star, MapPin, BookOpen, Clock, User as UserIcon, GraduationCap } from "lucide-react";
import { ReviewForm } from "@/components/ReviewForm";
import { getTeacherReviews } from "@/actions/review";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const resolvedParams = await params;
  const userId = resolvedParams.id;

  const user = await prisma.user.findUnique({
    where: { id: userId, role: "TEACHER" },
    include: {
      teacherProfile: true,
      listings: {
        where: { isActive: true },
      },
    },
  });

  if (!user || !user.teacherProfile) {
    notFound();
  }

  const profile = user.teacherProfile;
  const listings = user.listings;
  const { reviews } = await getTeacherReviews(profile.id);

  // Track profile view (not for own profile)
  if (session?.user?.id !== user.id) {
    await prisma.profileView.create({
      data: {
        teacherProfileId: profile.id,
        viewerId: session?.user?.id || null,
      },
    });
  }

  const hasReviewed = session?.user?.id
    ? reviews?.some((r) => r.studentId === session.user.id)
    : false;

  const educationText = [
    profile.university,
    profile.department,
    profile.graduationYear ? `${profile.graduationYear} mezunu` : null,
  ]
    .filter(Boolean)
    .join(" · ") || profile.education || null;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 pb-28">
      {/* Header Profile Section */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-10 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
        {profile.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photoUrl}
            alt={user.name}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-neutral-100 dark:bg-neutral-800 flex flex-shrink-0 items-center justify-center text-4xl md:text-5xl font-bold uppercase text-neutral-400">
            {user.name.charAt(0)}
          </div>
        )}

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium mb-6">
            <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 px-3 py-1 rounded-full">
              <Star className="fill-yellow-500" size={16} />
              {profile.averageRating > 0 ? profile.averageRating.toFixed(1) : "Yeni"}
              <span className="text-neutral-500 dark:text-neutral-400">({profile.reviewCount} Yorum)</span>
            </div>
            {profile.experience != null && profile.experience > 0 && (
              <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                <Clock size={16} /> {profile.experience} Yıl Deneyim
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                <MapPin size={16} /> {profile.location}
              </div>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-300">
            <p>{profile.bio || "Öğretmen henüz bir biyografi eklememiş."}</p>
          </div>

          <div className="mt-8 flex gap-4 justify-center md:justify-start">
            <Link href={`/messages?userId=${user.id}`}>
              <Button size="lg" className="rounded-full px-8">Mesaj Gönder</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Listings & Reviews */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Verdiği Dersler</h2>
            <div className="grid gap-4">
              {listings.length === 0 ? (
                <p className="text-neutral-500">Şu anda aktif bir ilan bulunmuyor.</p>
              ) : (
                listings.map((listing) => {
                  const extraLevels = listing.levels ? listing.levels.split(",").filter(Boolean) : [];
                  return (
                    <div key={listing.id} className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/50">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{listing.subject}</h3>
                        <div className="flex items-center gap-3 text-sm text-neutral-500 mb-2 flex-wrap">
                          <span className="flex items-center gap-1">
                            <BookOpen size={14} />
                            {[listing.level, ...extraLevels].join(" · ")}
                          </span>
                          <span className="flex items-center gap-1"><MapPin size={14} /> {listing.locationType}</span>
                          {listing.location && <span className="text-neutral-400">({listing.location})</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl">{listing.price} ₺</div>
                        <div className="text-xs text-neutral-500">/ saat</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Reviews Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Değerlendirmeler ({profile.reviewCount})</h2>

            <div className="space-y-4">
              {(!reviews || reviews.length === 0) ? (
                <p className="text-neutral-500">Bu öğretmene henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="p-6 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center font-bold text-neutral-500 uppercase">
                          {review.student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold">{review.student.name}</div>
                          <div className="text-xs text-neutral-500">
                            {new Date(review.createdAt).toLocaleDateString("tr-TR")}
                          </div>
                        </div>
                      </div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className={i < review.rating ? "fill-current" : "text-neutral-200 dark:text-neutral-700"} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-neutral-600 dark:text-neutral-300 mt-2">{review.comment}</p>}
                  </div>
                ))
              )}
            </div>

            {/* Review Form */}
            {(!hasReviewed && session?.user?.id !== user.id) && (
              <ReviewForm teacherProfileId={profile.id} />
            )}
          </section>
        </div>

        {/* Right Column: Info */}
        <div className="space-y-6">
          <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <h3 className="font-bold mb-4 flex items-center gap-2"><GraduationCap size={20} /> Eğitim Bilgisi</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {educationText || "Belirtilmemiş"}
            </p>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-900/50 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <h3 className="font-bold mb-4 flex items-center gap-2"><UserIcon size={20} /> İletişim</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              İletişim yalnızca platform içi mesajlaşma ile yapılır. Telefon numarası güvenliğiniz için gizli tutulur.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Message Button */}
      {session?.user?.id !== user.id && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 p-4">
          <div className="max-w-4xl mx-auto">
            <Link href={`/messages?userId=${user.id}`} className="block">
              <Button size="lg" className="w-full rounded-full">Mesaj Gönder</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
