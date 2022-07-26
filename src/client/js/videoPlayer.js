const videoPlayer = document.getElementById("videoPlayer");
const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoControls = document.getElementById("videoControls");

let volumeValue = 0.5;
video.volume = volumeValue;

let controlsTimeout = null;
let controlsMovementTimeout = null;

const paintTrack = (rangeInput, inputValue) => {
  rangeInput.style.background = `linear-gradient(to right, #26a1ed 0%, #26a1ed ${
    (inputValue / rangeInput.max) * 100
  }%, white ${(inputValue / rangeInput.max) * 100}%, white 100%)`;
};

const handlePlayClick = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMuteClick = () => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }

  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;

  paintTrack(volumeRange, volumeRange.value);
};

const handleVolume = (event) => {
  const {
    target: { value },
  } = event;
  volumeValue = value;
  video.volume = value;

  paintTrack(volumeRange, value);
};

// Time format trick
// 1. new Data(milliseconds) ======> prepare to get ISO formatted Date
// 2. ISO Format ======> YYYY-MM-DDTHH:mm:ss.sssZ
// 3. substr() =====> get only HH:MM:SS
const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substr(14, 5);

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);

  paintTrack(timeline, timeline.value);
  paintTrack(volumeRange, volumeRange.value);
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
  paintTrack(timeline, timeline.value);
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;

  paintTrack(timeline, value);
};

const handleFullScreen = () => {
  const isFullScreen = document.fullscreenElement;
  if (isFullScreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoPlayer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
};

const hideControls = () => {
  videoControls.classList.remove("showing");
};

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 2000);
};

const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls, 2000);
};

const handleKeydown = (event) => {
  const { localName } = event.target;
  const isTextArea = localName === "textarea" || localName === "input";
  if (isTextArea) return;

  const { code } = event;

  if (code === "Space") {
    handlePlayClick();
  }
  if (code === "KeyF") {
    handleFullScreen();
  }
  if (code === "Escape" && document.fullscreenElement) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  }
};

const handleEnded = () => {
  const { id } = videoPlayer.dataset;
  playBtnIcon.classList = "fas fa-play";
  fetch(`/api/video/${id}/view`, { method: "POST" });
};

playBtn.addEventListener("click", handlePlayClick);
video.addEventListener("click", handlePlayClick);

muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolume);
//the event function of loadedmetadata can load the infos of video... here like duration
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);

timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
videoPlayer.addEventListener("mousemove", handleMouseMove);
videoPlayer.addEventListener("mouseleave", handleMouseLeave);
document.addEventListener("keydown", handleKeydown);
