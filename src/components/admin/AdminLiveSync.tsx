"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getRecentNotifications, ActivityNotification } from "@/app/actions/notifications";

interface LiveToast {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  link: string;
  timestamp: string;
}

export function AdminLiveSync() {
  const router = useRouter();
  const [toasts, setToasts] = useState<LiveToast[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestNotifIdRef = useRef<string | null>(null);

  // Play a gentle luxury two-tone chime via Web Audio API (no external MP3 needed)
  const playLiveChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // First tone (523.25 Hz - C5) gliding smoothly to (783.99 Hz - G5)
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);
    } catch {
      // Browser autoplay restriction before user interaction — safe fallback
    }
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleIncomingEvent = useCallback(
    (eventData: any) => {
      if (!eventData || eventData.type === "connected") {
        setIsConnected(true);
        return;
      }

      // 1. Trigger seamless Next.js App Router background re-render without reloading page
      router.refresh();

      // 2. Play gentle audio chime
      playLiveChime();

      // 3. Dispatch global browser event for topbar notification badge
      const activityItem: ActivityNotification = {
        id: eventData.id,
        type: eventData.type.includes("pre_order") ? "pre_order" : "inquiry",
        title: eventData.title,
        subtitle: eventData.subtitle,
        timestamp: eventData.timestamp || new Date().toISOString(),
        link: eventData.link || "/admin/inquiries",
      };

      window.dispatchEvent(
        new CustomEvent("admin:live_event", { detail: activityItem })
      );

      // 4. Show live toast banner if it's a new lead/item
      if (!eventData.type.includes("deleted")) {
        const toastId = `${eventData.id}-${Date.now()}`;
        setToasts((prev) => [
          {
            id: toastId,
            type: eventData.type,
            title: eventData.title,
            subtitle: eventData.subtitle,
            link: eventData.link,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
          ...prev.slice(0, 3), // Keep max 4 visible
        ]);

        // Auto-dismiss toast after 6.5 seconds
        setTimeout(() => {
          dismissToast(toastId);
        }, 6500);
      }
    },
    [router, playLiveChime]
  );

  useEffect(() => {
    let isCancelled = false;

    function connectSSE() {
      if (isCancelled) return;
      try {
        const es = new EventSource("/api/admin/live-stream");
        eventSourceRef.current = es;

        es.onopen = () => {
          if (!isCancelled) setIsConnected(true);
        };

        es.onmessage = (event) => {
          if (isCancelled || !event.data) return;
          try {
            const data = JSON.parse(event.data);
            handleIncomingEvent(data);
          } catch (e) {
            console.warn("[AdminLiveSync] Failed to parse SSE message:", e);
          }
        };

        es.onerror = () => {
          if (isCancelled) return;
          setIsConnected(false);
          es.close();
          // Reconnect with backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            connectSSE();
          }, 4000);
        };
      } catch {
        setIsConnected(false);
      }
    }

    connectSSE();

    // ── Backup Polling Heartbeat (every 12 seconds) ──
    // Ensures that even if SSE connection drops or is blocked by an HTTP proxy,
    // new inquiries and leads still arrive completely live without reloading.
    const pollInterval = setInterval(async () => {
      try {
        const items = await getRecentNotifications();
        if (items && items.length > 0) {
          const newest = items[0].id;
          if (latestNotifIdRef.current && latestNotifIdRef.current !== newest) {
            router.refresh();
            window.dispatchEvent(
              new CustomEvent("admin:live_event", { detail: items[0] })
            );
          }
          latestNotifIdRef.current = newest;
        }
      } catch {
        // Silent
      }
    }, 12000);

    return () => {
      isCancelled = true;
      clearInterval(pollInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [handleIncomingEvent, router]);

  return (
    <>
      {/* Floating Live Toasts Container */}
      <div className="admin-live-toasts-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="admin-live-toast-card">
            <div className="admin-live-toast-indicator">
              <span className="live-pulse-dot" />
              <span className="live-pill-tag">LIVE LEAD</span>
              <span className="toast-time">{toast.timestamp}</span>
            </div>

            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-subtitle">{toast.subtitle}</div>
            </div>

            <div className="toast-actions">
              <button
                type="button"
                className="toast-btn-view"
                onClick={() => {
                  router.push(toast.link);
                  dismissToast(toast.id);
                }}
              >
                View Now
              </button>
              <button
                type="button"
                className="toast-btn-close"
                onClick={() => dismissToast(toast.id)}
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
