import { api, type Envelope } from "@/lib/api/client";
import type { AuthUser, Credentials, CurrentUser } from "@/features/auth/types";

export async function login(credentials: Credentials): Promise<AuthUser> {
  const response = await api.post<Envelope<AuthUser>>("/Auth/Login", credentials);
  return response.data;
}

export async function logout(): Promise<void> {
  await api.post("/Auth/logout", {}, { silent: true });
}

export async function currentUser(): Promise<CurrentUser> {
  return api.get<CurrentUser>("/User/me", { silent: true });
}

export async function forgotPassword(email: string): Promise<string> {
  const response = await api.post<Envelope<null>>("/Auth/ForgotPassword", { email });
  return response.message;
}

export async function resetPassword(input: {
  token: string;
  passwordNew: string;
  reconfirmPassword: string;
}): Promise<string> {
  const response = await api.post<Envelope<null>>("/Auth/ResetPassword", input);
  return response.message;
}
