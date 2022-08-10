import User from "../models/User";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => {
  return res.render("join", { pageTitle: "Join" });
};

export const postJoin = async (req, res) => {
  const pageTitle = "Join";
  const { username, email, password, password2, name, location } = req.body;

  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }

  const exists = await User.exists({ $or: [{ email }, { username }] });

  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "This Email/Username is already taken.",
    });
  }

  await User.create({
    username,
    email,
    password,
    name,
    location,
  });
  return res.redirect("/");
};
export const getLogin = (req, res) => {
  return res.render("login", { pageTitle: "Login" });
};
export const postLogin = async (req, res) => {
  const pageTitle = "Login";
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An Accoint with this Username does not exist.",
    });
  }

  const passwordMatched = await bcrypt.compare(password, user.password);

  if (!passwordMatched) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong Password.",
    });
  }

  req.session.loggedIn = true;
  req.session.user = user;

  return res.redirect("/");
};

export const logout = (req, res) => res.send("log out");
export const edit = (req, res) => res.send("edit");
export const remove = (req, res) => res.send("remove");
export const see = (req, res) => res.send("see");
