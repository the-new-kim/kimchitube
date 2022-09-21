import { likeContent } from "./utils";

const initCommentLike = () => {
  const videoComments = document.getElementById("videoComments");
  const comments = videoComments.querySelectorAll("li");

  Array.from(comments).map((comment) => {
    const { commentId } = comment.dataset;
    likeContent(comment, "comment", commentId);
  });
};

const initVideoLike = () => {
  const videoPlayer = document.getElementById("videoPlayer");
  const videoId = videoPlayer.dataset.id;
  const videoLikesContainer = document.querySelector(".videoLikesContainer");

  likeContent(videoLikesContainer, "video", videoId);
};

initCommentLike();
initVideoLike();
