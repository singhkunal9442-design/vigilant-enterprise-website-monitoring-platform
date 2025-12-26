import { IndexedEntity } from "./core-utils";
import type { User, Monitor, MonitorHistory } from "@shared/types";
import { MOCK_USERS } from "@shared/mock-data";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
export class MonitorEntity extends IndexedEntity<Monitor> {
  static readonly entityName = "monitor";
  static readonly indexName = "monitors";
  static readonly initialState: Monitor = {
    id: "",
    name: "",
    url: "",
    interval: 5,
    status: 'PENDING',
    history: []
  };
  static seedData: Monitor[] = [
    {
      id: "mon-1",
      name: "Google Search",
      url: "https://www.google.com",
      interval: 1,
      status: "UP",
      lastChecked: Date.now(),
      history: [
        { id: "h1", timestamp: Date.now() - 300000, latency: 120, status: "UP" },
        { id: "h2", timestamp: Date.now() - 600000, latency: 145, status: "UP" },
        { id: "h3", timestamp: Date.now() - 900000, latency: 110, status: "UP" }
      ]
    },
    {
      id: "mon-2",
      name: "Vigilant API",
      url: "https://api.vigilant.io/health",
      interval: 5,
      status: "DOWN",
      lastChecked: Date.now(),
      history: [
        { id: "h4", timestamp: Date.now() - 300000, latency: 0, status: "DOWN", message: "DNS Resolution Error" },
        { id: "h5", timestamp: Date.now() - 600000, latency: 450, status: "UP" }
      ]
    }
  ];
  async addHistory(entry: MonitorHistory) {
    await this.mutate(s => {
      const newHistory = [entry, ...s.history].slice(0, 50);
      return {
        ...s,
        status: entry.status,
        lastChecked: entry.timestamp,
        history: newHistory
      };
    });
  }
}