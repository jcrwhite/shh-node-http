/**
 * Ensure the HTTP(S) response.statusCode is OK
 *
 * @param {http.IncomingMessage} response the HTTP(S) response
 */
const assertStatus = response =>
  new Promise((resolve, reject) => {
    if (response.statusCode >= 200 && response.statusCode <= 308) {
      resolve(response);
    } else {
      let e = new Error(response.statusMessage);
      e.code = 'EBADRESCODE';
      e.statusCode = response.statusCode;
      e.headers = response.headers;
      e.body = response.body;
      reject(e);
    }
  });

module.exports = { assertStatus };
