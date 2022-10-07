import "../scss/styles.scss";
import { toggleShowing } from "./utils";

const userNavBtn = document.querySelector(".userNavBtn");
const userNavMenu = document.querySelector(".userNavMenu");

toggleShowing(userNavBtn, userNavMenu);

const searchToggler = document.querySelector(".searchToggler");
const searchForm = document.querySelector(".searchForm");

toggleShowing(searchToggler, searchForm);
