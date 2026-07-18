"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Star, BookOpen, Clock, ShieldCheck } from "lucide-react";

export type PopularTeacher = {
  id: string;
  name: string;
  subject: string;
  price: number;
  averageRating: number;
  reviewCount: number;
};

export type Testimonial = {
  id: string;
  text: string;
  author: string;
  role: string;
};

interface HomeClientProps {
  popularTeachers: PopularTeacher[];
  testimonials: Testimonial[];
}

export function HomeClient({ popularTeachers, testimonials }: HomeClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-100 via-white to-white dark:from-neutral-900 dark:via-black dark:to-black"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center px-4 max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Öğrenmenin <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-500 to-black dark:from-neutral-400 dark:to-white">En Hızlı</span> Yolu
          </h1>
          <p className="text-lg md:text-xl text-neutral-500 dark:text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Alanında uzman öğretmenlerle birebir çalışın. Karmaşadan uzak, güvenilir ve size en uygun özel ders eşleşmesini saniyeler içinde yapın.
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto bg-white dark:bg-neutral-900/50 backdrop-blur-md p-2 md:p-3 rounded-full border border-neutral-200 dark:border-neutral-800 shadow-xl dark:shadow-2xl flex items-center mb-8 relative z-10 group transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
            <Search className="text-neutral-400 ml-4 hidden sm:block" size={24} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Örn: LGS Matematik, Lise Fizik, Yabancı Dil..."
              className="flex-1 bg-transparent px-4 sm:px-6 py-3 outline-none text-lg text-foreground placeholder:text-neutral-400"
            />
            <button 
              type="submit"
              className="bg-orange-500 text-white px-6 sm:px-10 py-3 rounded-full font-medium transition-transform hover:bg-orange-600 hover:scale-[1.02] active:scale-95"
            >
              Bul
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-3">
            {["Matematik", "İngilizce", "Fizik", "Kimya", "YKS", "LGS"].map((tag, i) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
              >
                <Link 
                  href={`/search?q=${tag}`}
                  className="px-4 py-2 rounded-full text-sm border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-orange-500 dark:hover:border-orange-400 transition-colors bg-white/50 dark:bg-black/50 backdrop-blur-sm"
                >
                  {tag}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-900/20 border-y border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-10">
          {[
            { icon: ShieldCheck, title: "Güvenilir Eğitmenler", desc: "Tüm öğretmenlerimiz detaylı bir onay sürecinden geçer." },
            { icon: Clock, title: "Hızlı Eşleşme", desc: "Aradığınız kritere uygun öğretmeni saniyeler içinde bulun." },
            { icon: BookOpen, title: "Kaliteli Eğitim", desc: "Sadece alanında gerçekten uzmanlaşmış kişilerle çalışın." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                <feature.icon size={32} />
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-neutral-500 dark:text-neutral-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular Teachers Section */}
      <section className="py-20 max-w-6xl mx-auto px-4 w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Popüler Öğretmenler</h2>
            <p className="text-neutral-500 dark:text-neutral-400">Bu haftanın en çok tercih edilen eğitmenleri.</p>
          </div>
          <Link href="/search" className="text-sm font-medium hover:underline hidden sm:block">
            Tümünü Gör &rarr;
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {popularTeachers.length === 0 ? (
            <div className="col-span-full text-center py-10 text-neutral-500">
              Henüz değerlendirilmiş öğretmen bulunmuyor.
            </div>
          ) : popularTeachers.map((teacher, i) => (
            <motion.div 
              key={teacher.id}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm cursor-pointer"
              onClick={() => router.push(`/teacher/${teacher.id}`)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xl uppercase">
                  {teacher.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{teacher.name}</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">{teacher.subject}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div className="font-semibold">{teacher.price} ₺<span className="text-sm text-neutral-500 font-normal">/saat</span></div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Star className="fill-yellow-400 text-yellow-400" size={16} />
                  {teacher.averageRating.toFixed(1)} <span className="text-neutral-400">({teacher.reviewCount})</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-black text-white dark:bg-white dark:text-black mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Ne Dediler?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.length === 0 ? (
              <div className="col-span-full text-center py-10 text-neutral-400">
                Henüz yorum yapılmamış.
              </div>
            ) : testimonials.map((t, i) => (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-neutral-900 dark:bg-neutral-100 p-8 rounded-2xl text-left"
              >
                <p className="text-neutral-300 dark:text-neutral-700 text-lg italic mb-6">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="font-bold">{t.author}</div>
                  <div className="text-sm text-neutral-500">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
