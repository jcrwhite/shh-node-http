import { IncomingMessage } from 'http';
import { createBrotliDecompress, createGunzip, createInflate } from 'zlib';
import { ShhError } from '../utils/error';

enum BODY_FORMAT {
  String,
  Json,
  Buffer,
}

export class ShhResponse extends IncomingMessage {
  /**
   * Raw body dumped to string in case of parsing error
   */
  _rawBody: string | undefined;

  constructor(res: IncomingMessage) {
    super(res.socket);
    Object.assign(this, res);
  }

  private _parseBody(format: BODY_FORMAT): Promise<undefined | Buffer | string | Record<string | number, any>> {
    let decodedResponse: any;
    const data: Buffer[] = [];
    switch (this.headers['content-encoding']) {
      case 'gzip':
        decodedResponse = this.pipe(createGunzip());
        break;
      case 'deflate':
        decodedResponse = this.pipe(createInflate());
        break;
      case 'br':
        decodedResponse = this.pipe(createBrotliDecompress());
        break;
      default:
        decodedResponse = this;
        break;
    }

    decodedResponse.on('data', (chunk: Buffer) => {
      data.push(chunk);
    });

    return new Promise((resolve, reject) => {
      decodedResponse.on('end', () => {
        if (!data.length) {
          return resolve(undefined);
        }
        if (!format) {
          return resolve(data.toString());
        }
        if (format > 1) {
          return resolve(Buffer.concat(data));
        }

        // attempt to parse to JSON
        let json;
        try {
          json = JSON.parse(data.toString());
        } catch (e) {
          this._rawBody = data.toString();
          return reject(new ShhError(e.message, this));
        }
        resolve(json);
      });
    });
  }

  /**
   * Attempt to parse the response body as a string.
   */
  get body(): Promise<string> {
    return this._parseBody(BODY_FORMAT.String) as Promise<string>;
  }

  /**
   * Attempt to prase the response body as JSON.
   */
  get json(): Promise<Record<string | number, any>> {
    return this._parseBody(BODY_FORMAT.Json) as Promise<Record<string | number, any>>;
  }

  /**
   * Get the raw response body Buffer
   */
  get buffer(): Promise<Buffer> {
    return this._parseBody(BODY_FORMAT.Buffer) as Promise<Buffer>;
  }
}
