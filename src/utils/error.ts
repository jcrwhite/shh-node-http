export class ShhError extends Error {
  code: string | undefined;

  constructor(message: string, code?: string) {
    super(message);

    // assign the error class name in custom error (as a shortcut)
    this.name = this.constructor.name;

    this.code = code;

    // capturing the stack trace keeps the reference to this error class
    Error.captureStackTrace(this, this.constructor);
  }
}
