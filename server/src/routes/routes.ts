import Router from "express";
import { putKey, getKey } from "../services/services";

export const hollowRouter = Router();

hollowRouter.post("/encrypt/put", putKey)
hollowRouter.get("/encrypt/get/:key", getKey)
