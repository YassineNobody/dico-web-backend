import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import { ISettings } from "../interfaces/setting/settings";
interface SettingsCreationAttributes
  extends Optional<ISettings, "id" | "uuid"> {}

class Settings
  extends Model<ISettings, SettingsCreationAttributes>
  implements ISettings
{
  public id!: number;
  public uuid?: string;
  public isPublicWords!: boolean;
  public showOthersWords!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public userId!: number;
}

Settings.init(
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
    isPublicWords: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // 🔹 Privé par défaut
    },
    showOthersWords: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // 🔹 Ne voit pas les mots des autres par défaut
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // 🔹 1 seul Settings par User
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    timestamps: true,
    tableName: "settings",
    modelName: "Settings",
  }
);

export default Settings;
