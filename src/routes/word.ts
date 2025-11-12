import { Router } from "express";
import { body, param, query } from "express-validator";
import WordBaseController from "../controllers/wordBase";
import { WordType } from "../interfaces/dico/dico";
import { isAuthenticate, verifyToken } from "../middlewares/authenticate";
import { validateSchemaFields } from "../middlewares/validateSchema";
import WordGetterController from "../controllers/word";

const routerWord = Router();
const ctxBase = new WordBaseController();
const ctxSuper = new WordGetterController();

// ✅ Route pour créer un seul mot
routerWord.post(
  "/",
  [
    body("sourceLanguage")
      .isIn(["FR", "AR"])
      .withMessage("sourceLanguage est requis et doit être FR ou AR"),
    body("targetLanguage")
      .isIn(["FR", "AR"])
      .withMessage("targetLanguage est requis et doit être FR ou AR"),
    body("wordType")
      .isIn(Object.values(WordType))
      .withMessage(
        `wordType doit être l'un de : ${Object.values(WordType).join(", ")}`
      ),
    body("sourceWord")
      .isString()
      .notEmpty()
      .withMessage(
        "sourceWord est requis et doit être une chaîne de caractères"
      ),
    body("translationWord")
      .isString()
      .notEmpty()
      .withMessage(
        "translationWord est requis et doit être une chaîne de caractères"
      ),
  ],
  verifyToken,
  validateSchemaFields,
  ctxBase.createWord
);

// ✅ Route pour importer plusieurs mots (tableau)
routerWord.post(
  "/import",
  [
    // Vérifie que le corps est un tableau
    body()
      .isArray({ min: 1 })
      .withMessage("Le corps de la requête doit être un tableau non vide"),

    // Vérifie chaque objet à l’intérieur du tableau
    body("*.sourceLanguage")
      .isIn(["FR", "AR"])
      .withMessage("Chaque élément doit avoir sourceLanguage = 'FR' ou 'AR'"),

    body("*.targetLanguage")
      .isIn(["FR", "AR"])
      .withMessage("Chaque élément doit avoir targetLanguage = 'FR' ou 'AR'"),

    body("*.wordType")
      .isIn(Object.values(WordType))
      .withMessage(
        `Chaque élément doit avoir un wordType parmi : ${Object.values(
          WordType
        ).join(", ")}`
      ),

    body("*.sourceWord")
      .isString()
      .notEmpty()
      .withMessage("Chaque élément doit avoir sourceWord non vide"),

    body("*.translationWord")
      .isString()
      .notEmpty()
      .withMessage("Chaque élément doit avoir translationWord non vide"),
  ],
  verifyToken,
  validateSchemaFields,
  ctxBase.importWords
);

routerWord.put(
  "/:uuid",
  [
    param("uuid").isUUID().withMessage("uuid doit être un UUID valide"),
    body("sourceLanguage")
      .optional()
      .isIn(["FR", "AR"])
      .withMessage("sourceLanguage doit être FR ou AR"),
    body("targetLanguage")
      .optional()
      .isIn(["FR", "AR"])
      .withMessage("targetLanguage doit être FR ou AR"),
    body("wordType")
      .optional()
      .isIn(Object.values(WordType))
      .withMessage(
        `wordType doit être l'un de : ${Object.values(WordType).join(", ")}`
      ),
    body("sourceWord")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("sourceWord doit être une chaîne de caractères non vide"),
    body("translationWord")
      .optional()
      .isString()
      .notEmpty()
      .withMessage(
        "translationWord doit être une chaîne de caractères non vide"
      ),
  ],
  verifyToken,
  validateSchemaFields,
  ctxBase.updateWord
);

routerWord.delete(
  "/:uuid",
  [param("uuid").isUUID().withMessage("uuid doit être un UUID valide")],
  verifyToken,
  validateSchemaFields,
  ctxBase.deleteWord
);
routerWord.delete("/clear/all", verifyToken, ctxSuper.clearAllWords);
routerWord.get("/my-words", verifyToken, ctxSuper.getMyWords);

routerWord.get(
  "/search",
  [
    query("q")
      .isString()
      .notEmpty()
      .withMessage(
        "Le paramètre de requête 'q' est requis et doit être une chaîne de caractères"
      ),
  ],
  verifyToken,
  validateSchemaFields,
  ctxSuper.searchWords
);

routerWord.get(
  "/",
  [
    query("sourceLanguage")
      .isIn(["FR", "AR"])
      .optional()
      .withMessage(
        "Le paramètre 'sourceLanguage' est requis et doit être 'FR' ou 'AR'"
      )
      .default("FR"),
    query("targetLanguage")
      .optional()
      .isIn(["FR", "AR"])
      .withMessage(
        "Le paramètre 'targetLanguage' est requis et doit être 'FR' ou 'AR'"
      )
      .default("AR"),
  ],
  isAuthenticate,
  validateSchemaFields,
  ctxSuper.getByLanguages
);

routerWord.get(
  "/by-type",
  [
    query("type")
      .isIn(Object.values(WordType))
      .withMessage(
        `Le paramètre 'type' est requis et doit être l'un de : ${Object.values(
          WordType
        ).join(", ")}`
      ),
    query("sourceLanguage")
      .isIn(["FR", "AR"])
      .withMessage(
        "Le paramètre 'sourceLanguage' est requis et doit être 'FR' ou 'AR'"
      ),
    query("targetLanguage")
      .isIn(["FR", "AR"])
      .withMessage(
        "Le paramètre 'targetLanguage' est requis et doit être 'FR' ou 'AR'"
      ),
  ],
  isAuthenticate,
  validateSchemaFields,
  ctxSuper.getByType
);

routerWord.get(
  "/count-by-languages",
  [
    query("sourceLanguage")
      .isIn(["FR", "AR"])
      .withMessage(
        "Le paramètre 'sourceLanguage' est requis et doit être 'FR' ou 'AR'"
      )
      .default("FR"),
    query("targetLanguage")
      .isIn(["FR", "AR"])
      .withMessage(
        "Le paramètre 'targetLanguage' est requis et doit être 'FR' ou 'AR'"
      )
      .default("AR"),
  ],
  isAuthenticate,
  validateSchemaFields,
  ctxSuper.countByLanguages
);

routerWord.get("/language-by-pair", verifyToken, ctxSuper.getLanguageByPair);

routerWord.get(
  "/:uuid",
  [param("uuid").isUUID().withMessage("uuid doit être un UUID valide")],
  verifyToken,
  validateSchemaFields,
  ctxSuper.getWordByUuid
);

export default routerWord;
