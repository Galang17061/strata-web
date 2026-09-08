"use client";

import { useEffect } from "react";
import { readCookie } from "@/lib/cookies";
import { apiBaseUrl, tokenCookieName } from "@/lib/env";
import type { JobStatus } from "@/features/simulation/types";

export type JobAnnouncement = {
  jobId: string;
  status: JobStatus;
  kind: string;
};

export function parseAnnouncements(chunk: string): JobAnnouncement[] {
  const found: JobAnnouncement[] = [];
  for (const line of chunk.split("\n")) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (!payload) continue;
    try {
      const parsed = JSON.parse(payload) as JobAnnouncement;
      if (parsed && typeof parsed.jobId === "string") found.push(parsed);
    } catch {
      continue;
    }
  }
  return found;
}

export function useJobStream(active: boolean, onMove: (announcement: JobAnnouncement) => void): void {
  useEffect(() => {
    if (!active) return;
    const token = readCookie(tokenCookieName());
    if (!token) return;
    const controller = new AbortController();
    const listen = async () => {
      try {
        const response = await fetch(`${apiBaseUrl()}/Job/stream`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
          signal: controller.signal,
        });
        if (!response.ok || !response.body) return;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            for (const announcement of parseAnnouncements(part)) onMove(announcement);
          }
        }
      } catch {
        return;
      }
    };
    void listen();
    return () => controller.abort();
  }, [active, onMove]);
}
