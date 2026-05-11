// =============================================================
// OpenCRM Backend — Entrypoint (Phase 1)
//
// Phase 1 scope:
//   - Elysia app bootstrap
//   - CORS configured
//   - Health check endpoint
//   - Multi-mode skeleton (APP_MODE env)
//
// Deferred to later phases:
//   - Swagger / OpenAPI plugin       (Phase 2)
//   - Prisma / database connection   (Phase 2)
//   - Better Auth / session plugin   (Phase 3)
//   - Domain module routes           (Phase 3+)
//   - Socket.IO realtime server      (Phase 6)
//   - BullMQ workers                 (Phase 6)
//   - Redis connection               (Phase 6)
// =============================================================

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

const PORT = Number(process.env.PORT ?? 3010);
const NODE_ENV = process.env.NODE_ENV ?? "development";
const APP_MODE = process.env.APP_MODE ?? "api";

// -----------------------------------------------------------
// Multi-mode entry — later phases add worker/scheduler modes
// -----------------------------------------------------------
if (APP_MODE === "worker") {
  console.log("[opencrm] Starting in worker mode (BullMQ — Phase 6)");
  // TODO Phase 6: import and start BullMQ workers
  process.exit(0);
}

if (APP_MODE === "scheduler") {
  console.log("[opencrm] Starting in scheduler mode (cron — Phase 6)");
  // TODO Phase 6: import and start scheduler
  process.exit(0);
}

// -----------------------------------------------------------
// API mode (default)
// -----------------------------------------------------------
const trustedOrigins = (process.env.TRUSTED_ORIGINS ?? "http://localhost:3005")
  .split(",")
  .map((o) => o.trim());

const app = new Elysia({ name: "opencrm" })
  // CORS — allow frontend origin(s) from env
  .use(
    cors({
      origin: trustedOrigins,
      credentials: true,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Org-Slug",
        "X-App-Id",
        "X-App-Secret",
      ],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
  )

  // ----------------------------------------------------------
  // Health check — always available, no auth required
  // ----------------------------------------------------------
  .get("/health", () => ({
    status: "ok",
    env: NODE_ENV,
    mode: APP_MODE,
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  }))

  // ----------------------------------------------------------
  // API group placeholder — domain modules mount here (Phase 3+)
  // ----------------------------------------------------------
  .group("/api", (api) =>
    api.get("/ping", () => ({
      message: "OpenCRM API is running",
      phase: "Phase 1 — scaffold only",
    }))
  )

  .listen(PORT);

console.log(
  `[opencrm] Backend running at http://localhost:${PORT} (${NODE_ENV} / ${APP_MODE})`
);
console.log(`[opencrm] Health check: http://localhost:${PORT}/health`);

// Export App type for Eden Treaty (frontend type-safe client)
export type App = typeof app;
