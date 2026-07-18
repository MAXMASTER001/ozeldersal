"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { registerSchema } from "@/lib/validation";

export async function registerUser(formData: FormData) {
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

  const { name, email, password, role } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { error: "Bu e-posta adresi zaten kullanılıyor." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Register Error:", error);
    return { error: "Kayıt işlemi sırasında bir hata oluştu." };
  }
}
