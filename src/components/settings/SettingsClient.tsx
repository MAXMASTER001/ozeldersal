"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateAccount, changePassword, switchRole } from "@/actions/settings";
import { toast } from "sonner";
import { Save, KeyRound, RefreshCcw, User as UserIcon } from "lucide-react";

export default function SettingsClient({ user }: { user: { id: string; name: string; email: string; phone: string | null; role: string } }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleAccountSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateAccount(formData);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Bilgileriniz güncellendi.");
      router.refresh();
    }
    setIsSaving(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsChangingPw(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await changePassword(formData);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Şifreniz değiştirildi.");
      form.reset();
    }
    setIsChangingPw(false);
  };

  const handleSwitchRole = async () => {
    const newRole = user.role === "TEACHER" ? "STUDENT" : "TEACHER";
    const confirmMsg = newRole === "TEACHER"
      ? "Öğretmen hesabına geçmek istiyor musunuz? Profil oluşturma adımlarına yönlendirileceksiniz."
      : "Öğrenci/Veli hesabına geçmek istiyor musunuz?";
    if (!window.confirm(confirmMsg)) return;

    setIsSwitching(true);
    const res = await switchRole(newRole);
    if (res.error) {
      toast.error(res.error);
      setIsSwitching(false);
      return;
    }
    // Role is embedded in the JWT, so the user must re-login to refresh the token.
    toast.success("Rolünüz değiştirildi. Lütfen tekrar giriş yapın.");
    await signOut({ callbackUrl: res.redirect ? `/login?callbackUrl=${encodeURIComponent(res.redirect)}` : "/login" });
  };

  return (
    <div className="space-y-8">
      {/* Account Info */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><UserIcon size={20} /> Profil Bilgileri</h2>
        <form onSubmit={handleAccountSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Ad Soyad</label>
            <Input name="name" defaultValue={user.name} required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">E-posta</label>
            <Input value={user.email} disabled className="opacity-60 cursor-not-allowed" />
            <p className="text-xs text-neutral-500 mt-1">E-posta adresi değiştirilemez.</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Telefon Numarası</label>
            <Input name="phone" defaultValue={user.phone || ""} placeholder="05XX XXX XX XX" />
            <p className="text-xs text-neutral-500 mt-1">Telefon numaranız diğer kullanıcılarla asla paylaşılmaz.</p>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
              <Save size={16} /> {isSaving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><KeyRound size={20} /> Şifre Değiştir</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Mevcut Şifre</label>
            <Input name="currentPassword" type="password" required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Yeni Şifre</label>
            <Input name="newPassword" type="password" required />
            <p className="text-xs text-neutral-500 mt-1">En az 8 karakter, en az bir harf ve bir rakam içermelidir.</p>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isChangingPw} variant="outline">
              {isChangingPw ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
            </Button>
          </div>
        </form>
      </div>

      {/* Role Switch */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><RefreshCcw size={20} /> Hesap Türü</h2>
        <p className="text-sm text-neutral-500 mb-6">
          Şu an <span className="font-semibold text-foreground">{user.role === "TEACHER" ? "Öğretmen" : "Öğrenci / Veli"}</span> hesabı kullanıyorsunuz.
        </p>
        <Button variant="outline" onClick={handleSwitchRole} disabled={isSwitching}>
          {isSwitching
            ? "Değiştiriliyor..."
            : user.role === "TEACHER"
              ? "Öğrenci / Veli Hesabına Geç"
              : "Öğretmen Hesabına Geç"}
        </Button>
      </div>
    </div>
  );
}
