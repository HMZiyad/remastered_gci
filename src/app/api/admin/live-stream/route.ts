import { NextRequest, connection } from "next/server";
import { getSession } from "@/lib/session";
import { adminEventEmitter, AdminLiveEvent } from "@/lib/events";

export async function GET(request: NextRequest) {
  await connection();
  const session = await getSession();

  // Protect SSE stream: must be logged in as admin
  if (!session.isLoggedIn) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial handshake
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected", timestamp: new Date().toISOString() })}\n\n`)
      );

      // 2. Event listener
      const eventHandler = (event: AdminLiveEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // Stream might be closed
        }
      };

      adminEventEmitter.on("admin_activity", eventHandler);

      // 3. Keep-alive heartbeat every 15s to keep proxy/browser connections open
      const heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeatTimer);
        }
      }, 15000);

      // 4. Cleanup when client disconnects or aborts
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatTimer);
        adminEventEmitter.off("admin_activity", eventHandler);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disables Nginx buffering for instant delivery
    },
  });
}
