import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "./theme";
import { AuthProvider } from "./app/AuthProvider";
import { QueryProvider } from "./app/QueryProvider";
import { Router } from "./app/Router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <QueryProvider>
          <Router />
        </QueryProvider>
      </AuthProvider>
    </ChakraProvider>
  </React.StrictMode>,
);
