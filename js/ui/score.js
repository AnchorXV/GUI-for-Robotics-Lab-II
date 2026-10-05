// Score panel: team score, target picker, hold progress, carried/stack counters,
// batch deposit, violations. Reads every number from state; all point math lives
// in rules/scoring.js.
import { RULES } from "../config.js";
import {
  addCarriedCube,
  adjustStack,
  deposit,
  disqualify,
  logPenalty,
  removeCarriedCube,
  selectTarget,
} from "../state.js";

let violationDialog;
let lookPoints;

export function init() {
  violationDialog = document.getElementById("violation-dialog");
  lookPoints = document.getElementById("look-points");

  document.querySelectorAll("[data-target]").forEach((button) =>
    button.addEventListener("click", () => selectTarget(button.dataset.target)),
  );
  document.querySelectorAll("[data-cube]").forEach((button) =>
    button.addEventListener("click", () => addCarriedCube(button.dataset.cube)),
  );
  document.getElementById("carry-minus").addEventListener("click", removeCarriedCube);
  document.getElementById("stack-minus").addEventListener("click", () => adjustStack(-1));
  document.getElementById("stack-plus").addEventListener("click", () => adjustStack(1));

  document.getElementById("btn-deposit").addEventListener("click", deposit);

  document.getElementById("btn-violation").addEventListener("click", () => violationDialog.showModal());
  violationDialog.querySelectorAll("[data-penalty]").forEach((button) =>
    button.addEventListener("click", () => {
      violationDialog.close();
      logPenalty(button.dataset.penalty);
    }),
  );
  document.getElementById("btn-disqualify").addEventListener("click", () => {
    violationDialog.close();
    disqualify();
  });
  document.querySelectorAll("dialog [data-close]").forEach((button) =>
    button.addEventListener("click", () => button.closest("dialog").close()),
  );
}

export function render(state) {
  document.getElementById("team-score").textContent = state.teamScore;
  document.getElementById("phase-subscores").textContent =
    `Phase A ${state.phaseAScore} · Phase B ${state.phaseBScore}`;

  const targetLabel = document.getElementById("target-label");
  targetLabel.textContent = state.targetColor ? `Target: ${state.targetColor}` : "Target: not set";
  document.querySelectorAll("[data-target]").forEach((button) => {
    button.disabled = state.disqualified;
    button.classList.toggle("active", state.targetColor === button.dataset.target);
  });

  document.getElementById("hold-text").textContent = `${state.holdSeconds.toFixed(1)} / ${RULES.HOLD_DURATION_S} s`;
  document.getElementById("hold-fill").style.width =
    `${(state.holdSeconds / RULES.HOLD_DURATION_S) * 100}%`;

  document.getElementById("carry-count").textContent = `${state.carry} / ${RULES.MAX_CARRIED}`;
  document.getElementById("stack-count").textContent = `${state.stack} / ${RULES.MAX_STACK}`;

  const locked = state.disqualified;
  document.getElementById("carry-minus").disabled = locked || state.carry <= 0;
  document.querySelectorAll("[data-cube]").forEach((button) => {
    button.disabled = locked || state.carry >= RULES.MAX_CARRIED;
  });
  document.getElementById("stack-minus").disabled = locked || state.stack <= 0;
  document.getElementById("stack-plus").disabled = locked || state.stack >= RULES.MAX_STACK;
  // Deposit needs cubes and a drawn target; correctness comes from the target, not the operator.
  document.getElementById("btn-deposit").disabled = locked || state.carry < 1 || !state.targetColor;
  document.getElementById("btn-violation").disabled = locked;

  // First arena look only warns, later looks cost points (PRD 6).
  lookPoints.textContent = state.operatorLookWarned ? "(−50)" : "(warning)";
}