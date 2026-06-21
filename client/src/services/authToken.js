const storageKey = 'antoniotrinidad.admin.token';
const listeners = new Set();
let memoryToken;

const getStorage = () => {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

const notify = (token) => {
  listeners.forEach((listener) => listener(token));
};

export const getAccessToken = () => {
  if (memoryToken !== undefined) return memoryToken;

  memoryToken = getStorage()?.getItem(storageKey) || null;
  return memoryToken;
};

export const setAccessToken = (token) => {
  memoryToken = token;
  getStorage()?.setItem(storageKey, token);
  notify(token);
};

export const clearAccessToken = () => {
  memoryToken = null;
  getStorage()?.removeItem(storageKey);
  notify(null);
};

export const subscribeToAccessToken = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
