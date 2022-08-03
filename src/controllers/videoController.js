// /login -> Login
// /search -> Search

import Video from "../models/Video";

// /videos/:id -> See Video
// /videos/:id/edit -> Edit Video
// /videos/:id/delete -> Delete Video
// /videos/upload -> Upload Video

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({ createdAt: "desc" });

  return res.render("index", { message: "Welcome!", videos });
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
    });
  }

  return res.render("search", { pageTitle: "Search", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;

  const video = await Video.findById(id);

  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }

  return res.render("watch", { video });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);

  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }

  return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;

  const video = await Video.exists({ _id: id });

  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }

  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashTags(hashtags),
  });

  return res.redirect(`/video/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload");
};

export const postUpload = async (req, res) => {
  const { title, description, hashtags } = req.body;

  try {
    await Video.create({
      title,
      description,
      hashtags: Video.formatHashTags(hashtags),
    });

    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.render("upload", { errorMessage: error._message });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;

  const video = await Video.exists({ _id: id });

  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }

  await Video.findByIdAndDelete(id);

  return res.redirect(`/`);
};
