"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !password || !role) {
    return { error: "Lütfen tüm alanları doldurun." };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { error: "Bu e-posta adresi zaten kullanılıyor." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role // "TEACHER" or "STUDENT"
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Register Error:", error);
    return { error: "Kayıt işlemi sırasında bir hata oluştu." };
  }
}
