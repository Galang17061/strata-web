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
