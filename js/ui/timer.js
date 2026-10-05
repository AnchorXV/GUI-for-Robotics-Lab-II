// Timer panel: countdown from an absolute deadline plus the 10 s stack-hold window.
// One 100 ms interval drives both through state.tick(); rendering only reads state.
import { RULES } from "../config.js";
import { awardHoldIfComplete, pauseTimer, resetTimer, startTimer, tick } from "../state.js";

let display;
let startButton;
let pauseButton;
let resetButton;

export function init() {
  display = document.getElementById("timer");
  startButton = document.getElementById("btn-start");
  pauseButton = document.getElementById("btn-pause");
  resetButton = document.getElementById("btn-reset");

  startButton.addEventListener("click", startTimer);
  pauseButton.addEventListener("click", pauseTimer);
  resetButton.addEventListener("click", resetTimer);

  setInterval(() => {
    tick(Date.now());
    awardHoldIfComplete();
  }, 100);
}

export function render(state) {
  const minutes = String(Math.floor(state.timeLeft / 60)).padStart(2, "0");
  const seconds = String(state.timeLeft % 60).padStart(2, "0");
  display.textContent = `${minutes}:${seconds}`;
  display.classList.toggle("warning", state.timeLeft <= RULES.LOW_TIME_WARNING_S);

  startButton.disabled = !state.phase || state.phaseLocked || state.disqualified || state.running;
  pauseButton.disabled = !state.running;
}