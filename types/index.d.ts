export interface ShhResponse {
  statusCode: number;
  headers: object;
  body: any;
}

export interface ShhOptions {
  form: boolean;
  json: boolean;
  timeout: number;
  follow_redirects: boolean;
  params: object;
}

export interface Shh {
  get(url: string, options?: ShhOptions): Promise<ShhResponse>;
  put(url: string, body: any, options?: ShhOptions): Promise<ShhResponse>;
  patch(url: string, body: any, options?: ShhOptions): Promise<ShhResponse>;
  post(url: string, body: any, options?: ShhOptions): Promise<ShhResponse>;
  delete(url: string, body: any, options?: ShhOptions): Promise<ShhResponse>;
  request(method: string, url: string, body: any, options: ShhOptions): Promise<ShhResponse>;
}

declare const shh: Shh;

export default shh;
