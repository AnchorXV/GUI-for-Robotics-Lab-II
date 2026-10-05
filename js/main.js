// Bootstrap: wires the header, video placeholder, and disqualification banner, then
// delegates every panel to its ui/ module. Owns no scoring and no panel rendering.
import { CONFIG, formatWIBTime } from "./config.js";
import {
  addEvent,
  resetMatch,
  selectPhase,
  setTelemetry,
  subscribe,
} from "./state.js";
import { createMockSource } from "./data/mock.js";
import { createLiveSource } from "./data/live.js";
import { setActiveSource } from "./data/source.js";
import { init as initTelemetry, render as renderTelemetry } from "./ui/telemetry.js";
import { init as initControls, render as renderControls } from "./ui/controls.js";
import { init as initTimer, render as renderTimer } from "./ui/timer.js";
import { init as initScore, render as renderScore } from "./ui/score.js";
import { init as initLog, render as renderLog } from "./ui/log.js";

const wifiText = document.getElementById("wifi-text");
const wifiStatus = document.getElementById("wifi-status");
const clock = document.getElementById("clock");
const phaseAButton = document.getElementById("btn-phase-a");
const phaseBButton = document.getElementById("btn-phase-b");
const disqualificationBanner = document.getElementById("dq-banner");

function initHeader() {
  document.getElementById("team-name").textContent = CONFIG.TEAM_NAME;
  document.getElementById("mode-badge").textContent = CONFIG.USE_MOCK ? "MOCK" : "LIVE";

  phaseAButton.addEventListener("click", () => selectPhase("A"));
  phaseBButton.addEventListener("click", () => selectPhase("B"));
  document.getElementById("btn-reset-match").addEventListener("click", resetMatch);

  setInterval(renderClock, 1000);
  renderClock();
}

function renderClock() {
  clock.textContent = `${formatWIBTime(Date.now())} WIB`;
}

// Static canvas placeholder: dark 4:3 surface with the PRD 5.2 texts.
function drawVideoPlaceholder() {
  const canvas = document.getElementById("video-canvas");
  const context = canvas.getContext("2d");
  context.fillStyle = "#0E1524";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.textAlign = "center";
  context.fillStyle = "#FFFFFF";
  context.font = "600 22px system-ui, sans-serif";
  context.fillText("AWAITING ESP32-CAM STREAM (TCP)", canvas.width / 2, canvas.height / 2 - 8);
  context.fillStyle = "#8A94A6";
  context.font = "16px system-ui, sans-serif";
  context.fillText("NO SIGNAL (MOCK)", canvas.width / 2, canvas.height / 2 + 24);
}

function renderHeader(state) {
  // Accent follows the drawn target; neutral until the operator picks one.
  for (const id of ["team-color-bar", "robot-tag"]) {
    const accent = document.getElementById(id);
    if (state.targetColor) accent.dataset.color = state.targetColor;
    else accent.removeAttribute("data-color");
  }

  phaseAButton.classList.toggle("active", state.phase === "A");
  phaseBButton.classList.toggle("active", state.phase === "B");
  phaseAButton.disabled = state.phaseLocked || state.disqualified;
  phaseBButton.disabled = state.phaseLocked || state.disqualified;

  const telemetry = state.telemetry;
  if (telemetry) {
    wifiText.textContent = `CH ${telemetry.wifi.channel} · ${telemetry.wifi.rssi} dBm`;
    wifiStatus.classList.toggle("stale", state.telemetryStale);
  }

  const blindZoneText = document.getElementById("blind-zone-text");
  const blindZoneBar = document.getElementById("blind-zone-bar");
  blindZoneText.textContent = state.blindZone ? "Blind zone active" : "Blind zone clear";
  blindZoneBar.classList.toggle("active", state.blindZone);

  disqualificationBanner.hidden = !state.disqualified;
}

function render(state) {
  renderHeader(state);
  renderTelemetry(state);
  renderControls(state);
  renderTimer(state);
  renderScore(state);
  renderLog(state);
}

initHeader();
drawVideoPlaceholder();
initTelemetry();
initControls();
initTimer();
initScore();
initLog();
subscribe(render);

const source = CONFIG.USE_MOCK ? createMockSource((telemetry) => setTelemetry(telemetry)) : createLiveSource();
setActiveSource(source);
source.start();

addEvent("info", "Operator dashboard initialized.");
