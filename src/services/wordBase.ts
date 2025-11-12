import { Op } from "sequelize";
import { ICreateDico, IUpdateDico } from "../interfaces/dico/dico";
import { IUserSafe } from "../interfaces/user/user";
import Dico from "../models/dico";

class WordBaseService {
  // 🔹 Supprime les voyelles arabes (fatḥa, ḍamma, kasra, sukūn, etc.)
  private removeHarakat(text: string): string {
    return text.replace(/[\u064B-\u0652]/g, "");
  }

  // 🔹 Création d’un mot
  public async createWord(word: ICreateDico, user: IUserSafe) {
    try {
      const cleanSource = this.removeHarakat(word.translationWord);

      // Vérifie si un mot similaire existe déjà pour cet utilisateur
      const exists = await Dico.findOne({
        where: {
          userId: user.id,
          normalizedWord: cleanSource,
          targetLanguage: word.targetLanguage,
        },
      });

      if (exists) {
        throw new Error("❌ Ce mot existe déjà (même sans voyelles).");
      }

      // Création du mot
      const newWord = await Dico.create({
        ...word,
        normalizedWord: cleanSource,
        userId: user.id!,
      });

      return newWord;
    } catch (error: unknown) {
      console.error("[WordService.createWord]", error);
      throw error;
    }
  }

  // 🔹 Importation massive optimisée
  public async importWords(words: ICreateDico[], user: IUserSafe) {
    if (!Array.isArray(words) || words.length === 0) {
      throw new Error("❌ Le tableau de mots est vide ou invalide.");
    }

    // 🧹 Nettoyage et normalisation
    const prepared = words.map((w) => ({
      ...w,
      sourceWord: w.sourceWord.trim(),
      translationWord: w.translationWord.trim(),
      normalizedWord: this.removeHarakat(w.translationWord.trim()),
      userId: user.id!,
    }));

    // 🔍 Récupère les doublons existants pour cet utilisateur
    const existing = await Dico.findAll({
      where: {
        userId: user.id,
        normalizedWord: {
          [Op.in]: prepared.map((w) => w.normalizedWord),
        },
      },
      attributes: ["normalizedWord"],
    });

    const existingSet = new Set(existing.map((e) => e.normalizedWord));

    // 🚫 Filtre les doublons
    const toInsert = prepared.filter((w) => !existingSet.has(w.normalizedWord));

    if (toInsert.length === 0) {
      return {
        created: 0,
        skipped: prepared.length,
        errors: [],
        message: "Aucun mot ajouté (tous déjà existants).",
      };
    }

    // ⚡ Insertion massive en une requête SQL
    const created = await Dico.bulkCreate(toInsert, {
      ignoreDuplicates: true, // 🔥 PostgreSQL >= 9.5 gère ON CONFLICT DO NOTHING
    });

    // 🧮 Statistiques
    const createdCount = created.length;
    const skippedCount = prepared.length - createdCount;

    return {
      created: createdCount,
      skipped: skippedCount,
      errors: [],
      message: `✅ ${createdCount} mots ajoutés, ${skippedCount} ignorés.`,
    };
  }

  // 🔹 Mise à jour d’un mot existant
  public async updateWord(uuid: string, updates: IUpdateDico, user: IUserSafe) {
    try {
      // Recherche du mot à mettre à jour
      const existingWord = await Dico.findOne({
        where: { uuid, userId: user.id },
      });

      if (!existingWord) {
        throw new Error("❌ Mot introuvable ou non autorisé.");
      }

      // Si le mot source change, on le renormalise et on vérifie les doublons
      if (updates.sourceWord) {
        const cleanSource = this.removeHarakat(updates.sourceWord);

        const duplicate = await Dico.findOne({
          where: {
            userId: user.id,
            normalizedWord: cleanSource,
            targetLanguage:
              updates.targetLanguage ?? existingWord.targetLanguage,
          },
        });

        if (duplicate && duplicate.uuid !== uuid) {
          throw new Error("⚠️ Ce mot existe déjà (même sans voyelles).");
        }

        updates.normalizedWord = cleanSource;
      }

      // Nettoyage facultatif de la traduction
      if (updates.translationWord) {
        updates.translationWord = this.removeHarakat(updates.translationWord);
      }

      // Mise à jour
      await existingWord.update(updates);

      return existingWord;
    } catch (error: unknown) {
      console.error("[WordService.updateWord]", error);
      throw error;
    }
  }

  // 🔹 Suppression d’un mot
  public async deleteWord(uuid: string, user: IUserSafe) {
    try {
      const word = await Dico.findOne({ where: { userId: user.id!, uuid } });

      if (!word) {
        throw new Error("❌ Mot introuvable ou non autorisé.");
      }

      await word.destroy(); // ✅ plus élégant et sûr que Dico.destroy({ where: ... })
      return { message: "✅ Mot supprimé avec succès." };
    } catch (error) {
      console.error("[WordService.deleteWord]", error);
      throw error;
    }
  }
}

export default WordBaseService;
