import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");
const timeStamp = document.getElementById("timeStamp");

let stream;
let recorder;
let videoUrl; // URL
let timeStampId;
let currentTime = 0;

// In my case async & await work without installing regenerator-runtime
const init = async () => {
  currentTime = 0;
  timeStamp.innerText = currentTime;

  if (!actionBtn.disabled) {
    actionBtn.disabled === true;
  }

  stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: 1024,
      height: 576,
    },
    audio: false,
  });

  // 📝 Example for more options 📝
  //   getUserMedia({
  //     audio: true,
  //     video: {
  //       width: { min: 1024, ideal: 1280, max: 1920 },
  //       height: { min: 576, ideal: 720, max: 1080 }
  //     }
  //   })

  video.srcObject = stream;
  video.play();
  actionBtn.disabled = false;
};

const files = {
  input: "recording.webm",
  mp4Output: "output.mp4",
  thumbnailOutput: "thumbnail.jpg",
};

const downloadFile = (url, fileName) => {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);

  anchor.click();
};

const handleDownload = async () => {
  actionBtn.removeEventListener("click", handleDownload);
  actionBtn.innerText = "Transcoding";
  actionBtn.disabled = true;

  // 📝 FFMpeg + WebAssembly
  // 1️⃣ create a virtual world of ffmpeg and load ffmpeg using await
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  // 2️⃣ File System (FS)
  ffmpeg.FS("writeFile", files.input, await fetchFile(videoUrl)); //FS(method, fileName, binaryData)

  // 3️⃣ Run transcoding
  await ffmpeg.run("-i", files.input, "-r", "60", files.mp4Output);
  // basic ===> ffmpeg.run("-i" , input.webm, output.mp4)
  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumbnailOutput
  );

  // 4️⃣ Read
  const mp4File = ffmpeg.FS("readFile", files.mp4Output);
  const thumbnailFile = ffmpeg.FS("readFile", files.thumbnailOutput);

  //   console.log(mp4File);// 👈 Uint8Array
  //   console.log(mp4File.buffer); // 👈 binary data

  // 5️⃣ Create a new Blob
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbnailBlob = new Blob([thumbnailFile.buffer], { type: "image/jpg" });

  // 6️⃣ Create a new URL
  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbnailUrl = URL.createObjectURL(thumbnailBlob);

  downloadFile(mp4Url, "video.mp4");
  downloadFile(thumbnailUrl, "image.jpg");

  // Unlink remove all files
  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.mp4Output);
  ffmpeg.FS("unlink", files.thumbnailOutput);

  // Remove Urls
  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbnailUrl);
  URL.revokeObjectURL(videoUrl);

  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleStart);
  init();
};

// The reason why the event listeners have to be removed is because here we have only one button!
const handleStop = () => {
  if (recorder.state === "inactive") return;
  actionBtn.innerText = "Download Recording";
  actionBtn.removeEventListener("click", handleStop);
  actionBtn.addEventListener("click", handleDownload);

  recorder.stop();
  clearInterval(timeStampId);
  timeStampId = null;
};

const handleStart = () => {
  actionBtn.disabled = true;

  actionBtn.innerText = "Stop Recording";
  actionBtn.removeEventListener("click", handleStart);
  actionBtn.addEventListener("click", handleStop);

  recorder = new MediaRecorder(stream);
  // 📝 Option example for MediaRecorder 📝
  // extension "webm" is compatible for every browser but the ohter extensions like "mp4" may not.
  //   const options = {
  //     audioBitsPerSecond: 128000,
  //     videoBitsPerSecond: 2500000,
  //     mimeType: 'video/mp4'
  //   }
  //   const mediaRecorder = new MediaRecorder(stream, options);

  recorder.ondataavailable = (event) => {
    videoUrl = URL.createObjectURL(event.data); //This line will create a ⭐️URL⭐️ wich exists only on browser

    video.srcObject = null; // remove preview src
    video.src = videoUrl; // add the ⭐️URL⭐️ of recorded video file to src
    video.loop = true;
    video.play();
  };

  recorder.start();

  if (!timeStampId) {
    timeStampId = setInterval(() => {
      currentTime += 1;
      timeStamp.innerText = currentTime;
    }, 1000);
  }

  setTimeout(() => {
    actionBtn.disabled = false;
  }, 2000);

  setTimeout(() => {
    handleStop();
  }, 10000);
};

init();

actionBtn.addEventListener("click", handleStart);
