import { api, queryString, type Envelope } from "@/lib/api/client";
import type { Role, User, UserInput } from "@/features/account/types";

export type PageParams = {
  page?: number;
  pageSize?: number;
};

export function listUsers(params: PageParams = {}): Promise<Envelope<User[]>> {
  return api.get<Envelope<User[]>>(`/User${queryString(params)}`);
}

export function createUser(input: UserInput): Promise<Envelope<unknown>> {
  return api.post<Envelope<unknown>>("/User", input);
}

export function listRoles(): Promise<Envelope<Role[]>> {
  return api.get<Envelope<Role[]>>(`/Role${queryString({ page: 1, pageSize: 100 })}`);
}
