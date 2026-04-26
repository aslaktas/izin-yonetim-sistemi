import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getKullanicilar, getIzinler, createIzin } from '../services/api'

interface Kullanici {
  id: number
  isim: string
  departman: string
  rol: string
}

interface IzinTalebi {
  id: number
  izinTuru: string
  baslangic: string
  bitis: string
  aciklama?: string
  durum: string
  olusturuldu: string
  kullanici: Kullanici
}

const izinTurleri = [
  { value: 'YILLIK_IZIN', label: 'Yıllık İzin' },
  { value: 'HASTALIK', label: 'Hastalık' },
  { value: 'DOGUM', label: 'Doğum' },
  { value: 'UCRETSIZ', label: 'Ücretsiz' },
  { value: 'MAZERET', label: 'Mazeret' },
]

const durumBadge = (durum: string) => {
  if (durum === 'BEKLEMEDE') return 'bg-yellow-100 text-yellow-800'
  if (durum === 'ONAYLANDI') return 'bg-green-100 text-green-800'
  return 'bg-red-100 text-red-800'
}

const durumLabel = (durum: string) => {
  if (durum === 'BEKLEMEDE') return '⏳ Beklemede'
  if (durum === 'ONAYLANDI') return '✅ Onaylandı'
  return '❌ Reddedildi'
}

const gunFarki = (baslangic: string, bitis: string) => {
  const b = new Date(baslangic)
  const e = new Date(bitis)
  return Math.ceil((e.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export default function PersonelPage() {
  const navigate = useNavigate()
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>([])
  const [izinler, setIzinler] = useState<IzinTalebi[]>([])
  const [seciliKullanici, setSeciliKullanici] = useState('')
  const [form, setForm] = useState({
    izinTuru: '',
    baslangic: '',
    bitis: '',
    aciklama: '',
  })
  const [yukleniyor, setYukleniyor] = useState(false)

  useEffect(() => {
    getKullanicilar().then(r => setKullanicilar(r.data.data.filter((k: Kullanici) => k.rol === 'PERSONEL')))
  }, [])

  useEffect(() => {
    if (!seciliKullanici) return
    getIzinler({ kullaniciId: seciliKullanici }).then(r => setIzinler(r.data.data))
  }, [seciliKullanici])

  const handleSubmit = async () => {
    if (!seciliKullanici || !form.izinTuru || !form.baslangic || !form.bitis) {
      toast.error('Lütfen tüm zorunlu alanları doldurun')
      return
    }
    setYukleniyor(true)
    try {
      await createIzin({ kullaniciId: parseInt(seciliKullanici), ...form })
      toast.success('İzin talebi oluşturuldu!')
      setForm({ izinTuru: '', baslangic: '', bitis: '', aciklama: '' })
      const r = await getIzinler({ kullaniciId: seciliKullanici })
      setIzinler(r.data.data)
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Bir hata oluştu')
    } finally {
      setYukleniyor(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1E3A5F] text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">İzin Yönetim Sistemi</h1>
          <p className="text-sm text-blue-200">Personel Ekranı</p>
        </div>
        <button
          onClick={() => navigate('/yonetici')}
          className="bg-[#2E86C1] hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          Yönetici Görünümü →
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Form */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">İzin Talebi Oluştur</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Çalışan *</label>
              <select
                value={seciliKullanici}
                onChange={e => setSeciliKullanici(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Çalışan seçin...</option>
                {kullanicilar.map(k => (
                  <option key={k.id} value={k.id}>{k.isim} — {k.departman}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İzin Türü *</label>
              <select
                value={form.izinTuru}
                onChange={e => setForm({ ...form, izinTuru: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">İzin türü seçin...</option>
                {izinTurleri.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi *</label>
              <input
                type="date"
                value={form.baslangic}
                onChange={e => setForm({ ...form, baslangic: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi *</label>
              <input
                type="date"
                value={form.bitis}
                onChange={e => setForm({ ...form, bitis: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea
                value={form.aciklama}
                onChange={e => setForm({ ...form, aciklama: e.target.value })}
                rows={3}
                placeholder="Opsiyonel açıklama..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={yukleniyor}
            className="mt-4 bg-[#1E3A5F] hover:bg-[#2E86C1] disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
          >
            {yukleniyor ? 'Gönderiliyor...' : 'Talep Gönder'}
          </button>
        </div>

        {/* Tablo */}
        {seciliKullanici && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Taleplerim</h2>
            {izinler.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Henüz izin talebiniz bulunmuyor.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2 font-medium">İzin Türü</th>
                      <th className="pb-2 font-medium">Başlangıç</th>
                      <th className="pb-2 font-medium">Bitiş</th>
                      <th className="pb-2 font-medium">Gün</th>
                      <th className="pb-2 font-medium">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {izinler.map(izin => (
                      <tr key={izin.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3">{izinTurleri.find(t => t.value === izin.izinTuru)?.label}</td>
                        <td className="py-3">{new Date(izin.baslangic).toLocaleDateString('tr-TR')}</td>
                        <td className="py-3">{new Date(izin.bitis).toLocaleDateString('tr-TR')}</td>
                        <td className="py-3">{gunFarki(izin.baslangic, izin.bitis)} gün</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${durumBadge(izin.durum)}`}>
                            {durumLabel(izin.durum)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}