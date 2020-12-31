// Canvas
const canvas = document.querySelector("canvas");
canvas.height = innerHeight;
canvas.width = innerWidth;
const brush = canvas.getContext("2d");

const getBreakpoints = () => {
  const breakpoints = {
    sml: canvas.width <= 320,
    med: canvas.width <= 768,
    large: canvas.width <= 1280,
  };
  return breakpoints;
};

let breakpoints = getBreakpoints();
let radius = breakpoints.sml ? 100 : 186;
console.log(breakpoints);

const hexToRGB = (hex, alpha) => {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
};

const colors = {
  green: hexToRGB("#086972", 1),
  yellow: hexToRGB("#17b978", 1),
  red: hexToRGB("#a7ff83", 1),
};

const colorBars = {
  lower: "#1E2F6A",
  low: "#4370D6",
  mid: "#67B6E6",
  high: "#B6D3E1",
};

const effect = {
  speaker: true,
  lineCircle: false,
  soundBar: true,
  starField: false,
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

const audioEleMargin = 25;
const audioContext = new AudioContext();
const source = audioContext.createMediaElementSource(audioElement);

let analyser;
const setFFTSize = (size) => {
  analyser = audioContext.createAnalyser();
  analyser.fftSize = size;
  source.connect(analyser);
  //this connects our music back to the default output, such as your //speakers
  source.connect(audioContext.destination);
  return new Uint8Array(analyser.frequencyBinCount);
};
let data = setFFTSize(64);

const checkElement = async (selector) => {
  while (document.querySelector(selector) === null) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return document.querySelector(selector);
};

const playSong = (name) => {
  checkElement(`#${name}`).then(() => {
    const currentTrack = document.getElementById(name);
    const activeTrack = document.getElementsByClassName("active");
    while (activeTrack.length > 0) {
      activeTrack[0].classList.remove("active");
    }
    currentTrack.classList.add("active");
    songs.forEach((song) => {
      if (song.enum === name) audioElement.src = song.src;
    });

    audioElement.onloadeddata = function () {
      audioElement.play();
      init();
    };
  });
};

const selectSong = () => {
  songs.every((song, i) => {
    const currentSrc = audioElement.src;
    if (i >= songs.length - 1) {
      audioElement.src = songs[0].src;
      playSong(songs[0].enum);
      return false;
    } else if (currentSrc.includes(song.src)) {
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
let count = 0;

class Circle {
  constructor(radius, i, audioData) {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.starX = 1;
    this.starY = Math.random() * canvas.height;
    this.radius = radius;
    this.i = i;
    this.color = this.setColor();
    this.increment = 0;
    this.audioData = audioData;
  }

  drawSpeakerWaves() {
    if (!this.audioData) {
      brush.beginPath();
      brush.arc(
        this.x,
        this.y,
        breakpoints.sml ? this.radius / 3 : this.radius / 1.5,
        0,
        Math.PI * 2
      );
      // brush.shadowColor = this.color;
      // brush.shadowBlur = 1;
      // brush.fillStyle = this.color;
      // brush.fill();
      brush.lineWidth = this.radius / 25;
      brush.strokeStyle = this.color;
      brush.stroke();
    }
  }

  setColor() {
    if (this.radius > 190) {
      return colors.red;
    } else if (this.radius > 90) {
      return colors.yellow;
    } else {
      return colors.green;
    }
  }

  drawStarField() {
    if (!this.audioData) {
      this.starX += this.radius;
      brush.beginPath();
      brush.arc(this.starX, this.starY, 5, 0, Math.PI * 2);
      brush.fillStyle = colors.green;
      brush.fill();
    }
  }

  drawSpikes() {
    if (this.audioData) {
      const ctx = brush;
      var totalLength = 0;

      let cap = getAverage(this.audioData);
      cap = breakpoints.sml ? cap / 2 : cap;
      let numBurst = [];
      this.audioData.forEach((freq) => {
        if (breakpoints.sml) {
          freq > 30
            ? numBurst.push(freq / 2 + cap)
            : numBurst.push(freq / 2 + 30 + cap);
        } else {
          freq > 30
            ? numBurst.push(freq + cap)
            : numBurst.push(freq + 30 + cap);
        }
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height); //clear before every repaint
      var angleInRad = (Math.PI * (360 / numBurst.length)) / 180;
      var deltaAngleInRad = angleInRad / 2;
      const varX = this.x;
      const varY = this.y;
      ctx.moveTo(varX, varY);
      ctx.beginPath();
      numBurst.forEach((freq, i) => {
        const x1 = freq * Math.cos(angleInRad * i) + varX;
        const y1 = freq * Math.sin(angleInRad * i) + varY;
        const x2 = cap * Math.cos(angleInRad * i + deltaAngleInRad) + varX;
        const y2 = cap * Math.sin(angleInRad * i + deltaAngleInRad) + varY;
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
      });
      ctx.fillStyle = "crimson";
      ctx.fill();
    }
  }

  drawBar() {
    if (!this.audioData) {
      const audioRect = audioElement.getBoundingClientRect();
      const space = (audioRect.width - audioEleMargin * 2) / data.length;
      if (this.i % 1 === 0) {
        for (let index = 0; index < this.radius / 3; index++) {
          if (index % 1 === 0) {
            const smlRadius = 1;
            const x = space * this.i + audioRect.x + audioEleMargin + smlRadius;
            const y = audioRect.y - index;
            brush.beginPath();
            brush.arc(x, y, smlRadius, 0, Math.PI * 2);
            if (index > 60) {
              brush.fillStyle = colors.red;
            } else if (index > 30) {
              brush.fillStyle = colors.yellow;
            } else {
              brush.fillStyle = colors.green;
            }

            brush.fill();
          }
        }
      }
    }
  }

  drawCircleWave() {
    const multiplier = 4;
    const x = radius * Math.cos(degrees_to_radians(this.i * multiplier));
    const y = radius * Math.sin(degrees_to_radians(this.i * multiplier));
    this.lineCircle(
      x + innerWidth / 2 + 30,
      y + innerHeight / 2 + 5,
      2,
      this.radius / 1.5 > 175 ? 175 : this.radius / 1.5,
      this.i * multiplier,
      brush
    );
  }

  lineCircle(x, y, w, h, deg, ctx) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(degrees_to_radians(deg + 90));
    ctx.fillStyle = selectedColor;
    ctx.shadowColor = selectedColor;
    ctx.shadowBlur = 50;
    ctx.fillRect(-1 * (w / 2), -1 * (h / 2), w, h);
    ctx.restore();
  }

  update() {
    this.drawSpikes();
    if (effect.speaker && this.i % 2 === 0 && this.i > 5)
      this.drawSpeakerWaves();
    if (effect.lineCircle && this.i % 1 === 0 && this.i > 20)
      this.drawCircleWave();
    if (effect.soundBar && this.i % 1 === 0) this.drawBar();
    if (effect.starField && this.i % 1 === 0) {
      this.starX += this.i;
      console.log(this.starX);
      this.drawStarField();
    }
  }
}

const drawCircle = (x, y, w, h, deg, ctx) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(degrees_to_radians(deg + 90));
  ctx.fillStyle = selectedColor;
  ctx.shadowColor = selectedColor;
  ctx.shadowBlur = 50;
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

const setPlaylistPos = () => {
  const playlist = document.getElementById("track-list");
  if (breakpoints.sml) {
    playlist.style.width = `${canvas.width - 20}px`;
    playlist.style.left = `0px`;
    playlist.style.right = `0px`;
    playlist.style.top = `10px`;
    playlist.style.margin = `auto`;
  } else {
    const audioRect = audioElement.getBoundingClientRect();
    playlist.style.width = `${audioRect.width - audioEleMargin * 2}px`;
    playlist.style.left = `${audioRect.x + audioEleMargin}px`;
    playlist.style.top = `${audioRect.y + audioRect.height}px`;
  }
};

const animate = () => {
  if (canvas.width !== innerWidth || canvas.height !== innerHeight) {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    getBreakpoints();
    setPlaylistPos();
    radius = breakpoints.sml ? 100 : 186;
  }
  requestAnimationFrame(animate);
  // brush.fillStyle = hexToRGB("#111122", 0.3);
  // brush.fillRect(0, 0, canvas.width, canvas.height);
  brush.clearRect(0, 0, canvas.width, canvas.height);
  analyser.getByteFrequencyData(data);
  let circleArr = [];
  let audioData = [...data];
  circleArr.push(new Circle(100, 0, audioData));
  audioData.forEach((val, i) => {
    if (i % 1 === 0) circleArr.push(new Circle(val, i));
  });

  circleArr.forEach((circle, i) => {
    circle.update();
  });
};

const init = () => {
  setPlaylistPos();

  if (!audioElement.src) {
    playSong(songs[0].enum);
  }

  animate();
};

buildTracks();
