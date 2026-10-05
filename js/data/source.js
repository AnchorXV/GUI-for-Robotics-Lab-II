// Shared data-source contract (PRD 8) plus the registry holding the active source.
// Pure contract here: no telemetry logic, because main.js picks the source and only
// state.js reads telemetry.

/**
 * @typedef {Object} Telemetry
 * @property {number} timestamp Unix epoch in milliseconds.
 * @property {"A"|"B"} phase
 * @property {{ x: number, y: number, theta: number }} odometry meters and radians.
 * @property {number} battery_v Volts.
 * @property {{ channel: 1|6|11, rssi: number, latency_ms: number }} wifi
 * @property {{ lift: "up"|"down", gripper: "open"|"closed" }} servo
 * @property {boolean} blindZone
 * @property {boolean} outOfBase
 * @property {number} cubes_carried
 * @property {number} stack_height
 */

/**
 * @typedef {Object} DataSource
 * @property {() => void} start Begin producing telemetry.
 * @property {() => void} stop Stop producing telemetry.
 * @property {(cmd: string) => void} sendCommand Send a control command string.
 * @property {(fn: (telemetry: Telemetry) => void) => void} onTelemetry Register a telemetry callback.
 */

let activeSource = null;

export function setActiveSource(source) {
  activeSource = source;
}

// UI modules send commands through the active source instead of importing mock.js (PRD 7).
export function getActiveSource() {
  if (!activeSource) throw new Error("No active data source");
  return activeSource;
}