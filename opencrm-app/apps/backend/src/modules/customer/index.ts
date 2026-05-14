// =============================================================
// Customer Module Routes (Phase 3)
// =============================================================

import { Elysia, t } from "elysia";
import { requireAuth } from "../../plugins/require-auth";
import { CustomerService } from "./service";

export const customerModule = new Elysia({ name: "module:customer", prefix: "/customers" })
  .use(requireAuth)

  .get("/", async ({ appUuid, query }) => {
    const result = await CustomerService.list(appUuid, {
      page: query.page ? Number(query.page) : undefined,
      limit: query.per_page ? Number(query.per_page) : undefined,
      search: query.search || query.q || undefined,
    });
    return { data: result.data, total: result.total, page: result.page, limit: result.limit };
  }, {
    query: t.Object({
      page: t.Optional(t.String()),
      per_page: t.Optional(t.String()),
      search: t.Optional(t.String()),
      q: t.Optional(t.String()),
    }),
  })

  .get("/:id", async ({ params, set }) => {
    const customer = await CustomerService.getById(params.id);
    if (!customer) {
      set.status = 404;
      return { error: "Customer not found" };
    }
    return { data: customer };
  }, { params: t.Object({ id: t.String() }) })

  .post("/", async ({ body, appUuid }) => {
    const customer = await CustomerService.create({ ...body, appId: appUuid });
    return { data: customer };
  }, {
    body: t.Object({
      name: t.String(),
      email: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      company: t.Optional(t.String()),
      industry: t.Optional(t.String()),
      website: t.Optional(t.String()),
      address: t.Optional(t.String()),
      notes: t.Optional(t.String()),
    }),
  })

  .put("/:id", async ({ params, body, set }) => {
    try {
      const customer = await CustomerService.update(params.id, body);
      return { data: customer };
    } catch {
      set.status = 404;
      return { error: "Customer not found" };
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.Optional(t.String()),
      email: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      company: t.Optional(t.String()),
      industry: t.Optional(t.String()),
      website: t.Optional(t.String()),
      address: t.Optional(t.String()),
      notes: t.Optional(t.String()),
    }),
  })

  .delete("/:id", async ({ params, set }) => {
    try {
      await CustomerService.delete(params.id);
      return { success: true };
    } catch {
      set.status = 404;
      return { error: "Customer not found" };
    }
  }, { params: t.Object({ id: t.String() }) });
