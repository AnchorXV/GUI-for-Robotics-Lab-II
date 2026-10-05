// Telemetry panel: label/value rows for odometry, battery, latency, and actuators.
// Threshold colours come from RULES; the panel dims itself when data goes stale.
import { RULES } from "../config.js";

let staleBadge;
let panel;
const cells = {};

export function init() {
  panel = document.querySelector(".telemetry-panel");
  staleBadge = document.getElementById("telemetry-stale-badge");
  ["odo", "battery", "battery-fill", "latency", "lift-state", "gripper-state"].forEach((id) => {
    cells[id] = document.getElementById(id);
  });
}

export function render(state) {
  const telemetry = state.telemetry;
  if (!telemetry) return;

  const { x, y, theta } = telemetry.odometry;
  cells.odo.textContent = `${x.toFixed(2)} m, ${y.toFixed(2)} m, ${theta.toFixed(2)} rad`;

  const volts = telemetry.battery_v;
  cells.battery.textContent = `${volts.toFixed(2)} V`;
  cells.battery.classList.toggle("warn", volts < RULES.BATTERY_WARN_V && volts >= RULES.BATTERY_DANGER_V);
  cells.battery.classList.toggle("danger", volts < RULES.BATTERY_DANGER_V);
  cells["battery-fill"].style.width = `${batteryBarFill(volts)}%`;

  const latency = telemetry.wifi.latency_ms;
  cells.latency.textContent = `${latency} ms`;
  cells.latency.classList.toggle("danger", latency > RULES.LATENCY_DANGER_MS);

  cells["lift-state"].textContent = telemetry.servo.lift.toUpperCase();
  cells["gripper-state"].textContent = telemetry.servo.gripper.toUpperCase();

  staleBadge.hidden = !state.telemetryStale;
  panel.classList.toggle("stale", state.telemetryStale);
}

// Display-only bar scaled across the plausible pack range; never a percentage readout.
function batteryBarFill(volts) {
  return Math.min(Math.max(((volts - 10.0) / 2.8) * 100, 0), 100);
}