import { CONFIG, RULES } from "./config.js";
import { getState, setState, subscribe } from "./state.js";
import { createMockSource } from "./data/mock.js";
import { phaseBPoints } from "./rules/scoring.js";

const $ = (sel) => document.querySelector(sel);
const logEl = $("#log");

function log(msg) {
  const li = document.createElement("li");
  li.textContent = `[${new Date().toLocaleTimeString("id-ID")}] ${msg}`;
  logEl.prepend(li);
}

// --- Render telemetri ---
function renderTelemetry(t) {
  if (!t) return;
  const { x, y, theta } = t.odometry;
  $("#odo").textContent = `${x.toFixed(2)}, ${y.toFixed(2)}, ${theta.toFixed(2)} rad`;
  $("#battery").textContent = `${t.battery_v.toFixed(2)} V`;
  $("#latency").textContent = `${t.latency_ms} ms`;
  $("#wifi-status").textContent = `WiFi ch ${t.wifi.channel} · ${t.wifi.rssi} dBm`;
}

// --- Timer fase ---
let timerId = null;
function startTimer() {
  if (timerId) return;
  timerId = setInterval(() => {
    const { timeLeft } = getState();
    if (timeLeft <= 0) return stopTimer("Waktu habis");
    setState({ timeLeft: timeLeft - 1 });
  }, 1000);
  setState({ running: true });
  log("Timer dimulai");
}
function stopTimer(reason) {
  clearInterval(timerId);
  timerId = null;
  setState({ running: false });
  log(reason);
}

function renderTimer({ timeLeft }) {
  const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const s = String(timeLeft % 60).padStart(2, "0");
  const el = $("#timer");
  el.textContent = `${m}:${s}`;
  el.classList.toggle("warning", timeLeft <= 30);
}

// --- Aksi pengguna ---
document.querySelectorAll("[data-robot]").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-robot]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    setState({ robot: btn.dataset.robot });
    log(`Robot dipilih: ${btn.dataset.robot}`);
  })
);

document.querySelectorAll("[data-phase]").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-phase]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    setState({ phase: btn.dataset.phase, timeLeft: RULES.PHASE_DURATION_S });
    log(`Fase ${btn.dataset.phase} dipilih`);
  })
);

document.querySelectorAll("[data-cmd]").forEach((btn) =>
  btn.addEventListener("click", () => {
    const cmd = btn.dataset.cmd;
    // Nanti: kirim via UDP bridge. Sekarang hanya log.
    log(`CMD → ${cmd}`);
  })
);

$("#btn-penalty").addEventListener("click", () => log("Pelanggaran dicatat (perlu input jenis)"));

// --- Inisialisasi ---
subscribe((s) => {
  renderTimer(s);
  if (s.telemetry) renderTelemetry(s.telemetry);
  $("#score").textContent = s.score;
  $("#carried").textContent = s.carried;
  $("#stack").textContent = s.stack;
});

const source = CONFIG.USE_MOCK
  ? createMockSource((data) => setState({ telemetry: data }))
  : null;

$("#mode-indicator").textContent = CONFIG.USE_MOCK ? "Mock" : "Live";
renderTimer(getState());
log("Dashboard siap");