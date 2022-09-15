import { initLike } from "./utils";

const videoPlayer = document.getElementById("videoPlayer");
const videoId = videoPlayer.dataset.id;
const videoLikesContainer = document.querySelector(".videoLikesContainer");

const videoComments = document.getElementById("videoComments");
const comments = videoComments.querySelectorAll("li");

initLike(videoLikesContainer, "video", videoId);

Array.from(comments).map((comment) => {
  const { commentId } = comment.dataset;
  initLike(comment, "comment", commentId);
});
