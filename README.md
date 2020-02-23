# shh-node-http

A simple promise wrapper around Node.JS http(s) ClientRequest

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

## Examples

### plain html get:

```js
const { http } = require('shh-node-http');

http
  .get('https://www.google.com/', { json: false })
  .then(response => {
    console.log('status: ', response.statusCode);
    console.log('message: ', response.statusMessage);
  })
  .catch(e => console.error('request failed with error: ', e));
```

### REST API post

```js
const { http } = require('shh-node-http');
http
  .post('https://my-cool-rest-api.com/api/v1/users', {
    name: 'Josh',
    email: 'my-email@email.com',
    password: 'hunter2'
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
const { http, utils } = require('shh-node-http');

http
  .request('GET', 'https://www.google.com/', null, { json: false })
  .then(response => utils.assertStatus(response))
  .then(response => {
    console.log('status: ', response.statusCode);
    console.log('message: ', response.statusMessage);
  })
  .catch(e => console.error('request failed with error: ', e));
```
