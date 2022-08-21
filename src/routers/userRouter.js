import express from "express";
import {
  getChangePassword,
  getEdit,
  logout,
  postChangePassword,
  postEdit,
  remove,
  see,
  startGithubLogin,
  finishGithubLogin,
} from "../controllers/userController";
import { avatarUpload, protectorMiddleware } from "../middlewares";

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
  .post(avatarUpload.single("avatar"), postEdit);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);

userRouter.get("/remove", protectorMiddleware, remove);
// REGEX Number
// userRouter.get("/:id(\\d+)", see);
userRouter.get("/:id([0-9a-f]{24})", see);

userRouter.get("/github/start-login", startGithubLogin);
userRouter.get("/github/finish-login", finishGithubLogin);

export default userRouter;
