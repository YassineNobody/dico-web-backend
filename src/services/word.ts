import { Op, Sequelize } from "sequelize";
import { IUserSafe } from "../interfaces/user/user";
import { WordType } from "../interfaces/dico/dico";
import Dico from "../models/dico";
import Settings from "../models/settings";
import User from "../models/user";
import SettingsService from "./settings";

class WordGetterService {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  // 🔹 Supprime les voyelles arabes
  private removeHarakat(text: string): string {
    return text.replace(/[\u064B-\u0652]/g, "");
  }

  // 🔹 Génère une clé unique pour un mot (pour déduplication)
  private getWordKey(w: {
    normalizedWord: string;
    translationWord: string;
    sourceLanguage: string;
    targetLanguage: string;
  }): string {
    return `${w.sourceLanguage}-${
      w.targetLanguage
    }-${w.normalizedWord.toLowerCase()}-${w.translationWord.toLowerCase()}`;
  }

  // 🔹 Récupère les mots personnels
  public async getMyWords(user: IUserSafe) {
    return Dico.findAll({
      where: { userId: user.id },
      order: [["createdAt", "DESC"]],
    });
  }

  // 🔹 Récupère un mot précis
  public async getWordByUuid(uuid: string, user: IUserSafe) {
    const word = await Dico.findOne({ where: { uuid, userId: user.id } });
    if (!word) throw new Error("❌ Mot introuvable ou non autorisé.");
    return word;
  }

  // 🔹 Récupère les mots publics visibles
  private async getVisiblePublicWords(
    user?: IUserSafe | null,
    extraWhere: any = {}
  ) {
    const whereUser = user ? { userId: { [Op.ne]: user.id } } : {};

    const words = await Dico.findAll({
      attributes: [
        "normalizedWord",
        [Sequelize.fn("MIN", Sequelize.col("Dico.sourceWord")), "sourceWord"],
        [
          Sequelize.fn("MIN", Sequelize.col("Dico.translationWord")),
          "translationWord",
        ],
        "sourceLanguage",
        "targetLanguage",
        "wordType",
        "userId",
        [Sequelize.fn("MIN", Sequelize.col("Dico.createdAt")), "createdAt"],
      ],
      include: [
        {
          model: User,
          as: "user",
          required: true,
          attributes: ["id", "username", "nickname", "profile"],
          include: [
            {
              model: Settings,
              as: "settings",
              required: true,
              where: { isPublicWords: true },
              attributes: [],
            },
          ],
        },
      ],
      where: { ...whereUser, ...extraWhere },
      group: [
        "Dico.normalizedWord",
        "Dico.sourceLanguage",
        "Dico.targetLanguage",
        "Dico.wordType",
        "Dico.userId",
        "user.id",
      ],
      order: [
        [Sequelize.literal('"Dico"."normalizedWord"'), "ASC"],
        [Sequelize.literal('"createdAt"'), "DESC"],
      ],
    });

    return words.map((w) => ({
      ...w.toJSON(),
      author: {
        id: w.user?.id,
        username: w.user?.username,
        nickname: w.user?.nickname,
        profile: w.user?.profile,
      },
    }));
  }

  // 🔁 Fusionne les mots (priorité utilisateur, suppression des doublons)
  private mergeWords(
    myWords: any[],
    publicWords: any[]
  ): (typeof myWords)[number][] {
    const map = new Map<string, any>();

    // 🟢 Ajoute d'abord les mots personnels (priorité)
    for (const w of myWords) {
      const key = this.getWordKey(w);
      map.set(key, { ...w.toJSON(), author: null });
    }

    // 🟣 Puis les mots publics, uniquement s’ils n’existent pas déjà
    for (const w of publicWords) {
      const key = this.getWordKey(w);
      if (!map.has(key)) map.set(key, w);
    }

    return Array.from(map.values());
  }

  // 🔹 Recherche flexible (perso + publics)
  public async searchWords(query: string, user?: IUserSafe) {
    const cleanQuery = this.removeHarakat(query.trim());
    const where = {
      [Op.or]: [
        { normalizedWord: { [Op.iLike]: `%${cleanQuery}%` } },
        { translationWord: { [Op.iLike]: `%${cleanQuery}%` } },
      ],
    };

    let myWords: any[] = [];
    if (user) {
      myWords = await Dico.findAll({
        where: { userId: user.id, ...where },
        order: [["createdAt", "DESC"]],
      });
    }

    const publicWords = await this.getVisiblePublicWords(user, where);

    return this.mergeWords(myWords, publicWords);
  }

  // 🔹 Récupère les mots selon langues (perso + publics)
  public async getByLanguages(
    user: IUserSafe | null,
    sourceLang: "FR" | "AR",
    targetLang: "FR" | "AR"
  ) {
    const whereClause = {
      [Op.or]: [
        { sourceLanguage: sourceLang, targetLanguage: targetLang },
        { sourceLanguage: targetLang, targetLanguage: sourceLang },
      ],
    };

    const [myWords, publicWords] = await Promise.all([
      user
        ? Dico.findAll({
            where: { userId: user.id, ...whereClause },
            order: [["createdAt", "DESC"]],
          })
        : [],
      this.getVisiblePublicWords(user, whereClause),
    ]);

    const merged = this.mergeWords(myWords, publicWords);

    // 🔁 Inversion automatique si FR↔AR inversé
    return merged.map((w) => {
      if (w.sourceLanguage !== sourceLang) {
        return {
          ...w,
          sourceWord: w.translationWord,
          sourceLanguage: sourceLang,
          translationWord: w.sourceWord,
          targetLanguage: targetLang,
        };
      }
      return w;
    });
  }

  // 🔹 Récupère les mots par type (perso + publics)
  public async getByType(
    user: IUserSafe | null,
    type: WordType,
    sourceLang: "FR" | "AR",
    targetLang: "FR" | "AR"
  ) {
    const whereClause = {
      wordType: type,
      [Op.or]: [
        { sourceLanguage: sourceLang, targetLanguage: targetLang },
        { sourceLanguage: targetLang, targetLanguage: sourceLang },
      ],
    };

    const [myWords, publicWords] = await Promise.all([
      user
        ? Dico.findAll({
            where: { userId: user.id, ...whereClause },
            order: [["createdAt", "DESC"]],
          })
        : [],
      this.getVisiblePublicWords(user, whereClause),
    ]);

    const merged = this.mergeWords(myWords, publicWords);

    return merged.map((w) => {
      if (w.sourceLanguage !== sourceLang) {
        return {
          ...w,
          sourceWord: w.translationWord,
          sourceLanguage: sourceLang,
          translationWord: w.sourceWord,
          targetLanguage: targetLang,
        };
      }
      return w;
    });
  }

  // 🔹 Compte total (privé + public)
  public async countByLanguages(
    user: IUserSafe | null,
    sourceLang: "FR" | "AR",
    targetLang: "FR" | "AR"
  ) {
    const whereClause = {
      [Op.or]: [
        { sourceLanguage: sourceLang, targetLanguage: targetLang },
        { sourceLanguage: targetLang, targetLanguage: sourceLang },
      ],
    };

    if (!user) {
      // 🔸 Non connecté : uniquement publics
      return await Dico.count({
        include: [
          {
            model: User,
            as: "user",
            include: [
              {
                model: Settings,
                as: "settings",
                where: { isPublicWords: true },
              },
            ],
          },
        ],
        where: whereClause,
      });
    }

    const [privateCount, publicCount] = await Promise.all([
      Dico.count({ where: { userId: user.id, ...whereClause } }),
      (async () => {
        const settings = await this.settingsService.getUserSettings(user);
        if (!settings.showOthersWords) return 0;

        return Dico.count({
          include: [
            {
              model: User,
              as: "user",
              include: [
                {
                  model: Settings,
                  as: "settings",
                  where: { isPublicWords: true },
                },
              ],
            },
          ],
          where: { userId: { [Op.ne]: user.id }, ...whereClause },
        });
      })(),
    ]);

    return privateCount + publicCount;
  }

  // 🔹 Récupère les paires de langues (perso + publics)
  public async getLanguagePairs(user: IUserSafe) {
    const settings = await this.settingsService.getUserSettings(user);

    const userPairs = await Dico.findAll({
      where: { userId: user.id },
      attributes: [
        [Sequelize.literal("DISTINCT sourceLanguage"), "sourceLanguage"],
        [Sequelize.literal("targetLanguage"), "targetLanguage"],
      ],
    });

    let publicPairs: any[] = [];
    if (settings.showOthersWords) {
      publicPairs = await Dico.findAll({
        include: [
          {
            model: User,
            as: "user",
            include: [
              {
                model: Settings,
                as: "settings",
                where: { isPublicWords: true },
              },
            ],
          },
        ],
        where: { userId: { [Op.ne]: user.id } },
        attributes: [
          [Sequelize.literal("DISTINCT sourceLanguage"), "sourceLanguage"],
          [Sequelize.literal("targetLanguage"), "targetLanguage"],
        ],
      });
    }

    const combined = [...userPairs, ...publicPairs];
    const map = new Map<string, any>();
    for (const p of combined) {
      const key = `${(p as any).sourceLanguage}-${(p as any).targetLanguage}`;
      if (!map.has(key)) map.set(key, p);
    }

    return Array.from(map.values()).map((row) => ({
      source: (row as any).sourceLanguage,
      target: (row as any).targetLanguage,
    }));
  }

  // 🔹 Supprime tous les mots du user
  public async clearAll(user: IUserSafe) {
    const deleted = await Dico.destroy({ where: { userId: user.id } });
    return { message: `🗑️ ${deleted} mots supprimés.` };
  }
}

export default WordGetterService;
