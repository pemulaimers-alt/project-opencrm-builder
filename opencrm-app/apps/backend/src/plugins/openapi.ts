// =============================================================
// OpenAPI / Swagger Plugin (Phase 3)
//
// Auto-generated API documentation at /docs.
// =============================================================

import { Elysia } from "elysia";
import swagger from "@elysiajs/swagger";

export const openApiPlugin = new Elysia({ name: "openapi" }).use(
  swagger({
    path: "/docs",
    documentation: {
      info: {
        title: "OpenCRM API",
        version: "0.1.0",
        description: "OpenCRM backend API — omnichannel CRM platform",
      },
      tags: [
        { name: "Auth", description: "Authentication and session management" },
        { name: "User", description: "User profile management" },
        { name: "Team", description: "Team management" },
        { name: "Customer", description: "Customer/account management" },
        { name: "Contact", description: "Contact management" },
        { name: "Deal", description: "Sales pipeline and deals" },
        { name: "Activity", description: "Activity tracking" },
      ],
    },
  })
);
