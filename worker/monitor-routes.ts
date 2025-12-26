import { Hono } from "hono";
import type { Env } from './core-utils';
import { MonitorEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { MonitorStatus } from "@shared/types";
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
  // TRIGGER MANUAL CHECK (with simulation support)
  app.post('/api/monitors/:id/check', async (c) => {
    const id = c.req.param('id');
    const simulateFailure = c.req.query('simulate_failure') === 'true';
    const entity = new MonitorEntity(c.env, id);
    if (!await entity.exists()) return notFound(c, 'Monitor not found');
    const monitor = await entity.getState();
    const start = performance.now();
    let status: MonitorStatus = 'UP';
    let statusCode: number | undefined;
    let message: string | undefined;
    if (simulateFailure) {
      status = 'DOWN';
      message = 'Simulated Outage (Drill)';
      statusCode = 503;
    } else {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(monitor.url, {
          method: 'GET',
          signal: controller.signal,
          headers: { 'User-Agent': 'VigilantMonitor/1.0' }
        });
        clearTimeout(timeoutId);
        statusCode = res.status;
        if (!res.ok) {
          status = 'DOWN';
          message = `HTTP Error: ${res.status} ${res.statusText}`;
        }
      } catch (err: any) {
        status = 'DOWN';
        message = err.name === 'AbortError' ? 'Timeout' : err.message || 'Connection Failed';
      }
    }
    const latency = Math.round(performance.now() - start);
    const historyEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      latency: status === 'UP' ? latency : 0,
      status,
      statusCode,
      message
    };
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