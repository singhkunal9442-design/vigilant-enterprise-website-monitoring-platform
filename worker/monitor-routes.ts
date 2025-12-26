import { Hono } from "hono";
import type { Env } from './core-utils';
import { MonitorEntity, UserEntity } from "./entities";
import { ok, bad, isStr } from './core-utils';
export function monitorRoutes(app: Hono<{ Bindings: Env }>) {
  // LIST MONITORS
  app.get('/api/monitors', async (c) => {
    await MonitorEntity.ensureSeed(c.env);
    const page = await MonitorEntity.list(c.env);
    return ok(c, page.items);
  });
  // CREATE MONITOR
  app.post('/api/monitors', async (c) => {
    const body = await c.req.json() as { name: string; url: string; interval?: number };
    if (!isStr(body.name) || !isStr(body.url)) return bad(c, 'name and url required');
    const monitor = await MonitorEntity.create(c.env, {
      id: crypto.randomUUID(),
      name: body.name,
      url: body.url,
      interval: body.interval ?? 5,
      status: 'PENDING',
      history: []
    });
    return ok(c, monitor);
  });
  // DELETE MONITOR
  app.delete('/api/monitors/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await MonitorEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
}