import express from "express";
import {
  getJoin,
  getLogin,
  postJoin,
  postLogin,
} from "../controllers/userController";
import { search, home } from "../controllers/videoController";
import { publicOnlyMiddleware } from "../middlewares";

const globalRouter = express.Router();

globalRouter.get("/", home);
globalRouter
  .route("/join")
  .all(publicOnlyMiddleware)
  .get(getJoin)
  .post(postJoin);
globalRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(getLogin)
  .post(postLogin);
globalRouter.get("/search", search);

export default globalRouter;
