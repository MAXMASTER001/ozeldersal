import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verify() {
  const teachers = await prisma.user.findMany({
    where: { email: { startsWith: "test.ogretmen" }, role: "TEACHER" },
    include: { teacherProfile: true, listings: true },
  });
  const students = await prisma.user.count({ where: { email: { startsWith: "test.ogrenci" }, role: "STUDENT" } });
  const reviews = await prisma.review.count({ where: { teacherProfileId: { in: teachers.flatMap((teacher) => teacher.teacherProfile ? [teacher.teacherProfile.id] : []) } } });
  const incompleteProfiles = teachers.filter((teacher) => !teacher.teacherProfile?.bio || !teacher.teacherProfile?.photoUrl || !teacher.teacherProfile?.university || !teacher.teacherProfile?.department || !teacher.teacherProfile?.location || teacher.listings.length < 2 || teacher.teacherProfile.reviewCount < 3);

  const summary = { teachers: teachers.length, students, reviews, incompleteProfiles: incompleteProfiles.map((teacher) => teacher.email) };
  console.log(JSON.stringify(summary, null, 2));
  if (teachers.length < 15 || teachers.length > 20 || students < 20 || students > 30 || reviews !== 54 || incompleteProfiles.length > 0) process.exitCode = 1;
}

verify()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
