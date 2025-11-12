import { IUserRegister, UserRole } from "../interfaces/user/user";
import User from "../models/user";
import argon2 from "argon2";
import { toUserSafe } from "../utils/user";
import SettingsService from "./settings";
import { Op } from "sequelize";

class AuthenticateService {
  private settingsService: SettingsService;
  constructor() {
    this.settingsService = new SettingsService();
  }

  public async createUser(request: IUserRegister) {
    const hashPwd = await argon2.hash(request.password);
    const newUser = await User.create({
      ...request,
      password: hashPwd,
      role: UserRole.USER,
    });
    await this.settingsService.createDefaultSettings(newUser);
    return toUserSafe(newUser.toJSON());
  }

  public async authenticate(password: string, credential: string) {
    // 🔍 Recherche par username OU email
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: credential }, { email: credential }],
      },
    });

    if (
      user &&
      user.password &&
      (await argon2.verify(user.password, password))
    ) {
      return toUserSafe(user.toJSON());
    }

    return null;
  }
}

export default AuthenticateService;
