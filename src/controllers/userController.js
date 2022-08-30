import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "node-fetch";
import Video from "../models/Video";

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

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
export const getEdit = (req, res) => {
  return res.render("user/edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
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

export const remove = (req, res) => res.send("remove");
export const see = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).populate("videos");
  console.log(user);

  if (!user) {
    return res.render("user/profile", { pageTitle: "User not found." });
  }

  return res.render("user/profile", {
    pageTitle: `${user.name}'s Profile.`,
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
  console.log("hihihihihihihihi");

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
