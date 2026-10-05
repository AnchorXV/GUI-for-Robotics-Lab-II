const listeners = new Set();
let state = {
  robot: "hijau",
  phase: "A",
  telemetry: null,
  score: 0,
  carried: 0,
  stack: 0,
  timeLeft: 240,
  running: false,
};

export function getState() { return state; }

export function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}