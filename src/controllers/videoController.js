import User from "../models/User";
import Video from "../models/Video";
import Comment from "../models/Comment";

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");

  return res.render("index", { videos });
};

export const search = async (req, res) => {
  const { keyword } = req.query;

  let videos = [];

  if (keyword) {
    const regex = new RegExp(`${keyword}`, "i");

    videos = await Video.find({
      $or: [
        {
          title: {
            $regex: regex,
          },
        },
        {
          description: {
            $regex: regex,
          },
        },
        {
          hashtags: {
            $regex: regex,
          },
        },
      ],
    }).populate("owner");
  }

  return res.render("search", {
    pageTitle: `Search results for "${keyword}"`,
    videos,
  });
};

export const watch = async (req, res) => {
  const { id } = req.params;

  const video = await Video.findById(id)
    .populate("owner")
    .populate({ path: "comments", populate: { path: "owner" } });

  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }

  const regex = new RegExp(
    `(${video.hashtags.toString().replaceAll(",", "|")})`,
    "i"
  );

  const relatedVideos = await Video.find({
    $and: [
      //$ne : Not Equal
      { _id: { $ne: video._id } },
      {
        $or: [
          {
            owner: video.owner._id,
          },
          {
            hashtags: {
              $regex: regex,
            },
          },
        ],
      },
    ],
  }).populate("owner");

  return res.render("video/watch", {
    pageTitle: video.title,
    video,
    relatedVideos,
  });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;

  const video = await Video.findById(id);

  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }

  if (video.owner + "" !== _id + "") {
    return res.status(403).redirect("/");
  }

  return res.render("video/edit", { pageTitle: `Edit: ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const {
    user: { _id },
  } = req.session;

  // const video = await Video.exists({ _id: id }); 🤔 It returns only the id of video
  const video = await Video.findById(id);

  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  //Forbiding access to edit if the user is not the owner of video

  if (video.owner + "" !== _id + "") {
    req.flash("error", "You are not the owner of this video 😕");
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashTags(hashtags),
  });

  req.flash("success", "Video successfully updated 🙌");
  return res.redirect(`/video/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("video/upload");
};

export const postUpload = async (req, res) => {
  const {
    session: {
      user: { _id },
      isHeroku,
    },
    body: { title, description, hashtags },
    files: { video, thumbnail },
  } = req;

  try {
    const newVideo = await Video.create({
      fileUrl: isHeroku ? video[0].location : video[0].path,
      thumbnailUrl: isHeroku ? thumbnail[0].location : thumbnail[0].path,
      title,
      description,
      hashtags: Video.formatHashTags(hashtags),
      owner: _id,
    });

    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();

    req.flash("success", "Video uploaded 🎉");

    return res.redirect("/");
  } catch (error) {
    return res
      .status(400)
      .render("video/upload", { errorMessage: error._message });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;

  const video = await Video.findById(id);

  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }

  if (video.owner + "" !== _id + "") {
    return res.status(403).redirect("/");
  }

  const user = await User.findById(video.owner);
  const newVideos = user.videos.filter((video) => video + "" !== id);
  user.videos = newVideos;
  user.save();

  await Video.findByIdAndDelete(id);

  return res.redirect(`/`);
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);

  const {
    user: { _id: userId },
  } = req.session;

  const user = await User.findById(userId);

  // count only logged in user
  if (!user) {
    return res.sendStatus(200);
  }
  // prevent counting owners view
  if (userId + "" === video.owner + "") {
    return res.sendStatus(200);
  }

  // user already watched the video before
  if (user.watchedVideos.includes(id)) {
    return res.sendStatus(200);
  }

  if (!video) {
    return res.sendStatus(404);
  }

  user.watchedVideos.push(id);
  user.save();

  video.meta.views += 1;
  video.save();

  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: {
      user: { _id: userId },
      isHeroku,
    },
    body: { text },
    params: { id: videoId },
  } = req;

  const video = await Video.findById(videoId).populate("comments");
  const user = await User.findById(userId);
  if (!video || !user) {
    return res.sendStatus(404);
  }

  const { _id, name, avatarUrl, socialOnly } = user;

  const comment = await Comment.create({
    text,
    owner: userId,
    video: videoId,
  });

  video.comments.push(comment._id);
  video.save();
  user.comments.push(comment._id);
  user.save();

  // req.session.relaod();

  return res.status(201).json({
    commentId: comment._id,
    user: { _id, name, avatarUrl, socialOnly },
    isHeroku,
  });
  // 201: created
};

export const deleteComment = async (req, res) => {
  const {
    session: {
      user: { _id: userId },
    },
    body: { videoId },
    params: { id: commentId },
  } = req;

  const user = await User.findById(userId);
  const video = await Video.findById(videoId);

  if (!user || !video || !commentId) {
    return res.sendStatus(404);
  }

  await Comment.findByIdAndDelete(commentId);

  const updateComments = (array) => {
    return array.filter((comment) => comment._id + "" !== commentId + "");
  };

  const updatedUserComments = updateComments(user.comments);
  user.comments = updatedUserComments;
  user.save();

  const updatedVideoComments = updateComments(video.comments);
  video.comments = updatedVideoComments;
  video.save();

  return res.sendStatus(201);
};

/// like video helper
const removeLikeUser = (model, user, likeOrDislike) => {
  const newLikeUsers = model.meta[likeOrDislike].filter(
    (likeOrDislikeUser) => likeOrDislikeUser + "" !== user._id + ""
  );
  model.meta[likeOrDislike] = newLikeUsers;
};

const likeTargetModel = (res, targetModel, user, isLikeHit) => {
  /////// capsulate from here
  const isAlreadyLiked = targetModel.meta.likeUsers.includes(user._id);
  const isAlreadyDisiked = targetModel.meta.dislikeUsers.includes(user._id);

  if (isLikeHit) {
    if (isAlreadyLiked) {
      removeLikeUser(targetModel, user, "likeUsers");
    } else {
      if (isAlreadyDisiked) {
        removeLikeUser(targetModel, user, "dislikeUsers");
      }
      targetModel.meta.likeUsers.push(user._id);
    }
  } else {
    if (isAlreadyDisiked) {
      removeLikeUser(targetModel, user, "dislikeUsers");
    } else {
      if (isAlreadyLiked) {
        removeLikeUser(targetModel, user, "likeUsers");
      }

      targetModel.meta.dislikeUsers.push(user._id);
    }
  }

  targetModel.save();

  return res.status(201).json({
    likes: targetModel.meta.likeUsers.length,
    userLikesTarget: targetModel.meta.likeUsers.includes(user._id),
    dislikes: targetModel.meta.dislikeUsers.length,
    userDislikesTarget: targetModel.meta.dislikeUsers.includes(user._id),
  });
};

export const likeComment = async (req, res) => {
  const {
    session: {
      user: { _id: userId },
    },
    body: { isLikeHit },
    params: { id: commentId },
  } = req;

  const user = await User.findById(userId);
  const comment = await Comment.findById(commentId);

  if (!user || !comment) {
    return res.sendStatus(404);
  }
  likeTargetModel(res, comment, user, isLikeHit);
};

export const likeVideo = async (req, res) => {
  const {
    session: {
      user: { _id: userId },
    },
    body: { isLikeHit },
    params: { id: videoId },
  } = req;

  const user = await User.findById(userId);
  const video = await Video.findById(videoId);

  if (!user || !video) {
    return res.sendStatus(404);
  }

  likeTargetModel(res, video, user, isLikeHit);
  // /////// capsulate from here
  // const isAlreadyLiked = video.meta.likeUsers.includes(user._id);
  // const isAlreadyDisiked = video.meta.dislikeUsers.includes(user._id);

  // if (isLikeHit) {
  //   if (isAlreadyLiked) {
  //     removeLikeUser(video, user, "likeUsers");
  //   } else {
  //     if (isAlreadyDisiked) {
  //       removeLikeUser(video, user, "dislikeUsers");
  //     }
  //     video.meta.likeUsers.push(user._id);
  //   }
  // } else {
  //   if (isAlreadyDisiked) {
  //     removeLikeUser(video, user, "dislikeUsers");
  //   } else {
  //     if (isAlreadyLiked) {
  //       removeLikeUser(video, user, "likeUsers");
  //     }

  //     video.meta.dislikeUsers.push(user._id);
  //   }
  // }

  // video.save();

  // return res.status(201).json({
  //   likes: video.meta.likeUsers.length,
  //   userLikesTarget: video.meta.likeUsers.includes(user._id),
  //   dislikes: video.meta.dislikeUsers.length,
  //   userDislikesTarget: video.meta.dislikeUsers.includes(user._id),
  // });
};
