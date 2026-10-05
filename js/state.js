// Central state store (pub/sub). Owns every mutation so no UI module computes points
// or holds a private copy of match state. No DOM queries here.
import { CONFIG, CUBE_COLORS, RULES } from "./config.js";
import {
  clampStack,
  evaluateDeposit,
  holdPoints,
  operatorLookPenalty,
  penaltyPoints,
} from "./rules/scoring.js";

const listeners = new Set();

// Phase starts null so the timer Start button stays disabled until the operator
// picks a phase (PRD 5.5).
let state = {
  phase: null,
  phaseLocked: false,
  disqualified: false,
  teamScore: 0,
  phaseAScore: 0,
  phaseBScore: 0,
  targetColor: null,
  carry: 0,
  carriedColors: [],
  bonusGiven: false,
  stack: 0,
  holdSeconds: 0,
  holdStartedAt: 0,
  holdScoredAt: 0,
  timeLeft: RULES.PHASE_DURATION_S,
  running: false,
  deadline: 0,
  blindZone: false,
  outOfBase: false,
  telemetry: null,
  telemetryStale: false,
  autonomous: false,
  operatorLookWarned: false,
  events: [],
};

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function commit(patch) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn(state));
}

// Events are append-only with a hard cap; the panel renders newest first.
export function addEvent(type, message) {
  const entry = { type, message, at: Date.now() };
  const events = [entry, ...state.events].slice(0, RULES.LOG_MAX_ENTRIES);
  commit({ events });
}

// Phase switches stop and reset the clock but never touch the score.
export function selectPhase(phase) {
  if (state.phaseLocked || state.disqualified) return;
  commit({
    phase,
    timeLeft: RULES.PHASE_DURATION_S,
    running: false,
    deadline: 0,
    autonomous: false,
    holdSeconds: 0,
    holdStartedAt: 0,
    holdScoredAt: 0,
  });
  addEvent("info", `PHASE ${phase} selected`);
}

export function startTimer() {
  if (!state.phase || state.phaseLocked || state.disqualified) return;
  commit({
    running: true,
    // Remaining time is derived from the absolute deadline, never accumulated per tick.
    deadline: Date.now() + state.timeLeft * 1000,
  });
  addEvent("info", "TIMER START");
}

export function pauseTimer() {
  if (!state.running) return;
  commit({ running: false, deadline: 0, timeLeft: remainingSeconds(Date.now()) });
  addEvent("info", "TIMER PAUSE");
}

export function resetTimer() {
  commit({
    running: false,
    deadline: 0,
    timeLeft: RULES.PHASE_DURATION_S,
    phaseLocked: false,
    holdSeconds: 0,
    holdStartedAt: 0,
    holdScoredAt: 0,
  });
  addEvent("info", "TIMER RESET");
}

function remainingSeconds(now) {
  if (!state.running) return state.timeLeft;
  return Math.max(0, Math.ceil((state.deadline - now) / 1000));
}

// Single tick source for both clock and hold, called from ui/timer.js.
export function tick(now) {
  const timeLeft = remainingSeconds(now);
  const patch = {};

  if (timeLeft !== state.timeLeft) patch.timeLeft = timeLeft;

  if (state.running && timeLeft <= 0) {
    patch.running = false;
    patch.deadline = 0;
    patch.phaseLocked = true;
    addEvent("info", `PHASE ${state.phase} END`);
  }

  const holdSeconds = nextHoldSeconds(now);
  if (holdSeconds !== state.holdSeconds) patch.holdSeconds = holdSeconds;

  if (Object.keys(patch).length === 0) return state;
  commit(patch);
  return state;
}

// Hold is derived from wall clock like the match clock: holdStartedAt is stamped when
// the stack first reaches 2, and any stack change clears it.
function nextHoldSeconds(now) {
  if (state.stack < 2) return 0;
  const startedAt = state.holdStartedAt || now;
  const held = (now - startedAt) / 1000;
  return Number(Math.min(held, RULES.HOLD_DURATION_S).toFixed(1));
}

// Called by ui/timer.js when holdSeconds reaches the limit.
export function awardHoldIfComplete() {
  if (state.stack < 2 || state.holdSeconds < RULES.HOLD_DURATION_S) return;
  if (state.holdScoredAt === state.stack) return;

  const points = holdPoints(state.stack);
  commit({
    holdScoredAt: state.stack,
    phaseBScore: state.phaseBScore + points,
    teamScore: state.teamScore + points,
  });
  addEvent("score", `Hold ${RULES.HOLD_DURATION_S} s complete at stack ${state.stack}: +${points} pts`);
}

export function setTelemetry(telemetry, now = Date.now()) {
  commit({
    telemetry,
    blindZone: telemetry.blindZone,
    outOfBase: telemetry.outOfBase,
    // Stale is derived, never toggled by hand (PRD 5.3).
    telemetryStale: now - telemetry.timestamp > RULES.STALE_AFTER_MS,
  });
}

// Match target drawn per match; only this colour ever counts as correct.
export function selectTarget(color) {
  if (state.disqualified || !CUBE_COLORS.includes(color)) return;
  if (state.targetColor === color) return;
  commit({ targetColor: color });
  addEvent("info", `TARGET ${color.toUpperCase()} selected`);
}

export function addCarriedCube(color) {
  if (state.disqualified || !CUBE_COLORS.includes(color)) return;
  if (state.carry >= RULES.MAX_CARRIED) return;
  commit({ carry: state.carry + 1, carriedColors: [...state.carriedColors, color] });
}

export function removeCarriedCube() {
  if (state.carry < 1) return;
  commit({ carry: state.carry - 1, carriedColors: state.carriedColors.slice(0, -1) });
}

export function adjustStack(delta) {
  const stack = clampStack(state.stack + delta);
  if (stack === state.stack) return;
  // Any stack change restarts the hold window (PRD 5.6).
  commit({ stack, holdSeconds: 0, holdStartedAt: Date.now(), holdScoredAt: 0 });
}

// Batch deposit: every carried cube scores against the match target, then the carrier
// empties. Points come only from rules/scoring.js.
export function deposit() {
  if (state.disqualified || state.carry < 1 || !state.targetColor) return;
  const colors = state.carriedColors;
  const { cubePoints, bonusPoints, bonusGiven } = evaluateDeposit(colors, state.targetColor, state.bonusGiven);
  const points = cubePoints + bonusPoints;

  commit({
    carry: 0,
    carriedColors: [],
    phaseAScore: state.phaseAScore + points,
    teamScore: state.teamScore + points,
    bonusGiven,
  });
  const breakdown = colors.map((color) => color.toUpperCase()).join(", ");
  addEvent("score", `Deposit ${colors.length} cube(s) [${breakdown}]: ${points >= 0 ? "+" : ""}${points} pts`);
  if (bonusPoints > 0) {
    addEvent("score", `Triple ${state.targetColor.toUpperCase()} bonus: +${bonusPoints} pts`);
  }
}

export function logPenalty(key) {
  if (state.disqualified) return;

  if (key === "OPERATOR_LOOKS_ARENA") {
    const points = operatorLookPenalty(state.operatorLookWarned);
    commit({ operatorLookWarned: true });
    if (points === 0) {
      addEvent("warning", "Penalty: operator looked at arena in Phase B (first offence, warning only)");
      return;
    }
    commit({ teamScore: state.teamScore + points });
    addEvent("penalty", `Penalty: operator looked at arena in Phase B: ${points} pts`);
    return;
  }

  const points = penaltyPoints(key);
  commit({ teamScore: state.teamScore + points });
  addEvent("penalty", `Penalty recorded: ${points} pts`);
}

export function disqualify() {
  commit({ disqualified: true, running: false, deadline: 0, phaseLocked: true, autonomous: false });
  addEvent("penalty", "DISQUALIFIED: extra vision apparatus");
}

export function resetMatch() {
  state = {
    ...state,
    phase: null,
    phaseLocked: false,
    disqualified: false,
    teamScore: 0,
    phaseAScore: 0,
    phaseBScore: 0,
    // A reset match draws a new target.
    targetColor: null,
    carry: 0,
    carriedColors: [],
    bonusGiven: false,
    stack: 0,
    holdSeconds: 0,
    holdStartedAt: 0,
    holdScoredAt: 0,
    timeLeft: RULES.PHASE_DURATION_S,
    running: false,
    deadline: 0,
    autonomous: false,
    operatorLookWarned: false,
  };
  commit(state);
  addEvent("info", "MATCH RESET");
}

export function toggleAutonomous() {
  if (state.disqualified || state.phase === "B") return;
  const autonomous = !state.autonomous;
  commit({ autonomous });
  addEvent("info", `MODE ${autonomous ? "AUTONOMOUS" : "MANUAL"}`);
}