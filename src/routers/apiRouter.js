import express from "express";
import {
  createComment,
  deleteComment,
  likeComment,
  likeVideo,
  registerView,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/video/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/video/:id([0-9a-f]{24})/comment", createComment);
apiRouter.post("/video/:id([0-9a-f]{24})/like", likeVideo);
apiRouter.post("/comment/:id([0-9a-f]{24})/like", likeComment);
apiRouter.delete("/comment/:id([0-9a-f]{24})/delete", deleteComment);

export default apiRouter;
