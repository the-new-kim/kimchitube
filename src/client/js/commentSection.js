const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteButtons = document.querySelectorAll(".deleteButton");

const videoId = videoContainer.dataset.id;

const handleDelete = async (event) => {
  const { parentElement } = event.target;
  const {
    dataset: { commentId },
  } = parentElement;

  await fetch(`/api/comment/${commentId}/delete`, {
    method: "DELETE",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ videoId }),
  });

  parentElement.remove();
};

const addFakeComment = (text, commentId, name) => {
  const videoContents = document.querySelector(".video__comments ul");

  const newComment = document.createElement("li");
  newComment.classList.add("video__comment");
  newComment.dataset.commentId = commentId;
  const span = document.createElement("span");
  const button = document.createElement("button");

  span.innerText = `${name} : ${text}`;
  button.innerText = "❌";
  button.classList.add("btn");

  newComment.appendChild(span);
  newComment.appendChild(button);
  videoContents.prepend(newComment);

  button.addEventListener("click", handleDelete);
};

const handleSubmit = async (event) => {
  event.preventDefault();

  const textarea = form.querySelector("textarea");

  const text = textarea.value;

  if (text === "") return;

  const response = await fetch(`/api/video/${videoId}/comment`, {
    method: "POST",
    headers: { "Content-type": "application/json" }, // ⭐️ tell the server what we are going to send
    //req.body!!
    body: JSON.stringify({ text }),
  });

  if (response.status === 201) {
    const { commentId, name } = await response.json();

    addFakeComment(text, commentId, name);
  }
  textarea.value = "";
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

if (deleteButtons) {
  deleteButtons.forEach((button) =>
    button.addEventListener("click", handleDelete)
  );
}
