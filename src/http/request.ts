import { ClientRequest, IncomingMessage, request as http } from 'http';
import { request as https, RequestOptions } from 'https';
import { Stream } from 'stream';
import { ShhResponse } from './response';

export interface ShhOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: Buffer;
  form?: boolean;
  json?: boolean;
  follow_redirects?: boolean;
  timeout?: number;
}

export class ShhRequest extends Stream.Writable {
  private _agent: (options: RequestOptions, cb: (res: IncomingMessage) => void) => ClientRequest;
  private _request!: ClientRequest;
  constructor(options: RequestOptions) {
    super();
    this._agent = options.protocol === 'https' ? https : http;
  }

  private _bind(): void {
    Object.assign(this, this._request);
  }

  send(options: RequestOptions): Promise<ShhResponse> {
    return new Promise((resolve, reject) => {
      this._request = this._agent(options, res => {
        // do stuff
      });
      this._bind();
    });
  }
}
