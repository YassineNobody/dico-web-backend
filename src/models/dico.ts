import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import { IDico, WordType } from "../interfaces/dico/dico";
import User from "./user";

interface DicoCreationAttributes
  extends Optional<IDico, "id" | "uuid" | "createdAt"> {}

class Dico extends Model<IDico, DicoCreationAttributes> implements IDico {
  public id!: number;
  public uuid?: string;
  public sourceLanguage!: "FR" | "AR";
  public targetLanguage!: "FR" | "AR";
  public wordType!: WordType;
  public sourceWord!: string;
  public translationWord!: string;
  public normalizedWord!: string;
  public createdAt?: Date;
  public userId!: number;
  public readonly user?: User;
}

Dico.init(
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
    sourceLanguage: {
      type: DataTypes.ENUM("FR", "AR"),
      allowNull: false,
    },
    targetLanguage: {
      type: DataTypes.ENUM("FR", "AR"),
      allowNull: false,
    },
    wordType: {
      type: DataTypes.ENUM(...Object.values(WordType)),
      allowNull: false,
    },
    sourceWord: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [1, 255] },
    },
    translationWord: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [1, 255] },
    },
    normalizedWord: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  {
    sequelize,
    timestamps: true,
    tableName: "dicos",
    modelName: "Dico",
    indexes: [
      {
        unique: true,
        fields: ["userId", "normalizedWord", "targetLanguage"],
      },
    ],
  }
);

export default Dico;
