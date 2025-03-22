// Simple logging control
export const LOG_LEVEL = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

export const CURRENT_LOG_LEVEL = LOG_LEVEL.INFO;

export function log(level: number, ...args: any[]): void {
  if (level <= CURRENT_LOG_LEVEL) {
    const prefix = level === LOG_LEVEL.ERROR ? '❌ ERROR:' :
                  level === LOG_LEVEL.WARN ? '⚠️ WARNING:' :
                  level === LOG_LEVEL.INFO ? 'ℹ️ INFO:' : '🔍 DEBUG:';
    console.log(prefix, ...args);
  }
}
