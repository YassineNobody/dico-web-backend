import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validateSchemaFields = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      code: "BAD_REQUEST",
      message: "Champs invalides",
      errors: errors.array(),
    });
    return;
  }
  next();
};
