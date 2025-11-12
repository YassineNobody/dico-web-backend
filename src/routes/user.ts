import { Router } from "express";
import AuthenticateController from "../controllers/authenticate";
import { body } from "express-validator";
import { validateSchemaFields } from "../middlewares/validateSchema";
import { verifyToken } from "../middlewares/authenticate";

const routerAuthenticate = Router();
const ctx = new AuthenticateController();

routerAuthenticate.post(
  "/register",
  [
    body("email").isEmail().withMessage("E-mail invalide"),

    body("password")
      .isLength({ min: 8 })
      .withMessage("Le mot de passe doit contenir minimum 8 caractères"),

    body("username")
      .notEmpty()
      .withMessage("Le nom d'utilisateur est obligatoire")
      .isLength({ min: 3, max: 30 })
      .withMessage(
        "Le nom d'utilisateur doit contenir entre 3 et 30 caractères"
      ),

    body("nickname")
      .optional()
      .isLength({ max: 50 })
      .withMessage("Le surnom ne doit pas dépasser 50 caractères"),

    body("profile")
      .optional()
      .isURL()
      .withMessage("Le profil doit être une URL valide"),
  ],
  validateSchemaFields,
  ctx.register
);

routerAuthenticate.post(
  "/login",
  [
    body("credential")
      .notEmpty()
      .withMessage("L'e-mail ou le nom d'utilisateur est requis"),
    body("password")
      .notEmpty()
      .withMessage("Le mot de passe est requis")
      .isLength({ min: 8 })
      .withMessage("Le mot de passe doit contenir minimum 8 caractères"),
  ],
  validateSchemaFields,
  ctx.login
);

routerAuthenticate.get("/me", verifyToken, ctx.currentUser);

export default routerAuthenticate;
