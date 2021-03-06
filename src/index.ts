/**
 * A simple Promise wrapper around the native Node.JS http(s) module.
 *
 * @description this may not be the best wrapper around, but I've had it forever and it works
 *
 */

import { request } from 'http';
import { request as secureRequest } from 'https';
import { encode } from 'querystring';
import { createGunzip, createInflate, createBrotliDecompress } from 'zlib';
import { assertStatus } from './utils';

export interface ShhResponse {
  statusCode: number;
  statusMessage?: string;
  headers: { [propName: string]: string };
  raw: Buffer;
  body: any;
}

export interface ShhOptions {
  form?: boolean;
  json?: boolean;
  timeout?: number;
  follow_redirects?: boolean;
  params?: { [propName: string]: string | number };
  headers?: { [propName: string]: string };
}

/**
 * A Promise wrapper around the `http(s).ClientRequest`
 *
 * @param {'get'|'put'|'patch'|'post'|'delete'} method HTTP method to use when making the request
 * @param {string} url any valid URL string
 * @param {any} body the HTTP body you with to send (null will result in no body)
 * @param {ShhOptions|undefined} optionsOverride override the `defaultOptions`
 *
 * @description A Promise wrapper around the native Node.JS http(s) ClientRequest api to ease making
 * http(s) requests from the server side.
 *
 * @example ```
 * const request = shhHTTP('get', 'https://my-cool-webpage.com', null, { json: false });
 *
 * request.then(response => console.log('returned: ', response.body))
 *  .catch(e => console.error(e));
 * ```
 * @example ```
 * const request = shhHTTP('post', 'https://my-cool-REST-API.com', { data: { key: 'value' } });
 *
 * request.then(response => console.log('returned: ', response.body))
 *  .catch(e => console.error(e));
 * ```
 */
export const shhHTTP: (
  method: 'get' | 'put' | 'patch' | 'post' | 'delete',
  url: string,
  body?: any,
  optionsOverride?: ShhOptions
) => Promise<ShhResponse> = (
  method: 'get' | 'put' | 'patch' | 'post' | 'delete',
  url: string,
  body?: any,
  optionsOverride?: ShhOptions | undefined
) => {
  return new Promise((resolve, reject) => {
    const options = {
      ...{
        form: false,
        json: true,
        timeout: 30000,
        follow_redirects: true,
        params: null as any,
        headers: {}
      },
      ...optionsOverride
    };
    const parsedMethod = method.toUpperCase();
    const parsedParams = !!options.params ? encode(options.params) : null;
    let urlObject;
    try {
      urlObject = new URL(url);
    } catch (error) {
      return reject(new Error(`Invalid url ${url}`));
    }
    const agent = urlObject.protocol === 'https:' ? secureRequest : request;
    if (body && parsedMethod === 'GET') {
      return reject(new Error(`Invalid use of the body parameter while using the ${method.toUpperCase()} method.`));
    }
    const requestOptions: any = {
      method: parsedMethod,
      headers: options.headers,
      hostname: urlObject.hostname,
      path: urlObject.pathname,
      protocol: urlObject.protocol,
      timeout: options.timeout
    };
    if (urlObject.port) {
      requestOptions.port = +urlObject.port;
    }
    if (urlObject.search || parsedParams) {
      requestOptions.path += `?${parsedParams || urlObject.search}`;
    }
    if (options.form && options.json) {
      return reject(new Error('Request cannot be both type form and type json.'));
    }

    if (body) {
      if (options.json) {
        requestOptions.headers['content-type'] = 'application/json; charset=UTF-8';
        body = JSON.stringify(body);
      }
      if (options.form) {
        requestOptions.headers['content-type'] = 'application/x-www-form-urlencoded';
        body = encode(body);
      }
      requestOptions.headers['content-length'] = Buffer.byteLength(body);
    }

    const req = agent(requestOptions, res => {
      // redirect
      if (options.follow_redirects && res.headers.location) {
        /* istanbul ignore next */
        if ([301, 302, 307, 308].includes(res.statusCode as number)) {
          return resolve(shhHTTP(method, res.headers.location, body, optionsOverride));
        } // be linient in redirect checking and do not abort
      }

      const response: ShhResponse = {
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        headers: res.headers,
        body: ''
      } as ShhResponse;

      const _raw: Buffer[] = [];

      let decodedResponse;
      switch (
        res.headers['content-encoding'] // or, just use zlib.createUnzip() to handle both cases
      ) {
        case 'gzip':
          decodedResponse = res.pipe(createGunzip());
          break;
        case 'deflate':
          decodedResponse = res.pipe(createInflate());
          break;
        case 'br':
          decodedResponse = res.pipe(createBrotliDecompress());
          break;
        default:
          decodedResponse = res;
          break;
      }
      decodedResponse.on('data', chunk => {
        _raw.push(chunk);
      });

      decodedResponse.on('end', () => {
        response.raw = Buffer.concat(_raw);
        response.body = response.raw.toString();
        /**
         * If we are using JSON, attempt to parse the response
         */
        if (options.json && response.body) {
          try {
            response.body = JSON.parse(response.body);
          } catch (e) {
            return reject(e);
          }
        }
        resolve(response as ShhResponse);
      });
    });

    /**
     * Abort request after the given timeout
     *
     * @note returns the code `ECONNTIMEOUT` instead of a 408 or 504
     * so the user can decide if they are a server or a proxy
     */
    req.on('timeout', () => {
      req.abort();
      const e = new Error('Connection timed out.');
      (e as any).code = 'ECONNTIMEOUT';
      reject(e);
    });

    /**
     * Reject on any error
     */
    req.on('error', e => {
      reject(e);
    });

    /**
     * write the entire body
     *
     * @note chunked body streaming is not yet supported
     */
    if (body) {
      req.write(body);
    }

    /**
     * Finally, end the request
     */
    req.end();
  });
};

/**
 * GET helper
 *
 * @param {string} url valid URL string
 * @param {ShhOptions|null} options optionally override the package defaults
 *
 * @description A convenience method for making GET requests
 */
export const shhGet = (url: string, options?: ShhOptions | undefined) =>
  shhHTTP('get', url, null, options).then(response => assertStatus(response));

/**
 * PUT helper
 *
 * @param {string} url valid URL string
 * @param {any} body http body to send
 * @param {ShhOptions|null} options optionally override package defaults
 *
 * @description A convenience method for making PUT requests
 */
export const shhPut = (url: string, body: any = null, options?: ShhOptions | undefined) =>
  shhHTTP('put', url, body, options).then(response => assertStatus(response));

/**
 * PATCH helper
 *
 * @param {string} url valid URL string
 * @param {any} body http body to send
 * @param {ShhOptions|null} options optionally override package defaults
 *
 * @description A convenience method for making PATCH requests
 */
export const shhPatch = (url: string, body: any = null, options?: ShhOptions | undefined) =>
  shhHTTP('patch', url, body, options).then(response => assertStatus(response));

/**
 * POST helper
 *
 * @param {string} url valid URL string
 * @param {any} body http body to send
 * @param {ShhOptions|null} options optionally override package defaults
 *
 * @description A convenience method for making POST requests
 */
export const shhPost = (url: string, body: any = null, options?: ShhOptions | undefined) =>
  shhHTTP('post', url, body, options).then(response => assertStatus(response));

/**
 * DELETE helper
 *
 * @param {string} url valid URL string
 * @param {any} body http body to send
 * @param {ShhOptions|null} options optionally override package defaults
 *
 * @description A convenience method for making DELETE requests
 */
export const shhDelete = (url: string, body: any = null, options?: ShhOptions | undefined) =>
  shhHTTP('delete', url, body, options).then(response => assertStatus(response));

/**
 * @description A convenience wrapper around all the Shh HTTP methods
 *
 * @example
 * ```
 * import { shh } from 'shh-node-http';
 *
 * shh.get('https://www.google.com')
 *  .then(res => console.log(res.body))
 *  .catch(e => console.error(e))
 * ```
 */
export const shh = {
  get: shhGet,
  put: shhPut,
  patch: shhPatch,
  post: shhPost,
  delete: shhDelete,
  request: shhHTTP
};
