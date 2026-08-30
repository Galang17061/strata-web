import { api, queryString, type Envelope } from "@/lib/api/client";
import type { User } from "@/features/account/types";

export type PageParams = {
  page?: number;
  pageSize?: number;
};

export function listUsers(params: PageParams = {}): Promise<Envelope<User[]>> {
  return api.get<Envelope<User[]>>(`/User${queryString(params)}`);
}
