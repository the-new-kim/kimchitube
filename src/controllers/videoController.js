// /login -> Login
// /search -> Search

// /videos/:id -> See Video
// /videos/:id/edit -> Edit Video
// /videos/:id/delete -> Delete Video
// /videos/upload -> Upload Video

let videos = [
  {
    id: 1,
    title: "first video",
    rating: 4,
    year: 2020,
    overview: "of the printing and typesetting industry. ",
  },
  {
    id: 2,
    title: "second video",
    rating: 4,
    year: 2020,
    overview: "Lorem Ipsum is simply dummy tting industry. Lorem a",
  },
  {
    id: 3,
    title: "third video",
    rating: 4,
    year: 2020,
    overview: "psum has been the industry's standard dummy text evpe and scra",
  },
  {
    id: 4,
    title: "fourth video",
    rating: 4,
    year: 2020,
    overview:
      " standard dummy text ever since the 1500s, when an unknown printer ",
  },
  {
    id: 5,
    title: "fifth video",
    rating: 4,
    year: 2020,
    overview:
      "my text ever since the 1500s, when an unknown printer took a galley of type and scra",
  },
];

export const trending = (req, res) => {
  return res.render("index", { message: "Welcome!", videos });
};

export const search = (req, res) => res.send("search");

export const watch = (req, res) => {
  const { id } = req.params;

  const video = videos.find((video) => video.id === +id);

  return res.render("watch", { video, pageTitle: video.title });
};

export const getEdit = (req, res) => {
  const { id } = req.params;
  const video = videos.find((video) => video.id === +id);

  return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
};

export const postEdit = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const video = videos.find((video) => video.id === +id);
  video.title = title;

  return res.redirect(`/video/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload");
};

export const postUpload = (req, res) => {
  const { title } = req.body;

  const newVideo = {
    id: videos.length + 1,
    title,
    rating: 0,
    year: 2020,
    overview: "nothing",
  };

  videos.push(newVideo);

  return res.redirect("/");
};

export const remove = (req, res) => res.send("remove");
