import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  subscribeToAccessToken,
} from '../src/services/authToken.js';

describe('Admin access token', () => {
  afterEach(() => clearAccessToken());

  it('stores and clears the token while notifying subscribers', () => {
    const observed = [];
    const unsubscribe = subscribeToAccessToken((token) => observed.push(token));

    setAccessToken('admin-token');
    assert.equal(getAccessToken(), 'admin-token');

    clearAccessToken();
    assert.equal(getAccessToken(), null);
    assert.deepEqual(observed, ['admin-token', null]);

    unsubscribe();
  });
});
