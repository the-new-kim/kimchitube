import "../scss/styles.scss";
import { openNav } from "./utils";

const userNavBtn = document.querySelector(".userNavBtn");
const userNavMenu = document.querySelector(".userNavMenu");

if (userNavBtn && userNavMenu) {
  openNav(userNavBtn, userNavMenu);
}
