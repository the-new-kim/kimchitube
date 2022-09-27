import User from "../models/User";
import bcrypt from "bcryptjs";

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

  const user = await User.create({
    username,
    email,
    password,
    name,
    location,
  });

  req.session.loggedIn = true;
  req.session.user = user;

  req.flash("success", `Welcome ${username}`);
  return res.redirect("/");
};

export const getLogin = (req, res) => {
  return res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).render("login", {
      errorMessage: "An Accoint with this Username does not exist.",
    });
  }

  const passwordMatched = await bcrypt.compare(password, user.password);

  if (!passwordMatched) {
    return res.status(400).render("login", {
      errorMessage: "Wrong Password.",
    });
  }

  req.session.loggedIn = true;
  req.session.user = user;

  req.flash("success", `Hello ${username}`);
  return res.redirect("/");
};

export const logout = async (req, res) => {
  if (req.session.fbUser) {
    req.session.fbUser = null;
    // const { access_token, user_id } = req.session.fbUser;
    // const fbLogout = await (
    //   await fetch(
    //     `https://graph.facebook.com/v15.0/${user_id}/permissions?access_token=${access_token}`,
    //     {
    //       method: "DELETE",
    //     }
    //   )
    // ).json();
    // console.log(fbLogout);
  }

  req.session.user = null;
  req.session.loggedIn = false;
  req.flash("success", "Bye");
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("user/edit", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
      isHeroku,
    },
    body: { name, email, username, location },
    file,
  } = req;

  // const isHeroku = process.env.NODE_ENV === "production";

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? (isHeroku ? file.location : file.path) : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );

  req.session.user = updatedUser;
  req.flash("success", "Saved!");
  return res.redirect("/user/edit");
};

export const remove = (req, res) => {
  // if (req.session.fbUser) {
  //   const { access_token, user_id } = req.session.fbUser;
  //   const fbLogout = await (
  //     await fetch(
  //       `https://graph.facebook.com/v15.0/${user_id}/permissions?access_token=${access_token}`,
  //       {
  //         method: "DELETE",
  //       }
  //     )
  //   ).json();
  //   console.log(fbLogout);
  // }
};

export const see = async (req, res) => {
  const { id } = req.params;

  // how to populate an array
  // https://stackoverflow.com/questions/19222520/populate-nested-array-in-mongoose

  const user = await User.findById(id).populate({
    path: "videos",
    populate: { path: "owner" },
  });

  if (!user) {
    req.flash("error", "User Not Found");
    return res.status(404).render("404", { pageTitle: "User not found" });
  }

  return res.render("user/profile", {
    pageTitle: `${user.name}'s Channel`,
    user,
  });
};

export const getChangePassword = (req, res) => {
  return res.render("change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;

  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
      errorMessage: "the current password is incorrect.",
    });
  }

  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
      errorMessage: "this password does not match the confirmation.",
    });
  }

  user.password = newPassword;
  await user.save();

  return res.redirect("/user/logout");
};
