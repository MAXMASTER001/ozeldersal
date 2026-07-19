# Production runbook

Bu kontrol listesi, `main` dalına gelen her sürümün canlıya güvenle alınması için kullanılır.

## GitHub ve dağıtım akışı

Dokploy GitHub webhook'u `push` anında deploy başlatır; webhook CI sonucunu beklemez. Bu nedenle GitHub'da `main` için bir ruleset/branch protection oluşturun:

- yalnızca pull request ile birleştirme;
- gerekli durum kontrolü: `quality`;
- güncel dalın tekrar onayı ve en az bir onay;
- doğrudan push'u ve force push'u engelleme;
- yönetici hesapları da kurala tabi olsun.

Staging için ayrı Dokploy uygulaması ve `staging` dalı kullanın. Staging webhook'u sadece `staging` dalını, production webhook'u sadece korumalı `main` dalını dinlemelidir.

## Her sürüm öncesi

1. GitHub Actions `quality` işi yeşil: migration, lint, test ve build tamam.
2. Staging'de `/api/health` HTTP 200 dönüyor.
3. Kayıt, e-posta doğrulama, giriş, şifre sıfırlama ve fotoğraf yükleme smoke testi tamam.
4. `NEXTAUTH_URL=https://www.ozeldersal.net`; `PRISMA_BASELINE_EXISTING_DB` değişkeni yok veya `false`.
5. Production deploy sonrasında Dokploy loglarında migration hatası veya tekrar başlatma yok.

## Production altyapı kontrolü

- Dokploy Domains: `www.ozeldersal.net` TLS sertifikası **Issued/Active**, HTTP HTTPS'e yönleniyor.
- PostgreSQL dış dünyaya yayınlanmıyor; güçlü parolalar yalnızca Dokploy secrets içinde.
- Günlük yedekleme, en az 30 gün saklama, geri yükleme tatbikatı her üç ayda bir.
- Uptime monitörü: `https://www.ozeldersal.net/api/health`, 1 dakika aralık ve en az iki sorumluya uyarı.
- Sentry veya eşdeğeri hata takibi, Dokploy log forwarding ve uyarı kanalı yapılandırılmış.
- Brevo'da Dokploy çıkış IP'si yetkili; gönderen alan adı doğrulanmış.

## Geri alma

1. Dokploy'da son çalışan deployment'ı yeniden deploy edin.
2. Sorun migration kaynaklıysa yeni migration'ı geri alacak ayrı bir ileri migration hazırlayın; production veritabanında şema silme veya `db push --accept-data-loss` kullanmayın.
3. `/api/health`, giriş ve öğretmen araması ile smoke testi yapın.
4. Olayı, etkiyi ve alınan aksiyonu denetim kaydına/olay günlüğüne yazın.
