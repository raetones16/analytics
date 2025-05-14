import fs from "fs";
import path from "path";

export const LOG_LEVEL = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

type LogLevelKey = keyof typeof LOG_LEVEL;

function getLogLevelFromEnv() {
  const env = process.env.LOG_LEVEL?.toUpperCase() as LogLevelKey | undefined;
  if (env && Object.prototype.hasOwnProperty.call(LOG_LEVEL, env))
    return LOG_LEVEL[env];
  return LOG_LEVEL.INFO;
}
export const CURRENT_LOG_LEVEL = getLogLevelFromEnv();

const LOG_FILE = process.env.LOG_FILE;
let logStream: fs.WriteStream | null = null;
if (LOG_FILE) {
  const logFilePath = path.resolve(LOG_FILE);
  logStream = fs.createWriteStream(logFilePath, { flags: "a" });
}

const LOG_FORMAT = process.env.LOG_FORMAT === "json";

function getPrefix(level: number): string {
  return level === LOG_LEVEL.ERROR
    ? "❌ ERROR:"
    : level === LOG_LEVEL.WARN
    ? "⚠️ WARNING:"
    : level === LOG_LEVEL.INFO
    ? "ℹ️ INFO:"
    : "🔍 DEBUG:";
}

function formatLog(level: number, args: any[]): string {
  if (LOG_FORMAT) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: (Object.keys(LOG_LEVEL) as LogLevelKey[]).find(
        (k) => LOG_LEVEL[k] === level
      ),
      message: args
        .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
        .join(" "),
    });
  } else {
    const prefix = getPrefix(level);
    return [new Date().toISOString(), prefix, ...args].join(" ");
  }
}

export function log(level: number, ...args: any[]): void {
  if (level <= CURRENT_LOG_LEVEL) {
    const line = formatLog(level, args);
    if (level === LOG_LEVEL.ERROR) {
      console.error(line);
    } else if (level === LOG_LEVEL.WARN) {
      console.warn(line);
    } else {
      console.log(line);
    }
    if (logStream) {
      logStream.write(line + "\n");
    }
  }
}
