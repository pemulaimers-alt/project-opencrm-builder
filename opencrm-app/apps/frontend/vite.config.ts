// =============================================================
// OpenCRM Frontend — Vite Config (Phase 1)
//
// Stack: Vite 6 + React 18 + TanStack Start + Tailwind CSS v4
// =============================================================

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

export default defineConfig({
  plugins: [
    // TanStack Router — auto-generates routeTree.gen.ts from src/routes/
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    // React fast-refresh + JSX transform
    react(),
    // Tailwind CSS v4 — Vite-native plugin (no postcss needed)
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 3005,
    // Proxy API and socket calls to backend during dev
    proxy: {
      "/api": {
        target: "http://localhost:3010",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://localhost:3010",
        changeOrigin: true,
      },
      "/health": {
        target: "http://localhost:3010",
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
