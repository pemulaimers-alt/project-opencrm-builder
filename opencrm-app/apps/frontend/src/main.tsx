// =============================================================
// Application entry point
// =============================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    'Root element with id="root" not found. Check index.html.'
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
