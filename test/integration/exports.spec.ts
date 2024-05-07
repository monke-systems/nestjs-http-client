import { HttpClientTemplate, HttpClient } from '../../src';

describe('exports test', () => {
  it('package exports modules', () => {
    expect(HttpClientTemplate).toBeDefined();
    expect(HttpClient).toBeDefined();
  });
});
