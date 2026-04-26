require('dotenv').config()
const express = require('express')
const cors = require('cors')
const izinRoutes = require('./routes/izin.routes')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/api/healthcheck', (req, res) => {
  res.json({ status: 'ok', message: 'Sunucu çalışıyor' })
})

app.use('/api', izinRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, error: 'Sunucu hatası' })
})

app.listen(PORT, () => {
  console.log(`✅ Sunucu http://localhost:${PORT} adresinde çalışıyor`)
})