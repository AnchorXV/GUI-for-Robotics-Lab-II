// Generator data dummy: posisi berjalan, baterai turun, noise sensor
import { CONFIG } from "../config.js";

export function createMockSource(onData) {
  let t = 0;
  let x = 0, y = 0, theta = 0, battery = 12.0;

  const timer = setInterval(() => {
    t += CONFIG.MOCK_INTERVAL_MS / 1000;
    theta += 0.02;
    x += 0.5 * Math.cos(theta) * (CONFIG.MOCK_INTERVAL_MS / 1000);
    y += 0.5 * Math.sin(theta) * (CONFIG.MOCK_INTERVAL_MS / 1000);
    battery = Math.max(10.5, battery - 0.0005);

    onData({
      timestamp: Date.now(),
      odometry: { x: +x.toFixed(3), y: +y.toFixed(3), theta: +theta.toFixed(3) },
      battery_v: +(battery + (Math.random() - 0.5) * 0.05).toFixed(2),
      latency_ms: Math.round(30 + Math.random() * 40),
      wifi: { channel: 6, rssi: -55 - Math.round(Math.random() * 10) },
    });
  }, CONFIG.MOCK_INTERVAL_MS);

  return { stop: () => clearInterval(timer) };
}