import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Star } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const subject = params.subject as string | undefined;
  const level = params.level as string | undefined;
  const locationType = params.locationType as string | undefined;
  const q = params.q as string | undefined; // from homepage search

  const whereClause: any = { isActive: true };
  if (subject) whereClause.subject = { contains: subject, mode: "insensitive" };
  if (level) whereClause.level = { contains: level, mode: "insensitive" };
  if (locationType) whereClause.locationType = locationType;
  if (q) {
    whereClause.OR = [
      { subject: { contains: q, mode: "insensitive" } },
      { level: { contains: q, mode: "insensitive" } },
    ];
  }

  const listings = await prisma.listing.findMany({
    where: whereClause,
    include: {
      user: {
        include: {
          teacherProfile: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full max-w-6xl mx-auto p-4 md:p-8 gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
        <form method="GET" action="/search">
          <h2 className="font-semibold text-lg mb-4">Filtreler</h2>
          <div className="space-y-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-neutral-600">Branş</label>
              <select name="subject" defaultValue={subject || ""} className="w-full border border-neutral-200 rounded-md p-2 text-sm bg-transparent outline-none focus:border-black">
                <option value="">Tümü</option>
                <option value="Matematik">Matematik</option>
                <option value="Fizik">Fizik</option>
                <option value="İngilizce">İngilizce</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-neutral-600">Seviye</label>
              <select name="level" defaultValue={level || ""} className="w-full border border-neutral-200 rounded-md p-2 text-sm bg-transparent outline-none focus:border-black">
                <option value="">Tümü</option>
                <option value="İlkokul">İlkokul</option>
                <option value="Ortaokul">Ortaokul</option>
                <option value="Lise">Lise</option>
                <option value="Genel">Genel</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-neutral-600">Ders Şekli</label>
              <select name="locationType" defaultValue={locationType || ""} className="w-full border border-neutral-200 rounded-md p-2 text-sm bg-transparent outline-none focus:border-black">
                <option value="">Fark etmez</option>
                <option value="Sadece Online">Sadece Online</option>
                <option value="Sadece Yüz yüze">Sadece Yüz yüze</option>
                <option value="Yüz yüze & Online">Yüz yüze & Online</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Filtrele</Button>
            <Link href="/search" className="flex-1">
              <Button type="button" variant="outline" className="w-full">Temizle</Button>
            </Link>
          </div>
        </form>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <h1 className="text-2xl font-bold mb-6">Öğretmen İlanları ({listings.length} sonuç)</h1>
        
        <div className="grid gap-4">
          {listings.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">Aramanıza uygun ilan bulunamadı.</div>
          ) : (
            listings.map(listing => (
              <Card key={listing.id} className="overflow-hidden hover:border-black transition-colors">
                <CardContent className="p-0 sm:flex items-stretch">
                  <div className="w-full sm:w-48 bg-neutral-100 flex items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-neutral-200">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl font-bold text-neutral-300 uppercase">
                      {listing.user.name.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold">{listing.user.name}</h3>
                        <p className="text-neutral-500 font-medium">{listing.subject}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl">{listing.price} ₺</div>
                        <div className="text-xs text-neutral-500">/ saat</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-4 flex-wrap">
                      <Badge variant="secondary">{listing.level}</Badge>
                      <Badge variant="outline">{listing.locationType}</Badge>
                      {listing.user.teacherProfile?.experience && (
                        <Badge variant="outline">{listing.user.teacherProfile.experience} yıl deneyim</Badge>
                      )}
                      {(listing.user.teacherProfile?.averageRating ?? 0) > 0 && (
                        <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200 gap-1">
                          <Star className="fill-yellow-500 w-3 h-3" />
                          {listing.user.teacherProfile?.averageRating.toFixed(1)} 
                          <span className="opacity-70 font-normal">({listing.user.teacherProfile?.reviewCount})</span>
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-neutral-600 mb-6 line-clamp-2">
                      {listing.user.teacherProfile?.bio || "Detaylı bilgi için profili inceleyin."}
                    </p>
                    
                    <div className="mt-auto flex justify-end">
                      <Link href={`/teacher/${listing.userId}`}>
                        <Button variant="outline">Profili İncele</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
