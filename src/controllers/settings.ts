import { Request, Response } from "express";
import SettingsService from "../services/settings";

class ControllerSettings {
  private settingsService: SettingsService;
  constructor() {
    this.settingsService = new SettingsService();
    this.getSettings = this.getSettings.bind(this);
    this.setShowOther = this.setShowOther.bind(this);
    this.setVisibility = this.setVisibility.bind(this);
    this.resetSettings = this.resetSettings.bind(this);
  }
  public async getSettings(req: Request, res: Response) {
    try {
      const settings = await this.settingsService.getUserSettings(req.user!);
      res.status(200).json(settings.toJSON());
      return;
    } catch (error) {
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
      return;
    }
  }

  public async setVisibility(req: Request, res: Response) {
    try {
      const settings = await this.settingsService.toggleWordVisibility(
        req.user!
      );
      res.status(200).json(settings ? settings.toJSON() : null);
      return;
    } catch (error) {
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
      return;
    }
  }

  public async setShowOther(req: Request, res: Response) {
    try {
      const settings = await this.settingsService.toggleShowOthersWords(
        req.user!
      );
      res.status(200).json(settings ? settings.toJSON() : null);
      return;
    } catch (error) {
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
      return;
    }
  }

  public async resetSettings(req: Request, res: Response) {
    try {
      const settings = await this.settingsService.resetSettings(req.user!);
      res.status(200).json(settings ? settings.toJSON() : null);
      return;
    } catch (error) {
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Erreur interne du serveur",
      });
      return;
    }
  }
}

export default ControllerSettings;
