"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { registerSchema } from "@/lib/validation";
import { clientFingerprint, consumeRateLimit, createToken, hashToken, writeAuditLog } from "@/lib/security";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";

export async function registerUser(formData: FormData) {
  if (formData.get("website")) return { success: true };
  const limit = await consumeRateLimit(await clientFingerprint("register"), 5, 60 * 60 * 1000);
  if (!limit.allowed) return { error: `Çok fazla kayıt denemesi yapıldı. ${limit.retryAfterSeconds} saniye sonra tekrar deneyin.` };
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError || "Lütfen tüm alanları doğru doldurun." };
  }

  const { name, password, role } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser?.emailVerified) {
      return { error: "Bu e-posta adresi zaten kullanılıyor." };
    }

    // İlk gönderim başarısız olduysa yarım kalmış doğrulanmamış hesabı tekrar
    // kayıt olmaya zorlamadan yeni bir doğrulama bağlantısı gönderebilmeliyiz.
    if (existingUser) {
      const token = createToken();
      await prisma.$transaction([
        prisma.emailVerificationToken.deleteMany({ where: { userId: existingUser.id } }),
        prisma.emailVerificationToken.create({
          data: {
            userId: existingUser.id,
            tokenHash: hashToken(token),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        }),
      ]);
      await sendVerificationEmail(existingUser.email, token);
      return { success: true };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });

    const token = createToken();
    await prisma.emailVerificationToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
    await sendVerificationEmail(user.email, token);
    await writeAuditLog({ actorId: user.id, action: "ACCOUNT_REGISTERED", targetType: "USER", targetId: user.id });

    return { success: true };
  } catch (error) {
    console.error("Register Error:", error);
    return { error: "Kayıt işlemi sırasında bir hata oluştu." };
  }
}

export async function verifyEmail(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.expiresAt < new Date()) return { error: "Doğrulama bağlantısı geçersiz veya süresi dolmuş." };
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
    prisma.emailVerificationToken.delete({ where: { id: record.id } }),
  ]);
  await writeAuditLog({ actorId: record.userId, action: "EMAIL_VERIFIED", targetType: "USER", targetId: record.userId });
  return { success: true };
}

export async function requestPasswordReset(email: string) {
  const limit = await consumeRateLimit(await clientFingerprint("password-reset"), 5, 60 * 60 * 1000);
  if (!limit.allowed) return { success: true };
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) return { success: true };
  const token = createToken();
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 30 * 60 * 1000) } }),
  ]);
  await sendPasswordResetEmail(user.email, token);
  await writeAuditLog({ actorId: user.id, action: "PASSWORD_RESET_REQUESTED", targetType: "USER", targetId: user.id });
  return { success: true };
}

export async function resetPassword(token: string, password: string) {
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.expiresAt < new Date()) return { error: "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş." };
  const parsed = registerSchema.shape.password.safeParse(password);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Geçersiz şifre." };
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { password: await bcrypt.hash(parsed.data, 12) } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);
  await writeAuditLog({ actorId: record.userId, action: "PASSWORD_RESET", targetType: "USER", targetId: record.userId });
  return { success: true };
}
