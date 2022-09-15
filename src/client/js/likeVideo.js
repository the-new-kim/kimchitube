const videoPlayer = document.getElementById("videoPlayer");
const videoId = videoPlayer.dataset.id;

const videoLikesContainer = document.querySelector(".videoLikesContainer");

const likeBtn = videoLikesContainer.querySelector(".likeBtn");
const dislikeBtn = videoLikesContainer.querySelector(".dislikeBtn");
const likeCount = videoLikesContainer.querySelector(".likeCount");
const dislikeCount = videoLikesContainer.querySelector(".dislikeCount");

const LIKE_REGULAR_CL = "fa-regular fa-thumbs-up likeBtn";
const LIKE_SOLID_CL = "fa-solid fa-thumbs-up likeBtn";

const DISLIKE_REGULAR_CL = "fa-regular fa-thumbs-down dislikeBtn";
const DISLIKE_SOLID_CL = "fa-solid fa-thumbs-down dislikeBtn";

const repaintLikeBtn = (likes, userLikesVideo, dislikes) => {
  dislikeBtn.className = DISLIKE_REGULAR_CL;
  dislikeCount.innerText = dislikes;

  likeBtn.className = userLikesVideo ? LIKE_SOLID_CL : LIKE_REGULAR_CL;
  likeCount.innerText = likes;
};

const repaintDislikeBtn = (dislikes, userDislikesVideo, likes) => {
  likeBtn.className = LIKE_REGULAR_CL;
  likeCount.innerText = likes;

  dislikeBtn.className = userDislikesVideo
    ? DISLIKE_SOLID_CL
    : DISLIKE_REGULAR_CL;

  dislikeCount.innerText = dislikes;
};

const handleLikeClick = async (isLikeHit) => {
  const response = await fetch(`/api/video/${videoId}/like`, {
    method: "POST",
    headers: { "Content-type": "application/json" }, // ⭐️ tell the server what we are going to send
    //req.body!!
    body: JSON.stringify({ isLikeHit }),
  });

  if (response.status === 201) {
    const { likes, userLikesVideo, dislikes, userDislikesVideo } =
      await response.json();

    if (isLikeHit) {
      repaintLikeBtn(likes, userLikesVideo, dislikes);
    } else {
      repaintDislikeBtn(dislikes, userDislikesVideo, likes);
    }
  }
};

likeBtn.addEventListener("click", () => handleLikeClick(true));
dislikeBtn.addEventListener("click", () => handleLikeClick(false));
