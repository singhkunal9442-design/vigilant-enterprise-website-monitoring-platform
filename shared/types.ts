export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type MonitorStatus = 'UP' | 'DOWN' | 'PENDING' | 'MAINTENANCE';
export interface MonitorHistory {
  id: string;
  timestamp: number;
  latency: number;
  status: MonitorStatus;
  message?: string;
  statusCode?: number;
}
export interface Monitor {
  id: string;
  name: string;
  url: string;
  interval: number; // minutes
  status: MonitorStatus;
  lastChecked?: number;
  history: MonitorHistory[];
}
export interface User {
  id: string;
  name: string;
  email?: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}