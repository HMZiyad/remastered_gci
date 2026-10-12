import { EventEmitter } from "events";

export interface AdminLiveEvent {
  id: string;
  type:
    | "inquiry:new"
    | "inquiry:deleted"
    | "pre_order:new"
    | "pre_order:deleted"
    | "vehicle:new"
    | "vehicle:updated"
    | "stock:updated";
  title: string;
  subtitle: string;
  link: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

// Global singleton to persist across Next.js dev server hot module reloading
const globalForEvents = globalThis as unknown as { adminEventEmitter?: EventEmitter };

export const adminEventEmitter: EventEmitter =
  globalForEvents.adminEventEmitter || new EventEmitter();

// Support multiple concurrent admin browser sessions
adminEventEmitter.setMaxListeners(200);

if (process.env.NODE_ENV !== "production") {
  globalForEvents.adminEventEmitter = adminEventEmitter;
}

/**
 * Broadcasts an event to all connected admin clients in real time
 */
export function emitAdminEvent(event: AdminLiveEvent) {
  try {
    adminEventEmitter.emit("admin_activity", event);
  } catch (error) {
    console.error("[Events] Failed to emit admin event:", error);
  }
}
