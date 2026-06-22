import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildEmailComposeUrl } from '../src/services/emailLinks.js';

describe('email links', () => {
  it('builds a Gmail composer URL for the corporate address', () => {
    const url = new URL(buildEmailComposeUrl({
      email: ' hi@antoniotrinidad.dev ',
      subject: 'Project inquiry',
    }));

    assert.equal(url.origin, 'https://mail.google.com');
    assert.equal(url.searchParams.get('to'), 'hi@antoniotrinidad.dev');
    assert.equal(url.searchParams.get('su'), 'Project inquiry');
  });
});
