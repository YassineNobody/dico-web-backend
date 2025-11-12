export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface IUser {
  id?: number;
  uuid?: string;
  email: string;
  username: string;
  nickname: string;
  password: string;
  role: UserRole;
  profile?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IUserRegister = Omit<
  IUser,
  "id" | "uuid" | "createdAt" | "updatedAt" | "role"
>;

export type IUserUpdate = Omit<
  IUser,
  "id" | "uuid" | "createdAt" | "updatedAt" | "password"
>;
export type IUserSafe = Omit<IUser, "password">;
