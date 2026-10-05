// Team identity, data source selection, and every competition rule value (PRD 6).
// rules/scoring.js imports RULES from here so the UI and the rule engine cannot drift.

export const CONFIG = {
  USE_MOCK: true,
  MOCK_INTERVAL_MS: 200,
  TEAM_NAME: "Kelompok 7",
  // Header clock and log timestamps always render in this zone via Intl.DateTimeFormat,
  // never the laptop's own zone. The header label stays "WIB".
  TIME_ZONE: "Asia/Jakarta",
};

// Cube colours the robot can carry. There is no fixed team colour: the header accent
// and the robot tag follow the drawn match target, and stay neutral until it is picked.
export const CUBE_COLORS = ["red", "green", "blue"];

const wibFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: CONFIG.TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function formatWIBTime(at) {
  return wibFormatter.format(at);
}

export const RULES = {
  PHASE_DURATION_S: 240,
  MAX_CARRIED: 3,
  MAX_STACK: 5,
  HOLD_DURATION_S: 10,
  DEPOSIT_CORRECT_PTS: 30,
  DEPOSIT_WRONG_PTS: -20,
  TRIPLE_SAME_COLOR_BONUS: 50,
  STACK_POINTS: { 2: 20, 3: 50, 4: 100, 5: 200 },
  PENALTIES: {
    OTHER_BASE: -50,
    BLOCK_OPPONENT_OVER_5S: -50,
    DELIBERATE_RAM: -80,
    OPERATOR_LOOKS_ARENA: -50,
  },
  STALE_AFTER_MS: 500,
  LOW_TIME_WARNING_S: 30,
  BATTERY_WARN_V: 11.0,
  BATTERY_DANGER_V: 10.5,
  LATENCY_DANGER_MS: 100,
  LOG_MAX_ENTRIES: 200,
};
