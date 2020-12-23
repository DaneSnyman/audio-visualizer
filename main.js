// Canvas
const canvas = document.querySelector("canvas");
canvas.height = innerHeight;
canvas.width = innerWidth;
const brush = canvas.getContext("2d");
const radius = 150;

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
analyser.fftSize = 2048;
const source = audioContext.createMediaElementSource(audioElement);
source.connect(analyser);
//this connects our music back to the default output, such as your //speakers
source.connect(audioContext.destination);

const playSong = (name) => {
  songs.forEach((song) => {
    if (song.enum === name) audioElement.src = song.src;
  });

  init();
};

let data = new Uint8Array(analyser.frequencyBinCount);

const draw = (data) => {
  data = [...data];
  const space = canvas.width / data.length;

  data.forEach((val, i) => {
    if (i % 2 === 0) {
      const x = radius * Math.cos(degrees_to_radians(i * 6));
      const y = radius * Math.sin(degrees_to_radians(i * 6));
      drawCircle(x + innerWidth / 2, y + innerHeight / 2, 1, val, i * 6, brush);
    }
    // * Circles
    if (i % 5 === 0) {
      for (let index = 0; index < val; index++) {
        if (index % 7 === 0) {
          brush.beginPath();
          brush.arc(space * i, canvas.height - index, 2, 0, Math.PI * 2);
          if (index > 180) {
            brush.fillStyle = "red";
          } else if (index > 120) {
            brush.fillStyle = "yellow";
          } else {
            brush.fillStyle = "green";
          }

          brush.fill();
        }
      }
    }
  });
};

function drawCircle(x, y, w, h, deg, ctx) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(degrees_to_radians(deg + 90));
  if (h > 200) {
    ctx.fillStyle = "red";
    ctx.shadowColor = "red";
    ctx.shadowBlur = 2;
  } else if (h > 130) {
    ctx.fillStyle = "yellow";
    ctx.shadowColor = "yellow";
    ctx.shadowBlur = 2;
  } else {
    ctx.fillStyle = "green";
    ctx.shadowColor = "green";
    ctx.shadowBlur = 2;
  }
  ctx.fillRect(-1 * (w / 2), -1 * (h / 2), w, h);
  ctx.restore();
}
function degrees_to_radians(degrees) {
  return (degrees * Math.PI) / 180;
}
function radians_to_degrees(radians) {
  return (radians * 180) / Math.PI;
}

const animate = () => {
  if (canvas.width !== innerWidth || canvas.height !== innerHeight) {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  requestAnimationFrame(animate);
  brush.fillStyle = "rgba(20, 20, 20, 0.5)";
  brush.fillRect(0, 0, canvas.width, canvas.height);
  analyser.getByteFrequencyData(data);
  draw(data);
};

const init = async () => {
  if (!audioElement.src) {
    audioElement.src = songs[0].src;
  }
  audioElement.play();
  animate();
};

init();

audioElement.onplay = () => {
  audioContext.resume();
};

const selectSong = () => {
  songs.every((song, i) => {
    const currentSrc = audioElement.src.substr(
      audioElement.src.indexOf("/", 7) + 1
    );
    if (i >= songs.length - 1) {
      audioElement.src = songs[0].src;
      playSong(songs[0].enum);
      return false;
    } else if (song.src === currentSrc) {
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
