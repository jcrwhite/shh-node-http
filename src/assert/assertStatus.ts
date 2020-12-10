/**
 * Ensure the HTTP(S) response.statusCode is OK
 */
// export const assertStatus: (response: ShhResponse) => Promise<ShhResponse> = (response: ShhResponse) =>
//   new Promise((resolve, reject) => {
//     if (response.statusCode >= 200 && response.statusCode <= 308) {
//       resolve(response);
//     } else {
//       const e: ShhError = new Error(response.statusMessage) as ShhError;
//       e.code = 'EBADRESCODE';
//       e.statusCode = response.statusCode;
//       e.headers = response.headers;
//       e.body = response.body;
//       reject(e);
//     }
//   });
