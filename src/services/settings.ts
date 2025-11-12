import { ISettings } from "../interfaces/setting/settings";
import { IUserSafe } from "../interfaces/user/user";
import Settings from "../models/settings";
import User from "../models/user";

class SettingsService {
  // 🔹 Méthode privée pour récupérer les settings d’un utilisateur
  private async getSettings(userId: number) {
    const settings = await Settings.findOne({ where: { userId } });
    return settings;
  }

  // 🔹 Création automatique des settings par défaut lors de l’inscription
  public async createDefaultSettings(user: User) {
    const exists = await this.getSettings(user.id);
    if (exists) return exists; // éviter les doublons

    const settings: ISettings = {
      isPublicWords: false,
      showOthersWords: false,
      userId: user.id,
    };

    return await Settings.create(settings);
  }

  // 🔹 Récupération publique (utile pour un controller)
  public async getUserSettings(user: IUserSafe) {
    const settings = await this.getSettings(user.id!);
    if (!settings) {
      // créer automatiquement s’il n’existe pas (sécurité)
      return await this.createDefaultSettings(user as any);
    }
    return settings;
  }

  // 🔹 Bascule "mots publics" ON/OFF
  public async toggleWordVisibility(user: IUserSafe) {
    const settings = await this.getSettings(user.id!);
    if (!settings) return null;

    const updated = await settings.update({
      isPublicWords: !settings.isPublicWords,
    });
    return updated;
  }

  // 🔹 Bascule "voir les mots des autres" ON/OFF
  public async toggleShowOthersWords(user: IUserSafe) {
    const settings = await this.getSettings(user.id!);
    if (!settings) return null;

    const updated = await settings.update({
      showOthersWords: !settings.showOthersWords,
    });
    return updated;
  }

  // 🔹 Réinitialiser les paramètres à leurs valeurs par défaut
  public async resetSettings(user: IUserSafe) {
    const settings = await this.getSettings(user.id!);
    if (!settings) return null;

    await settings.update({
      isPublicWords: false,
      showOthersWords: false,
    });

    return settings;
  }
}

export default SettingsService;
