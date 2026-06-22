export const COOKIE_CONSENT_KEY = 'antoniotrinidad-cookie-consent-v1';
export const COOKIE_CONSENT_VALUES = ['accepted', 'rejected'];

export const readCookieConsent = (storage = globalThis.localStorage) => {
  try {
    const value = storage?.getItem(COOKIE_CONSENT_KEY);
    return COOKIE_CONSENT_VALUES.includes(value) ? value : null;
  } catch {
    return null;
  }
};

export const saveCookieConsent = (value, storage = globalThis.localStorage) => {
  if (!COOKIE_CONSENT_VALUES.includes(value)) {
    throw new Error('Invalid cookie consent value');
  }

  try {
    storage?.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    // The choice still applies for the current page when storage is unavailable.
  }

  return value;
};
