import { Router } from "express";
import LearnController from "../controllers/learn";
import { body, param } from "express-validator";
import { validateSchemaFields } from "../middlewares/validateSchema";
import { verifyToken } from "../middlewares/authenticate";
import { verifyAdmin } from "../middlewares/verifyAdmin";

const routerLearn = Router();
const ctx = new LearnController();

// ✅ Créer un seul cours (ADMIN)
routerLearn.post(
  "/",
  [
    verifyToken,
    verifyAdmin,
    body("categoryId").isInt().withMessage("categoryId must be an integer"),
    body("title")
      .isString()
      .notEmpty()
      .withMessage("title is required and must be a string"),
    body("urlPdf")
      .isString()
      .notEmpty()
      .withMessage("urlPdf is required and must be a string"),
    body("contentMarkdown")
      .optional()
      .isString()
      .withMessage("contentMarkdown must be a string"),
    validateSchemaFields,
  ],
  ctx.createLearn
);

// ✅ Importer plusieurs cours (ADMIN)
routerLearn.post(
  "/bulk",
  [
    verifyToken,
    verifyAdmin,
    body().isArray({ min: 1 }).withMessage("Body must be a non-empty array"),
    body("*.categoryId").isInt().withMessage("categoryId must be an integer"),
    body("*.title")
      .isString()
      .notEmpty()
      .withMessage("title is required and must be a string"),
    body("*.urlPdf")
      .isString()
      .notEmpty()
      .withMessage("urlPdf is required and must be a string"),
    body("*.contentMarkdown")
      .optional()
      .isString()
      .withMessage("contentMarkdown must be a string"),
    validateSchemaFields,
  ],
  ctx.createLearns
);

// ✅ Mettre à jour un cours (ADMIN)
routerLearn.put(
  "/:slug",
  [
    verifyToken,
    verifyAdmin,
    param("slug").isString().withMessage("slug must be a string"),
    body("categoryId")
      .optional()
      .isInt()
      .withMessage("categoryId must be an integer"),
    body("title").optional().isString().withMessage("title must be a string"),
    body("urlPdf").optional().isString().withMessage("urlPdf must be a string"),
    body("contentMarkdown")
      .optional()
      .isString()
      .withMessage("contentMarkdown must be a string"),
    validateSchemaFields,
  ],
  ctx.updateLearn
);

// ✅ Supprimer un cours (ADMIN)
routerLearn.delete(
  "/:slug",
  [
    verifyToken,
    verifyAdmin,
    param("slug").isString().withMessage("slug must be a string"),
    validateSchemaFields,
  ],
  ctx.deleteLearn
);

// ✅ Récupérer tous les cours (publique)
routerLearn.get("/", ctx.getAll);

// ✅ Récupérer les cours par catégorie (publique)
routerLearn.get(
  "/category/:categoryId",
  [
    param("categoryId").isInt().withMessage("categoryId must be an integer"),
    validateSchemaFields,
  ],
  ctx.getByCategory
);

// ✅ Récupérer un cours par slug (publique)
routerLearn.get(
  "/:slug",
  [
    param("slug").isString().notEmpty().withMessage("slug must be a string"),
    validateSchemaFields,
  ],
  ctx.getBySlug
);

export default routerLearn;
