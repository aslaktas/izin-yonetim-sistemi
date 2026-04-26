import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getIzinler, updateDurum, getDashboard } from '../services/api'

interface Kullanici {
  id: number
  isim: string
  departman: string
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

interface Dashboard {
  toplam: number
  bekleyen: number
  onaylanan: number
  reddedilen: number
}

const izinTurleri: Record<string, string> = {
  YILLIK_IZIN: 'Yıllık İzin',
  HASTALIK: 'Hastalık',
  DOGUM: 'Doğum',
  UCRETSIZ: 'Ücretsiz',
  MAZERET: 'Mazeret',
}

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

export default function YoneticiPage() {
  const navigate = useNavigate()
  const [izinler, setIzinler] = useState<IzinTalebi[]>([])
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [filtre, setFiltre] = useState('')
  const [modal, setModal] = useState<{ id: number; tip: 'ONAYLANDI' | 'REDDEDILDI' } | null>(null)
  const [yukleniyor, setYukleniyor] = useState<number | null>(null)

  const verileriYukle = async () => {
    const params = filtre ? { durum: filtre } : {}
    const [izinRes, dashRes] = await Promise.all([
      getIzinler(params),
      getDashboard()
    ])
    setIzinler(izinRes.data.data)
    setDashboard(dashRes.data.data)
  }

  useEffect(() => {
    verileriYukle()
  }, [filtre])

  const handleKarar = async () => {
    if (!modal) return
    setYukleniyor(modal.id)
    try {
      await updateDurum(modal.id, modal.tip)
      toast.success(modal.tip === 'ONAYLANDI' ? '✅ Talep onaylandı!' : '❌ Talep reddedildi!')
      setModal(null)
      await verileriYukle()
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Bir hata oluştu')
    } finally {
      setYukleniyor(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1E3A5F] text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">İzin Yönetim Sistemi</h1>
          <p className="text-sm text-blue-200">Yönetici Ekranı</p>
        </div>
        <button
          onClick={() => navigate('/personel')}
          className="bg-[#2E86C1] hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          ← Personel Görünümü
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Dashboard Kartları */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <p className="text-3xl font-bold text-gray-800">{dashboard.toplam}</p>
              <p className="text-sm text-gray-500 mt-1">Toplam Talep</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <p className="text-3xl font-bold text-yellow-500">{dashboard.bekleyen}</p>
              <p className="text-sm text-gray-500 mt-1">⏳ Bekleyen</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <p className="text-3xl font-bold text-green-500">{dashboard.onaylanan}</p>
              <p className="text-sm text-gray-500 mt-1">✅ Onaylanan</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <p className="text-3xl font-bold text-red-500">{dashboard.reddedilen}</p>
              <p className="text-sm text-gray-500 mt-1">❌ Reddedilen</p>
            </div>
          </div>
        )}

        {/* Filtre */}
        <div className="bg-white rounded-xl shadow p-4 flex gap-3">
          {['', 'BEKLEMEDE', 'ONAYLANDI', 'REDDEDILDI'].map(d => (
            <button
              key={d}
              onClick={() => setFiltre(d)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                filtre === d
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {d === '' ? 'Tümü' : durumLabel(d)}
            </button>
          ))}
        </div>

        {/* Tablo */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">İzin Talepleri</h2>
          {izinler.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Bu filtreye ait talep bulunmuyor.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Çalışan</th>
                    <th className="pb-2 font-medium">Departman</th>
                    <th className="pb-2 font-medium">İzin Türü</th>
                    <th className="pb-2 font-medium">Başlangıç</th>
                    <th className="pb-2 font-medium">Bitiş</th>
                    <th className="pb-2 font-medium">Gün</th>
                    <th className="pb-2 font-medium">Durum</th>
                    <th className="pb-2 font-medium">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {izinler.map(izin => (
                    <tr key={izin.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium">{izin.kullanici.isim}</td>
                      <td className="py-3 text-gray-500">{izin.kullanici.departman}</td>
                      <td className="py-3">{izinTurleri[izin.izinTuru]}</td>
                      <td className="py-3">{new Date(izin.baslangic).toLocaleDateString('tr-TR')}</td>
                      <td className="py-3">{new Date(izin.bitis).toLocaleDateString('tr-TR')}</td>
                      <td className="py-3">{gunFarki(izin.baslangic, izin.bitis)} gün</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${durumBadge(izin.durum)}`}>
                          {durumLabel(izin.durum)}
                        </span>
                      </td>
                      <td className="py-3">
                        {izin.durum === 'BEKLEMEDE' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setModal({ id: izin.id, tip: 'ONAYLANDI' })}
                              disabled={yukleniyor === izin.id}
                              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-3 py-1 rounded text-xs transition"
                            >
                              Onayla
                            </button>
                            <button
                              onClick={() => setModal({ id: izin.id, tip: 'REDDEDILDI' })}
                              disabled={yukleniyor === izin.id}
                              className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-1 rounded text-xs transition"
                            >
                              Reddet
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Onay Modalı */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {modal.tip === 'ONAYLANDI' ? '✅ Talebi Onayla' : '❌ Talebi Reddet'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Bu işlemi geri alamazsınız. Devam etmek istiyor musunuz?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                İptal
              </button>
              <button
                onClick={handleKarar}
                className={`px-4 py-2 text-sm text-white rounded-lg transition ${
                  modal.tip === 'ONAYLANDI'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Evet, {modal.tip === 'ONAYLANDI' ? 'Onayla' : 'Reddet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}