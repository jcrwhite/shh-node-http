export interface ShhOptions {
  form?: boolean;
  json?: boolean;
  timeout?: number;
  follow_redirects?: boolean;
  params?: { [propName: string]: string | number };
  headers?: { [propName: string]: string };
}
