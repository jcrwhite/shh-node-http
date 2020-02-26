/**
 * A simple Promise wrapper around the native Node.JS http(s) module.
 *
 * @description this may not be the best wrapper around, but I've had it forever and it works
 *
 */

const request = require('http').request;
const secureRequest = require('https').request;
const encode = require('querystring').encode;

const { assertStatus } = require('./utils');

/**
 * The default options for a request
 *
 * @default ```
 * form: false,
 * json: true,
 * timeout: 30000, // 30 seconds
 * follow_redirects: true,
 * params: null
 * ```
 */
const default_options = {
  form: false,
  json: true,
  timeout: 30000,
  follow_redirects: true,
  params: null
};

/**
 * A Promise wrapper around the `http(s).ClientRequest`
 *
 * @param {'get'|'put'|'patch'|'post'|'delete'} method HTTP method to use when making the request
 * @param {string} url any valid URL string
 * @param {any} body the HTTP body you with to send (null will result in no body)
 * @param {object|null} options override the `default_options`
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
const shhHTTP = (method = 'GET', url, body = null, options = default_options) => {
  const parsedMethod = method.toUpperCase();
  const parsedParams = !!options.params ? encode(options.params) : null;
  let urlObject;
  try {
    urlObject = new URL(url);
  } catch (error) {
    throw new Error(`Invalid url ${url}`);
  }
  const agent = urlObject.protocol === 'https:' ? secureRequest : request;
  if (body && parsedMethod === 'GET') {
    throw new Error(
      `Invalid use of the body parameter while using the ${method.toUpperCase()} method.`
    );
  }
  let requestOptions = {
    method: parsedMethod,
    headers: options.headers || {},
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
    throw new Error('Request cannot be both type form and type json.');
  }
  if (options.form) {
    requestOptions.headers['content-type'] = 'application/x-www-form-urlencoded';
  }
  if (options.json) {
    requestOptions.headers['content-type'] = 'application/json; charset=UTF-8';
  }
  if (body) {
    if (options.json) {
      body = JSON.stringify(body);
    }
    if (options.form) {
      body = encode(body);
    }
    requestOptions.headers['content-length'] = Buffer.byteLength(body);
  }

  return new Promise((resolve, reject) => {
    const req = agent(requestOptions, res => {
      const response = {
        statusCode: res.statusCode,
        headers: res.headers,
        body: ''
      };

      res.setEncoding('utf8');
      res.on('data', chunk => {
        response.body += chunk;
      });

      res.on('end', () => {
        /**
         * If we are using JSON, attempt to parse the response
         */
        if (options.json) {
          try {
            response.body = JSON.parse(response.body);
          } catch (e) {
            reject(e);
          }
        }
        resolve(response);
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
      let e = new Error('Connection timed out.');
      e.code = 'ECONNTIMEOUT';
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
 * @param {object|null} options optionally override the package defaults
 *
 * @description A convenience method for making GET requests
 */
const _get = (url, options) =>
  shhHTTP('get', url, null, { ...default_options, ...options }).then(response =>
    assertStatus(response)
  );

/**
 * PUT helper
 *
 * @param {string} url valid URL string
 * @param {any} body http body to send
 * @param {object|null} options optionally override package defaults
 *
 * @description A convenience method for making PUT requests
 */
const _put = (url, body = null, options) =>
  shhHTTP('put', url, body, { ...default_options, ...options }).then(response =>
    assertStatus(response)
  );

/**
 * PATCH helper
 *
 * @param {string} url valid URL string
 * @param {any} body http body to send
 * @param {object|null} options optionally override package defaults
 *
 * @description A convenience method for making PATCH requests
 */
const _patch = (url, body = null, options) =>
  shhHTTP('patch', url, body, {
    ...default_options,
    ...options
  }).then(response => assertStatus(response));

/**
 * POST helper
 *
 * @param {string} url valid URL string
 * @param {any} body http body to send
 * @param {object|null} options optionally override package defaults
 *
 * @description A convenience method for making POST requests
 */
const _post = (url, body = null, options) =>
  shhHTTP('post', url, body, {
    ...default_options,
    ...options
  }).then(response => assertStatus(response));

/**
 * DELETE helper
 *
 * @param {string} url valid URL string
 * @param {any} body http body to send
 * @param {object|null} options optionally override package defaults
 *
 * @description A convenience method for making DELETE requests
 */
const _delete = (url, body = null, options) =>
  shhHTTP('delete', url, body, {
    ...default_options,
    ...options
  }).then(response => assertStatus(response));

module.exports = {
  get: _get,
  put: _put,
  patch: _patch,
  post: _post,
  delete: _delete,
  request: shhHTTP
};
