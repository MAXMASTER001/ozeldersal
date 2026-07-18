"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  updateProfile,
  createListing,
  updateListing,
  deleteListing,
  toggleListingStatus,
} from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SUBJECTS, LEVELS, LOCATION_TYPES, CITIES } from "@/lib/constants";
import { Eye, EyeOff, Save, Trash2, Plus, Pencil, X, Camera, TrendingUp } from "lucide-react";

type Listing = {
  id: string;
  subject: string;
  level: string;
  levels: string;
  locationType: string;
  location: string | null;
  price: number;
  isActive: boolean;
};

type Profile = {
  bio: string | null;
  experience: number | null;
  photoUrl: string | null;
  university: string | null;
  department: string | null;
  graduationYear: number | null;
  location: string | null;
};

const emptyListingForm = {
  subject: "Matematik",
  level: "Lise",
  levels: [] as string[],
  locationType: "Yüz yüze & Online",
  location: "",
  price: "",
};

export default function DashboardClient({
  profile,
  listings,
  weeklyViews,
}: {
  profile: Profile;
  listings: Listing[];
  weeklyViews: number;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form state
  const [bio, setBio] = useState(profile.bio || "");
  const [experience, setExperience] = useState(String(profile.experience ?? ""));
  const [university, setUniversity] = useState(profile.university || "");
  const [department, setDepartment] = useState(profile.department || "");
  const [graduationYear, setGraduationYear] = useState(profile.graduationYear ? String(profile.graduationYear) : "");
  const [profileLocation, setProfileLocation] = useState(profile.location || "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(profile.photoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Listing state
  const [showListingForm, setShowListingForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [listingForm, setListingForm] = useState(emptyListingForm);
  const [isSavingListing, setIsSavingListing] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || "Fotoğraf yüklenemedi.");
      else {
        setPhotoUrl(data.url);
        toast.success("Fotoğraf yüklendi. Kaydetmeyi unutmayın.");
      }
    } catch {
      toast.error("Fotoğraf yüklenirken bir hata oluştu.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const res = await updateProfile({
      bio,
      experience: Number(experience),
      university: university || null,
      department: department || null,
      graduationYear: graduationYear ? Number(graduationYear) : null,
      location: profileLocation || null,
      photoUrl,
    });
    if (res.error) toast.error(res.error);
    else {
      toast.success("Profil güncellendi.");
      router.refresh();
    }
    setIsSavingProfile(false);
  };

  const openNewListing = () => {
    setEditingId(null);
    setListingForm(emptyListingForm);
    setShowListingForm(true);
  };

  const openEditListing = (l: Listing) => {
    setEditingId(l.id);
    setListingForm({
      subject: l.subject,
      level: l.level,
      levels: l.levels ? l.levels.split(",").filter(Boolean) : [],
      locationType: l.locationType,
      location: l.location || "",
      price: String(l.price),
    });
    setShowListingForm(true);
  };

  const toggleExtraLevel = (level: string) => {
    setListingForm((f) => ({
      ...f,
      levels: f.levels.includes(level) ? f.levels.filter((x) => x !== level) : [...f.levels, level],
    }));
  };

  const handleListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingListing(true);
    const payload = {
      subject: listingForm.subject,
      level: listingForm.level,
      levels: listingForm.levels.filter((l) => l !== listingForm.level).join(","),
      locationType: listingForm.locationType,
      location: listingForm.location || null,
      price: Number(listingForm.price),
    };
    const res = editingId ? await updateListing(editingId, payload) : await createListing(payload);
    if (res.error) toast.error(res.error);
    else {
      toast.success(editingId ? "İlan güncellendi." : "İlan oluşturuldu.");
      setShowListingForm(false);
      setEditingId(null);
      router.refresh();
    }
    setIsSavingListing(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;
    const res = await deleteListing(id);
    if (res.error) toast.error(res.error);
    else {
      toast.success("İlan silindi.");
      router.refresh();
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    setTogglingId(id);
    const res = await toggleListingStatus(id, !current);
    if (res.error) toast.error(res.error);
    else toast.success(!current ? "İlan yayına alındı." : "İlan donduruldu.");
    setTogglingId(null);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Weekly views */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <TrendingUp size={22} />
        </div>
        <div>
          <div className="text-2xl font-bold">{weeklyViews}</div>
          <p className="text-sm text-neutral-500">Son 7 günde profil görüntülenmesi</p>
        </div>
      </div>

      {/* Listings */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">İlanlarım ({listings.length})</h2>
          <Button size="sm" onClick={openNewListing} className="flex items-center gap-1">
            <Plus size={16} /> Yeni İlan
          </Button>
        </div>

        <div className="space-y-3 mb-6">
          {listings.map((l) => (
            <div key={l.id} className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${l.isActive ? "border-neutral-200 dark:border-neutral-700" : "border-dashed border-neutral-300 dark:border-neutral-700 opacity-60"}`}>
              <div>
                <div className="font-semibold flex items-center gap-2">
                  {l.subject}
                  {!l.isActive && <span className="text-xs font-normal text-neutral-500">(Pasif)</span>}
                </div>
                <div className="text-sm text-neutral-500">
                  {[l.level, ...l.levels.split(",").filter(Boolean)].join(" · ")} — {l.locationType}
                  {l.location ? ` · ${l.location}` : ""} — {l.price} ₺/saat
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleToggle(l.id, l.isActive)} disabled={togglingId === l.id}>
                  {l.isActive ? <><EyeOff size={14} /> Dondur</> : <><Eye size={14} /> Yayına Al</>}
                </Button>
                <Button size="sm" variant="outline" onClick={() => openEditListing(l)}>
                  <Pencil size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(l.id)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Listing Form */}
        {showListingForm && (
          <form onSubmit={handleListingSubmit} className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-5 space-y-4 bg-neutral-50 dark:bg-neutral-800/40">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{editingId ? "İlanı Düzenle" : "Yeni İlan"}</h3>
              <button type="button" onClick={() => setShowListingForm(false)} className="text-neutral-400 hover:text-neutral-600">
                <X size={18} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Branş</label>
                <select value={listingForm.subject} onChange={(e) => setListingForm({ ...listingForm, subject: e.target.value })} className="w-full border border-neutral-200 dark:border-neutral-700 rounded-md p-3 text-sm bg-white dark:bg-neutral-900 outline-none focus:border-black dark:focus:border-white">
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Ders Şekli</label>
                <select value={listingForm.locationType} onChange={(e) => setListingForm({ ...listingForm, locationType: e.target.value })} className="w-full border border-neutral-200 dark:border-neutral-700 rounded-md p-3 text-sm bg-white dark:bg-neutral-900 outline-none focus:border-black dark:focus:border-white">
                  {LOCATION_TYPES.map((lt) => <option key={lt.value} value={lt.value}>{lt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Ana Seviye</label>
                <select value={listingForm.level} onChange={(e) => setListingForm({ ...listingForm, level: e.target.value })} className="w-full border border-neutral-200 dark:border-neutral-700 rounded-md p-3 text-sm bg-white dark:bg-neutral-900 outline-none focus:border-black dark:focus:border-white">
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Saatlik Ücret (₺)</label>
                <Input value={listingForm.price} onChange={(e) => setListingForm({ ...listingForm, price: e.target.value })} type="number" min="1" required />
              </div>
              {listingForm.locationType !== "Sadece Online" && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Konum (Şehir)</label>
                  <select value={listingForm.location} onChange={(e) => setListingForm({ ...listingForm, location: e.target.value })} className="w-full border border-neutral-200 dark:border-neutral-700 rounded-md p-3 text-sm bg-white dark:bg-neutral-900 outline-none focus:border-black dark:focus:border-white">
                    <option value="">Şehir seçin</option>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Ek Seviyeler (opsiyonel)</label>
              <div className="flex flex-wrap gap-2">
                {LEVELS.filter((l) => l !== listingForm.level).map((l) => (
                  <button
                    type="button"
                    key={l}
                    onClick={() => toggleExtraLevel(l)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      listingForm.levels.includes(l)
                        ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowListingForm(false)}>Vazgeç</Button>
              <Button type="submit" disabled={isSavingListing}>
                {isSavingListing ? "Kaydediliyor..." : editingId ? "Güncelle" : "İlan Oluştur"}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Profile Edit */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">Profil Bilgileri</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden hover:border-neutral-400 transition-colors flex-shrink-0"
            >
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <Camera size={24} className="text-neutral-400" />
              )}
            </button>
            <div>
              <p className="text-sm font-medium">Profil Fotoğrafı</p>
              <p className="text-xs text-neutral-500">{isUploading ? "Yükleniyor..." : "Değiştirmek için tıklayın"}</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Deneyim (Yıl)</label>
              <Input value={experience} onChange={(e) => setExperience(e.target.value)} required type="number" min="0" max="70" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Konum (Şehir)</label>
              <select value={profileLocation} onChange={(e) => setProfileLocation(e.target.value)} className="w-full border border-neutral-200 dark:border-neutral-700 rounded-md p-3 text-sm bg-transparent outline-none focus:border-black dark:focus:border-white">
                <option value="">Belirtilmemiş</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Üniversite</label>
              <Input value={university} onChange={(e) => setUniversity(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Bölüm</label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Mezuniyet Yılı</label>
              <Input value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} type="number" min="1950" max="2030" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Biyografi <span className={`font-normal ${bio.length > 300 ? "text-red-500" : "text-neutral-400"}`}>({bio.length}/300)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
              maxLength={300}
              className="w-full border border-neutral-200 dark:border-neutral-700 rounded-md p-3 text-sm bg-transparent outline-none focus:border-black dark:focus:border-white min-h-[120px]"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSavingProfile} className="flex items-center gap-2">
              <Save size={16} /> {isSavingProfile ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
