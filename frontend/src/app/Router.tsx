import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box, Center, Spinner } from "@chakra-ui/react";
import { InventoryPage } from "../pages/InventoryPage";
import { LoginGate } from "../features/auth/LoginGate";
import { useAuth } from "./AuthProvider";
import bgTheme from "../assets/background_theme.webp";

const BG_OVERLAY = `linear-gradient(rgba(255,255,255,0.35), rgba(255,255,255,0.35)), url(${bgTheme})`;

export function Router() {
  const { status } = useAuth();

  return (
    <Box
      minH="100vh"
      bgImage={BG_OVERLAY}
      bgRepeat="no-repeat"
      bgSize={{ base: "100% 100%", md: "cover" }}
      bgPosition="center"
      bgAttachment={{ base: "scroll", md: "fixed" }}
    >
      {status === "checking" ? (
        <Center minH="100vh">
          <Spinner size="xl" color="brand.500" thickness="4px" />
        </Center>
      ) : status !== "authenticated" ? (
        <LoginGate />
      ) : (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<InventoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      )}
    </Box>
  );
}
