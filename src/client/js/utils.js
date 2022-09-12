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
