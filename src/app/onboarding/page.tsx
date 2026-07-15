"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { completeOnboarding } from "@/actions/onboarding";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await completeOnboarding(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Profiliniz başarıyla oluşturuldu.");
        router.push("/search");
      }
    } catch (err) {
      toast.error("Profil oluşturulurken bir hata meydana geldi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-black' : 'bg-neutral-100'}`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-2xl font-bold mb-2">Uzmanlık Alanınız</h1>
                <p className="text-neutral-500 mb-6">Hangi branşta eğitim veriyorsunuz?</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Branş</label>
                    <select name="subject" required className="w-full border border-neutral-200 rounded-md p-3 text-sm bg-transparent outline-none focus:border-black">
                      <option value="Matematik">Matematik</option>
                      <option value="Fizik">Fizik</option>
                      <option value="İngilizce">İngilizce</option>
                      <option value="Kimya">Kimya</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Deneyim (Yıl)</label>
                    <Input name="experience" required placeholder="Örn: 5" type="number" min="0" />
                  </div>
                </div>
              </div>
              <Button type="button" className="w-full" onClick={() => setStep(2)}>Devam Et</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-2xl font-bold mb-2">Ders Detayları</h1>
                <p className="text-neutral-500 mb-6">Ders işleyişiniz ve ücretlendirmeniz hakkında bilgi verin.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Ders Şekli</label>
                    <select name="locationType" required className="w-full border border-neutral-200 rounded-md p-3 text-sm bg-transparent outline-none focus:border-black">
                      <option value="Yüz yüze & Online">Yüz yüze & Online</option>
                      <option value="Sadece Yüz yüze">Sadece Yüz yüze</option>
                      <option value="Sadece Online">Sadece Online</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Saatlik Ücret (₺)</label>
                    <Input name="price" required placeholder="Örn: 400" type="number" min="0" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>Geri</Button>
                <Button type="button" className="flex-1" onClick={() => setStep(3)}>Devam Et</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-2xl font-bold mb-2">Kendinizi Tanıtın</h1>
                <p className="text-neutral-500 mb-6">Velilerin ve öğrencilerin dikkatini çekecek kısa bir biyografi yazın.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Biyografi</label>
                    <textarea 
                      name="bio"
                      required
                      className="w-full border border-neutral-200 rounded-md p-3 text-sm bg-transparent outline-none focus:border-black min-h-[120px]"
                      placeholder="Kendinizden, öğretim tarzınızdan ve tecrübelerinizden bahsedin..."
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>Geri</Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Kaydediliyor..." : "Profili Tamamla"}
                </Button>
              </div>
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
