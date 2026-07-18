# Dokploy production deployment

1. Dokploy'de ayrı `staging` ve `production` environment'ları oluşturun.
2. Bu depoyu Docker Compose servisi olarak bağlayın ve her environment için `.env.production.example` içindeki değişkenleri Dokploy Variables ekranından girin.
3. Dokploy Domains ile `ozeldersal.com` ve `www.ozeldersal.com` alan adlarını bağlayın; TLS sertifikasını Dokploy/Traefik yönetsin. Uygulama portunu internete doğrudan açmayın.
4. İlk kez mevcut bir veritabanına geçiş yapıyorsanız, şemayı ve yedeği doğruladıktan sonra başlangıç migration'ını Prisma'ya tanıtın:

   ```sh
   npx prisma migrate resolve --applied 20260718160000_init
   ```

   Boş bir üretim veritabanında bu adıma gerek yoktur; container başlangıcında `prisma migrate deploy` migration'ı uygular.
5. GitHub Actions kontrolleri başarılı olduktan sonra yalnızca `main` dalını production'a otomatik deploy edin. Önce staging'e deploy edip `/api/health` kontrolünü doğrulayın.

## Uygulama dışı zorunlu adımlar

- Yedekleme ve geri yükleme tatbikatı için PostgreSQL sağlayıcısında günlük yedekleme tanımlayın.
- E-posta doğrulama ve şifre sıfırlama için bir e-posta sağlayıcısı seçin.
- Kullanıcı fotoğraflarını kalıcı nesne depolamaya (S3/R2 vb.) taşıyın; yerel `uploads` volume'u tek sunucu için geçici bir ara çözümdür.
- Hata izleme, uptime uyarısı ve merkezi loglama sağlayıcısı bağlayın.
