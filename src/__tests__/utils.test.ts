import { assertStatus } from '../utils';

describe('test basic statusCode assert utility', () => {
  test.concurrent('catches bad status code', () =>
    expect(assertStatus({ statusCode: 400, headers: null, body: null } as any)).rejects.toThrow()
  );
  test.concurrent('passes good status code', () =>
    expect(assertStatus({ statusCode: 200, headers: null, body: null } as any)).resolves.toHaveProperty(
      'statusCode',
      200
    )
  );
});
