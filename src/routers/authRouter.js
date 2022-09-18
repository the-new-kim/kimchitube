import express from "express";
import {
  finishFbLogin,
  finishGithubLogin,
  finishGoogleLogin,
  startFbLogin,
  startGithubLogin,
  startGoogleLogin,
} from "../controllers/authController";

const authRouter = express.Router();

authRouter.get("/github/start-login", startGithubLogin);
authRouter.get("/github/finish-login", finishGithubLogin);
authRouter.get("/google/start-login", startGoogleLogin);
authRouter.get("/google/finish-login", finishGoogleLogin);
authRouter.get("/fb/start-login", startFbLogin);
authRouter.get("/fb/finish-login", finishFbLogin);

export default authRouter;
