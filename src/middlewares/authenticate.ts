import { NextFunction, Request, Response } from "express";
import TokenService from "../services/token";
import { IUserSafe } from "../interfaces/user/user";

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
};

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Token manquant dans le headers",
    });
    return;
  }
  const tokenService = new TokenService();
  const decodedToken = tokenService.verifyToken(token);
  if ("error" in decodedToken) {
    res.status(401).json({
      code: "UNAUTHORIZED",
      message: "Token invalide",
    });
    return;
  }
  const { exp, iat, ...user } = decodedToken;
  req.user = user;
  req.token = token;
  next();
};




// ✅ Middleware
export const isAuthenticate = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : undefined;

    // 🔹 Aucun token → utilisateur non connecté
    if (!token) {
      req.user = null;
      req.token = undefined;
      return next();
    }

    // 🔹 Vérification du token
    const tokenService = new TokenService();
    const decoded = tokenService.verifyToken(token);

    // Si le token est invalide → on considère l'utilisateur comme non connecté
    if (!decoded || "error" in decoded) {
      req.user = null;
      req.token = undefined;
      return next();
    }

    // 🔹 Décodage réussi → on extrait l'utilisateur
    const { exp, iat, ...user } = decoded as IUserSafe & { exp: number; iat: number };
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error("[isAuthenticate] Erreur :", error);
    // ⚠️ On ne bloque pas les routes publiques
    req.user = null;
    req.token = undefined;
    next();
  }
};
