// Canvas
const canvas = document.querySelector("canvas");
canvas.height = innerHeight;
canvas.width = innerWidth;
const brush = canvas.getContext("2d");
const radius = 200;
// const colors = {
//   green: "#00916e",
//   yellow: "#FFCF00",
//   red: "#fa003f",
// };

const colors = {
  green: "rgba(255,255,255, 0.5)",
  yellow: "rgba(255,207,0, 0.5)",
  red: "rgba(156, 13, 56, 0.8)",
};

const colorBars = {
  lower: "#1E2F6A",
  low: "#4370D6",
  mid: "#67B6E6",
  high: "#B6D3E1",
};

let selectedColor = colors.yellow;

// Audio
const songs = [
  {
    title: "Downlink - Ignition",
    src: "assets/ignition.mp3",
    enum: "ignition",
    playing: false,
  },
  {
    title: "Wamdue Project - King of My Castle",
    src: "assets/wamdue.mp3",
    enum: "wamdue",
    playing: false,
  },
  {
    title: "Miss Jane - It's a fine day",
    src: "assets/fineday.mp3",
    enum: "fineday",
    playing: false,
  },
];
const audioElement = document.querySelector("audio");
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 512;
const source = audioContext.createMediaElementSource(audioElement);
source.connect(analyser);
//this connects our music back to the default output, such as your //speakers
source.connect(audioContext.destination);

const checkElement = async (selector) => {
  while (document.querySelector(selector) === null) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return document.querySelector(selector);
};

const playSong = (name) => {
  checkElement(`#${name}`).then((res) => {
    const currentTrack = document.getElementById(name);
    const activeTrack = document.getElementsByClassName("active");
    while (activeTrack.length > 0) {
      activeTrack[0].classList.remove("active");
    }
    currentTrack.classList.add("active");
    songs.forEach((song) => {
      if (song.enum === name) audioElement.src = song.src;
    });
    audioElement.play();
    init();
  });
};

const selectSong = () => {
  songs.every((song, i) => {
    const currentSrc = audioElement.src.substr(
      audioElement.src.indexOf("/", 7) + 1
    );
    if (i >= songs.length - 1) {
      console.log("ding");
      audioElement.src = songs[0].src;
      playSong(songs[0].enum);
      return false;
    } else if (song.src === currentSrc) {
      console.log("ding2");
      const arrIndex = +i + 1;
      const next = songs[arrIndex];
      playSong(next.enum);
      return false;
    }
    return true;
  });
};

audioElement.onended = () => {
  selectSong();
};

audioElement.onplay = () => {
  audioContext.resume();
};

const getAverage = (nums) => {
  return nums.reduce((a, b) => a + b) / nums.length;
};

let data = new Uint8Array(analyser.frequencyBinCount);
const draw = (data) => {
  data = [...data];
  const space = canvas.width / 2 / data.length;
  const average = getAverage(data);
  if (average < 40) {
    selectedColor = colors.green;
  } else if (average < 90) {
    selectedColor = colors.yellow;
  } else {
    selectedColor = colors.red;
  }

  data.forEach((val, i) => {
    if (i % 1 === 0) {
      multiplier = 3;
      const x = radius * Math.cos(degrees_to_radians(i * multiplier));
      const y = radius * Math.sin(degrees_to_radians(i * multiplier));
      drawCircle(
        x + innerWidth / 2 + 33,
        y + innerHeight / 2,
        2,
        val / 1.3 > 175 ? 175 : val / 1.3,
        i * multiplier,
        brush
      );
    }
    // * Circles
    if (i % 3 === 0) {
      for (let index = 0; index < val; index++) {
        if (index % 8 === 0) {
          const x = space * i + 20;
          const y = canvas.height - index - 20;
          brush.beginPath();
          brush.arc(x, y, 1, 0, Math.PI * 2);
          if (index > 190) {
            brush.fillStyle = colorBars.high;
          } else if (index > 90) {
            brush.fillStyle = colorBars.mid;
          } else {
            brush.fillStyle = colorBars.low;
          }

          brush.fill();
        }
      }
    }
  });
};

const drawCircle = (x, y, w, h, deg, ctx) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(degrees_to_radians(deg + 90));
  // if (h > 170) {
  //   ctx.fillStyle = colors.red;
  //   ctx.shadowColor = colors.red;
  //   ctx.shadowBlur = 20;
  // } else if (h > 80) {
  //   ctx.fillStyle = colors.yellow;
  //   ctx.shadowColor = colors.yellow;
  //   ctx.shadowBlur = 20;
  // } else {
  //   ctx.fillStyle = colors.green;
  //   ctx.shadowColor = colors.green;
  //   ctx.shadowBlur = 20;
  // }
  ctx.fillStyle = selectedColor;
  ctx.shadowColor = selectedColor;
  ctx.shadowBlur = 20;
  ctx.fillRect(-1 * (w / 2), -1 * (h / 2), w, h);
  ctx.restore();
};

const degrees_to_radians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

const radians_to_degrees = (radians) => {
  return (radians * 180) / Math.PI;
};

const buildTracks = () => {
  const tracks = document.querySelector("ul");
  songs.forEach((song) => {
    var audio = new Audio();
    audio.src = song.src;
    audio.addEventListener("loadedmetadata", function () {
      var s = parseInt(audio.duration % 60);
      var m = parseInt((audio.duration / 60) % 60);
      song.duration = `${m < 10 ? `0${m}` : m}:${s}`;

      const li = document.createElement("li");
      const durationDisplay = document.createElement("span");
      durationDisplay.append(song.duration);
      li.appendChild(document.createTextNode(song.title));
      li.appendChild(durationDisplay);
      li.setAttribute("id", song.enum);
      li.setAttribute("onClick", `playSong('${song.enum}')`);
      tracks.appendChild(li);
      init();
    });
  });
};

const animate = () => {
  if (canvas.width !== innerWidth || canvas.height !== innerHeight) {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  requestAnimationFrame(animate);
  brush.clearRect(0, 0, canvas.width, canvas.height);
  // brush.fillStyle = "rgba(20, 20, 20, 0.5)";
  // brush.fillRect(0, 0, canvas.width, canvas.height);
  analyser.getByteFrequencyData(data);
  draw(data);
};

const init = () => {
  if (!audioElement.src) {
    playSong(songs[0].enum);
  }

  animate();
};

buildTracks();
