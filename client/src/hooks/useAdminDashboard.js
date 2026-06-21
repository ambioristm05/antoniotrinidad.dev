import { useCallback, useEffect, useState } from 'react';

import { getAdminDashboard } from '../services/adminDashboard.js';

export function useAdminDashboard() {
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState({
    data: null,
    error: null,
    status: 'loading',
  });

  useEffect(() => {
    const controller = new AbortController();

    setState((current) => ({ ...current, error: null, status: 'loading' }));

    getAdminDashboard({ signal: controller.signal })
      .then((data) => setState({ data, error: null, status: 'success' }))
      .catch((error) => {
        if (error?.code === 'ABORTED') return;
        setState((current) => ({ ...current, error, status: 'error' }));
      });

    return () => controller.abort();
  }, [requestVersion]);

  const reload = useCallback(() => setRequestVersion((version) => version + 1), []);

  return { ...state, reload };
}
