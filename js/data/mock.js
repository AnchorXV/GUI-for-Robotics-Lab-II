// Simulated telemetry source: walks the robot, drains the battery, adds sensor noise,
// and flips the safety flags rarely. Produces the PRD 7 schema exactly.
import { CONFIG } from "../config.js";

const WIFI_CHANNELS = [1, 6, 11];

export function createMockSource(onTelemetry) {
  let x = 0;
  let y = 0;
  let theta = 0;
  let battery = 11.8;
  let blindZone = false;
  let outOfBase = false;
  let lift = "down";
  let gripper = "open";
  let handle = null;

  function step() {
    const seconds = CONFIG.MOCK_INTERVAL_MS / 1000;

    theta += 0.02;
    x = Number((x + 0.5 * Math.cos(theta) * seconds).toFixed(3));
    y = Number((y + 0.5 * Math.sin(theta) * seconds).toFixed(3));
    battery = Math.max(10.5, battery - 0.0005);

    // Low-probability flag flips keep the safety UI reachable without a button.
    if (Math.random() < 0.004) blindZone = !blindZone;
    if (Math.random() < 0.002) outOfBase = !outOfBase;
    if (Math.random() < 0.01) lift = lift === "up" ? "down" : "up";
    if (Math.random() < 0.01) gripper = gripper === "open" ? "closed" : "open";

    onTelemetry({
      timestamp: Date.now(),
      phase: "A",
      odometry: { x, y, theta },
      battery_v: Number((battery + (Math.random() - 0.5) * 0.05).toFixed(2)),
      wifi: {
        channel: WIFI_CHANNELS[Math.floor(Math.random() * WIFI_CHANNELS.length)],
        rssi: -55 - Math.round(Math.random() * 10),
        latency_ms: Math.round(30 + Math.random() * 90),
      },
      servo: { lift, gripper },
      blindZone,
      outOfBase,
      cubes_carried: 0,
      stack_height: 0,
    });
  }

  return {
    start() {
      if (handle !== null) return;
      step();
      handle = setInterval(step, CONFIG.MOCK_INTERVAL_MS);
    },
    stop() {
      clearInterval(handle);
      handle = null;
    },
    sendCommand() {
      // Mock has no transport; ui/controls.js writes the command to the log instead.
    },
    onTelemetry(fn) {
      onTelemetry = fn;
    },
  };
}