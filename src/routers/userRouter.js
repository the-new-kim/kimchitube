import express from "express";
import { edit, logout, remove, see } from "../controllers/userController";

// /login -> Login
// /search -> Search

// /users/:id -> See User
// /users/logout -> Log Out
// /users/edit -> Edit MY Profile
// /users/delete -> Delete MY Profile

const userRouter = express.Router();

userRouter.get("/logout", logout);
userRouter.get("/edit", edit);
userRouter.get("/remove", remove);
userRouter.get("/:id(\\d+)", see);

export default userRouter;
