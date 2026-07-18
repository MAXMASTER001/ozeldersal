import "server-only";

type Email = { to: string; subject: string; html: string };

function appUrl() {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

async function sendEmail(email: Email) {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") throw new Error("E-posta sağlayıcısı yapılandırılmamış.");
    console.info(`[development email] To: ${email.to} Subject: ${email.subject}`);
    console.info(email.html.replace(/<[^>]+>/g, " "));
    return;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { email: from, name: process.env.EMAIL_FROM_NAME || "Özeldersal" },
      to: [{ email: email.to }],
      subject: email.subject,
      htmlContent: email.html,
    }),
  });
  if (!response.ok) throw new Error("E-posta gönderilemedi.");
}

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${appUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  await sendEmail({ to, subject: "E-posta adresinizi doğrulayın", html: `<p>Özeldersal hesabınızı etkinleştirmek için bağlantıyı açın:</p><p><a href="${url}">${url}</a></p><p>Bu bağlantı 24 saat geçerlidir.</p>` });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  await sendEmail({ to, subject: "Şifre sıfırlama bağlantısı", html: `<p>Şifrenizi yenilemek için bağlantıyı açın:</p><p><a href="${url}">${url}</a></p><p>Bu bağlantı 30 dakika geçerlidir.</p>` });
}
