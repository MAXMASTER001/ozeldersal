import "server-only";

import crypto from "crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function clientFingerprint(scope: string) {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim()
    || requestHeaders.get("x-real-ip")
    || "unknown";
  return `${scope}:${crypto.createHash("sha256").update(ip).digest("hex")}`;
}

export async function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = new Date();
  const current = await prisma.rateLimit.findUnique({ where: { key } });
  if (!current || now.getTime() - current.windowStart.getTime() >= windowMs) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((windowMs - (now.getTime() - current.windowStart.getTime())) / 1000) };
  }

  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return { allowed: true, retryAfterSeconds: 0 };
}

export async function writeAuditLog(input: {
  actorId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  await prisma.auditLog.create({ data: input });
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createToken() {
  return crypto.randomBytes(32).toString("base64url");
}
