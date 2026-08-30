import { api, queryString, type Envelope } from "@/lib/api/client";
import type { Role, User, UserInput, UserUpdateInput } from "@/features/account/types";

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

export function updateUser(userId: string, input: UserUpdateInput): Promise<Envelope<unknown>> {
  return api.put<Envelope<unknown>>(`/User/${encodeURIComponent(userId)}`, input);
}

export function resetPassword(userId: string, input: { passwordNew: string; reconfirmPassword: string }): Promise<Envelope<unknown>> {
  return api.put<Envelope<unknown>>(`/User/ChangePasswordAdmin${queryString({ UserId: userId })}`, input);
}

export function deleteUser(userId: string): Promise<Envelope<null>> {
  return api.delete<Envelope<null>>(`/User/${encodeURIComponent(userId)}`);
}

export function listRoles(): Promise<Envelope<Role[]>> {
  return api.get<Envelope<Role[]>>(`/Role${queryString({ page: 1, pageSize: 100 })}`);
}

export function updateRole(roleId: string, input: { roleName: string }): Promise<Envelope<unknown>> {
  return api.put<Envelope<unknown>>(`/Role/${encodeURIComponent(roleId)}`, input);
}
