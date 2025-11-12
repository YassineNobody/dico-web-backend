import { NextFunction, Request, Response } from "express";
import { UserRole } from "../interfaces/user/user";

/**
 * 🛡️ Middleware pour restreindre l'accès aux administrateurs.
 * Doit être utilisé après verifyToken (req.user doit exister).
 */
export const verifyAdmin = (
  req: Request ,
  res: Response,
  next: NextFunction
) => {
  try {
    // Vérifie la présence de l'utilisateur dans la requête
    if (!req.user) {
      res.status(401).json({
        code: "UNAUTHORIZED",
        message: "Authentification requise.",
      });
      return;
    }

    // Vérifie le rôle administrateur
    if (req.user.role !== UserRole.ADMIN) {
      console.warn(
        `🚫 Accès refusé à l'utilisateur ${req.user.username} (${req.user.role})`
      );
      res.status(403).json({
        code: "FORBIDDEN",
        message: "Accès refusé : privilèges administrateur requis.",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Erreur dans verifyAdmin :", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Erreur interne du middleware d'autorisation.",
    });
    return;
  }
};
