import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export const getKullanicilar = () => api.get('/kullanicilar')
export const getIzinler = (params?: Record<string, string>) => api.get('/izinler', { params })
export const createIzin = (data: object) => api.post('/izin-talep', data)
export const updateDurum = (id: number, durum: string) => api.put(`/izin-durum/${id}`, { durum })
export const getDashboard = () => api.get('/dashboard/ozet')

export default api