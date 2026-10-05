// Competition scoring rules (PRD 6). Pure functions only: no DOM, no state, no clock.
// Every point value in the UI must come from this module.
import { RULES } from "../config.js";

// Batch deposit evaluation: every carried cube scores against the match target, and a
// full same-colour deposit pays the triple bonus once per match.
export function evaluateDeposit(carriedColors, targetColor, bonusAlreadyGiven) {
  const cubePoints = carriedColors.reduce(
    (sum, color) => sum + (color === targetColor ? RULES.DEPOSIT_CORRECT_PTS : RULES.DEPOSIT_WRONG_PTS),
    0,
  );
  const tripleTarget =
    carriedColors.length === RULES.MAX_CARRIED &&
    carriedColors.every((color) => color === targetColor);
  const bonusPoints = tripleTarget && !bonusAlreadyGiven ? RULES.TRIPLE_SAME_COLOR_BONUS : 0;
  return { cubePoints, bonusPoints, bonusGiven: bonusAlreadyGiven || bonusPoints > 0 };
}

// Hold 10 s only pays for 2..5 cubes; anything else earns nothing.
export function holdPoints(stackHeight) {
  return RULES.STACK_POINTS[stackHeight] ?? 0;
}

export function penaltyPoints(key) {
  const points = RULES.PENALTIES[key];
  if (points === undefined) throw new Error(`Unknown penalty: ${key}`);
  return points;
}

export function clampStack(stack) {
  return Math.min(Math.max(stack, 0), RULES.MAX_STACK);
}

// The operator-look penalty warns on the first offence and scores -50 afterwards.
// Kept in rules/ because it is a rule, not a UI decision.
export function operatorLookPenalty(alreadyWarned) {
  return alreadyWarned ? RULES.PENALTIES.OPERATOR_LOOKS_ARENA : 0;
}