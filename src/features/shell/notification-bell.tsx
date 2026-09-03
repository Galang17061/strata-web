"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { listAlerts } from "@/features/workspace/api";

const SEEN_KEY = "strata.alerts.seen";

function readSeen(): string {
  try {
    return localStorage.getItem(SEEN_KEY) ?? "";
  } catch {
    return "";
  }
}

function alertMoment(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function NotificationBell() {
  const [seen, setSeen] = useState(readSeen);
  const alerts = useQuery({
    queryKey: ["alerts"],
    queryFn: () => listAlerts(),
    refetchInterval: 60000,
    retry: false,
  });
  const rows = alerts.data?.data ?? [];
  const newest = rows[0]?.createdAt ?? "";
  const hasNews = Boolean(newest) && newest > seen;

  const markSeen = (open: boolean) => {
    if (open && newest) {
      try {
        localStorage.setItem(SEEN_KEY, newest);
      } catch {
        void 0;
      }
      setSeen(newest);
    }
  };

  return (
    <DropdownMenu onOpenChange={markSeen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Reliability alerts" className="relative">
          <Bell />
          {hasNews ? (
            <span className="absolute top-1 right-1 size-2 rounded-full bg-danger" aria-hidden="true" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Reliability alerts</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {rows.length === 0 ? (
          <p className="px-2 py-3 text-body-sm text-foreground-muted">
            All quiet. Alerts appear when a system falls below the floor you set for it.
          </p>
        ) : (
          <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
            {rows.map((alert) => (
              <div key={alert.notificationId} className="rounded-sm px-2 py-1.5 hover:bg-accent">
                <p className="text-body-sm font-medium">{alert.title}</p>
                <p className="text-caption text-foreground-muted">{alert.body}</p>
                <p className="mt-0.5 font-mono text-caption text-foreground-subtle">{alertMoment(alert.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
