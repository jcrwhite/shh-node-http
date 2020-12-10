# shh-node-http

A simple promise wrapper around Node.JS http(s) ClientRequest

[![https://nodei.co/npm/shh-node-http.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/shh-node-http.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/shh-node-http)

[![Node version](https://img.shields.io/node/v/shh-node-http.svg?style=flat)](http://nodejs.org/download/)

## Simple to use

shh-node-http is designed to be the simplest way to make http calls from your Node application. For convenience it defaults to a Content-Type of JSON and follows redirects.

It supports:

- http
- https
- parsing JSON
- parsing form
- passthrough of all other body type

## Minimal

shh-node-http has 0 (zero) dependencies, is under 250 LOC including comments / whitespace, and completely exposes the native Node request / response objects so nothing is hidden from you.

## Compatibility

shh-node-http has full typings and works with TypeScript, esmodule `import`, and the old Node module `require`.

## Usage

```ts
const { shh } = require('shh-node-http');

shh.post(url: string, body: any, options?: Object)
  .then(response => doSomething(response))
  .catch(e => handleError(e));
```

### Options

- params - `{ key: value }` query parameters (default `null`)
- headers - `{ key: value }` http headers (automatically applies `Content-Type, Content-Length`)
- json - `true|false` encodes and parses the request body as JSON (default `true`)
- form - `true|false` form encodes and parses the request body (default `false`)
- timeout - `number` request timeout in milliseconds, the request will be canceled and the Promise will be rejected once this value is reached (default `30000` - 30 seconds)
- follow_redirects - `true|false` whether to follow http redirects (default `true`)

## Examples

### plain html get:

```js
const { shh } = require('shh-node-http');

shh
  .get('https://www.google.com/', { json: false })
  .then(response => {
    console.log('status: ', response.statusCode);
    console.log('message: ', response.statusMessage);
  })
  .catch(e => console.error('request failed with error: ', e));
```

### passing query parameetrs

```js
const { shh } = require('shh-node-http');

shh
  .get('https://my-cool-rest-api.com/api/v1/users', { params: { name: 'Bob' } })
  .then(response => {
    console.log('status: ', response.statusCode);
    console.log('message: ', response.statusMessage);
  })
  .catch(e => console.error('request failed with error: ', e));
```

### REST API post

```js
const { shh } = require('shh-node-http');
shh
  .post('https://my-cool-rest-api.com/api/v1/users', {
    name: 'Josh',
    email: 'my-email@email.com',
    password: 'hunter2',
  })
  .then(response => {
    console.log('Created user ', response.body.name);
    hanldeNewUser(response.body);
  })
  .catch(e => {
    console.error('Create user failed woth error: ', e.message);
    handleNewUserError(e.body || e);
  });
```

### using the raw request wrapper:

```js
const { shh, utils } = require('shh-node-http');

shh
  .request('GET', 'https://www.google.com/', null, { json: false })
  .then(response => utils.assertStatus(response))
  .then(response => {
    console.log('status: ', response.statusCode);
    console.log('message: ', response.statusMessage);
  })
  .catch(e => console.error('request failed with error: ', e));
```
