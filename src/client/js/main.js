import "../scss/styles.scss";

const searchForm = document.querySelector(".searchForm");

const handleSubmit = (event) => {
  event.preventDefault();
  const { value } = event.target.keyword;
  window.location.href = `/search?keyword=${value}`;
};

searchForm.addEventListener("submit", handleSubmit);

const navMenu = document.querySelector(".navMenu");
const navAvatar = document.querySelector(".navAvatar");

const SHOWING_CL = "showing";
let isNavOpen = false;

const handleClick = (event) => {
  const navAvatarClicked = navAvatar.contains(event.target);
  const navMenuClicked = navMenu.contains(event.target);

  if (isNavOpen && navMenuClicked) {
    return;
  }
  if (isNavOpen && !navAvatarClicked) {
    isNavOpen = false;
  }
  if (navAvatarClicked) {
    isNavOpen = !isNavOpen;
  }

  isNavOpen
    ? navMenu.classList.add(SHOWING_CL)
    : navMenu.classList.remove(SHOWING_CL);
};

document.body.addEventListener("click", handleClick);
