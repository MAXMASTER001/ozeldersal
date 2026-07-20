"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { completeOnboarding } from "@/actions/onboarding";
import { toast } from "sonner";
import { SUBJECTS, LEVELS, LOCATION_TYPES, CITIES } from "@/lib/constants";
import { Camera, Check } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state (collected across steps)
  const [subjects, setSubjects] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [locationType, setLocationType] = useState("Yüz yüze & Online");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const totalSteps = 4;

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Fotoğraf yüklenemedi.");
      } else {
        setPhotoUrl(data.url);
        toast.success("Fotoğraf yüklendi.");
      }
    } catch {
      toast.error("Fotoğraf yüklenirken bir hata oluştu.");
    } finally {
      setIsUploading(false);
    }
  };

  const canProceedStep1 = subjects.length > 0 && levels.length > 0 && experience !== "";
  const canProceedStep2 =
    price !== "" &&
    Number(price) > 0 &&
    (locationType === "Sadece Online" || location !== "");
  const canSubmit = bio.length >= 20 && bio.length <= 300 && phone.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsLoading(true);
    try {
      const res = await completeOnboarding({
        subjects,
        levels,
        experience: Number(experience),
        locationType,
        location: location || null,
        price: Number(price),
        university: university || null,
        department: department || null,
        graduationYear: graduationYear ? Number(graduationYear) : null,
        bio,
        photoUrl,
        phone,
      });

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Profiliniz başarıyla oluşturuldu.");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Profil oluşturulurken bir hata meydana geldi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 py-10">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-sm">

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-black dark:bg-white" : "bg-neutral-100 dark:bg-neutral-800"}`}
            />
          ))}
        </div>
        <p className="text-xs text-neutral-400 mb-6 text-right">Adım {step} / {totalSteps}</p>

        {/* STEP 1: Subjects & Levels & Experience */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-2xl font-bold mb-2">Uzmanlık Alanınız</h1>
              <p className="text-neutral-500 mb-6">Verebileceğiniz dersleri ve seviyeleri seçin. Birden fazla seçebilirsiniz.</p>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium mb-2 block">Branşlar <span className="text-neutral-400 font-normal">(çoklu seçim)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleItem(subjects, setSubjects, s)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors flex items-center gap-1 ${
                          subjects.includes(s)
                            ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                            : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
                        }`}
                      >
                        {subjects.includes(s) && <Check size={14} />} {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Hedef Seviyeler <span className="text-neutral-400 font-normal">(çoklu seçim)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {LEVELS.map((l) => (
                      <button
                        type="button"
                        key={l}
                        onClick={() => toggleItem(levels, setLevels, l)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors flex items-center gap-1 ${
                          levels.includes(l)
                            ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                            : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
                        }`}
                      >
                        {levels.includes(l) && <Check size={14} />} {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Deneyim (Yıl)</label>
                  <Input value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Örn: 5" type="number" min="0" max="70" />
                </div>
              </div>
            </div>
            <Button type="button" className="w-full" disabled={!canProceedStep1} onClick={() => setStep(2)}>Devam Et</Button>
          </div>
        )}

        {/* STEP 2: Lesson Details */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-2xl font-bold mb-2">Ders Detayları</h1>
              <p className="text-neutral-500 mb-6">Ders işleyişiniz ve ücretlendirmeniz hakkında bilgi verin.</p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Ders Şekli</label>
                  <select value={locationType} onChange={(e) => setLocationType(e.target.value)} className="w-full border border-neutral-200 dark:border-neutral-700 rounded-md p-3 text-sm bg-transparent outline-none focus:border-black dark:focus:border-white">
                    {LOCATION_TYPES.map((lt) => (
                      <option key={lt.value} value={lt.value}>{lt.label}</option>
                    ))}
                  </select>
                </div>

                {locationType !== "Sadece Online" && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Konum (Şehir)</label>
                    <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-neutral-200 dark:border-neutral-700 rounded-md p-3 text-sm bg-transparent outline-none focus:border-black dark:focus:border-white">
                      <option value="">Şehir seçin</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-1 block">Saatlik Ücret (₺)</label>
                  <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Örn: 400" type="number" min="1" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>Geri</Button>
              <Button type="button" className="flex-1" disabled={!canProceedStep2} onClick={() => setStep(3)}>Devam Et</Button>
            </div>
          </div>
        )}

        {/* STEP 3: Education */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-2xl font-bold mb-2">Eğitim Geçmişi</h1>
              <p className="text-neutral-500 mb-6">Bu alanlar isteğe bağlıdır ancak güven oluşturur.</p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Üniversite</label>
                  <Input value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="Örn: Boğaziçi Üniversitesi" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Bölüm</label>
                  <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Örn: Matematik Öğretmenliği" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Mezuniyet Yılı</label>
                  <Input value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="Örn: 2018" type="number" min="1950" max="2030" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>Geri</Button>
              <Button type="button" className="flex-1" onClick={() => setStep(4)}>Devam Et</Button>
            </div>
          </div>
        )}

        {/* STEP 4: Photo & Bio */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-2xl font-bold mb-2">Kendinizi Tanıtın</h1>
              <p className="text-neutral-500 mb-6">Bir profil fotoğrafı ekleyin ve kısa bir biyografi yazın.</p>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium mb-1 block">Cep Telefonu</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    type="tel"
                    autoComplete="tel"
                    required
                  />
                  <p className="text-xs text-neutral-500 mt-1">Zorunludur; herkese açık profilinizde gösterilmez.</p>
                </div>
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
                    <p className="text-xs text-neutral-500">{isUploading ? "Yükleniyor..." : "JPG, PNG veya WebP · en fazla 5MB"}</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Biyografi <span className={`font-normal ${bio.length > 300 ? "text-red-500" : "text-neutral-400"}`}>({bio.length}/300)</span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={300}
                    className="w-full border border-neutral-200 dark:border-neutral-700 rounded-md p-3 text-sm bg-transparent outline-none focus:border-black dark:focus:border-white min-h-[120px]"
                    placeholder="Kendinizden, öğretim tarzınızdan ve tecrübelerinizden bahsedin... (en az 20 karakter)"
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(3)}>Geri</Button>
              <Button type="button" className="flex-1" disabled={isLoading || !canSubmit} onClick={handleSubmit}>
                {isLoading ? "Kaydediliyor..." : "Profili Tamamla"}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
