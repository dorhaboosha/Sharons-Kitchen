import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { InventoryPage } from '../pages/InventoryPage'

export function Router() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<InventoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
