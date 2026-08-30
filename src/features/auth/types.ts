export type AccessData = {
  modul: string;
  is_add: boolean;
  is_edit: boolean;
  is_delete: boolean;
  is_view: boolean;
  is_download: boolean;
};

export type AuthUser = {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  roleName: string;
  token: string;
  validUntil: string;
  accessData: AccessData[];
};

export type CurrentUser = {
  id: string;
  fullname: string;
  username: string;
  email: string;
  roleId: string;
  role: string;
};

export type Credentials = {
  username: string;
  password: string;
};
