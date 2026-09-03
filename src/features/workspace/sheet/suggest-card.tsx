"use client";

import { useQuery } from "@tanstack/react-query";
import { Lightbulb } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { suggestedParameters } from "@/features/workspace/api";
import { formatFailureRate, formatHours } from "@/lib/format";

export function suggestionStory(suggestion: {
  source: string;
  events: number;
  components: number;
  totalHours: number;
}): string {
  if (suggestion.source === "history") {
    return `Learned from ${suggestion.events} recorded failures across ${suggestion.components} identical parts, ${Math.round(suggestion.totalHours)} running hours in all.`;
  }
  if (suggestion.source === "vendor") {
    return `No identical part has a history yet, so this comes from ${suggestion.events} failures across ${suggestion.components} parts by the same vendor.`;
  }
  if (suggestion.source === "master") {
    return "No recorded history anywhere yet - this is the vendor's own quoted rate from the catalogue.";
  }
  return "Nothing to learn from yet: no history and no quoted rate in the catalogue.";
}

type SuggestCardProps = {
  systemComponentId: string;
};

export function SuggestCard({ systemComponentId }: SuggestCardProps) {
  const [asked, setAsked] = useState(false);
  const suggestion = useQuery({
    queryKey: ["suggestion", systemComponentId],
    queryFn: () => suggestedParameters(systemComponentId),
    enabled: asked,
  });
  const data = suggestion.data?.data ?? null;

  if (!asked) {
    return (
      <Button type="button" variant="secondary" size="sm" className="self-start" onClick={() => setAsked(true)}>
        <Lightbulb /> Suggest a rate from the fleet
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-sm border border-border bg-surface-sunken p-3">
      <p className="flex items-center gap-2 text-caption uppercase text-foreground-muted">
        <Lightbulb className="size-3.5" aria-hidden="true" /> Suggested from the fleet
      </p>
      {suggestion.isPending ? (
        <p className="text-body-sm text-foreground-muted">Looking through the records…</p>
      ) : suggestion.isError ? (
        <p className="text-body-sm text-danger">{suggestion.error.message}</p>
      ) : data ? (
        <>
          {data.failureRate !== null ? (
            <p className="font-mono text-body-sm">
              λ = {formatFailureRate(data.failureRate)} · MTBF = {formatHours(data.mtbf)}
            </p>
          ) : null}
          <p className="text-caption text-foreground-muted normal-case tracking-normal">{suggestionStory(data)}</p>
        </>
      ) : null}
    </div>
  );
}
