# PRD: Özel Ders Eşleştirme Platformu

**Doküman Sahibi:** Mehmet
**Versiyon:** 1.0
**Tarih:** 12 Temmuz 2026
**Durum:** Taslak

---

## 1. Özet

Öğretmenlerin kendi profillerini oluşturup özel ders ilanı verebildiği; velilerin ise bu ilanları filtreleyerek arayabildiği, öğretmen profillerini detaylıca inceleyebildiği ve platform üzerinden doğrudan mesajlaşarak iletişime geçebildiği bir eşleştirme platformu.

Piyasadaki mevcut özel ders siteleri (Armut, Özel Ders Al vb.) genellikle kalabalık, reklam yoğun ve karmaşık arayüzlere sahip. Bu platformun temel farklılaşma noktası **radikal minimalizm**: az ama öz bilgi, hızlı karar verme, dağınıklıktan arındırılmış bir deneyim.

---

## 2. Problem Tanımı

### Veli tarafı sorunları
- Doğru öğretmeni bulmak için çok fazla filtre, çok fazla reklam, çok fazla gereksiz bilgiyle boğuşmak zorunda kalıyorlar.
- Öğretmen profillerindeki bilgiler güvenilir/doğrulanmış değil.
- İletişim genelde telefon numarası paylaşımına indirgeniyor, platform içi takip yok.

### Öğretmen tarafı sorunları
- Profil oluşturma süreçleri gereksiz uzun ve karmaşık.
- İlan verme, öne çıkma gibi işlemler ücretli/karmaşık paketlere bağlı.
- Mesajlaşma ve talep yönetimi dağınık (WhatsApp, telefon, site içi mesaj karışık).

### Fırsat
Sade, hızlı, güven veren ve gereksiz gürültüden arındırılmış bir deneyimle her iki taraf için de sürtünmesiz bir eşleştirme akışı sunmak.

---

## 3. Hedef Kitle

| Persona | Tanım | Temel İhtiyaç |
|---|---|---|
| **Veli (Ayşe, 38)** | LGS'ye hazırlanan çocuğu için matematik öğretmeni arıyor | Hızlıca güvenilir, uygun öğretmen bulmak |
| **Öğretmen (Kemal, 29)** | Ek gelir için özel ders vermek istiyor | Kolay profil oluşturma, düzenli talep akışı |
| **Öğrenci (17)** | Kendi de arama yapabilir (opsiyonel, MVP sonrası) | Sınav odaklı destek |

---

## 4. Hedefler ve Başarı Metrikleri

| Hedef | Metrik | Hedef Değer (İlk 6 ay) |
|---|---|---|
| Öğretmen kayıtları | Tamamlanmış profil sayısı | 500 |
| Veli aktivasyonu | İlk mesajı gönderen veli oranı | %35+ |
| Eşleşme kalitesi | Mesajlaşmadan derse geçiş oranı | %20+ |
| Kullanıcı memnuniyeti | Profil oluşturma tamamlama süresi | < 3 dakika |
| Elde tutma | Aylık aktif öğretmen oranı | %60+ |

---

## 5. Kapsam

### 5.1 MVP Kapsamında Olanlar
1. Öğretmen kayıt ve profil oluşturma
2. Özel ders ilanı verme (branş, seviye, konum/online, ücret)
3. Veli tarafında arama ve filtreleme
4. Öğretmen profil detay sayfası
5. Platform içi mesajlaşma (1-1)
6. Temel bildirim sistemi (yeni mesaj, yeni ilan görüntülenme)
7. Basit kimlik/telefon doğrulama

### 5.2 MVP Kapsamı Dışında (Sonraki Fazlar)
- Ödeme/tahsilat entegrasyonu (ders ücreti platform üzerinden alınmayacak, ilk fazda)
- Değerlendirme/yorum sistemi
- Video görüşme entegrasyonu
- Takvim/randevu yönetimi
- Mobil uygulama (native)
- Öğretmen öne çıkarma / reklam modeli

---

## 6. Kullanıcı Hikayeleri (User Stories)

### Öğretmen
- Bir öğretmen olarak, hızlıca kayıt olup branşımı, deneyimimi ve ücretimi belirterek ilan yayınlayabilmeliyim.
- Bir öğretmen olarak, profilime kısa bir tanıtım videosu/metni ve eğitim geçmişimi ekleyebilmeliyim.
- Bir öğretmen olarak, bana gelen mesajları tek bir yerden takip edip yanıtlayabilmeliyim.
- Bir öğretmen olarak, ilanımı istediğim zaman pasif/aktif hale getirebilmeliyim.

### Veli
- Bir veli olarak, branş, sınıf seviyesi, konum (yüz yüze/online) ve bütçeye göre öğretmen arayabilmeliyim.
- Bir veli olarak, öğretmen profilini incelerken deneyim, eğitim bilgisi ve varsa geçmiş yorumları görebilmeliyim.
- Bir veli olarak, beğendiğim öğretmene platform içinden doğrudan mesaj gönderebilmeliyim.
- Bir veli olarak, arama sonuçlarını hızlıca tarayabilmeli, gereksiz bilgi/reklamla karşılaşmamalıyım.

---

## 7. Fonksiyonel Gereksinimler

### 7.1 Kimlik Doğrulama & Onboarding
- E-posta veya telefon ile kayıt
- Öğretmen/Veli rol seçimi (bir kullanıcı ileride her iki rolü de taşıyabilir)
- Telefon numarası SMS doğrulaması (güven unsuru için)
- Öğretmen onboarding akışı max 5 adım, max 3 dakika sürmeli (minimalist prensip)

### 7.2 Öğretmen Profili
Zorunlu alanlar:
- Ad soyad, profil fotoğrafı
- Branş(lar) (Matematik, Fizik, İngilizce vb. — çoklu seçim)
- Hedef seviye (İlkokul, Ortaokul, Lise, Üniversite, KPSS/TYT-AYT/LGS gibi sınav bazlı etiketler)
- Ders şekli: Online / Yüz yüze / Her ikisi
- Konum (yüz yüze ise)
- Saatlik ücret aralığı
- Kısa biyografi (max 300 karakter — minimalizmi korumak için sınır)
- Eğitim geçmişi (üniversite, bölüm, mezuniyet yılı)
- Deneyim yılı

Opsiyonel alanlar:
- Tanıtım videosu linki
- Sertifikalar
- Uygunluk takvimi (haftalık müsaitlik, basit görsel grid)

### 7.3 İlan Yönetimi
- Öğretmen bir veya birden fazla branş için ayrı ilan oluşturabilir
- İlan durumu: Aktif / Pasif
- İlan düzenleme ve silme

### 7.4 Arama ve Filtreleme (Veli tarafı)
- Anahtar filtreler: Branş, seviye, ders şekli, konum, ücret aralığı
- Sıralama: En uygun (relevans), En düşük ücret, En yüksek deneyim
- **Tasarım prensibi:** Filtre paneli sade, en fazla 4-5 ana filtre gösterilecek; "gelişmiş filtreler" ikinci bir katmanda gizlenecek

### 7.5 Öğretmen Profil Detay Sayfası
- Tüm profil bilgileri tek sayfada, gereksiz bölümlere ayrılmadan
- "Mesaj Gönder" birincil aksiyon butonu, sayfanın her yerinden erişilebilir (sticky)

### 7.6 Mesajlaşma
- Gerçek zamanlı veya near-real-time 1-1 mesajlaşma
- Mesaj geçmişi görüntüleme
- Okundu bilgisi (opsiyonel MVP+1)
- Yeni mesaj bildirimi (push/email)
- Spam/kötüye kullanım raporlama butonu

### 7.7 Bildirimler
- Yeni mesaj
- Profil/ilan görüntülenme özeti (haftalık, öğretmenler için)

---

## 8. Fonksiyonel Olmayan Gereksinimler

| Kategori | Gereksinim |
|---|---|
| Performans | Arama sonuçları < 1 saniyede yüklenmeli |
| Güvenlik | KVKK uyumluluğu, kişisel veri şifreleme, telefon numaraları mesajlaşmada gizli tutulur (platform dışına çıkana kadar) |
| Erişilebilirlik | Mobil öncelikli (mobile-first) responsive tasarım |
| Ölçeklenebilirlik | Başlangıçta tek şehir/bölge odaklı, coğrafi genişlemeye uygun mimari |
| Dil | Türkçe (MVP), çoklu dil desteğine uygun altyapı |

---

## 9. Tasarım Prensipleri (Farklılaşma Stratejisi)

Bu platformun rakiplerinden ayrışacağı temel eksen **minimalist UI/UX**:

1. **Az ama öz bilgi mimarisi:** Her ekranda kullanıcının o anki karara odaklanmasını sağlayacak kadar bilgi gösterilir, fazlası "detay göster" ile katmanlanır.
2. **Nötr, sakin görsel dil:** Yoğun renk paletleri, banner reklamlar, pop-up'lar yok. Bol boşluk (whitespace), sade tipografi.
3. **Tek birincil aksiyon:** Her sayfada kullanıcının yapması gereken bir ana eylem net şekilde öne çıkar (örn. profil sayfasında "Mesaj Gönder").
4. **Hızlı tamamlanan akışlar:** Kayıt, ilan oluşturma, arama — hepsi minimum adımda tamamlanır.
5. **Görsel gürültü yok:** Karşılaştırma tabloları, "öne çıkan ilan" rozetleri, aşırı vurgulu CTA yığınları kullanılmaz.

---

## 10. Bilgi Mimarisi (Sayfa Haritası)

```
├── Ana Sayfa (arama kutusu + öne çıkan branşlar)
├── Arama Sonuçları (filtre + öğretmen kart listesi)
├── Öğretmen Profil Detay
├── Öğretmen Onboarding / Profil Düzenleme
├── Mesajlar (gelen kutusu + sohbet detay)
├── Bildirimler
├── Hesap Ayarları
└── Rol Değiştir (Veli ↔ Öğretmen)
```

---

## 11. Teknik Notlar (Öneri — Mehmet'in stack tercihine göre)

- **Frontend:** React (web), gerekirse ileride React Native ile mobil
- **Backend:** Node.js/Express veya .NET (mevcut deneyime göre tercih edilebilir)
- **Veritabanı:** SQL Server veya PostgreSQL — ilişkisel yapı (kullanıcı, ilan, mesaj, filtre ilişkileri) için uygun
- **Mesajlaşma:** WebSocket tabanlı (Socket.io) veya üçüncü parti (Firebase Realtime DB) değerlendirilebilir
- **Doğrulama:** SMS API (Netgsm, İletimerkezi gibi Türkiye odaklı sağlayıcılar) veya Twilio

*Not: Bu bölüm öneri niteliğindedir; teknik mimari kararları ayrı bir teknik tasarım dokümanında detaylandırılmalı.*

---

## 12. Riskler ve Açık Sorular

| Risk/Soru | Not |
|---|---|
| Güven mekanizması olmadan kalite kontrolü nasıl sağlanacak? | MVP'de manuel onay/moderasyon süreci gerekebilir |
| İlk kullanıcı kitlesi (öğretmen tarafı) nasıl toplanacak? | Soğuk başlangıç problemi — belirli bölge/branşa odaklanarak başlanabilir |
| Ödeme platform dışında kalırsa gelir modeli ne olacak? | Freemium (öne çıkan ilan, sınırsız mesaj gibi) modeller ileride değerlendirilebilir |
| Mesajlaşmada telefon numarası paylaşımı nasıl engellenecek/izlenecek? | Basit regex tabanlı filtreleme MVP'de yeterli olabilir |

---

## 13. Fazlandırma Önerisi

**Faz 1 (MVP):** Kayıt, profil, ilan, arama, mesajlaşma
**Faz 2:** Yorum/değerlendirme sistemi, gelişmiş bildirimler, öğretmen takvimi
**Faz 3:** Ödeme entegrasyonu, öne çıkarma modeli, mobil native uygulama
**Faz 4:** Coğrafi genişleme, çoklu dil desteği
