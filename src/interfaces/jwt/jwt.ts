import { IUserSafe } from "../user/user";

export interface IJwt extends IUserSafe {
  exp?: number | string;
  iat?: number | string;
}
