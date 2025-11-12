import dotenv from "dotenv";
dotenv.config();
import "./types/express";
import { app, startServer } from "./server";

startServer(app);
