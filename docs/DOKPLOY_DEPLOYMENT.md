# Dokploy production deployment

1. Dokploy'de ayrı `staging` ve `production` environment'ları oluşturun.
2. Bu depoyu Docker Compose servisi olarak bağlayın ve her environment için `.env.production.example` içindeki değişkenleri Dokploy Variables ekranından girin.
3. Dokploy Domains ile `ozeldersal.com` ve `www.ozeldersal.com` alan adlarını bağlayın; TLS sertifikasını Dokploy/Traefik yönetsin. Uygulama portunu internete doğrudan açmayın.
4. İlk kez mevcut bir veritabanına geçiş yapıyorsanız, şemayı ve yedeği doğruladıktan sonra başlangıç migration'ını Prisma'ya tanıtın:

   ```sh
   npx prisma migrate resolve --applied 20260718160000_init
   ```

   Boş bir üretim veritabanında bu adıma gerek yoktur; container başlangıcında `prisma migrate deploy` migration'ı uygular.
5. Dokploy'de **Auto Deploy** açıkken, Dokploy'un Webhook URL'sini GitHub deposunda **Settings → Webhooks** bölümüne ekleyin. `application/json`, yalnızca `push` olayı ve SSL doğrulaması seçili kalmalıdır. Dokploy'deki dal ile GitHub webhook'unu tetikleyen dalın `main` olduğundan emin olun. GitHub Actions kalite kontrollerini ayrı çalıştırır; deploy tetikleyicisi GitHub webhook'udur.
6. Önce staging'e deploy edip `/api/health` kontrolünü doğrulayın.

## Uygulama dışı zorunlu adımlar

- Dokploy Domains üzerinden `ozeldersal.com` ve `www.ozeldersal.com` için TLS sertifikasının **Issued/Active** olduğunu kontrol edin; HTTP'yi HTTPS'e yönlendirin.
- PostgreSQL sağlayıcısında günlük yedekleme, en az 30 gün saklama ve üç ayda bir geri yükleme tatbikatı tanımlayın. Geri yükleme sonucu `/api/health` ile doğrulanmalıdır.
- Resend hesabında doğrulanmış gönderen alan adı oluşturun ve Dokploy Variables'a `EMAIL_FROM`, `RESEND_API_KEY` ekleyin. E-posta doğrulama ve şifre sıfırlama bu değişkenler olmadan production'da bilinçli olarak çalışmaz.
- R2/S3 bucket, sınırlı erişimli API anahtarı ve CDN özel alan adını oluşturun; `S3_*` değişkenlerini Dokploy'a girin. Uygulama bu değişkenler mevcutsa yeni fotoğrafları nesne depolamasına yükler. Antivirüs taraması için bucket olayını ClamAV/Lambda veya eşdeğeri bir tarama servisine bağlayın; temiz olmayan nesneleri yayınlamayın.
- Uptime uyarısı için en az 1 dakikada bir `https://ozeldersal.com/api/health` kontrolü, merkezi hata takibi için Sentry (veya eşdeğeri), loglar için Dokploy log forwarder/sağlayıcı yapılandırın.
- `ADMIN_EMAILS` içine yalnızca yetkili moderatör e-postalarını ekleyin. Moderasyon kuyruğu `/admin` yolundadır; tüm kararlar `AuditLog` tablosuna yazılır.
- Dokploy'de **Auto Deploy** açık, GitHub repository webhook'u `push` olayı için aktif ve Dokploy dalı `main` olmalıdır. GitHub webhook teslimatı ile yeni deployment kaydını birlikte doğrulayın.
