import { initLike } from "./utils";

const videoPlayer = document.getElementById("videoPlayer");
const form = document.getElementById("commentForm");
const deleteButtons = document.querySelectorAll(".deleteButton");
const commentsTotal = document.querySelector(".commentsTotal");
const commentsText = document.querySelector(".commentsText");

let currentCommentsTotal = +commentsTotal.innerText;

const videoId = videoPlayer.dataset.id;

const repaintCommentsTotal = () => {
  commentsTotal.innerText = currentCommentsTotal;
  commentsText.innerText = currentCommentsTotal > 1 ? " Comments" : " Comment";
};

const handleCommentDelete = async (event) => {
  const commentContainer = event.target.closest(".video__comment");

  const {
    dataset: { commentId },
  } = commentContainer;

  await fetch(`/api/comment/${commentId}/delete`, {
    method: "DELETE",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ videoId }),
  });

  currentCommentsTotal -= 1;
  repaintCommentsTotal();

  commentContainer.remove();
};

const addFakeComment = (text, commentId, user, isHeroku) => {
  const { _id, name, avatarUrl, socialOnly } = user;
  const videoContents = document.querySelector(".video__comments");

  const newComment = document.createElement("li");
  newComment.classList.add("video__comment");
  newComment.dataset.commentId = commentId;

  const avatarContainer = document.createElement("div");
  avatarContainer.classList.add("avatar", "avatar__sm");
  const avatarAnchor = document.createElement("a");
  avatarAnchor.href = `/user/${_id}`;
  avatarContainer.appendChild(avatarAnchor);
  if (avatarUrl) {
    const img = document.createElement("img");
    img.crossOrigin = "Anonymous";
    img.src = isHeroku || socialOnly ? avatarUrl : "/" + avatarUrl;
    avatarAnchor.appendChild(img);
  } else {
    const emptyAvatar = document.createElement("div");
    emptyAvatar.classList.add("empty__avatar");
    emptyAvatar.innerHTML = name[0];
    avatarAnchor.appendChild(emptyAvatar);
  }

  const commentMain = document.createElement("div");
  commentMain.classList.add("video__comment__main");
  const userNameAnchor = document.createElement("a");
  userNameAnchor.hfref = `/user/${_id}`;
  userNameAnchor.innerText = name;
  const commentText = document.createElement("p");
  commentText.innerText = text;

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("video__comment__buttons");
  const likeBtn = document.createElement("i");
  likeBtn.classList.add("fa-regular", "fa-thumbs-up", "likeBtn");
  const likeCount = document.createElement("span");
  likeCount.classList.add("likeCount");
  likeCount.innerText = 0;

  const dislikeBtn = document.createElement("i");
  dislikeBtn.classList.add("fa-regular", "fa-thumbs-down", "dislikeBtn");
  const dislikeCount = document.createElement("span");
  dislikeCount.classList.add("dislikeCount");
  dislikeCount.innerText = 0;

  const deleteButton = document.createElement("i");
  deleteButton.classList.add("deleteButton", "fa-solid", "fa-trash");

  buttonContainer.appendChild(likeBtn);
  buttonContainer.appendChild(likeCount);
  buttonContainer.appendChild(dislikeBtn);
  buttonContainer.appendChild(dislikeCount);
  buttonContainer.appendChild(deleteButton);

  commentMain.appendChild(userNameAnchor);
  commentMain.appendChild(commentText);
  commentMain.appendChild(buttonContainer);

  newComment.appendChild(avatarContainer);
  newComment.appendChild(commentMain);

  videoContents.prepend(newComment);

  currentCommentsTotal += 1;
  repaintCommentsTotal();

  initLike(buttonContainer, "comment", commentId);
  deleteButton.addEventListener("click", handleCommentDelete);
};

const handleCommentSubmit = async (event) => {
  event.preventDefault();

  const input = form.querySelector("input");

  const text = input.value;

  if (text === "") return;

  const response = await fetch(`/api/video/${videoId}/comment`, {
    method: "POST",
    headers: { "Content-type": "application/json" }, // ⭐️ tell the server what we are going to send
    //req.body!!
    body: JSON.stringify({ text }),
  });

  if (response.status === 201) {
    const { commentId, user, isHeroku } = await response.json();
    addFakeComment(text, commentId, user, isHeroku);
  }
  input.value = "";
};

if (form) {
  form.addEventListener("submit", handleCommentSubmit);
}

if (deleteButtons) {
  deleteButtons.forEach((button) =>
    button.addEventListener("click", handleCommentDelete)
  );
}
