import User from "../models/User";
import fetch from "node-fetch";

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
        // avatarUrl: userData.avatar_url,
        avatar: {
          url: userData.avatar_url,
          filename: "",
        },
      });

      req.session.loggedIn = true;
      req.session.user = user;
      return res.redirect("/");
    }
  } else {
    return res.redirect("/login");
  }
};

// https://developers.google.com/identity/protocols/oauth2/web-server#sample-oauth-2.0-server-response
// OAuth 2.0 Playground
// https://developers.google.com/oauthplayground/
export const startGoogleLogin = (req, res) => {
  const baseUrl =
    "https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?";

  const config = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const params = new URLSearchParams(config).toString();

  return res.redirect(baseUrl + params);
};

export const finishGoogleLogin = async (req, res) => {
  const tokenUrl = "https://oauth2.googleapis.com/token?";

  const tokenConfig = {
    code: req.query.code,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    client_id: process.env.GOOGLE_CLIENT_ID,
    grant_type: "authorization_code",
  };

  const tokenParams = new URLSearchParams(tokenConfig).toString();

  const tokenData = await (
    await fetch(tokenUrl + tokenParams, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
  ).json();

  const { access_token } = tokenData;

  if (!access_token) {
    return res.redirect("/login");
  }

  const userUrl = "https://www.googleapis.com/oauth2/v2/userinfo";

  const userData = await (
    await fetch(userUrl, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
  ).json();

  const { email, name, picture: url } = userData;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    req.session.loggedIn = true;
    req.session.user = existingUser;
    return res.redirect("/");
  } else {
    const user = await User.create({
      username: name,
      email,
      name,
      password: "",
      location: "",
      socialOnly: true,
      avatar: {
        url,
        filename,
      },
    });

    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  }
};

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
      data: { url },
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
      avatar: {
        url,
        filename: "",
      },
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
