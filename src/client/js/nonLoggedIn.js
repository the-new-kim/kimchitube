const { toggleShowing } = require("./utils");

const likeBtnContainers = document.querySelectorAll(".likeBtnContainer");

Array.from(likeBtnContainers).map((container) => {
  const btn = container.querySelector(".likeBtn");
  const nonLoggedInLikeMessage = container.querySelector(
    ".nonLoggedInLikeMessage"
  );

  toggleShowing(container, nonLoggedInLikeMessage);
});
