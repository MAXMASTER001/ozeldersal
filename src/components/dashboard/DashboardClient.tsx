"use client";

import { useState } from "react";
import { updateProfile, toggleListingStatus } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff, Save } from "lucide-react";

export default function DashboardClient({ profile, listing }: { profile: any, listing: any }) {
  const [isActive, setIsActive] = useState(listing.isActive);
  const [isLoading, setIsLoading] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    const newStatus = !isActive;
    const res = await toggleListingStatus(newStatus);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      setIsActive(newStatus);
      toast.success(newStatus ? "İlanınız yayına alındı." : "İlanınız donduruldu (gizlendi).");
    }
    setIsToggling(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await updateProfile(formData);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Profil başarıyla güncellendi.");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Status Toggle Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">İlan Durumu</h2>
          <p className="text-neutral-500 text-sm">
            {isActive 
              ? "İlanınız şu an aktif ve veliler tarafından bulunabilir." 
              : "İlanınız donduruldu, arama sonuçlarında çıkmıyor."}
          </p>
        </div>
        <Button 
          variant={isActive ? "outline" : "default"} 
          onClick={handleToggle}
          disabled={isToggling}
          className="flex items-center gap-2"
        >
          {isActive ? (
            <><EyeOff size={16} /> İlanı Dondur</>
          ) : (
            <><Eye size={16} /> Yayına Al</>
          )}
        </Button>
      </div>

      {/* Edit Form */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">Bilgileri Güncelle</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Branş</label>
              <select name="subject" defaultValue={listing.subject} required className="w-full border border-neutral-200 rounded-md p-3 text-sm bg-transparent outline-none focus:border-black">
                <option value="Matematik">Matematik</option>
                <option value="Fizik">Fizik</option>
                <option value="İngilizce">İngilizce</option>
                <option value="Kimya">Kimya</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Ders Şekli</label>
              <select name="locationType" defaultValue={listing.locationType} required className="w-full border border-neutral-200 rounded-md p-3 text-sm bg-transparent outline-none focus:border-black">
                <option value="Yüz yüze & Online">Yüz yüze & Online</option>
                <option value="Sadece Yüz yüze">Sadece Yüz yüze</option>
                <option value="Sadece Online">Sadece Online</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Deneyim (Yıl)</label>
              <Input name="experience" defaultValue={profile.experience} required type="number" min="0" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Saatlik Ücret (₺)</label>
              <Input name="price" defaultValue={listing.price} required type="number" min="0" />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Biyografi</label>
            <textarea 
              name="bio"
              defaultValue={profile.bio}
              required
              className="w-full border border-neutral-200 rounded-md p-3 text-sm bg-transparent outline-none focus:border-black min-h-[120px]"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
              <Save size={16} /> {isLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
