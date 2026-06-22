import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  COOKIE_CONSENT_KEY,
  readCookieConsent,
  saveCookieConsent,
} from '../src/services/cookieConsent.js';

const createStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
};

describe('cookie consent storage', () => {
  it('persists accepted and rejected choices', () => {
    const storage = createStorage();

    assert.equal(readCookieConsent(storage), null);
    assert.equal(saveCookieConsent('accepted', storage), 'accepted');
    assert.equal(storage.getItem(COOKIE_CONSENT_KEY), 'accepted');
    assert.equal(readCookieConsent(storage), 'accepted');

    saveCookieConsent('rejected', storage);
    assert.equal(readCookieConsent(storage), 'rejected');
  });

  it('ignores unknown stored values and rejects invalid choices', () => {
    const storage = createStorage();
    storage.setItem(COOKIE_CONSENT_KEY, 'unknown');

    assert.equal(readCookieConsent(storage), null);
    assert.throws(() => saveCookieConsent('unknown', storage), /Invalid cookie consent value/);
  });
});
