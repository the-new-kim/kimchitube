import User from "../models/User";
import bcrypt from "bcryptjs";
import fetch from "node-fetch";
import { redirect } from "next/dist/server/api-utils";

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

  req.flash("success", "Account successfully created 🙌");
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

  req.flash("success", `Hello ${username} 👋`);
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
  req.flash("success", "Successfully logged out 👋");
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
  req.flash("success", "User updated 😎");
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

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";

  const config = {
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: "read:user user:email",
  };

  const params = new URLSearchParams(config).toString();

  res.redirect(`${baseUrl}?${params}`);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";

  const config = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_SECRET,
    code: req.query.code,
  };

  const params = new URLSearchParams(config).toString();

  // Fetch does not exist on Node JS. Only on Browser.
  // So we need to install a package called "node-fetch".
  // there are some functions not defined on Node JS like... fetch, alert...
  const tokenRequest = await (
    await fetch(`${baseUrl}?${params}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  const { access_token } = tokenRequest;

  if ("access_token" in tokenRequest) {
    const apiUrl = "https://api.github.com";

    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }

    const existingUser = await User.findOne({ email: emailObj.email });

    if (existingUser) {
      req.session.loggedIn = true;
      req.session.user = existingUser;
      return res.redirect("/");
    } else {
      const user = await User.create({
        username: userData.login,
        email: emailObj.email,
        name: userData.name,
        password: "",
        location: userData.location,
        socialOnly: true,
        avatarUrl: userData.avatar_url,
      });

      req.session.loggedIn = true;
      req.session.user = user;
      return res.redirect("/");
    }
  } else {
    return res.redirect("/login");
  }
};

export const startGoogleLogin = (req, res) => {
  const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";

  const config = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "token",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
  };

  const params = new URLSearchParams(config).toString();

  return res.redirect(`${baseUrl}?${params}`);
};

export const finishGoogleLogin = async (req, res) => {};

export const startFbLogin = (req, res) => {
  const baseUrl = "https://www.facebook.com/v15.0/dialog/oauth?";

  const config = {
    client_id: process.env.FB_APP_ID,
    redirect_uri: process.env.FB_REDIRECT_URI,
    // state: { st: "state2f4rg3", ds: "890678465" },
    // state={"{st=state123abc,ds=123456789}"}
    // display: "popup",
  };

  const params = new URLSearchParams(config).toString();
  return res.redirect(baseUrl + params);
};

export const finishFbLogin = async (req, res) => {
  ////////1️⃣ GET ACCESS TOKEN
  const accessUrl = "https://graph.facebook.com/v15.0/oauth/access_token?";
  const accessConfig = {
    client_id: process.env.FB_APP_ID,
    redirect_uri: process.env.FB_REDIRECT_URI,
    client_secret: process.env.FB_SECRET,
    // scope:[].join(","),//csv format
    code: req.query.code,
  };

  const accessParams = new URLSearchParams(accessConfig).toString();
  const tokenRequest = await (await fetch(accessUrl + accessParams)).json();
  const { access_token } = tokenRequest;

  if (!access_token) {
    return res.redirect("/login");
  }

  ////////2️⃣ GET USER ID
  const debugUrl = "https://graph.facebook.com/v15.0/debug_token?";
  const debugConfig = {
    input_token: access_token, // {token-to-inspect}
    access_token: process.env.FB_APP_ID + "|" + process.env.FB_SECRET, // {app-token-or-admin-token} WTF...
  };

  const debugParams = new URLSearchParams(debugConfig).toString();
  const debugRequest = await (await fetch(debugUrl + debugParams)).json();

  const {
    data: { user_id },
  } = debugRequest;

  if (!user_id) {
    return res.redirect("/login");
  }

  ////////3️⃣ GET USER DATA
  const userUrl = `https://graph.facebook.com/v15.0/${user_id}?`;
  const userConfig = {
    fields: ["email", "name", "picture.type(large)"].join(","),
    access_token,
  };
  const userParams = new URLSearchParams(userConfig).toString();
  const userData = await (await fetch(userUrl + userParams)).json();

  const {
    name,
    email,
    picture: {
      data: { url: avatarUrl },
    },
  } = userData;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    req.session.loggedIn = true;
    req.session.user = existingUser;
    req.session.fbUser = {
      access_token,
      user_id,
    };
    return res.redirect("/");
  } else {
    const user = await User.create({
      username: name,
      email: email || "test@test.test",
      name: name,
      password: "",
      location: "",
      socialOnly: true,
      avatarUrl,
    });

    req.session.loggedIn = true;
    req.session.user = user;
    req.session.fbUser = {
      access_token,
      user_id,
    };

    return res.redirect("/");
  }
};
