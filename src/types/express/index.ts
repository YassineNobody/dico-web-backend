import { IUserSafe } from "../../interfaces/user/user";

declare global {
  namespace Express {
    interface Request {
      user?: IUserSafe | null; // toujours défini (même si null)
      token?: string;
    }
  }
}
export {};
