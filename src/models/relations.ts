/**
 * 💡 Cette fonction initialise toutes les relations Sequelize
 * entre les différents modèles de l'application.
 * À appeler juste après l'import des modèles,
 * avant sequelize.sync() ou toute interaction avec la DB.
 */

import Dico from "./dico";
import User from "./user";
import Settings from "./settings";
import Learn from "./learn";
import LearnCategory from "./learnCategory";

export const initRelations = () => {
  // 🔹 User → Dico
  User.hasMany(Dico, {
    foreignKey: "userId",
    as: "dicos",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Dico.belongsTo(User, { foreignKey: "userId", as: "user" });

  // 🔹 User → Settings (1–1)
  User.hasOne(Settings, {
    foreignKey: "userId",
    as: "settings",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Settings.belongsTo(User, { foreignKey: "userId", as: "user" });

  // 🔹 LearnCategory → Learn (1–N)
  LearnCategory.hasMany(Learn, {
    foreignKey: "categoryId",
    as: "learns",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });
  Learn.belongsTo(LearnCategory, {
    foreignKey: "categoryId",
    as: "category",
  });

  console.log("✅ Relations Sequelize initialisées avec succès");
};

export default initRelations;
