import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveReport, suspendUser } from "@/actions/admin";

export default async function AdminPage() {
  const session = await auth();
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map((email) => email.trim().toLowerCase());
  if (!session?.user?.email || !admins.includes(session.user.email.toLowerCase())) redirect("/");
  const reports = await prisma.report.findMany({ where: { status: "OPEN" }, orderBy: { createdAt: "desc" }, take: 100, include: { reporter: { select: { name: true, email: true } } } });
  return <main className="flex-1 mx-auto w-full max-w-4xl p-4 md:p-8"><h1 className="text-3xl font-bold">Moderasyon kuyruğu</h1><p className="mt-2 text-neutral-600">Açık raporlar ve kullanıcı işlemleri denetim kaydına yazılır.</p><div className="mt-8 space-y-4">{reports.length === 0 ? <p>Açık rapor yok.</p> : reports.map((report) => <article key={report.id} className="rounded-xl border p-5"><p className="font-medium">{report.reason}</p><p className="mt-1 text-sm text-neutral-600">Bildiren: {report.reporter.name} · Hedef: {report.targetId}</p><p className="mt-1 text-xs text-neutral-500">{report.createdAt.toLocaleString("tr-TR")}</p><div className="mt-4 flex gap-2"><form action={resolveReport.bind(null, report.id, "RESOLVED")}><button className="rounded bg-black px-3 py-2 text-sm text-white">Çözüldü</button></form><form action={resolveReport.bind(null, report.id, "DISMISSED")}><button className="rounded border px-3 py-2 text-sm">Reddet</button></form><form action={suspendUser.bind(null, report.targetId, true)}><button className="rounded border border-red-300 px-3 py-2 text-sm text-red-700">Hesabı askıya al</button></form></div></article>)}</div></main>;
}
