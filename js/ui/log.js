// Event log panel: newest-first entries with WIB timestamps, plus .txt export.
// The only module allowed to touch console-adjacent output: entries render to the panel.
import { formatWIBTime } from "../config.js";
import { getState } from "../state.js";

const TYPE_LABELS = {
  info: "INFO",
  command: "CMD",
  score: "SCORE",
  penalty: "PENALTY",
  warning: "WARN",
};

let list;

export function init() {
  list = document.getElementById("log-list");
  document.getElementById("btn-export-log").addEventListener("click", exportLog);
}

export function render(state) {
  list.replaceChildren(...state.events.map(renderEntry));
}

function renderEntry(entry) {
  const item = document.createElement("li");
  item.className = `log-${entry.type}`;
  const time = document.createElement("span");
  time.className = "log-time";
  time.textContent = `[${formatWIBTime(entry.at)}]`;
  const label = document.createElement("span");
  label.className = "log-type";
  label.textContent = TYPE_LABELS[entry.type];
  item.append(time, ` ${entry.message} `, label);
  return item;
}

function exportLog() {
  const lines = getState().events
    .slice()
    .reverse()
    .map((entry) => `[${formatWIBTime(entry.at)}] [${TYPE_LABELS[entry.type]}] ${entry.message}`);
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `autostack-log-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.txt`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}