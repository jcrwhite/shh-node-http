/**
 * A simple Promise wrapper around the native Node.JS http(s) module.
 *
 * @description this may not be the best wrapper around, but I've had it forever and it works
 *
 */

import { request } from 'http';
import { request as secureRequest } from 'https';
import { encode } from 'querystring';
import { ShhOptions } from '../utils/options';
import { safeToString } from '../utils/toString';
import { ShhResponse } from './response';

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
    let _isStream = false;

    const options = {
      ...{
        form: false,
        json: true,
        timeout: 30000,
        follow_redirects: true,
        params: null as any,
        headers: {},
      },
      ...optionsOverride,
    };
    const parsedMethod = method.toUpperCase();
    const parsedParams = options.params ? encode(options.params) : null;
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
      timeout: options.timeout,
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
      /**
       * Body is a regular object of primative
       */
      if (!(body.pipe && body.readable)) {
        if (options.json) {
          requestOptions.headers['content-type'] = 'application/json; charset=UTF-8';
          body = JSON.stringify(body);
        } else if (options.form) {
          requestOptions.headers['content-type'] = 'application/x-www-form-urlencoded';
          body = encode(body);
        } else {
          body = safeToString(body);
        }
        requestOptions.headers['content-length'] = Buffer.byteLength(body);
      } else {
        /**
         * Body is a stream so we do nothing with it
         */
        _isStream = true;
      }
    }

    const req = agent(requestOptions, res => {
      // redirect
      if (options.follow_redirects && res.headers.location) {
        /* istanbul ignore next */
        if ([301, 302, 307, 308].includes(res.statusCode as number)) {
          return resolve(shhHTTP(method, res.headers.location, body, optionsOverride));
        } // be linient in redirect checking and do not abort
      }

      return resolve(new ShhResponse(res));
    });

    /**
     * Abort request after the given timeout
     *
     * @note returns the code `ECONNTIMEOUT` instead of a 408 or 504
     * so the user can decide if they are a server or a proxy
     */
    req.on('timeout', () => {
      req.destroy();
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
      if (_isStream) {
        body.pipe(req);
      } else {
        req.write(body);
        req.end();
      }
    } else {
      /**
       * Finally, end the request
       */
      req.end();
    }
  });
};
