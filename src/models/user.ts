import { DataTypes, Model, Optional } from "sequelize";
import { IUser, UserRole } from "../interfaces/user/user";
import sequelize from "../config/database";

interface UserCreationAttributes extends Optional<IUser, "id" | "uuid"> {}
class User extends Model<IUser, UserCreationAttributes> implements IUser {
  public id!: number;
  public email!: string;
  public username!: string;
  public nickname!: string;
  public password!: string;
  public role!: UserRole;
  public uuid?: string;
  public profile?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z\d]).{8,}$/,
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    profile: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null, // ou une image par défaut
      validate: {
        isUrl: true,
      },
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.USER,
    }
  },
  {
    sequelize,
    timestamps: true,
    tableName: "users",
    modelName: "User",
  }
);
export default User;
