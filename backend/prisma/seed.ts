import { PrismaClient, Rol } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seed başlıyor...')

  // Kullanıcıları oluştur
  const kullanicilar = await Promise.all([
    prisma.kullanici.upsert({
      where: { email: 'ahmet@sirket.com' },
      update: {},
      create: { isim: 'Ahmet Yılmaz', email: 'ahmet@sirket.com', departman: 'Yazılım', rol: Rol.PERSONEL }
    }),
    prisma.kullanici.upsert({
      where: { email: 'ayse@sirket.com' },
      update: {},
      create: { isim: 'Ayşe Kaya', email: 'ayse@sirket.com', departman: 'Tasarım', rol: Rol.PERSONEL }
    }),
    prisma.kullanici.upsert({
      where: { email: 'mehmet@sirket.com' },
      update: {},
      create: { isim: 'Mehmet Demir', email: 'mehmet@sirket.com', departman: 'Yazılım', rol: Rol.PERSONEL }
    }),
    prisma.kullanici.upsert({
      where: { email: 'fatma@sirket.com' },
      update: {},
      create: { isim: 'Fatma Şahin', email: 'fatma@sirket.com', departman: 'İnsan Kaynakları', rol: Rol.PERSONEL }
    }),
    prisma.kullanici.upsert({
      where: { email: 'yonetici@sirket.com' },
      update: {},
      create: { isim: 'Ali Öztürk', email: 'yonetici@sirket.com', departman: 'Yönetim', rol: Rol.YONETICI }
    }),
  ])

  console.log(`✅ ${kullanicilar.length} kullanıcı oluşturuldu`)

  // Örnek izin talepleri
  const bugun = new Date()
  const gelecek = (gun: number) => {
    const d = new Date(bugun)
    d.setDate(d.getDate() + gun)
    return d
  }

  await prisma.izinTalebi.createMany({
    data: [
      {
        kullaniciId: kullanicilar[0].id,
        izinTuru: 'YILLIK_IZIN',
        baslangic: gelecek(5),
        bitis: gelecek(10),
        aciklama: 'Yaz tatili',
        durum: 'BEKLEMEDE'
      },
      {
        kullaniciId: kullanicilar[1].id,
        izinTuru: 'HASTALIK',
        baslangic: gelecek(2),
        bitis: gelecek(4),
        aciklama: 'Doktor raporu mevcut',
        durum: 'ONAYLANDI'
      },
      {
        kullaniciId: kullanicilar[2].id,
        izinTuru: 'MAZERET',
        baslangic: gelecek(1),
        bitis: gelecek(1),
        aciklama: 'Aile ziyareti',
        durum: 'BEKLEMEDE'
      },
      {
        kullaniciId: kullanicilar[3].id,
        izinTuru: 'UCRETSIZ',
        baslangic: gelecek(15),
        bitis: gelecek(20),
        durum: 'REDDEDILDI'
      },
    ]
  })

  console.log('✅ Örnek izin talepleri oluşturuldu')
  console.log('🎉 Seed tamamlandı!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })