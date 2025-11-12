import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import { ILearnCategory } from "../interfaces/learn/learnCategory";

interface LearnCategoryCreationAttributes
  extends Optional<
    ILearnCategory,
    "id" | "uuid" | "slug" | "createdAt" | "updatedAt"
  > {}

class LearnCategory
  extends Model<ILearnCategory, LearnCategoryCreationAttributes>
  implements ILearnCategory
{
  public id!: string;
  public uuid?: string;
  public slug?: string;
  public name!: string;
  public description?: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
}

LearnCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [1, 200],
          msg: "Le nom doit contenir entre 1 et 200 caractères",
        },
      },
    },
    slug: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: "learn_categories",
    modelName: "LearnCategory",
    timestamps: true,
  }
);

export default LearnCategory;
