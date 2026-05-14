// =============================================================
// OpenCRM Backend — Entrypoint (Phase 3 — Step 2)
//
// Per builder contract (backend/blueprint.md) plugin order:
//   1. new Elysia({ name: 'opencrm' })
//   2. .use(cors({ ... }))
//   3. .use(appContext)         → global derive: userId, appUuid, orgSlug
//   4. .use(openApiPlugin)     → Swagger/OpenAPI at /docs
//   5. .all('/auth/*', ...)    → Better Auth routes (sign-in, sign-up)
//   6. .group('/api', ...)     → authModule + 6 CRM modules
//   7. .group('/api/v1', ...)  → same modules mirrored for compat
//   8. .listen(PORT)
//
// Deferred to Phase 6:
//   - Socket.IO realtime server
//   - BullMQ workers
//   - Redis connection
// =============================================================

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { appContext, openApiPlugin } from "./plugins";
import { auth } from "./auth";
import {
  authModule,
  userModule,
  teamModule,
  customerModule,
  contactModule,
  dealModule,
  activityModule,
} from "./modules";

const PORT = Number(process.env.PORT ?? 3010);
const NODE_ENV = process.env.NODE_ENV ?? "development";
const APP_MODE = process.env.APP_MODE ?? "api";

// -----------------------------------------------------------
// Multi-mode entry — later phases add worker/scheduler modes
// -----------------------------------------------------------
if (APP_MODE === "worker") {
  console.log("[opencrm] Starting in worker mode (BullMQ — Phase 6)");
  process.exit(0);
}

if (APP_MODE === "scheduler") {
  console.log("[opencrm] Starting in scheduler mode (cron — Phase 6)");
  process.exit(0);
}

// -----------------------------------------------------------
// API mode (default)
// -----------------------------------------------------------
const trustedOrigins = (process.env.TRUSTED_ORIGINS ?? "http://localhost:3005")
  .split(",")
  .map((o) => o.trim());

const app = new Elysia({ name: "opencrm" })
  // 1. CORS
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

  // 2. App context — resolves userId, appUuid, orgSlug on every request
  .use(appContext)

  // 3. OpenAPI / Swagger at /docs
  .use(openApiPlugin)

  // 4. Health check — always available, no auth required
  .get("/health", () => ({
    status: "ok",
    env: NODE_ENV,
    mode: APP_MODE,
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  }))

  // 5. Better Auth routes at root /auth/*
  //    POST /auth/sign-in/email, POST /auth/sign-up/email, etc.
  .all("/auth/*", async ({ request }) => {
    return auth.handler(request);
  })

  // 6. API group — all Phase 3 modules under /api
  .group("/api", (api) =>
    api
      .use(authModule)       // /api/auth/*
      .use(userModule)       // /api/user/*
      .use(teamModule)       // /api/teams/*
      .use(customerModule)   // /api/customers/*
      .use(contactModule)    // /api/contacts/*
      .use(dealModule)       // /api/crm/*
      .use(activityModule)   // /api/activities/*
  )

  // 7. API v1 mirror — per builder contract, most modules are mirrored
  .group("/api/v1", (api) =>
    api
      .use(authModule)       // /api/v1/auth/*
      .use(userModule)       // /api/v1/user/*
      .use(teamModule)       // /api/v1/teams/*
      .use(customerModule)   // /api/v1/customers/*
      .use(contactModule)    // /api/v1/contacts/*
      .use(dealModule)       // /api/v1/crm/*
      .use(activityModule)   // /api/v1/activities/*
  )

  .listen(PORT);

console.log(
  `[opencrm] Backend running at http://localhost:${PORT} (${NODE_ENV} / ${APP_MODE})`
);
console.log(`[opencrm] Health check: http://localhost:${PORT}/health`);
console.log(`[opencrm] API docs: http://localhost:${PORT}/docs`);

// Export App type for Eden Treaty (frontend type-safe client)
export type App = typeof app;
