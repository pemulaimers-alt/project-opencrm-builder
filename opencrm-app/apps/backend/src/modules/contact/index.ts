// =============================================================
// Contact Module Routes (Phase 3)
// =============================================================

import { Elysia, t } from "elysia";
import { requireAuth } from "../../plugins/require-auth";
import { ContactService } from "./service";

export const contactModule = new Elysia({ name: "module:contact", prefix: "/contacts" })
  .use(requireAuth)

  .get("/", async ({ appUuid, query }) => {
    const contacts = await ContactService.list(appUuid, { q: query.q });
    return { data: contacts };
  }, { query: t.Object({ q: t.Optional(t.String()), appId: t.Optional(t.String()) }) })

  .get("/:id", async ({ params, set }) => {
    const contact = await ContactService.getById(params.id);
    if (!contact) {
      set.status = 404;
      return { error: "Contact not found" };
    }
    return { data: contact };
  }, { params: t.Object({ id: t.String() }) })

  .post("/", async ({ body, appUuid }) => {
    const contact = await ContactService.create({
      firstName: body.name || body.firstName || "",
      lastName: body.lastName,
      email: body.email,
      phone: body.phone || body.phone_number,
      jobTitle: body.jobTitle,
      customerId: body.customerId,
      appId: appUuid,
    });
    return { data: contact };
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
      email: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      phone_number: t.Optional(t.String()),
      jobTitle: t.Optional(t.String()),
      customerId: t.String(),
    }),
  })

  .patch("/:id", async ({ params, body, set }) => {
    try {
      const contact = await ContactService.update(params.id, {
        ...(body.name && { firstName: body.name }),
        ...(body.firstName && { firstName: body.firstName }),
        ...(body.lastName !== undefined && { lastName: body.lastName }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.phone_number !== undefined && { phone: body.phone_number }),
        ...(body.jobTitle !== undefined && { jobTitle: body.jobTitle }),
      });
      return { data: contact };
    } catch {
      set.status = 404;
      return { error: "Contact not found" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.Optional(t.String()),
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
      email: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      phone_number: t.Optional(t.String()),
      jobTitle: t.Optional(t.String()),
    }),
  })

  .delete("/:id", async ({ params, set }) => {
    try {
      await ContactService.delete(params.id);
      return { success: true };
    } catch {
      set.status = 404;
      return { error: "Contact not found" };
    }
  }, { params: t.Object({ id: t.String() }) });
