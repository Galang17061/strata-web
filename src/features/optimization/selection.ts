import type { OptimizationChoice, OptimizationSlot } from "@/features/optimization/types";

export function selectedCandidateId(slot: OptimizationSlot, selections: Record<string, string>): string {
  const manual = selections[slot.systemComponentId];
  if (manual && slot.candidates.some((candidate) => candidate.componentId === manual)) return manual;
  return slot.candidates[slot.proposedIndex].componentId;
}

export function choicesOf(slots: OptimizationSlot[], selections: Record<string, string>): OptimizationChoice[] {
  return slots.map((slot) => ({ systemComponentId: slot.systemComponentId, componentId: selectedCandidateId(slot, selections) }));
}

export function locksOf(slots: OptimizationSlot[], selections: Record<string, string>, locked: ReadonlySet<string>): OptimizationChoice[] {
  return slots
    .filter((slot) => locked.has(slot.systemComponentId))
    .map((slot) => ({ systemComponentId: slot.systemComponentId, componentId: selectedCandidateId(slot, selections) }));
}

export function hasManualChanges(slots: OptimizationSlot[], selections: Record<string, string>): boolean {
  return slots.some((slot) => {
    const manual = selections[slot.systemComponentId];
    return Boolean(manual) && manual !== slot.candidates[slot.proposedIndex].componentId;
  });
}
