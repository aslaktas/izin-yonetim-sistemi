# Personel İzin Yönetim Sistemi

Pratech GOREV-2 — Fullstack İzin Talep & Onay Uygulaması

## Teknolojiler
- **Backend:** Node.js, Express.js, Prisma ORM
- **Veritabanı:** Supabase (PostgreSQL)
- **Frontend:** React, Vite, Tailwind CSS

## Kurulum

### Backend
```bash
cd backend
npm install
cp .env.example .env   # DATABASE_URL'i doldur
npx prisma migrate dev --name init
npx prisma db seed     # Örnek veri
npm run dev            # http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## Ekranlar
- `/` → Personel ekranı (izin talebi oluştur + geçmiş talepler)
- `/yonetici` → Yönetici ekranı (tüm talepler + onayla/reddet)

## API Endpointleri
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/healthcheck | Sunucu kontrolü |
| GET | /api/kullanicilar | Kullanıcı listesi |
| POST | /api/izin-talep | Yeni izin talebi |
| GET | /api/izinler | Tüm talepler |
| PUT | /api/izin-durum/:id | Onayla / Reddet |
| GET | /api/dashboard/ozet | Dashboard istatistikleri |
