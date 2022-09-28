import "../scss/styles.scss";
import { toggleShowing } from "./utils";

const userNavBtn = document.querySelector(".userNavBtn");
const userNavMenu = document.querySelector(".userNavMenu");

if (userNavBtn && userNavMenu) {
  toggleShowing(userNavBtn, userNavMenu);
}
