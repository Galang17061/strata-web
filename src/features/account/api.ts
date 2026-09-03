import { ApiError, api, queryString, type Envelope } from "@/lib/api/client";
import type { Role, User, UserAccessEntry, UserInput, UserUpdateInput } from "@/features/account/types";

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

export async function accessOfUser(userId: string): Promise<UserAccessEntry[]> {
  try {
    const response = await api.get<Envelope<UserAccessEntry[]>>(`/UserAccess/${encodeURIComponent(userId)}`);
    return response.data ?? [];
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return [];
    throw error;
  }
}

export function saveAccess(entries: UserAccessEntry[]): Promise<Envelope<unknown>> {
  const payload = entries.map(({ userId, modul, is_add, is_edit, is_delete, is_view, is_download }) => ({
    userId,
    modul,
    is_add,
    is_edit,
    is_delete,
    is_view,
    is_download,
  }));
  return api.post<Envelope<unknown>>("/UserAccess/CreateOrUpdateMany", payload);
}

export function deleteUser(userId: string): Promise<Envelope<null>> {
  return api.delete<Envelope<null>>(`/User/${encodeURIComponent(userId)}`);
}

export type AuditEntry = {
  auditTrailId: string;
  userName: string;
  method: string;
  path: string;
  statusCode: number;
  createdAt: string;
};

export function listAudit(params: PageParams = {}): Promise<Envelope<AuditEntry[]>> {
  return api.get<Envelope<AuditEntry[]>>(`/Audit${queryString(params)}`);
}

export type FeedbackEntry = {
  feedbackId: string;
  userName: string;
  category: "bug" | "idea" | "question";
  message: string;
  page: string | null;
  createdAt: string;
};

export function listFeedback(params: PageParams = {}): Promise<Envelope<FeedbackEntry[]>> {
  return api.get<Envelope<FeedbackEntry[]>>(`/Feedback${queryString(params)}`);
}

export type InviteResult = {
  inviteUrl: string;
  expiresAt: string;
  delivered: boolean;
};

export function inviteUser(input: { email: string; roleId: string }): Promise<Envelope<InviteResult>> {
  return api.post<Envelope<InviteResult>>("/User/Invite", input);
}

export function listRoles(): Promise<Envelope<Role[]>> {
  return api.get<Envelope<Role[]>>(`/Role${queryString({ page: 1, pageSize: 100 })}`);
}

export function updateRole(roleId: string, input: { roleName: string }): Promise<Envelope<unknown>> {
  return api.put<Envelope<unknown>>(`/Role/${encodeURIComponent(roleId)}`, input);
}
