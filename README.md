# Toko Akun Rehan v1.0 (final)

Stack: Next.js 15, React 19, Neon Postgres, Framer Motion, QRIS AriesPay, deploy GitHub + Vercel.

Environment Variables di Vercel:
- DATABASE_URL (otomatis dari Neon)  WAJIB
- GMAIL_USER, GMAIL_APP_PASSWORD     WAJIB untuk OTP daftar dan lupa password
- JWT_SECRET                         disarankan (teks acak panjang)
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SITE_URL   untuk login Google
- BLOB_READ_WRITE_TOKEN              opsional (foto tetap jalan tanpa Blob)
- DISCORD_WEBHOOK_URL                opsional (bisa diisi dari Admin)

Merchant ID dan Secret Key AriesPay, biaya layanan, dan webhook Discord diisi dari Admin, menu Bayar.
Webhook AriesPay: https://DOMAIN/api/webhook
Login admin: username admin_rehan atau Gmail admin.
