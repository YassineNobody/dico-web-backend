import express, { Express } from "express";
import cors from "cors";
import sequelize from "./config/database";
import constants from "./config/constants";
import routerAuthenticate from "./routes/user";
import initRelations from "./models/relations";
import routerSettings from "./routes/settings";
import routerWord from "./routes/word";
import routerLearnCategory from "./routes/learnCategory";
import routerLearn from "./routes/learn";
const app = express();

function configGlobal(app: Express) {
  app.use(cors());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
}
function configRouter(app: Express) {
  const urlApi = "/api";

  app.use(`${urlApi}/auth`, routerAuthenticate);
  app.use(`${urlApi}/settings`, routerSettings);
  app.use(`${urlApi}/words`, routerWord);
  app.use(`${urlApi}/learn-categories`, routerLearnCategory);
  app.use(`${urlApi}/learns`, routerLearn);
}
async function startServer(app: Express) {
  try {
    configGlobal(app);
    configRouter(app);

    await sequelize.authenticate();
    initRelations();
    await sequelize.sync();

    // ✅ utilise le port fourni par la plateforme
    const PORT = parseInt(process.env.PORT || "") || constants.PORT || 3000;
    const HOST = process.env.HOST || "0.0.0.0";

    app.listen(PORT, HOST, () => {
      console.log(`🚀 Serveur en route : http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Erreur lors du démarrage du serveur :", error);
  }
}

export { app, startServer };
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection :", err);
  process.exit(1);
});
