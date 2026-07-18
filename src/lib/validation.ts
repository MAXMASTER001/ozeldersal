import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, { message: "Şifre en az 8 karakter olmalıdır." })
  .regex(/[a-zA-ZÇĞİÖŞÜçğıöşü]/, { message: "Şifre en az bir harf içermelidir." })
  .regex(/[0-9]/, { message: "Şifre en az bir rakam içermelidir." });

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Ad Soyad en az 2 karakter olmalıdır." }).max(100),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
  password: passwordSchema,
  role: z.enum(["TEACHER", "STUDENT"]),
});

export const phoneSchema = z
  .string()
  .regex(/^(\+90|0)?[0-9]{10}$/, { message: "Geçerli bir telefon numarası giriniz (örn: 05XX XXX XX XX)." })
  .optional()
  .or(z.literal(""));

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Mevcut şifrenizi giriniz." }),
  newPassword: passwordSchema,
});

// --- Contact-info leak filters (KVKK: keep phone/email inside platform) ---
const PHONE_REGEX = /(?:\+?90[\s-]?)?0?5\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/;
const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const URL_REGEX = /(?:https?:\/\/|www\.)[^\s]+/i;

export function containsContactInfo(text: string): boolean {
  return PHONE_REGEX.test(text) || EMAIL_REGEX.test(text) || URL_REGEX.test(text);
}

export function detectContactInfoType(text: string): string | null {
  if (PHONE_REGEX.test(text)) return "telefon numarası";
  if (EMAIL_REGEX.test(text)) return "e-posta adresi";
  if (URL_REGEX.test(text)) return "bağlantı";
  return null;
}
