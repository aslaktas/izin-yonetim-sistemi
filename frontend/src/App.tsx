import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import PersonelPage from './pages/PersonelPage'
import YoneticiPage from './pages/YoneticiPage'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/personel" />} />
        <Route path="/personel" element={<PersonelPage />} />
        <Route path="/yonetici" element={<YoneticiPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App