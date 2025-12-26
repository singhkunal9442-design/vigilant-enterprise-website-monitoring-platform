import { MonitorEntity } from "./entities";
import type { Env } from "./core-utils";
import type { Monitor, MonitorStatus, MonitorHistory } from "@shared/types";
export interface CheckResult {
  monitorId: string;
  name: string;
  checked: boolean;
  status?: MonitorStatus;
  latency?: number;
  error?: string;
}
/**
 * Core monitoring logic for a single node.
 * Performs advanced validation: timeout, status codes, and body patterns.
 */
export async function runSingleCheck(env: Env, monitor: Monitor, simulateFailure: boolean = false): Promise<MonitorHistory> {
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
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      const res = await fetch(monitor.url, {
        method: 'GET',
        signal: controller.signal,
        headers: { 
          'User-Agent': 'VigilantMonitor/1.0 (HealthCheck; +https://vigilant.io)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        redirect: 'follow'
      });
      clearTimeout(timeoutId);
      statusCode = res.status;
      if (!res.ok) {
        status = 'DOWN';
        message = `HTTP Error: ${res.status} ${res.statusText}`;
      } else {
        // Advanced Body Scanning for "Fake 200s" or Maintenance modes
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text')) {
          const body = (await res.text()).toLowerCase();
          const failurePatterns = [
            'maintenance mode',
            'sql error',
            'connection failed',
            'database error',
            'site under maintenance',
            'access denied'
          ];
          for (const pattern of failurePatterns) {
            if (body.includes(pattern)) {
              status = 'DOWN';
              message = `Pattern Match: ${pattern}`;
              break;
            }
          }
        }
      }
    } catch (err: any) {
      status = 'DOWN';
      message = err.name === 'AbortError' ? 'Timeout (>10s)' : err.message || 'Connection Failed';
    }
  }
  const latency = Math.round(performance.now() - start);
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    latency: status === 'UP' ? latency : 0,
    status,
    statusCode,
    message
  };
}
/**
 * Iterates through all monitors and executes checks for those due based on their interval.
 */
export async function performGlobalCheck(env: Env): Promise<CheckResult[]> {
  const { items: monitors } = await MonitorEntity.list(env);
  const now = Date.now();
  const results: CheckResult[] = [];
  for (const monitor of monitors) {
    const lastChecked = monitor.lastChecked || 0;
    const intervalMs = monitor.interval * 60 * 1000;
    // Check if due (or if it's never been checked)
    if (now - lastChecked >= intervalMs || monitor.status === 'PENDING') {
      try {
        const historyEntry = await runSingleCheck(env, monitor);
        const entity = new MonitorEntity(env, monitor.id);
        // Optimize storage: only add history if status changed OR if 5 mins passed since last history
        // This prevents excessive writes for 1-min monitors that are stable
        const statusChanged = monitor.status !== historyEntry.status;
        const timeSinceLastLog = now - lastChecked;
        if (statusChanged || timeSinceLastLog >= 300000 || monitor.status === 'PENDING') {
          await entity.addHistory(historyEntry);
        } else {
          // Just update the lastChecked timestamp without adding a full history record
          await entity.mutate(s => ({ ...s, lastChecked: now }));
        }
        results.push({
          monitorId: monitor.id,
          name: monitor.name,
          checked: true,
          status: historyEntry.status,
          latency: historyEntry.latency
        });
      } catch (e: any) {
        results.push({
          monitorId: monitor.id,
          name: monitor.name,
          checked: true,
          error: e.message
        });
      }
    } else {
      results.push({
        monitorId: monitor.id,
        name: monitor.name,
        checked: false
      });
    }
  }
  return results;
}