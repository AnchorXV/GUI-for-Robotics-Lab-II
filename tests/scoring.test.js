// Rule values checked against the PRD 6 tables. Runs with: node --test tests/
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  clampStack,
  evaluateDeposit,
  holdPoints,
  operatorLookPenalty,
  penaltyPoints,
} from "../js/rules/scoring.js";

describe("Phase A batch deposits", () => {
  it("3 target cubes score +90 plus the +50 bonus", () => {
    assert.deepEqual(evaluateDeposit(["red", "red", "red"], "red", false), {
      cubePoints: 90,
      bonusPoints: 50,
      bonusGiven: true,
    });
  });
  it("3 target cubes score +90 with no bonus when already given", () => {
    assert.deepEqual(evaluateDeposit(["green", "green", "green"], "green", true), {
      cubePoints: 90,
      bonusPoints: 0,
      bonusGiven: true,
    });
  });
  it("2 target + 1 other score +40 with no bonus", () => {
    assert.deepEqual(evaluateDeposit(["blue", "red", "blue"], "blue", false), {
      cubePoints: 40,
      bonusPoints: 0,
      bonusGiven: false,
    });
  });
  it("3 non-target cubes score -60 with no bonus", () => {
    assert.deepEqual(evaluateDeposit(["green", "blue", "green"], "red", false), {
      cubePoints: -60,
      bonusPoints: 0,
      bonusGiven: false,
    });
  });
  it("partial deposits score cubes but never the bonus", () => {
    assert.deepEqual(evaluateDeposit(["red", "red"], "red", false), {
      cubePoints: 60,
      bonusPoints: 0,
      bonusGiven: false,
    });
  });
});

describe("Phase B hold points", () => {
  it("pays 20/50/100/200 for stacks 2/3/4/5", () => {
    assert.deepEqual([2, 3, 4, 5].map(holdPoints), [20, 50, 100, 200]);
  });
  it("pays nothing below stack 2 or above stack 5", () => {
    assert.deepEqual([0, 1, 6].map(holdPoints), [0, 0, 0]);
  });
});

describe("penalties", () => {
  it("matches the PRD 6 table", () => {
    assert.equal(penaltyPoints("OTHER_BASE"), -50);
    assert.equal(penaltyPoints("BLOCK_OPPONENT_OVER_5S"), -50);
    assert.equal(penaltyPoints("DELIBERATE_RAM"), -80);
    assert.equal(penaltyPoints("OPERATOR_LOOKS_ARENA"), -50);
  });
  it("rejects unknown penalty keys", () => {
    assert.throws(() => penaltyPoints("LANDED_ROCKET"), /Unknown penalty/);
  });
  it("warns on the first arena look, scores -50 afterwards", () => {
    assert.equal(operatorLookPenalty(false), 0);
    assert.equal(operatorLookPenalty(true), -50);
  });
});

describe("counter clamps", () => {
  it("stack stays within 0..5", () => {
    assert.deepEqual([-1, 0, 5, 6].map(clampStack), [0, 0, 5, 5]);
  });
});
