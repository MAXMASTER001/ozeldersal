import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const password = "Test1234";
const teacherNames = [
  "Ayşe Demir", "Mehmet Kaya", "Elif Şahin", "Can Yıldız", "Zeynep Arslan", "Burak Çelik",
  "Selin Aydın", "Emre Koç", "Derya Güneş", "Ozan Aksoy", "Ece Yalçın", "Mert Kaplan",
  "İpek Erdem", "Deniz Kurt", "Seda Tunç", "Arda Özkan", "Melis Polat", "Kaan Yüce",
];
const studentNames = [
  "Ada Acar", "Bora Akın", "Ceren Baş", "Doruk Can", "Eylül Dağ", "Fırat Er", "Gül Ekin",
  "Hakan Işık", "İlayda Kılıç", "Jale Koç", "Kuzey Lara", "Lale Mert", "Mina Nehir", "Onur Oğuz",
  "Pelin Özer", "Rana Sarp", "Sarp Taş", "Tuana Uçar", "Umut Vural", "Veli Yaman", "Yağmur Zor",
  "Aslı Yurt", "Berk Zengin", "Cansu Akın",
];
const subjects = [
  "Matematik", "Fizik", "Kimya", "Biyoloji", "Türkçe", "İngilizce", "Tarih", "Coğrafya", "Geometri",
  "Fen Bilgisi", "Almanca", "Fransızca", "Müzik", "Resim", "Bilgisayar / Yazılım", "Matematik", "Fizik", "İngilizce",
];
const cities = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Eskişehir"];
const universities = ["Boğaziçi Üniversitesi", "ODTÜ", "İstanbul Üniversitesi", "Ege Üniversitesi", "Hacettepe Üniversitesi", "İTÜ"];
const departments = ["Matematik Öğretmenliği", "Fizik Bölümü", "İngiliz Dili ve Edebiyatı", "Kimya Mühendisliği", "Türk Dili ve Edebiyatı", "Bilgisayar Mühendisliği"];
const reviewComments = [
  "Ders anlatımı çok anlaşılır, düzenli çalışma planı oluşturduk.",
  "Çocuğumun konu eksiklerini kısa sürede tespit edip iyi yönlendirdi.",
  "Sınav hazırlığında hem motive edici hem de çok sistemli bir öğretmen.",
];

const teacherEmail = (index) => `test.ogretmen${String(index + 1).padStart(2, "0")}@ozeldersal.test`;
const studentEmail = (index) => `test.ogrenci${String(index + 1).padStart(2, "0")}@ozeldersal.test`;

async function upsertUsers(names, role, emailFor, passwordHash) {
  return Promise.all(names.map((name, index) => prisma.user.upsert({
    where: { email: emailFor(index) },
    update: { name, password: passwordHash, role, phone: `05${String(100000000 + index).slice(1)}` },
    create: { name, email: emailFor(index), password: passwordHash, role, phone: `05${String(100000000 + index).slice(1)}` },
  })));
}

async function seed() {
  const passwordHash = await bcrypt.hash(password, 10);
  const [teachers, students] = await Promise.all([
    upsertUsers(teacherNames, "TEACHER", teacherEmail, passwordHash),
    upsertUsers(studentNames, "STUDENT", studentEmail, passwordHash),
  ]);

  await prisma.listing.deleteMany({ where: { userId: { in: teachers.map((teacher) => teacher.id) } } });
  const profiles = await Promise.all(teachers.map((teacher, index) => prisma.teacherProfile.upsert({
    where: { userId: teacher.id },
    update: {
      bio: `${subjects[index]} alanında ${6 + (index % 12)} yıllık deneyime sahibim. Öğrencinin hedefini ve öğrenme hızını merkeze alan, bol örnekli ve düzenli takipli dersler planlıyorum. Her dersin sonunda kısa tekrar notları ve kişiye özel çalışma önerileri paylaşıyorum.`,
      photoUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(teacher.name)}&backgroundColor=ffedd5`,
      university: universities[index % universities.length],
      department: departments[index % departments.length],
      graduationYear: 2008 + (index % 14),
      location: cities[index % cities.length],
      experience: 6 + (index % 12),
    },
    create: {
      userId: teacher.id,
      bio: `${subjects[index]} alanında ${6 + (index % 12)} yıllık deneyime sahibim. Öğrencinin hedefini ve öğrenme hızını merkeze alan, bol örnekli ve düzenli takipli dersler planlıyorum. Her dersin sonunda kısa tekrar notları ve kişiye özel çalışma önerileri paylaşıyorum.`,
      photoUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(teacher.name)}&backgroundColor=ffedd5`,
      university: universities[index % universities.length],
      department: departments[index % departments.length],
      graduationYear: 2008 + (index % 14),
      location: cities[index % cities.length],
      experience: 6 + (index % 12),
    },
  })));

  await prisma.listing.createMany({
    data: teachers.flatMap((teacher, index) => [
      {
        userId: teacher.id,
        subject: subjects[index],
        level: index % 2 === 0 ? "Lise" : "Ortaokul",
        levels: index % 2 === 0 ? "TYT-AYT,LGS" : "İlkokul,LGS",
        locationType: index % 3 === 0 ? "Sadece Online" : "Yüz yüze & Online",
        location: cities[index % cities.length],
        price: 450 + index * 35,
      },
      {
        userId: teacher.id,
        subject: index % 2 === 0 ? "Geometri" : "Fen Bilgisi",
        level: "LGS",
        levels: "Ortaokul,Lise",
        locationType: "Yüz yüze & Online",
        location: cities[index % cities.length],
        price: 500 + index * 35,
      },
    ]),
  });

  await prisma.review.deleteMany({ where: { teacherProfileId: { in: profiles.map((profile) => profile.id) } } });
  await prisma.review.createMany({
    data: profiles.flatMap((profile, teacherIndex) => [0, 1, 2].map((offset) => ({
      teacherProfileId: profile.id,
      studentId: students[(teacherIndex * 3 + offset) % students.length].id,
      rating: offset === 2 && teacherIndex % 4 === 0 ? 4 : 5,
      comment: reviewComments[offset],
    }))),
  });

  await Promise.all(profiles.map(async (profile) => {
    const stats = await prisma.review.aggregate({
      where: { teacherProfileId: profile.id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return prisma.teacherProfile.update({
      where: { id: profile.id },
      data: { averageRating: stats._avg.rating ?? 0, reviewCount: stats._count.rating },
    });
  }));

  await prisma.message.deleteMany({
    where: { OR: [{ senderId: { in: students.map((student) => student.id) } }, { receiverId: { in: teachers.map((teacher) => teacher.id) } }] },
  });
  await prisma.notification.deleteMany({ where: { userId: { in: teachers.map((teacher) => teacher.id) } } });
  await prisma.message.createMany({
    data: teachers.map((teacher, index) => ({
      senderId: students[index % students.length].id,
      receiverId: teacher.id,
      content: "Merhaba, ders programınız hakkında platform üzerinden bilgi alabilir miyim?",
    })),
  });
  await prisma.notification.createMany({
    data: teachers.map((teacher, index) => ({
      userId: teacher.id,
      type: "NEW_MESSAGE",
      title: "Yeni Mesaj",
      body: `${students[index % students.length].name} size bir mesaj gönderdi.`,
      link: `/messages?userId=${students[index % students.length].id}`,
    })),
  });

  console.log(JSON.stringify({ teachers: teachers.length, students: students.length, listings: teachers.length * 2, reviews: profiles.length * 3, messages: teachers.length }, null, 2));
}

seed()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
