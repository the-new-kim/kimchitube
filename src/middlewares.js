import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const isHeroku = process.env.NODE_ENV === "production";

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const s3ImageUploader = multerS3({
  s3: s3,
  bucket: "kimchitube/images",
  acl: "public-read",
});

const s3VideoUploader = multerS3({
  s3: s3,
  bucket: "kimchitube/videos",
  acl: "public-read",
});

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteTitle = "KIMCHI TUBE";
  res.locals.loggedInUser = req.session.user;
  res.locals.isHeroku = isHeroku;
  res.locals.videoMixinTypes = {
    index: "index",
    profile: "Profile",
    related: "Related",
  };

  res.locals.fbUser = req.session.fb;

  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Login first.");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/");
  }
};

const avatarMulter = multer({
  dest: "uploads/",
  limits: {
    fileSize: 3000000,
  },
  storage: isHeroku ? s3ImageUploader : undefined,
}).single("avatar");

export const avatarUpload = (req, res, next) => {
  avatarMulter(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      req.flash("error", err.message);
      return res.status(404).render("user/edit");
    } else if (err) {
      req.flash("error", err.message);
      return res.status(404).redirect("/");
    } else {
      return next();
    }
  });
};

const videoMulter = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10000000,
  },
  storage: isHeroku ? s3VideoUploader : undefined,
}).fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

export const videoUpload = (req, res, next) => {
  videoMulter(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      req.flash("error", err.message);
      return res.status(404).render("video/upload");
    } else if (err) {
      req.flash("error", err.message);
      return res.status(404).redirect("/");
    } else {
      return next();
    }
  });
};
