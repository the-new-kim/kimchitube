import express from "express";
import {
  getChangePassword,
  getEdit,
  logout,
  postChangePassword,
  postEdit,
  remove,
  see,
} from "../controllers/userController";
import { protectorMiddleware, uploadFile } from "../middlewares";

// /login -> Login
// /search -> Search

// /users/:id -> See User
// /users/logout -> Log Out
// /users/edit -> Edit MY Profile
// /users/delete -> Delete MY Profile

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(uploadFile.single("avatar"), postEdit);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);

userRouter.get("/remove", protectorMiddleware, remove);
userRouter.get("/:id(\\d+)", see);

export default userRouter;
