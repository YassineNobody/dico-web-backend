import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import { ILearn } from "../interfaces/learn/learn";
import slugify from "slugify";

interface LearnCreationAttributes
  extends Optional<ILearn, "id" | "slug" | "createdAt" | "updatedAt"> {}

class Learn extends Model<ILearn, LearnCreationAttributes> implements ILearn {
  public id!: string;
  public title!: string;
  public slug?: string;
  public urlPdf!: string;
  public categoryId!: number;
  public contentMarkdown?: string;
  public readonly createdAt?: string;
  public readonly updatedAt?: string;
}

// ✅ Initialisation du modèle
Learn.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [3, 255],
      },
    },
    slug: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
      defaultValue: "",
    },
    urlPdf: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    contentMarkdown: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "learn_categories",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "learns",
    modelName: "Learn",
    timestamps: true,
  }
);

// ✅ Hook pour générer automatiquement le slug avant création
Learn.beforeCreate((learn) => {
  learn.slug = slugify(learn.title, { lower: true, strict: true });
});

// ✅ Hook pour régénérer le slug si le titre change
Learn.beforeUpdate((learn) => {
  if (learn.changed("title")) {
    learn.slug = slugify(learn.title, { lower: true, strict: true });
  }
});

export default Learn;
