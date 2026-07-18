"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/security";

async function requireAdmin() {
  const session = await auth();
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map((email) => email.trim().toLowerCase());
  if (!session?.user?.id || !session.user.email || !admins.includes(session.user.email.toLowerCase())) throw new Error("Yetkisiz işlem.");
  return session.user;
}

export async function resolveReport(reportId: string, status: "RESOLVED" | "DISMISSED") {
  const admin = await requireAdmin();
  const report = await prisma.report.update({ where: { id: reportId }, data: { status, resolvedAt: new Date(), resolvedById: admin.id } });
  await writeAuditLog({ actorId: admin.id, action: `REPORT_${status}`, targetType: "REPORT", targetId: report.id });
}

export async function suspendUser(userId: string, suspended: boolean) {
  const admin = await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { isSuspended: suspended } });
  await writeAuditLog({ actorId: admin.id, action: suspended ? "USER_SUSPENDED" : "USER_REINSTATED", targetType: "USER", targetId: userId });
}
