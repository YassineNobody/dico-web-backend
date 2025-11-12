import { Router } from "express";
import ControllerSettings from "../controllers/settings";
import { verifyToken } from "../middlewares/authenticate";

const routerSettings = Router();
const ctx = new ControllerSettings();

routerSettings.get("/", verifyToken, ctx.getSettings);

routerSettings.patch("/visibility", verifyToken, ctx.setVisibility);

routerSettings.patch("/show-other", verifyToken, ctx.setShowOther);

routerSettings.patch("/reset", verifyToken, ctx.resetSettings);

export default routerSettings;
