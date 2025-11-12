import { Request, Response } from "express";
import WordGetterService from "../services/word";
import { WordType } from "../interfaces/dico/dico";

class WordGetterController {
  private wordGetterService: WordGetterService;
  constructor() {
    this.wordGetterService = new WordGetterService();
    this.getMyWords = this.getMyWords.bind(this);
    this.getWordByUuid = this.getWordByUuid.bind(this);
    this.searchWords = this.searchWords.bind(this);
    this.getByLanguages = this.getByLanguages.bind(this);
    this.getByType = this.getByType.bind(this);
    this.countByLanguages = this.countByLanguages.bind(this);
    this.getLanguageByPair = this.getLanguageByPair.bind(this);
    this.clearAllWords = this.clearAllWords.bind(this);
  }

  public async getMyWords(req: Request, res: Response) {
    try {
      const words = await this.wordGetterService.getMyWords(req.user!);
      res.status(200).json(words.map((word) => word.toJSON()));
      return;
    } catch (error: unknown) {
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
      return;
    }
  }

  public async getWordByUuid(req: Request, res: Response) {
    try {
      const uuid: string = req.params.uuid;
      const word = await this.wordGetterService.getWordByUuid(uuid, req.user!);
      res.status(200).json(word.toJSON());
      return;
    } catch (error: unknown) {
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
      return;
    }
  }

  public async searchWords(req: Request, res: Response) {
    try {
      const query: string = req.query.q as string;
      const words = await this.wordGetterService.searchWords(query, req.user!);
      res.status(200).json(words);
      return;
    } catch (error: unknown) {
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
      return;
    }
  }

  public async getByLanguages(req: Request, res: Response) {
    try {
      const sourceLanguage = req.query.sourceLanguage as "AR" | "FR";
      const targetLanguage = req.query.targetLanguage as "AR" | "FR";
      const words = await this.wordGetterService.getByLanguages(
        req.user!,
        sourceLanguage,
        targetLanguage
      );
      res.status(200).json(words);
      return;
    } catch (error: unknown) {
      console.log(error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
      return;
    }
  }

  public async getByType(req: Request, res: Response) {
    try {
      const type = req.query.type as WordType;
      const sourceLanguage = req.query.sourceLanguage as "AR" | "FR";
      const targetLanguage = req.query.targetLanguage as "AR" | "FR";
      const words = await this.wordGetterService.getByType(
        req.user!,
        type,
        sourceLanguage,
        targetLanguage
      );
      res.status(200).json(words);
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
      return;
    }
  }

  public async countByLanguages(req: Request, res: Response) {
    try {
      const sourceLanguage = req.query.sourceLanguage as "AR" | "FR";
      const targetLanguage = req.query.targetLanguage as "AR" | "FR";
      const count = await this.wordGetterService.countByLanguages(
        req.user!,
        sourceLanguage,
        targetLanguage
      );
      res.status(200).json({ count });
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
      return;
    }
  }

  public async getLanguageByPair(req: Request, res: Response) {
    try {
      const languages = await this.wordGetterService.getLanguagePairs(
        req.user!
      );
      res.status(200).json(languages);
      return;
    } catch (error: unknown) {
      console.log(error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
      return;
    }
  }

  public async clearAllWords(req: Request, res: Response) {
    try {
      const confirmation = await this.wordGetterService.clearAll(req.user!);
      res.status(200).json(confirmation);
      return;
    } catch (error: unknown) {
      console.log(error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
      return;
    }
  }
}

export default WordGetterController;
