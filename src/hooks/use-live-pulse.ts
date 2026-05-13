"use client";

import { useEffect, useState } from "react";

/**
 * Placeholder for WebSocket-driven refreshes; simulates a realtime cadence.
 * Replace with native WebSocket when Spring Boot gateway is available.
 */
export function useLivePulse(intervalMs = 32000) {
  const [pulse, setPulse] = useState(0);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => setPulse((p) => p + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  useEffect(() => {
    const mockWs =
      typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_WS_URL &&
      process.env.NEXT_PUBLIC_WS_URL.length > 0;

    if (!mockWs) return;

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
      ws.onopen = () => setConnected(true);
      ws.onclose = () => setConnected(false);
      ws.onerror = () => setConnected(false);
      ws.onmessage = () => setPulse((p) => p + 1);
    } catch {
      setConnected(false);
    }

    return () => {
      ws?.close();
    };
  }, []);

  return { pulse, connected };
}
