import { IncomingHttpHeaders } from 'http';
import { ShhResponse } from '../http/response';

export class ShhError extends Error {
  code: string | undefined;

  headers?: IncomingHttpHeaders;
  statusCode?: number;
  body?: any;

  constructor(message: string, res?: ShhResponse, code?: string) {
    super(message);

    // assign the error class name in custom error (as a shortcut)
    this.name = this.constructor.name;

    this.code = code;

    if (res) {
      this.headers = res.headers;
      this.statusCode = res.statusCode;
      this.body = res._rawBody;
    }

    // capturing the stack trace keeps the reference to this error class
    Error.captureStackTrace(this, this.constructor);
  }
}
