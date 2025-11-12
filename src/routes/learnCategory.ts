import { Router } from "express";
import LearnCategoryController from "../controllers/learnCategory";
import { verifyToken } from "../middlewares/authenticate";
import { verifyAdmin } from "../middlewares/verifyAdmin";
import { body, query } from "express-validator";
import { validateSchemaFields } from "../middlewares/validateSchema";

const routerLearnCategory = Router();
const ctx = new LearnCategoryController();

// ✅ Créer une seule catégorie (ADMIN uniquement)
routerLearnCategory.post(
  "/",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
  ],
  validateSchemaFields,
  verifyToken,
  verifyAdmin,
  ctx.createCategory
);

// ✅ Importer plusieurs catégories (ADMIN uniquement)
routerLearnCategory.post(
  "/bulk",
  [
    verifyToken,
    verifyAdmin,
    body().isArray({ min: 1 }).withMessage("Body must be a non-empty array"),
    body("*.name").notEmpty().withMessage("Each category must have a name"),
    body("*.description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    validateSchemaFields,
  ],
  ctx.createCategories
);

// ✅ Récupérer toutes les catégories (accès à tous)
routerLearnCategory.get("/", ctx.getAllCategories);

// ✅ Mettre à jour une catégorie (ADMIN)
routerLearnCategory.put(
  "/",
  [
    verifyToken,
    verifyAdmin,
    query("id").optional().isInt().withMessage("ID must be an integer"),
    query("uuid").optional().isUUID().withMessage("UUID must be valid"),
    body("name").optional().isString().withMessage("Name must be a string"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    validateSchemaFields,
  ],
  ctx.updateCategory
);

// ✅ Supprimer une catégorie (ADMIN)
routerLearnCategory.delete(
  "/",
  [
    verifyToken,
    verifyAdmin,
    query("id").optional().isInt().withMessage("ID must be an integer"),
    query("uuid").optional().isUUID().withMessage("UUID must be valid"),
    validateSchemaFields,
  ],
  ctx.deleteCategory
);

export default routerLearnCategory;
