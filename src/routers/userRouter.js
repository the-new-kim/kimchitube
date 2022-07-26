import express from "express";
import {
  getChangePassword,
  getEdit,
  logout,
  postChangePassword,
  postEdit,
  remove,
  see,
  // startGithubLogin,
  // finishGithubLogin,
  // // startGoogleLogin,
  // // finishGoogleLogin,
  startFbLogin,
  finishFbLogin,
} from "../controllers/userController";
import { avatarUpload, protectorMiddleware } from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(avatarUpload, postEdit);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);

userRouter.get("/remove", protectorMiddleware, remove);
// REGEX Number
// userRouter.get("/:id(\\d+)", see);
userRouter.get("/:id([0-9a-f]{24})", see);

// userRouter.get("/github/start-login", startGithubLogin);
// userRouter.get("/github/finish-login", finishGithubLogin);

// userRouter.get("/google/start-login", startGoogleLogin);
// userRouter.get("/google/finish-login", finishGoogleLogin);

// userRouter.get("/fb/start-login", startFbLogin);
// userRouter.get("/fb/finish-login", finishFbLogin);

export default userRouter;
