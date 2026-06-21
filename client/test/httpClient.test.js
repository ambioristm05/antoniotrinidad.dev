import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError, createHttpClient, isApiError } from '../src/services/httpClient.js';

const jsonResponse = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  });

describe('HTTP client', () => {
  it('builds query strings and does not send a content type for GET requests', async () => {
    let capturedUrl;
    let capturedOptions;
    const client = createHttpClient({
      baseUrl: 'http://localhost:5000/api',
      fetchImpl: async (url, options) => {
        capturedUrl = url;
        capturedOptions = options;
        return jsonResponse({ status: 'success' });
      },
    });

    const result = await client.get('/projects', {
      query: {
        page: 2,
        featured: false,
        tag: ['node', 'api'],
        empty: '',
      },
    });

    assert.equal(
      capturedUrl,
      'http://localhost:5000/api/projects?page=2&featured=false&tag=node&tag=api',
    );
    assert.equal(capturedOptions.method, 'GET');
    assert.equal(capturedOptions.headers.has('Content-Type'), false);
    assert.equal(result.status, 'success');
  });

  it('serializes JSON bodies and includes an access token when available', async () => {
    let capturedOptions;
    const client = createHttpClient({
      baseUrl: 'http://localhost:5000/api',
      getAccessToken: () => 'test-token',
      fetchImpl: async (url, options) => {
        capturedOptions = options;
        return jsonResponse({ status: 'success' }, { status: 201 });
      },
    });

    await client.post('/contact', { name: 'Antonio' });

    assert.equal(capturedOptions.headers.get('Content-Type'), 'application/json');
    assert.equal(capturedOptions.headers.get('Authorization'), 'Bearer test-token');
    assert.equal(capturedOptions.body, JSON.stringify({ name: 'Antonio' }));
  });

  it('returns null for successful responses without content', async () => {
    const client = createHttpClient({
      baseUrl: 'http://localhost:5000/api',
      fetchImpl: async () => new Response(null, { status: 204 }),
    });

    assert.equal(await client.delete('/projects/id'), null);
  });

  it('throws structured API errors for unsuccessful responses', async () => {
    let unauthorizedCalls = 0;
    const client = createHttpClient({
      baseUrl: 'http://localhost:5000/api',
      onUnauthorized: () => {
        unauthorizedCalls += 1;
      },
      fetchImpl: async () =>
        jsonResponse(
          {
            status: 'fail',
            message: 'Project not found',
          },
          { status: 404 },
        ),
    });

    await assert.rejects(
      () => client.get('/projects/missing'),
      (error) => {
        assert.equal(isApiError(error), true);
        assert.equal(error.status, 404);
        assert.equal(error.code, 'HTTP_ERROR');
        assert.equal(error.message, 'Project not found');
        assert.equal(error.details.status, 'fail');
        return true;
      },
    );

    assert.equal(unauthorizedCalls, 0);

    const unauthorizedClient = createHttpClient({
      baseUrl: 'http://localhost:5000/api',
      onUnauthorized: () => {
        unauthorizedCalls += 1;
      },
      fetchImpl: async () => jsonResponse({ message: 'Invalid token' }, { status: 401 }),
    });

    await assert.rejects(() => unauthorizedClient.get('/auth/me'), ApiError);
    assert.equal(unauthorizedCalls, 1);
  });

  it('normalizes network and timeout errors', async () => {
    const networkClient = createHttpClient({
      baseUrl: 'http://localhost:5000/api',
      fetchImpl: async () => {
        throw new TypeError('fetch failed');
      },
    });
    const timeoutClient = createHttpClient({
      baseUrl: 'http://localhost:5000/api',
      timeoutMs: 5,
      fetchImpl: (url, { signal }) =>
        new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        }),
    });

    await assert.rejects(
      () => networkClient.get('/health'),
      (error) => error instanceof ApiError && error.code === 'NETWORK_ERROR',
    );
    await assert.rejects(
      () => timeoutClient.get('/health'),
      (error) => error instanceof ApiError && error.code === 'TIMEOUT',
    );
  });
});
