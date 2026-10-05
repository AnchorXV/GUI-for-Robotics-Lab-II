// Live telemetry source placeholder. Every method throws so the missing bridge is
// impossible to miss: CONFIG.USE_MOCK must stay true until the bridge exists.
export function createLiveSource() {
  const notImplemented = () => {
    throw new Error("Live source not implemented");
  };

  return {
    start: notImplemented,
    stop: notImplemented,
    sendCommand: notImplemented,
    onTelemetry: notImplemented,
  };
}