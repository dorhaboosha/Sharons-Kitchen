import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import { InventoryPage } from '../pages/InventoryPage'
import bgTheme from '../assets/background_theme.png'

const BG_OVERLAY = `linear-gradient(rgba(255,255,255,0.35), rgba(255,255,255,0.35)), url(${bgTheme})`

export function Router() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Box minH="100vh" bgImage={BG_OVERLAY} bgRepeat="no-repeat"
        bgSize={{ base: "100% 100%", md: "cover" }}
        bgPosition="center"
        bgAttachment={{ base: "scroll", md: "fixed" }}>
        <Routes>
          <Route path="/" element={<InventoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </BrowserRouter>
  )
}
