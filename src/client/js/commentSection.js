const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const handleSubmit = (event) => {
  event.preventDefault();

  const textarea = form.querySelector("textarea");

  const text = textarea.value;
  const videoId = videoContainer.dataset.id;

  console.log(text, videoId);

  if (text === "") return;

  fetch(`/api/video/${videoId}/comment`, {
    method: "POST",
    headers: { "Content-type": "application/json" }, // ⭐️ tell the server what we are going to send
    //req.body!!
    body: JSON.stringify({ text }),
  });
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}
