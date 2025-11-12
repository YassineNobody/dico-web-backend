import { Request, Response } from "express";
import WordBaseService from "../services/wordBase";
import { ICreateDico, IUpdateDico } from "../interfaces/dico/dico";

class WordBaseController {
  private wordBaseService: WordBaseService;

  constructor() {
    this.wordBaseService = new WordBaseService();
    this.createWord = this.createWord.bind(this);
    this.importWords = this.importWords.bind(this);
    this.updateWord = this.updateWord.bind(this);
    this.deleteWord = this.deleteWord.bind(this);
  }

  public async createWord(req: Request, res: Response) {
    try {
      const wordRequest: ICreateDico = req.body;
      const word = await this.wordBaseService.createWord(
        wordRequest,
        req.user!
      );
      res.status(201).json(word.toJSON());
      return;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message === "❌ Ce mot existe déjà (même sans voyelles)."
      ) {
        res.status(409).json({
          code: "CONFLICT",
          message: `Ce mot existe déjà (même sans voyelles)`,
        });
        return;
      } else if (
        error instanceof Error &&
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const field = (error as any).errors[0].path;
        res.status(409).json({
          code: "CONFLICT",
          message: `${field} existe déjà`,
        });
        return;
      } else {
        console.log(error);
        res.status(500).json({
          code: "INTERNAL_ERROR",
          message: "Erreur interne du serveur",
        });
        return;
      }
    }
  }

  public async importWords(req: Request, res: Response) {
    try {
      const request: ICreateDico[] = req.body;
      const words = await this.wordBaseService.importWords(request, req.user!);
      res.status(201).json(words);
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

  public async updateWord(req: Request, res: Response) {
    try {
      const uuid: string = req.params.uuid;
      const updates: IUpdateDico = req.body;
      const word = await this.wordBaseService.updateWord(
        uuid,
        updates,
        req.user!
      );
      res.status(200).json(word.toJSON());
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
  public async deleteWord(req: Request, res: Response) {
    try {
      const uuid: string = req.params.uuid;
      const confirmation = await this.wordBaseService.deleteWord(
        uuid,
        req.user!
      );
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
export default WordBaseController;