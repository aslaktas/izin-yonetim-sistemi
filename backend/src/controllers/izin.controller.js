const prisma = require('../lib/prisma')
const { isAfter, parseISO, startOfDay } = require('date-fns')

// Tüm izin taleplerini listele
const getIzinler = async (req, res) => {
  try {
    const { durum, kullaniciId } = req.query
    const where = {}
    if (durum) where.durum = durum
    if (kullaniciId) where.kullaniciId = parseInt(kullaniciId)

    const izinler = await prisma.izinTalebi.findMany({
      where,
      include: { kullanici: true },
      orderBy: { olusturuldu: 'desc' }
    })
    res.json({ success: true, data: izinler })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Tek izin talebi
const getIzinById = async (req, res) => {
  try {
    const izin = await prisma.izinTalebi.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { kullanici: true }
    })
    if (!izin) return res.status(404).json({ success: false, error: 'Talep bulunamadı' })
    res.json({ success: true, data: izin })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Yeni izin talebi oluştur
const createIzin = async (req, res) => {
  try {
    const { kullaniciId, izinTuru, baslangic, bitis, aciklama } = req.body

    if (!kullaniciId || !izinTuru || !baslangic || !bitis) {
      return res.status(422).json({ success: false, error: 'Tüm zorunlu alanları doldurun' })
    }

    const bugun = startOfDay(new Date())
    const baslangicDate = startOfDay(parseISO(baslangic))
    const bitisDate = startOfDay(parseISO(bitis))

 
    if (baslangicDate < bugun) {
    return res.status(422).json({ success: false, error: 'Başlangıç tarihi geçmişte olamaz', field: 'baslangic' })
    }

    if (bitisDate < baslangicDate) {
      return res.status(422).json({ success: false, error: 'Bitiş tarihi başlangıçtan önce olamaz', field: 'bitis' })
    }

    const kullanici = await prisma.kullanici.findUnique({ where: { id: parseInt(kullaniciId) } })
    if (!kullanici) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' })

    const izin = await prisma.izinTalebi.create({
      data: {
        kullaniciId: parseInt(kullaniciId),
        izinTuru,
        baslangic: new Date(baslangic),
        bitis: new Date(bitis),
        aciklama: aciklama || null
      },
      include: { kullanici: true }
    })

    res.status(201).json({ success: true, data: izin })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Durum güncelle (Yönetici)
const updateDurum = async (req, res) => {
  try {
    const { durum } = req.body
    const gecerliDurumlar = ['ONAYLANDI', 'REDDEDILDI']

    if (!gecerliDurumlar.includes(durum)) {
      return res.status(422).json({ success: false, error: 'Geçersiz durum. ONAYLANDI veya REDDEDILDI olmalı' })
    }

    const izin = await prisma.izinTalebi.findUnique({ where: { id: parseInt(req.params.id) } })
    if (!izin) return res.status(404).json({ success: false, error: 'Talep bulunamadı' })

    const updated = await prisma.izinTalebi.update({
      where: { id: parseInt(req.params.id) },
      data: { durum },
      include: { kullanici: true }
    })

    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Kullanıcı listesi
const getKullanicilar = async (req, res) => {
  try {
    const kullanicilar = await prisma.kullanici.findMany({
      orderBy: { isim: 'asc' }
    })
    res.json({ success: true, data: kullanicilar })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Dashboard özeti
const getDashboard = async (req, res) => {
  try {
    const [toplam, bekleyen, onaylanan, reddedilen] = await Promise.all([
      prisma.izinTalebi.count(),
      prisma.izinTalebi.count({ where: { durum: 'BEKLEMEDE' } }),
      prisma.izinTalebi.count({ where: { durum: 'ONAYLANDI' } }),
      prisma.izinTalebi.count({ where: { durum: 'REDDEDILDI' } }),
    ])
    res.json({ success: true, data: { toplam, bekleyen, onaylanan, reddedilen } })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

module.exports = { getIzinler, getIzinById, createIzin, updateDurum, getKullanicilar, getDashboard }