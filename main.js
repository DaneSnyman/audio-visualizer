// Canvas
const canvas = document.querySelector("canvas");
canvas.height = innerHeight;
canvas.width = innerWidth;
const brush = canvas.getContext("2d");

// Audio
const songs = [
  {
    title: "Miss Jane - It's a fine day",
    src: "assets/fineday.mp3",
    enum: "fineday",
    playing: false,
  },
  {
    title: "Wamdue Project - King of My Castle",
    src: "assets/wamdue.mp3",
    enum: "wamdue",
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
    // * Circles
    if (i % 7 === 0) {
      for (let index = 0; index < val; index++) {
        if (index % 7 === 0) {
          brush.beginPath();
          brush.arc(space * i, canvas.height - index, 2, 0, Math.PI * 2);
          if (index > 180) {
            brush.fillStyle = "red";
          } else if (index > 80) {
            brush.fillStyle = "yellow";
          } else {
            brush.fillStyle = "green";
          }

          brush.fill();
        }
      }
    }

    // * lines
    // brush.beginPath();
    // brush.moveTo(space * i, canvas.height);
    // if (val > 200) {
    //   brush.strokeStyle = "red";
    // } else if (val > 100) {
    //   brush.strokeStyle = "yellow";
    // } else {
    //   brush.strokeStyle = "green";
    // }
    // for (let index = 0; index < val; index++) {
    //   brush.lineTo(space * i, canvas.height - index);
    // }
    // brush.stroke();
  });
};

const animate = () => {
  if (canvas.width !== innerWidth || canvas.height !== innerHeight) {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  requestAnimationFrame(animate);
  brush.fillStyle = "rgba(20, 20, 20, 0.3)";
  brush.fillRect(0, 0, canvas.width, canvas.height);
  analyser.getByteFrequencyData(data);
  draw(data);
};

const init = () => {
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

audioElement.onended = () => {
  songs.forEach((song, i) => {
    console.log("song", song.src);
    console.log("audioEle", audioElement.src);
    if (
      song.src === audioElement.src.substr(audioElement.src.indexOf("/", 7) + 1)
    ) {
      const arrIndex = i + 1;
      const next = songs[arrIndex];
      playSong(next.enum);
    } else {
      console.log("start list again");
      audioElement.src = songs[0].src;
      playSong(songs[0].enum);
    }
  });
};
