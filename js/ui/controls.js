// Controls panel: D-pad, actuators, mode toggle, and keyboard shortcuts.
// Every press goes through the active data source; the mock has no transport so the
// press is written to the log as a command entry instead.
import { getActiveSource } from "../data/source.js";
import { addEvent, toggleAutonomous } from "../state.js";

const DRIVE_COMMANDS = ["forward", "left", "stop", "right", "backward"];
const GRIPPER_COMMANDS = ["grip_open", "grip_close"];

const SHORTCUTS = {
  KeyW: "forward",
  KeyA: "left",
  KeyS: "backward",
  KeyD: "right",
  Space: "stop",
  KeyQ: "lift_up",
  KeyE: "lift_down",
};

let driveButtons = [];
let gripperButtons = [];
let liftButtons = [];
let manualButton;
let autoButton;
let outOfBaseBadge;

export function init() {
  const buttons = [...document.querySelectorAll("[data-cmd]")];
  driveButtons = buttons.filter((button) => DRIVE_COMMANDS.includes(button.dataset.cmd));
  gripperButtons = buttons.filter((button) => GRIPPER_COMMANDS.includes(button.dataset.cmd));
  liftButtons = buttons.filter(
    (button) => !DRIVE_COMMANDS.includes(button.dataset.cmd) && !GRIPPER_COMMANDS.includes(button.dataset.cmd),
  );
  manualButton = document.getElementById("btn-mode-manual");
  autoButton = document.getElementById("btn-mode-auto");
  outOfBaseBadge = document.getElementById("out-of-base-badge");

  buttons.forEach((button) =>
    button.addEventListener("click", () => send(button.dataset.cmd)),
  );
  manualButton.addEventListener("click", () => {
    if (!manualButton.disabled) toggleAutonomous();
  });
  autoButton.addEventListener("click", () => {
    if (!autoButton.disabled) toggleAutonomous();
  });
  document.addEventListener("keydown", (event) => {
    if (event.repeat || shortcutsSuspended(event)) return;
    const command = SHORTCUTS[event.code];
    if (!command) return;
    event.preventDefault();
    const button = buttons.find((candidate) => candidate.dataset.cmd === command);
    if (button && !button.disabled) send(command);
  });

  function shortcutsSuspended(event) {
    const target = event.target;
    if (target.closest("input, textarea, select")) return true;
    if (target.isContentEditable) return true;
    return document.querySelector("dialog[open]") !== null;
  }
}

function send(command) {
  getActiveSource().sendCommand(command);
  addEvent("command", `CMD ${command}`);
}

export function render(state) {
  const driveLocked = state.disqualified || (state.phase === "B" && state.outOfBase);
  const allLocked = state.disqualified;

  driveButtons.forEach((button) => {
    button.disabled = driveLocked;
  });
  gripperButtons.forEach((button) => {
    button.disabled = driveLocked;
  });
  liftButtons.forEach((button) => {
    button.disabled = allLocked;
  });

  manualButton.disabled = allLocked;
  autoButton.disabled = allLocked || state.phase !== "A";

  manualButton.classList.toggle("active", !state.autonomous);
  autoButton.classList.toggle("active", state.autonomous);

  outOfBaseBadge.hidden = !(state.phase === "B" && state.outOfBase);
}