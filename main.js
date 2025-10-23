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

// torque + angle math
function updateSeesaw() {
  let leftTorque = 0, rightTorque = 0;

  // go through all weights
  weights.forEach((w) => {
    if (w.x < 0) {
      leftTorque += Math.abs(w.x) * w.weight;
    } else {
      rightTorque += w.x * w.weight;
    }
  });

  // print to console (for debugging)
  console.log("torques =>", leftTorque, rightTorque);

  // torque difference → angle (limited to ±30)
  const diff = (rightTorque - leftTorque) / 10;
  currentAngle = Math.max(-30, Math.min(30, diff));

  // rotate the beam
  beam.style.transform = `translateX(-50%) rotate(${currentAngle}deg)`;

  // show values in UI
  leftText.textContent = leftTorque.toFixed(0);
  rightText.textContent = rightTorque.toFixed(0);
  angleText.textContent = currentAngle.toFixed(1) + "°";

  // save periodically (not every frame)
  const now = Date.now();
  if (now - lastSave > 1500) { // every ~1.5s
    saveState();
    lastSave = now;
  }
}