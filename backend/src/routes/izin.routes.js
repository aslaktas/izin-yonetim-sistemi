const express = require('express')
const router = express.Router()
const {
  getIzinler,
  getIzinById,
  createIzin,
  updateDurum,
  getKullanicilar,
  getDashboard
} = require('../controllers/izin.controller')

router.get('/izinler', getIzinler)
router.get('/izinler/:id', getIzinById)
router.post('/izin-talep', createIzin)
router.put('/izin-durum/:id', updateDurum)
router.get('/kullanicilar', getKullanicilar)
router.get('/dashboard/ozet', getDashboard)

module.exports = router