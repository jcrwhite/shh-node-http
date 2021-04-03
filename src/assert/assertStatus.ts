import { ShhResponse } from '../http/response';
import { ShhError } from '../utils/error';

/**
 * Ensure the HTTP(S) response.statusCode is OK
 */
export const assertStatus: (response: ShhResponse) => Promise<ShhResponse> = (response: ShhResponse) =>
  new Promise((resolve, reject) => {
    response.statusCode = response.statusCode || -1;
    if (response.statusCode >= 200 && response.statusCode <= 308) {
      resolve(response);
    } else {
      reject(new ShhError(response.statusMessage + '', response, 'EBADRESCODE'));
    }
  });
