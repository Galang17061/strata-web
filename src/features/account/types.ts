export type User = {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  roleId: string;
  roleName: string | null;
  token: string | null;
};

export type Role = {
  id: string;
  roleName: string;
};

export type UserInput = {
  fullname: string;
  userName: string;
  email: string;
  password: string;
  roleId: string;
};

export type UserAccessEntry = {
  id?: string;
  userId: string;
  modul: string;
  is_add: boolean;
  is_edit: boolean;
  is_delete: boolean;
  is_view: boolean;
  is_download: boolean;
};

export type UserUpdateInput = {
  fullname: string;
  userName: string;
  roleId: string;
};
