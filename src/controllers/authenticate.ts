import { Request, Response } from "express";
import AuthenticateService from "../services/authenticate";
import TokenService from "../services/token";
import { IUserRegister } from "../interfaces/user/user";

class AuthenticateController {
  private authenticateService: AuthenticateService;
  private tokenService: TokenService;

  constructor() {
    this.authenticateService = new AuthenticateService();
    this.tokenService = new TokenService();

    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.currentUser = this.currentUser.bind(this);
  }

  public async register(req: Request, res: Response) {
    const request: IUserRegister = req.body;
    try {
      const newUser = await this.authenticateService.createUser(request);
      const token = this.tokenService.encodeToken(newUser);
      res.status(201).json({ user: newUser, token });
      return;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const field = (error as any).errors[0].path;
        res.status(409).json({
          code: "CONFLICT",
          message: `${field} existe déjà`,
        });
        return;
      } else {
        console.log(error);
        res.status(500).json({
          code: "INTERNAL_ERROR",
          message: "Erreur interne du serveur",
        });
        return;
      }
    }
  }

  public async login(req: Request, res: Response) {
    const { credential, password }: { credential: string; password: string } =
      req.body;
    try {
      const user = await this.authenticateService.authenticate(
        password,
        credential
      );
      if (user) {
        const token = this.tokenService.encodeToken(user);
        res.status(200).json({ user, token });
        return;
      } else {
        res.status(401).json({
          code: "UNAUTHORIZED",
          message: "E-mail ou nom d'utilisateur ou mot de passe invalide",
        });
        return;
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
      return;
    }
  }
  public async currentUser(req: Request, res: Response) {
    if (!req.user && !req.token) {
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "Token invalide",
      });
      return;
    }
    res.status(200).json({ user: req.user!, token: req.token! });
    return;
  }
}

export default AuthenticateController;
