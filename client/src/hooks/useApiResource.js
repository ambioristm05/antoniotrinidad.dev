import { useCallback, useEffect, useState } from 'react';

export function useApiResource(request, key = '') {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({ data: null, error: null, status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, error: null, status: 'loading' }));

    request({ signal: controller.signal })
      .then((data) => setState({ data, error: null, status: 'success' }))
      .catch((error) => {
        if (error?.code === 'ABORTED') return;
        setState((current) => ({ ...current, error, status: 'error' }));
      });

    return () => controller.abort();
  }, [key, version]);

  const retry = useCallback(() => setVersion((current) => current + 1), []);
  return { ...state, retry };
}
