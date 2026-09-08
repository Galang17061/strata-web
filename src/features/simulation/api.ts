import { api, type Envelope } from "@/lib/api/client";
import type { Job, SimulationRequestInput } from "@/features/simulation/types";

export function startRehearsal(rbdSystemId: string, input: SimulationRequestInput): Promise<Envelope<Job>> {
  return api.post<Envelope<Job>>(`/Simulation/system/${rbdSystemId}/monte-carlo`, input);
}

export function fetchJob(jobId: string): Promise<Envelope<Job>> {
  return api.get<Envelope<Job>>(`/Job/${jobId}`);
}

export function cancelJob(jobId: string): Promise<Envelope<null>> {
  return api.post<Envelope<null>>(`/Job/${jobId}/cancel`);
}
