export const openNav = (btn, menu) => {
  const SHOWING_CL = "showing";
  let isNavOpen = false;

  const handleClick = (event) => {
    const btnClicked = btn.contains(event.target);
    const menuClicked = menu.contains(event.target);

    if ((!isNavOpen && !btnClicked) || (isNavOpen && menuClicked)) {
      return;
    }
    if (isNavOpen && !btnClicked) {
      isNavOpen = false;
    }
    if (btnClicked) {
      isNavOpen = !isNavOpen;
    }

    isNavOpen
      ? menu.classList.add(SHOWING_CL)
      : menu.classList.remove(SHOWING_CL);
  };

  document.body.addEventListener("click", handleClick);
};

export const likeContent = (container, targetCategory, targetId) => {
  const likeBtn = container.querySelector(".likeBtn");
  const dislikeBtn = container.querySelector(".dislikeBtn");
  const likeCount = container.querySelector(".likeCount");
  const dislikeCount = container.querySelector(".dislikeCount");

  const LIKE_REGULAR_CL = "fa-regular fa-thumbs-up likeBtn";
  const LIKE_SOLID_CL = "fa-solid fa-thumbs-up likeBtn";

  const DISLIKE_REGULAR_CL = "fa-regular fa-thumbs-down dislikeBtn";
  const DISLIKE_SOLID_CL = "fa-solid fa-thumbs-down dislikeBtn";

  const repaintLikeBtn = (likes, userLikesTarget, dislikes) => {
    dislikeBtn.className = DISLIKE_REGULAR_CL;
    dislikeCount.innerText = dislikes;

    likeBtn.className = userLikesTarget ? LIKE_SOLID_CL : LIKE_REGULAR_CL;
    likeCount.innerText = likes;
  };

  const repaintDislikeBtn = (dislikes, userDislikesTarget, likes) => {
    likeBtn.className = LIKE_REGULAR_CL;
    likeCount.innerText = likes;

    dislikeBtn.className = userDislikesTarget
      ? DISLIKE_SOLID_CL
      : DISLIKE_REGULAR_CL;

    dislikeCount.innerText = dislikes;
  };

  const handleLikeClick = async (isLikeHit) => {
    const response = await fetch(`/api/${targetCategory}/${targetId}/like`, {
      method: "POST",
      headers: { "Content-type": "application/json" }, // ⭐️ tell the server what we are going to send
      //req.body!!
      body: JSON.stringify({ isLikeHit }),
    });

    if (response.status === 201) {
      const { likes, userLikesTarget, dislikes, userDislikesTarget } =
        await response.json();

      if (isLikeHit) {
        repaintLikeBtn(likes, userLikesTarget, dislikes);
      } else {
        repaintDislikeBtn(dislikes, userDislikesTarget, likes);
      }
    }
  };

  likeBtn.addEventListener("click", () => handleLikeClick(true));
  dislikeBtn.addEventListener("click", () => handleLikeClick(false));
};
