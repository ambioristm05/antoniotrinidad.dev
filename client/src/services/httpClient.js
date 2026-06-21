const defaultErrorMessage = 'No se pudo completar la solicitud.';
const networkErrorMessage = 'No se pudo conectar con el servidor.';
const timeoutErrorMessage = 'La solicitud tardó demasiado tiempo.';

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'REQUEST_FAILED', details = null, cause } = {}) {
    super(message, { cause });
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const isApiError = (error) => error instanceof ApiError;

const appendQuery = (url, query = {}) => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;

    const values = Array.isArray(value) ? value : [value];
    values.forEach((item) => searchParams.append(key, String(item)));
  }

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

const parseResponse = async (response) => {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json().catch(() => null);
  }

  const text = await response.text();
  return text || null;
};

const serializeBody = (body, headers) => {
  if (body === undefined || body === null) return undefined;
  if (typeof FormData !== 'undefined' && body instanceof FormData) return body;
  if (typeof body === 'string' || body instanceof URLSearchParams) return body;

  headers.set('Content-Type', 'application/json');
  return JSON.stringify(body);
};

export const createHttpClient = ({
  baseUrl,
  fetchImpl = globalThis.fetch,
  timeoutMs = 10000,
  getAccessToken = () => null,
  onUnauthorized = () => {},
} = {}) => {
  if (!baseUrl) throw new Error('HTTP client baseUrl is required');
  if (typeof fetchImpl !== 'function') throw new Error('HTTP client fetch implementation is required');

  const request = async (
    path,
    { method = 'GET', query, body, headers: customHeaders, signal, ...fetchOptions } = {},
  ) => {
    const headers = new Headers(customHeaders);
    const token = getAccessToken();
    const controller = new AbortController();
    let timedOut = false;

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const handleExternalAbort = () => controller.abort(signal.reason);

    if (signal) {
      if (signal.aborted) handleExternalAbort();
      else signal.addEventListener('abort', handleExternalAbort, { once: true });
    }

    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    try {
      const url = appendQuery(`${baseUrl}${path}`, query);
      const response = await fetchImpl(url, {
        ...fetchOptions,
        method,
        headers,
        body: serializeBody(body, headers),
        signal: controller.signal,
      });
      const payload = await parseResponse(response);

      if (!response.ok) {
        if (response.status === 401) onUnauthorized();

        throw new ApiError(payload?.message || defaultErrorMessage, {
          status: response.status,
          code: payload?.code || 'HTTP_ERROR',
          details: payload,
        });
      }

      return payload;
    } catch (error) {
      if (isApiError(error)) throw error;

      if (timedOut) {
        throw new ApiError(timeoutErrorMessage, {
          code: 'TIMEOUT',
          cause: error,
        });
      }

      if (signal?.aborted || error?.name === 'AbortError') {
        throw new ApiError('La solicitud fue cancelada.', {
          code: 'ABORTED',
          cause: error,
        });
      }

      throw new ApiError(networkErrorMessage, {
        code: 'NETWORK_ERROR',
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', handleExternalAbort);
    }
  };

  return {
    request,
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
    patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  };
};
