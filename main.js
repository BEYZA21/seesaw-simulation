// just grabbing stuff from the page
const beam = document.querySelector("#beam");
const pivot = document.querySelector("#pivot");
const log = document.querySelector("#log");
const angleText = document.querySelector("#angle");
const leftText = document.querySelector("#left");
const rightText = document.querySelector("#right");
const resetBtn = document.querySelector("#resetBtn");
// audio system
const SFX = {
  ctx: null,
  gain: null,
  buffers: {},
  enabled: true,
  volume: 0.4,
};
// start audio after first click anywhere (browser policy)
window.addEventListener("click", () => {
  if (!SFX.ctx) {
    ensureAudio();
    console.log("Audio system initialized 🎧");
  }
}, { once: true });

//void audio init function
async function initAudio() {
  if (SFX.ctx) return;
  SFX.ctx = new (window.AudioContext || window.webkitAudioContext)();
  SFX.gain = SFX.ctx.createGain();
  SFX.gain.gain.value = SFX.volume;
  SFX.gain.connect(SFX.ctx.destination);
  await Promise.all([
    loadSound("drop", "sfx/drop.mp3"),
    loadSound("settle", "sfx/settle.mp3"),
    loadSound("reset", "sfx/reset.mp3"),
  ]);
}

//void audio load function 
async function loadSound(name, url) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  SFX.buffers[name] = await SFX.ctx.decodeAudioData(buf);
}

function ensureAudio() {
  if (!SFX.ctx) initAudio();
  else if (SFX.ctx.state === "suspended") SFX.ctx.resume();
}

function playSfx(name, vol = 1, rate = 1) {
  if (!SFX.enabled || !SFX.buffers[name]) return;
  const src = SFX.ctx.createBufferSource();
  src.buffer = SFX.buffers[name];
  src.playbackRate.value = rate;
  const gain = SFX.ctx.createGain();
  gain.gain.value = vol;
  src.connect(gain).connect(SFX.gain);
  src.start();
}

// volume + mute controls
const muteToggle = document.querySelector("#muteToggle");
const volRange = document.querySelector("#volRange");

muteToggle.addEventListener("click", () => {
  SFX.enabled = !SFX.enabled;
  muteToggle.textContent = SFX.enabled ? "🔊" : "🔇";
});
volRange.addEventListener("input", () => {
  SFX.volume = parseFloat(volRange.value);
  if (SFX.gain) SFX.gain.gain.value = SFX.volume;
});

let weights = []; // gonna store all dropped weights
let currentAngle = 0;
let targetAngle = 0;
let lastSave = 0;
let anim;

// click to drop new weight
beam.addEventListener("click", (e) => {
  ensureAudio(); // 🔊 added sound init
  const rect = beam.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2; // 0 = center
  const side = x < 0 ? "left" : "right";
  const w = Math.floor(Math.random() * 10) + 1; // 1–10 kg

  // new element
  const el = document.createElement("div");
  el.className = "weight";
  el.textContent = `${w}kg`;
  el.style.left = `${e.clientX - rect.left}px`;
  el.style.top = "50%";
  el.style.transform = "translate(-50%, -50%)";
  el.style.background = side === "left" ? "#3b82f6" : "#ef4444";
  beam.appendChild(el);

  weights.push({ x, weight: w, el });
  logMsg(`+${w}kg added to ${side} side`);
  playSfx("drop", 0.5, 1 + w * 0.015); // 🔊 added sound effect
  updateSeesaw();
});

// main torque + balance update
function updateSeesaw() {
  let leftTorque = 0, rightTorque = 0;
  weights.forEach((w) => {
    const torque = Math.abs(w.x) * w.weight; // tork formule
    if (w.x < 0) leftTorque += torque;
    else rightTorque += torque;
  });

  // torque diff → angle (capped ±30)
  const diff = (rightTorque - leftTorque) / 10;
  targetAngle = Math.max(-30, Math.min(30, diff));

  // totals for UI (sum of weights)
  const leftMass = weights.filter(w => w.x < 0).reduce((s, w) => s + w.weight, 0);
  const rightMass = weights.filter(w => w.x > 0).reduce((s, w) => s + w.weight, 0); //left and right total weight calculate

  leftText.textContent = leftMass.toFixed(0);
  rightText.textContent = rightMass.toFixed(0);

  // smooth animation
  cancelAnimationFrame(anim);
  animateTilt();

  // save periodically
  const now = Date.now();
  if (now - lastSave > 1500) {
    saveState();
    lastSave = now;
  }
}

// smooth tilt using requestAnimationFrame
function animateTilt() {
  const prevAngle = currentAngle; // 🔊 added to detect final movement
  currentAngle += (targetAngle - currentAngle) * 0.2;
  beam.style.transform = `translateX(-50%) rotate(${currentAngle}deg)`;
  angleText.textContent = currentAngle.toFixed(1) + "°";

  if (Math.abs(targetAngle - currentAngle) > 0.1) {
    anim = requestAnimationFrame(animateTilt);
  } else {
    currentAngle = targetAngle;
    beam.style.transform = `translateX(-50%) rotate(${currentAngle}deg)`;
    angleText.textContent = currentAngle.toFixed(1) + "°";

    // 🔊 subtle settle sound when movement stops
    if (Math.abs(currentAngle - prevAngle) > 2) {
      playSfx("settle", 0.25 + Math.abs(currentAngle) / 200, 1);
    }
  }
}

// log messages nicely
function logMsg(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

// reset everything (bonus feature)
resetBtn.addEventListener("click", () => {
  weights.forEach(w => w.el.remove());
  weights = [];
  currentAngle = 0;
  targetAngle = 0;
  beam.style.transform = `translateX(-50%) rotate(0deg)`;
  log.innerHTML = "";
  leftText.textContent = "0";
  rightText.textContent = "0";
  angleText.textContent = "0°";
  logMsg("Reset done");
  playSfx("reset", 0.4); //  added reset sound
  saveState();
});

// save + load functions
function saveState() {
  const data = weights.map(w => ({ x: w.x, weight: w.weight }));
  localStorage.setItem("weights", JSON.stringify(data));
}

function loadState() {
  const saved = localStorage.getItem("weights");
  if (!saved) return;
  const arr = JSON.parse(saved);
  const half = beam.clientWidth / 2;

  arr.forEach(w => {
    const el = document.createElement("div");
    el.className = "weight";
    el.textContent = `${w.weight}kg`;
    el.style.left = `${half + w.x}px`;
    el.style.top = "50%";
    el.style.transform = "translate(-50%, -50%)";
    el.style.background = w.x < 0 ? "#3b82f6" : "#ef4444";
    beam.appendChild(el);
    weights.push({ ...w, el });
  });

  logMsg("Restored previous session");
  updateSeesaw();
}

window.addEventListener("load", loadState);
window.addEventListener("keydown", (e) => {
  if (e.key === "d") {
    ensureAudio();
    playSfx("drop", 0.5);
    console.log("▶ Tried playing drop sound");
  }
});
