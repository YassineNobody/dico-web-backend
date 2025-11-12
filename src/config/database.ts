import { Sequelize } from "sequelize";

// Si tu veux que Sequelize prenne automatiquement DATABASE_URL en priorité :
let sequelize: Sequelize;

if (process.env.DATABASE_URL) {
  // ✅ Cas où on utilise une URL complète (Neon, Render, Railway, etc.)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Obligatoire pour Neon.tech
      },
    },
    logging: false,
  });
} else {
  // ✅ Cas local (variables séparées)
  const config = {
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_DATABASE || "database_name",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres" as const,
    logging: false,
  };

  sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
  });
}

export default sequelize;
