// just grabbing stuff from the page
const beam = document.querySelector("#beam");
const pivot = document.querySelector("#pivot");
const log = document.querySelector("#log");
const angleText = document.querySelector("#angle"); // will show the tilt
const leftText = document.querySelector("#left");
const rightText = document.querySelector("#right");

let weights = []; // gonna store all dropped weights
let currentAngle = 0;

beam.addEventListener("click", (e) => {
  // get click position relative to beam
  const rect = beam.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2; // 0 = center
  const side = x < 0 ? "left" : "right";

  // random weight 1-10
  const w = Math.floor(Math.random() * 10) + 1;

  // make new element
  const el = document.createElement("div");
  el.className = "weight";
  el.style.left = `${e.clientX - rect.left}px`;
  el.style.background = side === "left" ? "#3b82f6" : "#ef4444"; // blue/red
  el.textContent = `${w}kg`;
  beam.appendChild(el);

  weights.push({ x, weight: w, el });
  logMessage(`+${w}kg added to ${side} side`);
  updateSeesaw();
});
