// Simple browser-safe logging control
export const LOG_LEVEL = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

export const CURRENT_LOG_LEVEL = LOG_LEVEL.INFO;

function getPrefix(level: number): string {
  return level === LOG_LEVEL.ERROR
    ? "❌ ERROR:"
    : level === LOG_LEVEL.WARN
    ? "⚠️ WARNING:"
    : level === LOG_LEVEL.INFO
    ? "ℹ️ INFO:"
    : "🔍 DEBUG:";
}

export function log(level: number, ...args: any[]): void {
  if (level <= CURRENT_LOG_LEVEL) {
    const prefix = getPrefix(level);
    if (level === LOG_LEVEL.ERROR) {
      console.error(prefix, ...args);
    } else if (level === LOG_LEVEL.WARN) {
      console.warn(prefix, ...args);
    } else {
      console.log(prefix, ...args);
    }
  }
}
