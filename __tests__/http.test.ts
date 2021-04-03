import { IncomingMessage } from 'http';
import { Stream } from 'stream';
import { shh } from '../src/index';

const baseURL = 'https://httpbin.org/';

describe('test shh GET scenarios', () => {
  test.concurrent('GET many, no params', () =>
    expect(shh.get(baseURL + 'get')).resolves.toHaveProperty('statusCode', 200)
  );
  test.concurrent('GET single, no params', () =>
    expect(shh.get(baseURL + 'anything/1234')).resolves.toHaveProperty('statusCode', 200)
  );
  test.concurrent('GET many, with params', () =>
    expect(shh.get(baseURL + 'get', { params: { limit: 10, offset: 0 } })).resolves.toHaveProperty('statusCode', 200)
  );
  test.concurrent('GET single, with params', () =>
    expect(shh.get(baseURL + 'anything/1234', { params: { limit: 10, offset: 0 } })).resolves.toHaveProperty(
      'statusCode',
      200
    )
  );
  test.concurrent('GET single, with params in url', () =>
    expect(shh.get(baseURL + 'anything/1234?limit=10&offset=0')).resolves.toHaveProperty('statusCode', 200)
  );
  // Test site no longer suports this api
  // test.concurrent('GET with redirect', () =>
  //   expect(shh.get(baseURL + 'redirect-to', { params: { url: `${baseURL}anything/1234` } })).resolves.toHaveProperty(
  //     'statusCode'
  //   )
  // );
});

describe('test pipe functionality', () => {
  test.concurrent('return an instance of IncomingMessage', () =>
    expect(
      shh.get(baseURL + 'anything/1234', { params: { limit: 10, offset: 0 } }).then(response => response)
    ).resolves.toBeInstanceOf(IncomingMessage)
  );
  test.concurrent('returned instance is a ReadableStream', () =>
    expect(
      shh.get(baseURL + 'anything/1234', { params: { limit: 10, offset: 0 } }).then(response => response)
    ).resolves.toHaveProperty('pipe')
  );
  test.concurrent('pipe response from one request to another', () =>
    expect(
      shh
        .get(baseURL + 'anything/1234', { params: { limit: 10, offset: 0 } })
        .then(response => shh.put(baseURL + 'anything/1234', response))
        .then(response => response.json)
    ).resolves.toHaveProperty('json')
  );
});

describe('test shh PUT scenarios', () => {
  test.concurrent('PUT, with json', () =>
    expect(
      shh.put(baseURL + 'anything/1234', { json: [1, 2, 3, 4] }).then(response => response.json)
    ).resolves.toHaveProperty('json', {
      json: [1, 2, 3, 4],
    })
  );
  test.concurrent('PUT, with form', () =>
    expect(
      shh.put(baseURL + 'anything/5678', { form: 'user1' }, { form: true, json: false }).then(response => response.json)
    ).resolves.toBeTruthy()
  );
  test.concurrent('PUT, with string', () =>
    expect(
      shh
        .put(baseURL + 'anything/1234', JSON.stringify({ json: [1, 2, 3, 4] }), { json: false })
        .then(response => response.body)
    ).resolves.toBeTruthy()
  );
  test.concurrent('PUT, with buffer', () =>
    expect(
      shh.put(baseURL + 'anything/1234', { json: [1, 2, 3, 4] }, { json: false }).then(response => response.buffer)
    ).resolves.toBeInstanceOf(Buffer)
  );
  test.concurrent('PUT, with no body', () =>
    expect(shh.put(baseURL + 'anything/5678')).resolves.toHaveProperty('statusCode', 200)
  );
});

describe('test shh PATCH scenarios', () => {
  test.concurrent('PATCH, with json', () =>
    expect(
      shh.patch(baseURL + 'anything/1234', { json: [1, 2, 3, 4] }).then(response => response.json)
    ).resolves.toHaveProperty('json', {
      json: [1, 2, 3, 4],
    })
  );
  test.concurrent('PATCH, with form', () =>
    expect(
      shh
        .patch(baseURL + 'anything/5678', { form: 'user1' }, { form: true, json: false })
        .then(response => response.body)
    ).resolves.toBeTruthy()
  );
  test.concurrent('PATCH, with no body', () =>
    expect(shh.patch(baseURL + 'anything/5678')).resolves.toHaveProperty('statusCode', 200)
  );
});

describe('test shh POST scenarios', () => {
  test.concurrent('POST, with json', () =>
    expect(
      shh.post(baseURL + 'anything/1234', { json: [1, 2, 3, 4] }).then(response => response.json)
    ).resolves.toHaveProperty('json', {
      json: [1, 2, 3, 4],
    })
  );
  test.concurrent('POST, with form', () =>
    expect(
      shh
        .post(baseURL + 'anything/5678', { form: 'user1' }, { form: true, json: false })
        .then(response => response.json)
    ).resolves.toBeTruthy()
  );
  test.concurrent('POST, with no body', () =>
    expect(shh.post(baseURL + 'anything/5678')).resolves.toHaveProperty('statusCode', 200)
  );
});

describe('test shh DELETE scenarios', () => {
  test.concurrent('DELETE, with body', () =>
    expect(
      shh.delete(baseURL + 'anything/1234', { json: [1, 2, 3, 4] }).then(response => response.json)
    ).resolves.toHaveProperty('json', {
      json: [1, 2, 3, 4],
    })
  );
  test.concurrent('DELETE, without body', () =>
    expect(shh.delete(baseURL + 'anything/5678')).resolves.toHaveProperty('statusCode', 200)
  );
});

describe('test shh body type handling', () => {
  test.concurrent('get JSON', () => expect(shh.get(baseURL + 'json')).resolves.toHaveProperty('statusCode', 200));
  test.concurrent('get JSON deflate', () =>
    expect(shh.get(baseURL + 'deflate')).resolves.toHaveProperty('statusCode', 200)
  );
  test.concurrent('get JSON gzip', () => expect(shh.get(baseURL + 'gzip')).resolves.toHaveProperty('statusCode', 200));
  test.concurrent('get JSON brotli', () =>
    expect(shh.get(baseURL + 'brotli')).resolves.toHaveProperty('statusCode', 200)
  );
  test.concurrent('get html encoding/utf8', () =>
    expect(shh.get(baseURL + 'encoding/utf8', { json: false })).resolves.toHaveProperty('statusCode', 200)
  );
  test.concurrent('get html', () =>
    expect(shh.get(baseURL + 'html', { json: false })).resolves.toHaveProperty('statusCode', 200)
  );
  test.concurrent('get xml', () =>
    expect(shh.get(baseURL + 'xml', { json: false })).resolves.toHaveProperty('statusCode', 200)
  );
  test.concurrent('get streamed data', () =>
    expect(
      shh.get(baseURL + 'drip', { json: false, params: { duration: 1, numbytes: 10, code: 200, delay: 1 } })
    ).resolves.toHaveProperty('statusCode', 200)
  );
  test.concurrent('get image', () =>
    expect(shh.get(baseURL + 'image', { json: false })).resolves.toHaveProperty('statusCode', 200)
  );
});

describe('test shh failures', () => {
  test.concurrent('GET with improper config', () =>
    expect(shh.get(baseURL + 'get', { form: true, json: true })).rejects.toThrow()
  );
  test.concurrent('GET with improper url', () => expect(shh.get('this is a test')).rejects.toThrow());
  test.concurrent('GET with disallowed body', () =>
    expect(shh.request('get', baseURL + 'get', { test: 'this is not allowed' })).rejects.toThrow()
  );
  test.concurrent('POST with improper returned body', () => expect(shh.post(baseURL + 'html')).rejects.toThrow());
  test.concurrent('GET to unreachable host', () => expect(shh.get('http://localhost:1337')).rejects.toThrow());
  test.concurrent('GET with improper redirect', () =>
    expect(shh.get(baseURL + 'redirect-to', { params: { url: `this is a bad URL` } })).rejects.toThrow()
  );
  test.concurrent('GET timeout', () =>
    expect(
      shh.get(baseURL + 'drip', {
        json: false,
        timeout: 1000,
        params: { duration: 1, numbytes: 10, code: 200, delay: 1 },
      })
    ).rejects.toThrow()
  );
});
