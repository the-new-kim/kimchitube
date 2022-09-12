const videoPlayer = document.getElementById("videoPlayer");
const form = document.getElementById("commentForm");
const deleteButtons = document.querySelectorAll(".deleteButton");
const commentsNumber = document.querySelector(".commentsNumber");
const commentsText = document.querySelector(".commentsText");

let currentCommentsNumber = +commentsNumber.innerText;

const videoId = videoPlayer.dataset.id;

const repaintCommentsNumber = () => {
  commentsNumber.innerText = currentCommentsNumber;
  commentsText.innerText = currentCommentsNumber > 1 ? " Comments" : " Comment";
};

const handleDelete = async (event) => {
  const commentContainer = event.target.closest(".video__comment");

  console.log(commentContainer);

  const {
    dataset: { commentId },
  } = commentContainer;

  await fetch(`/api/comment/${commentId}/delete`, {
    method: "DELETE",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ videoId }),
  });

  currentCommentsNumber -= 1;
  repaintCommentsNumber();

  commentContainer.remove();
};

const addFakeComment = (text, commentId, user) => {
  const { _id, name, avatarUrl, socialOnly } = user;
  const videoContents = document.querySelector(".video__comments");

  const newComment = document.createElement("li");
  newComment.classList.add("video__comment");
  newComment.dataset.commentId = commentId;

  const avatarContainer = document.createElement("div");
  avatarContainer.classList.add("avatar", "avatar__sm");
  // if(avatarUrl)

  const commentMain = document.createElement("div");
  commentMain.classList.add("video__comment__main");

  const span = document.createElement("span");

  const deleteIcon = document.createElement("i");

  span.innerText = `${name} : ${text}`;

  deleteIcon.classList.add("deleteButton", "fa-solid", "fa-trash");

  newComment.appendChild(span);
  newComment.appendChild(deleteIcon);
  videoContents.prepend(newComment);

  currentCommentsNumber += 1;
  repaintCommentsNumber();

  deleteIcon.addEventListener("click", handleDelete);
};

const handleSubmit = async (event) => {
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
    const { commentId, user } = await response.json();
    addFakeComment(text, commentId, user);
  }
  input.value = "";
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

if (deleteButtons) {
  deleteButtons.forEach((button) =>
    button.addEventListener("click", handleDelete)
  );
}
