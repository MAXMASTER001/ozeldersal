import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  hasValidImageSignature,
  ImageOptimizationError,
  MAX_UPLOAD_BYTES,
  optimizeProfileImage,
} from "@/lib/image-upload";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function objectStorage() {
  const { S3_BUCKET, S3_REGION, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_URL } = process.env;
  if (!S3_BUCKET || !S3_REGION || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !S3_PUBLIC_URL) return null;
  return {
    bucket: S3_BUCKET,
    publicUrl: S3_PUBLIC_URL.replace(/\/$/, ""),
    client: new S3Client({ region: S3_REGION, endpoint: S3_ENDPOINT, forcePathStyle: Boolean(S3_ENDPOINT), credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY } }),
  };
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Sadece JPG, PNG veya WebP formatı desteklenir." }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Dosya boyutu 5MB'dan küçük olmalıdır." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    if (!hasValidImageSignature(file.type, buffer)) {
      return NextResponse.json({ error: "Dosya içeriği bildirilen görsel türüyle eşleşmiyor." }, { status: 400 });
    }

    const optimizedBuffer = await optimizeProfileImage(buffer);
    const filename = `${session.user.id}-${crypto.randomBytes(6).toString("hex")}.webp`;

    const storage = objectStorage();
    if (storage) {
      await storage.client.send(new PutObjectCommand({ Bucket: storage.bucket, Key: `profile-photos/${filename}`, Body: optimizedBuffer, ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" }));
      return NextResponse.json({ url: `${storage.publicUrl}/profile-photos/${filename}` });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), optimizedBuffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Upload Error:", error);
    if (error instanceof ImageOptimizationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Dosya yüklenirken bir hata oluştu." }, { status: 500 });
  }
}
