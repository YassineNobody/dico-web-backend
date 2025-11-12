import { Request, Response } from "express";
import LearnCategoryService from "../services/learnCategory";
import {
  ICreateLearnCategory,
  IUpdateLearnCategory,
} from "../interfaces/learn/learnCategory";

class LearnCategoryController {
  private service: LearnCategoryService;

  constructor() {
    this.service = new LearnCategoryService();
    this.createCategory = this.createCategory.bind(this);
    this.createCategories = this.createCategories.bind(this);
    this.updateCategory = this.updateCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
    this.getAllCategories = this.getAllCategories.bind(this);
  }

  public async createCategory(req: Request, res: Response) {
    try {
      const request = req.body as ICreateLearnCategory;
      const category = await this.service.createCategory(request);
      res.status(201).json(category);
    } catch (error: unknown) {
      console.error("Erreur lors de la création de la catégorie :", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
    }
  }

  public async createCategories(req: Request, res: Response) {
    try {
      const request = req.body as ICreateLearnCategory[];
      const categories = await this.service.createCategories(request);
      res.status(201).json(categories);
    } catch (error: unknown) {
      console.error("Erreur lors de l'import des catégories :", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
    }
  }

  public async updateCategory(req: Request, res: Response) {
    try {
      const data = req.body as IUpdateLearnCategory;
      const id = req.query.id ? Number(req.query.id) : undefined;
      const uuid = req.query.uuid as string | undefined;

      const category = await this.service.updateCategory(data, id, uuid);
      res.status(200).json(category);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la catégorie :", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
    }
  }

  public async deleteCategory(req: Request, res: Response) {
    try {
      const id = req.query.id ? Number(req.query.id) : undefined;
      const uuid = req.query.uuid as string | undefined;

      const msg = await this.service.deleteCategory(id, uuid);
      res.status(200).json(msg);
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie :", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
    }
  }

  public async getAllCategories(_: Request, res: Response) {
    try {
      const categories = await this.service.getAllCategories();
      res.status(200).json(categories);
    } catch (error) {
      console.error("Erreur lors de la récupération des catégories :", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
    }
  }
}

export default LearnCategoryController;
