-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('PERSONEL', 'YONETICI');

-- CreateEnum
CREATE TYPE "IzinTuru" AS ENUM ('YILLIK_IZIN', 'HASTALIK', 'DOGUM', 'UCRETSIZ', 'MAZERET');

-- CreateEnum
CREATE TYPE "Durum" AS ENUM ('BEKLEMEDE', 'ONAYLANDI', 'REDDEDILDI');

-- CreateTable
CREATE TABLE "Kullanici" (
    "id" SERIAL NOT NULL,
    "isim" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "departman" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'PERSONEL',
    "olusturuldu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kullanici_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IzinTalebi" (
    "id" SERIAL NOT NULL,
    "kullaniciId" INTEGER NOT NULL,
    "izinTuru" "IzinTuru" NOT NULL,
    "baslangic" TIMESTAMP(3) NOT NULL,
    "bitis" TIMESTAMP(3) NOT NULL,
    "aciklama" TEXT,
    "durum" "Durum" NOT NULL DEFAULT 'BEKLEMEDE',
    "olusturuldu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellendi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IzinTalebi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kullanici_email_key" ON "Kullanici"("email");

-- AddForeignKey
ALTER TABLE "IzinTalebi" ADD CONSTRAINT "IzinTalebi_kullaniciId_fkey" FOREIGN KEY ("kullaniciId") REFERENCES "Kullanici"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
