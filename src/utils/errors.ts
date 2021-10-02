export class StepError extends Error {
  constructor(public readonly step: string, message: string) {
    super(message);
  }
}

export class FileError extends StepError {
  constructor(
    public readonly step: string,
    public readonly path: string,
    message: string
  ) {
    super(step, `Error processing ${path}: ${message}`);
  }
}

export class FileNotFoundError extends FileError {
  constructor(step: string, path: string) {
    super(step, path, `Not found`);
  }
}

export class JSONFileParsingError extends FileError {
  constructor(step: string, path: string, message: string) {
    super(step, path, `Failed to parse JSON. ${message}`);
  }
}

export class TSConfigPropertyError extends StepError {
  constructor(public readonly step: string, public readonly property: string) {
    super(step, `${property} is not set in tsconfig`);
  }
}
