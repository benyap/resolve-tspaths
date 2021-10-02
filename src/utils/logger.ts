import { bold, dim, green, red } from "ansi-colors";

export type LoggerLevel = "verbose" | "info" | "error";

export class Logger {
  constructor(public readonly level: LoggerLevel) {}

  verbose(...args: any[]) {
    if (this.level === "verbose") {
      console.log(...args);
    }
  }

  info(...args: any[]) {
    if (["verbose", "info"].includes(this.level)) {
      console.log(...args);
    }
  }

  error(...args: any[]) {
    console.error(...args.map((x) => red(x)));
  }

  fancyParams<T extends { [key: string]: any }>(title: string, params: T) {
    this.verbose(bold(title));
    const keys = Object.keys(params);
    const isArray = Array.isArray(params);
    if (keys.length === 0) this.verbose(dim("empty"));
    else {
      for (const key of keys) {
        let value = params[key as keyof typeof params] as any;
        if (typeof value === "string") value = green(value);
        if (isArray) this.verbose(value);
        else this.verbose(key, "->", value);
      }
    }
    this.verbose();
  }

  fancyError(title: string, message: string) {
    console.error();
    console.error(red.bold(title));
    console.error(message);
    console.error();
  }
}
