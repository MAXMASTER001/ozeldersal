import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Star, MapPin, SlidersHorizontal, ChevronDown } from "lucide-react";
import { SUBJECTS, LEVELS, LOCATION_TYPES, CITIES } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const subject = params.subject as string | undefined;
  const level = params.level as string | undefined;
  const locationType = params.locationType as string | undefined;
  const location = params.location as string | undefined;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const sort = (params.sort as string | undefined) || "relevance";
  const q = params.q as string | undefined;

  const whereClause: Prisma.ListingWhereInput = { isActive: true };
  const andConditions: Prisma.ListingWhereInput[] = [];
  if (subject) whereClause.subject = subject;
  if (level) {
    andConditions.push({
      OR: [
        { level },
        { levels: { contains: level } },
      ],
    });
  }
  if (locationType) whereClause.locationType = locationType;
  if (location) whereClause.location = location;
  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.price = {};
    if (minPrice !== undefined && !isNaN(minPrice)) whereClause.price.gte = minPrice;
    if (maxPrice !== undefined && !isNaN(maxPrice)) whereClause.price.lte = maxPrice;
  }
  if (q) {
    andConditions.push({
      OR: [
        { subject: { contains: q, mode: "insensitive" } },
        { level: { contains: q, mode: "insensitive" } },
        { levels: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
      ],
    });
  }
  if (andConditions.length > 0) {
    whereClause.AND = andConditions;
  }

  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  else if (sort === "experience") orderBy = { user: { teacherProfile: { experience: "desc" } } };
  else if (sort === "rating") orderBy = { user: { teacherProfile: { averageRating: "desc" } } };

  const listings = await prisma.listing.findMany({
    where: whereClause,
    include: {
      user: {
        include: {
          teacherProfile: true,
        },
      },
    },
    orderBy,
  });

  const currentParams = new URLSearchParams();
  Object.entries({ subject, level, locationType, location, minPrice: params.minPrice, maxPrice: params.maxPrice, sort, q }).forEach(([k, v]) => {
    if (v && typeof v === "string") currentParams.set(k, v);
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full max-w-6xl mx-auto p-4 md:p-8 gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <form method="GET" action="/search" className="space-y-5">
          {q && <input type="hidden" name="q" value={q} />}
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <SlidersHorizontal size={18} /> Filtreler
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-neutral-600 dark:text-neutral-400">Branş</label>
              <select name="subject" defaultValue={subject || ""} className="w-full border border-neutral-200 dark:border-neutral-700 rounded-md p-2 text-sm bg-transparent outline-none focus:border-black dark:focus:border-white">
                <option value="">Tümü</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-neutral-600 dark:text-neutral-400">Seviye</label>
              <select name="level" defaultValue={level || ""} className="w-full border border-neutral-200 dark:border-neutral-700 rounded-md p-2 text-sm bg-transparent outline-none focus:border-black dark:focus:border-white">
                <option value="">Tümü</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-neutral-600 dark:text-neutral-400">Ders Şekli</label>
              <select name="locationType" defaultValue={locationType || ""} className="w-full border border-neutral-200 dark:border-neutral-700 rounded-md p-2 text-sm bg-transparent outline-none focus:border-black dark:focus:border-white">
                <option value="">Fark etmez</option>
                {LOCATION_TYPES.map((lt) => <option key={lt.value} value={lt.value}>{lt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-neutral-600 dark:text-neutral-400">Sıralama</label>
              <select name="sort" defaultValue={sort} className="w-full border border-neutral-200 dark:border-neutral-700 rounded-md p-2 text-sm bg-transparent outline-none focus:border-black dark:focus:border-white">
                <option value="relevance">En Yeni</option>
                <option value="price_asc">En Düşük Ücret</option>
                <option value="experience">En Yüksek Deneyim</option>
                <option value="rating">En Yüksek Puan</option>
              </select>
            </div>
          </div>

          {/* Advanced filters */}
          <details className="group border-t border-neutral-200 dark:border-neutral-800 pt-4">
            <summary className="text-sm font-medium cursor-pointer list-none flex items-center justify-between text-neutral-600 dark:text-neutral-400">
              Gelişmiş Filtreler
              <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
            </summary>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-neutral-600 dark:text-neutral-400">Konum (Şehir)</label>
                <select name="location" defaultValue={location || ""} className="w-full border border-neutral-200 dark:border-neutral-700 rounded-md p-2 text-sm bg-transparent outline-none focus:border-black dark:focus:border-white">
                  <option value="">Tümü</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-neutral-600 dark:text-neutral-400">Ücret Aralığı (₺/saat)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    min="0"
                    placeholder="Min"
                    defaultValue={params.minPrice as string | undefined}
                    className="w-full border border-neutral-200 dark:border-neutral-700 rounded-md p-2 text-sm bg-transparent outline-none focus:border-black dark:focus:border-white"
                  />
                  <span className="text-neutral-400">–</span>
                  <input
                    type="number"
                    name="maxPrice"
                    min="0"
                    placeholder="Max"
                    defaultValue={params.maxPrice as string | undefined}
                    className="w-full border border-neutral-200 dark:border-neutral-700 rounded-md p-2 text-sm bg-transparent outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>
            </div>
          </details>

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
            listings.map((listing) => {
              const tp = listing.user.teacherProfile;
              const extraLevels = listing.levels ? listing.levels.split(",").filter(Boolean) : [];
              return (
                <Card key={listing.id} className="overflow-hidden hover:border-black dark:hover:border-white transition-colors">
                  <CardContent className="p-0 sm:flex items-stretch">
                    <div className="w-full sm:w-48 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-neutral-200 dark:border-neutral-800">
                      {tp?.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={tp.photoUrl} alt={listing.user.name} className="w-24 h-24 rounded-full object-cover shadow-sm" />
                      ) : (
                        <div className="w-24 h-24 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center shadow-sm text-2xl font-bold text-neutral-300 uppercase">
                          {listing.user.name.charAt(0)}
                        </div>
                      )}
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
                        {listing.user.email.endsWith(".test") && (
                          <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-300">Örnek profil</Badge>
                        )}
                        <Badge variant="secondary">{listing.level}</Badge>
                        {extraLevels.map((l) => (
                          <Badge key={l} variant="outline">{l}</Badge>
                        ))}
                        <Badge variant="outline">{listing.locationType}</Badge>
                        {listing.location && (
                          <Badge variant="outline" className="gap-1"><MapPin size={12} /> {listing.location}</Badge>
                        )}
                        {tp?.experience != null && tp.experience > 0 && (
                          <Badge variant="outline">{tp.experience} yıl deneyim</Badge>
                        )}
                        {(tp?.averageRating ?? 0) > 0 && (
                          <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200 gap-1 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20">
                            <Star className="fill-yellow-500 w-3 h-3" />
                            {tp?.averageRating.toFixed(1)}
                            <span className="opacity-70 font-normal">({tp?.reviewCount})</span>
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 line-clamp-2">
                        {tp?.bio || "Detaylı bilgi için profili inceleyin."}
                      </p>

                      <div className="mt-auto flex justify-end">
                        <Link href={`/teacher/${listing.userId}`}>
                          <Button variant="primary">Profili İncele</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
