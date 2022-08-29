const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const handleDownload = () => {
  const anchor = document.createElement("a");
  anchor.href = videoFile;
  anchor.download = "download.webm";
  document.body.appendChild(anchor);

  anchor.click();
};

// The reason why the event listeners have to be removed is because here we have only one button!
const handleStop = () => {
  startBtn.innerText = "Download Recording";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleDownload);

  recorder.stop();
};

const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);

  recorder = new MediaRecorder(stream);
  // Option example for MediaRecorder
  // extension webm is compatible for every browser but the ohter extensions like mp4 may not.
  //   const options = {
  //     audioBitsPerSecond: 128000,
  //     videoBitsPerSecond: 2500000,
  //     mimeType: 'video/mp4'
  //   }
  //   const mediaRecorder = new MediaRecorder(stream, options);

  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data); //This line will create a ⭐️URL⭐️ wich exists only on browser

    video.srcObject = null; // remove preview src
    video.src = videoFile; // add the ⭐️URL⭐️ of recorded video file to src
    video.loop = true;
    video.play();
  };

  recorder.start();
};

// In my case async & await work without installing regenerator-runtime
const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });

  //   getUserMedia({
  //     audio: true,
  //     video: {
  //       width: { min: 1024, ideal: 1280, max: 1920 },
  //       height: { min: 576, ideal: 720, max: 1080 }
  //     }
  //   })

  video.srcObject = stream;
  video.play();
};

init();

startBtn.addEventListener("click", handleStart);
