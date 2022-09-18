import express, { text } from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import globalRouter from "./routers/globalRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import apiRouter from "./routers/apiRouter";
import { localsMiddleware } from "./middlewares";
import flash from "express-flash";
import authRouter from "./routers/authRouter";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.use(logger);
app.use(express.urlencoded({ extended: true }));
// app.use(express.text());// ⭐️ a built-in middleware function parses incoming request payloads into a string
app.use(express.json()); // ⭐️ built-in middleware function parses incoming requests with JSON payloads

//Session must be before Routers
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

// app.use((req, res, next) => {
//   console.log(req.headers.cookie);
//   next();
// });

// app.use((req, res, next) => {
//   req.sessionStore.all((error, sessions) => {
//     console.log(sessions);
//     next();
//   });
// });

app.use(flash());
app.use(localsMiddleware);

app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));

// 👇 to solve sharedArrayBuffer error wich comes from loading ffmpeg👇
app.use((_, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

app.use("/", globalRouter);
app.use("/video", videoRouter);
app.use("/user", userRouter);
app.use("/api", apiRouter);
app.use("/oauth", authRouter);

export default app;
