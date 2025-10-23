// just grabbing stuff from the page
const beam = document.querySelector("#beam");
const pivot = document.querySelector("#pivot");
const log = document.querySelector("#log");
const angleText = document.querySelector("#angle"); // will show the tilt
const leftText = document.querySelector("#left");
const rightText = document.querySelector("#right");

let weights = []; // gonna store all dropped weights
let currentAngle = 0;
