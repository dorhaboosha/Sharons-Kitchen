import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { InventoryPage } from '../pages/InventoryPage'

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InventoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
