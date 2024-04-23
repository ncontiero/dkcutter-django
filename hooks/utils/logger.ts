/* eslint-disable no-console */
import util from "node:util";
import { isMainThread, parentPort } from "node:worker_threads";
import { blue, green, red, yellow } from "colorette";

type LOG_TYPE = "info" | "success" | "error" | "warn";

export const colorize = (type: LOG_TYPE, data: any) => {
  switch (type) {
    case "info":
      return blue(data);
    case "warn":
      return yellow(data);
    case "success":
      return green(data);
    case "error":
      return red(data);
    default:
      return data;
  }
};

export function createLogger(type: LOG_TYPE, ...data: unknown[]) {
  const args = data.map((item) => colorize(type, item));
  switch (type) {
    case "error": {
      if (!isMainThread) {
        parentPort?.postMessage({
          type: "error",
          text: util.format(...args),
        });
        return;
      }

      return console.error(...args);
    }
    default:
      if (!isMainThread) {
        parentPort?.postMessage({
          type: "log",
          text: util.format(...args),
        });
        return;
      }

      console.log(...args);
  }
}

export const logger = {
  error: (...args: unknown[]) => {
    return createLogger("error", ...args);
  },
  warn: (...args: unknown[]) => {
    return createLogger("warn", ...args);
  },
  info: (...args: unknown[]) => {
    return createLogger("info", ...args);
  },
  success: (...args: unknown[]) => {
    return createLogger("success", ...args);
  },
  break: () => console.log(""),
};
