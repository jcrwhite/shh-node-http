import { assertStatus } from './assert/assertStatus';
import { shhHTTP } from './http/request';
import { ShhOptions } from './utils/options';

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
  request: shhHTTP,
};
