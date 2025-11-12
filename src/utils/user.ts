import { IUser, IUserSafe } from "../interfaces/user/user";

export const toUserSafe = ({ password, ...safe }: IUser): IUserSafe => safe;
