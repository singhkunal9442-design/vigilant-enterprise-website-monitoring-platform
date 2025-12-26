import { Hono } from "hono";
import type { Env } from './core-utils';
import { MonitorEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { runSingleCheck, performGlobalCheck } from "./monitor-engine";
export function monitorRoutes(app: Hono<{ Bindings: Env }>) {
  // LIST MONITORS
  app.get('/api/monitors', async (c) => {
    await MonitorEntity.ensureSeed(c.env);
    const page = await MonitorEntity.list(c.env);
    return ok(c, page.items);
  });
  // GET MONITOR DETAIL
  app.get('/api/monitors/:id', async (c) => {
    const id = c.req.param('id');
    const entity = new MonitorEntity(c.env, id);
    if (!await entity.exists()) return notFound(c, 'Monitor not found');
    const state = await entity.getState();
    return ok(c, state);
  });
  // CREATE MONITOR
  app.post('/api/monitors', async (c) => {
    const body = await c.req.json() as { name: string; url: string; interval?: number };
    if (!isStr(body.name) || !isStr(body.url)) return bad(c, 'name and url required');
    let targetUrl = body.url.trim();
    if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
    const monitor = await MonitorEntity.create(c.env, {
      id: crypto.randomUUID(),
      name: body.name.trim(),
      url: targetUrl,
      interval: body.interval ?? 5,
      status: 'PENDING',
      history: []
    });
    return ok(c, monitor);
  });
  // UPDATE MONITOR
  app.put('/api/monitors/:id', async (c) => {
    const id = c.req.param('id');
    const entity = new MonitorEntity(c.env, id);
    if (!await entity.exists()) return notFound(c, 'Monitor not found');
    const body = await c.req.json() as { name?: string; url?: string; interval?: number };
    const updated = await entity.mutate(s => ({
      ...s,
      name: body.name?.trim() || s.name,
      url: body.url?.trim() || s.url,
      interval: body.interval ?? s.interval,
    }));
    return ok(c, updated);
  });
  // SYNC ALL MONITORS (Global check trigger)
  app.post('/api/monitors/sync-all', async (c) => {
    // Manually trigger the global engine check for all monitors
    const results = await performGlobalCheck(c.env);
    return ok(c, results);
  });
  // TRIGGER MANUAL CHECK
  app.post('/api/monitors/:id/check', async (c) => {
    const id = c.req.param('id');
    const simulateFailure = c.req.query('simulate_failure') === 'true';
    const entity = new MonitorEntity(c.env, id);
    if (!await entity.exists()) return notFound(c, 'Monitor not found');
    const monitor = await entity.getState();
    const historyEntry = await runSingleCheck(c.env, monitor, simulateFailure);
    // addHistory handles status updates and persistence internally via entity.mutate
    await entity.addHistory(historyEntry);
    const updated = await entity.getState();
    return ok(c, updated);
  });
  // DELETE MONITOR
  app.delete('/api/monitors/:id', async (c) => {
    const id = c.req.param('id');
    const deleted = await MonitorEntity.delete(c.env, id);
    return ok(c, { id, deleted });
  });
}