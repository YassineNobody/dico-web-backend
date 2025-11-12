import {
  ICreateLearnCategory,
  IUpdateLearnCategory,
} from "../interfaces/learn/learnCategory";
import LearnCategory from "../models/learnCategory";
import slugify from "slugify";
import { Op } from "sequelize";

class LearnCategoryService {
  // 🔹 Crée une catégorie unique
  public async createCategory(request: ICreateLearnCategory) {
    const name = request.name.trim();

    const exists = await LearnCategory.findOne({
      where: { name: { [Op.iLike]: name } },
    });

    if (exists) {
      throw new Error(`❌ Une catégorie avec le nom "${name}" existe déjà.`);
    }

    const slug = slugify(name, { lower: true, strict: true });

    const category = await LearnCategory.create({
      ...request,
      name,
      slug,
    });

    return category.toJSON();
  }

  // 🔹 Import de plusieurs catégories à la fois
  public async createCategories(requests: ICreateLearnCategory[]) {
    // Nettoyage et suppression des doublons locaux
    const uniqueNames = [...new Set(requests.map((r) => r.name.trim()))];

    // On vérifie ce qui existe déjà en DB
    const existing = await LearnCategory.findAll({
      where: { name: { [Op.in]: uniqueNames } },
    });

    const existingNames = existing.map((c) => c.name);
    const newCategories = uniqueNames
      .filter((n) => !existingNames.includes(n))
      .map((name) => ({
        name,
        slug: slugify(name, { lower: true, strict: true }),
      }));

    if (newCategories.length === 0) {
      throw new Error("❌ Toutes les catégories existent déjà.");
    }

    // Création en bloc (rapide, sans doublons)
    const created = await LearnCategory.bulkCreate(newCategories, {
      ignoreDuplicates: true,
    });

    return created.map((cat) => cat.toJSON());
  }

  // 🔹 Mise à jour par ID ou UUID
  public async updateCategory(
    data: IUpdateLearnCategory,
    id?: number,
    uuid?: string
  ) {
    const category = await LearnCategory.findOne({
      where: id ? { id } : { uuid },
    });

    if (!category) throw new Error("❌ Catégorie non trouvée.");

    if (data.name && data.name.trim() !== category.name) {
      const duplicate = await LearnCategory.findOne({
        where: {
          name: data.name.trim(),
          id: { [Op.ne]: category.id },
        },
      });
      if (duplicate) {
        throw new Error(
          `❌ Une catégorie avec le nom "${data.name}" existe déjà.`
        );
      }

      // Regénère le slug si le nom change
      data.slug = slugify(data.name.trim(), { lower: true, strict: true });
    }

    await category.update(data);
    return category.toJSON();
  }

  // 🔹 Suppression
  public async deleteCategory(id?: number, uuid?: string) {
    const category = await LearnCategory.findOne({
      where: id ? { id } : { uuid },
    });

    if (!category) throw new Error("❌ Catégorie non trouvée.");

    await category.destroy();

    return {
      message: `🗑️ Catégorie "${category.name}" supprimée avec succès.`,
    };
  }

  // 🔹 Récupère toutes les catégories
  public async getAllCategories() {
    const categories = await LearnCategory.findAll({
      order: [["createdAt", "ASC"]],
    });
    return categories.map((c) => c.toJSON());
  }

  // 🔹 Récupère une catégorie (UUID ou ID)
  public async getCategoryByUuid(uuid: string) {
    const category = await LearnCategory.findOne({ where: { uuid } });
    if (!category) throw new Error("❌ Catégorie introuvable.");
    return category.toJSON();
  }

  public async getCategoryById(id: number) {
    const category = await LearnCategory.findOne({ where: { id } });
    if (!category) throw new Error("❌ Catégorie introuvable.");
    return category.toJSON();
  }
}

export default LearnCategoryService;
