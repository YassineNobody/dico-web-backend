import { Request, Response } from "express";
import LearnService from "../services/learn";
import { ICreateLean, IUpdateLearn } from "../interfaces/learn/learn";

class LearnController {
  private service: LearnService;

  constructor() {
    this.service = new LearnService();

    this.createLearn = this.createLearn.bind(this);
    this.createLearns = this.createLearns.bind(this);
    this.updateLearn = this.updateLearn.bind(this);
    this.deleteLearn = this.deleteLearn.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getByCategory = this.getByCategory.bind(this);
    this.getBySlug = this.getBySlug.bind(this);
  }

  // 🔹 Créer un seul cours
  public async createLearn(req: Request, res: Response) {
    try {
      const request = req.body as ICreateLean;
      const learn = await this.service.createLearn(request);
      res.status(201).json(learn);
    } catch (error) {
      console.error("Erreur lors de la création du cours :", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message:
          error instanceof Error ? error.message : "Erreur interne du serveur",
      });
    }
  }

  // 🔹 Importer plusieurs cours
  public async createLearns(req: Request, res: Response) {
    try {
      const requests = req.body as ICreateLean[];
      const learns = await this.service.createLearns(requests);
      res.status(201).json(learns);
    } catch (error) {
      console.error("Erreur lors de l'import des cours :", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message:
          error instanceof Error ? error.message : "Erreur interne du serveur",
      });
    }
  }

  // 🔹 Mettre à jour un cours
  public async updateLearn(req: Request, res: Response) {
    try {
      const slug = req.params.slug as string;
      const updateData = req.body as IUpdateLearn;
      const learn = await this.service.updateLearn(slug, updateData);
      res.status(200).json(learn);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du cours :", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message:
          error instanceof Error ? error.message : "Erreur interne du serveur",
      });
    }
  }

  // 🔹 Supprimer un cours
  public async deleteLearn(req: Request, res: Response) {
    try {
      const slug = req.params.slug as string;
      const msg = await this.service.deleteLearn(slug);
      res.status(200).json(msg);
    } catch (error) {
      console.error("Erreur lors de la suppression du cours :", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message:
          error instanceof Error ? error.message : "Erreur interne du serveur",
      });
    }
  }

  // 🔹 Récupérer tous les cours
  public async getAll(_: Request, res: Response) {
    try {
      const learns = await this.service.getAllLearns();
      res.status(200).json(learns);
    } catch (error) {
      console.error("Erreur lors de la récupération des cours :", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message:
          error instanceof Error ? error.message : "Erreur interne du serveur",
      });
    }
  }

  // 🔹 Récupérer les cours par catégorie
  public async getByCategory(req: Request, res: Response) {
    try {
      const categoryId = Number(req.params.categoryId);
      if (isNaN(categoryId)) {
        res.status(400).json({
          code: "BAD_REQUEST",
          message: "Invalid categoryId parameter",
        });
        return;
      }
      const learns = await this.service.getLearnsByCategory(categoryId);
      res.status(200).json(learns);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des cours par catégorie :",
        error
      );
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message:
          error instanceof Error ? error.message : "Erreur interne du serveur",
      });
    }
  }

  // 🔹 Récupérer un cours par son slug
  public async getBySlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug as string;
      const learn = await this.service.getLearnBySlug(slug);
      res.status(200).json(learn);
    } catch (error) {
      console.error("Erreur lors de la récupération du cours :", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message:
          error instanceof Error ? error.message : "Erreur interne du serveur",
      });
    }
  }
}

export default LearnController;
