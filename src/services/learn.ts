import { ICreateLean, IUpdateLearn } from "../interfaces/learn/learn";
import Learn from "../models/learn";
import LearnCategory from "../models/learnCategory";

class LearnService {
  // 🔹 Créer un cours unique
  public async createLearn(request: ICreateLean) {
    // Vérifie que la catégorie existe
    const category = await LearnCategory.findByPk(request.categoryId);
    if (!category) {
      throw new Error("Category does not exist");
    }

    // Vérifie l’existence d’un doublon (titre + catégorie)
    const existed = await Learn.findOne({
      where: {
        title: request.title.toLowerCase(),
        categoryId: request.categoryId,
      },
    });
    if (existed) {
      throw new Error("Learn with this title already exists in this category");
    }

    const learn = await Learn.create(request);
    return learn.toJSON();
  }

  // 🔹 Créer plusieurs cours (import massif)
  public async createLearns(requests: ICreateLean[]) {
    const createdLearns: any[] = [];

    for (const request of requests) {
      const category = await LearnCategory.findByPk(request.categoryId);
      if (!category) continue;

      const existed = await Learn.findOne({
        where: {
          title: request.title.toLowerCase(),
          categoryId: request.categoryId,
        },
      });

      if (!existed) {
        const learn = await Learn.create(request);
        createdLearns.push(learn.toJSON());
      }
    }

    return createdLearns;
  }

  // 🔹 Mettre à jour un cours par slug
  public async updateLearn(slug: string, updateData: IUpdateLearn) {
    const learn = await Learn.findOne({ where: { slug } });
    if (!learn) throw new Error("Learn not found");

    // Vérifie si la catégorie cible existe
    if (updateData.categoryId) {
      const category = await LearnCategory.findByPk(updateData.categoryId);
      if (!category) throw new Error("Category does not exist");
    }

    // Vérifie s’il y a déjà un autre cours avec le même titre dans la catégorie
    if (updateData.title) {
      const existed = await Learn.findOne({
        where: {
          title: updateData.title.toLowerCase(),
          categoryId: updateData.categoryId ?? learn.categoryId,
        },
      });

      if (existed && existed.id !== learn.id) {
        throw new Error(
          "Another learn with this title already exists in this category"
        );
      }
    }

    await learn.update(updateData);
    return learn.toJSON();
  }

  // 🔹 Supprimer un cours par slug
  public async deleteLearn(slug: string) {
    const learn = await Learn.findOne({ where: { slug } });
    if (!learn) throw new Error("Learn not found");

    await learn.destroy();
    return { message: "Learn deleted successfully" };
  }

  // 🔹 Récupérer tous les cours (triés par date descendante)
  public async getAllLearns() {
    const learns = await Learn.findAll({
      include: [
        {
          model: LearnCategory,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return learns.map((l) => l.toJSON());
  }

  // 🔹 Récupérer tous les cours d'une catégorie spécifique
  public async getLearnsByCategory(categoryId: number) {
    const learns = await Learn.findAll({
      where: { categoryId },
      include: [
        {
          model: LearnCategory,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return learns.map((l) => l.toJSON());
  }

  // 🔹 Récupérer un cours par son slug
  public async getLearnBySlug(slug: string) {
    const learn = await Learn.findOne({
      where: { slug },
      include: [
        {
          model: LearnCategory,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    if (!learn) throw new Error("Learn not found");
    return learn.toJSON();
  }
}

export default LearnService;
