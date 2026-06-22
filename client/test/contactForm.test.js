import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { contactFormToPayload, emptyContactForm } from '../src/services/contactForm.js';

describe('contact form transformation', () => {
  it('normalizes public contact values for the API', () => {
    assert.deepEqual(contactFormToPayload({
      ...emptyContactForm,
      name: '  Ada Lovelace  ',
      email: ' ADA@Example.COM ',
      subject: '  Project inquiry ',
      message: '  I would like to discuss an API.  ',
    }), {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      subject: 'Project inquiry',
      message: 'I would like to discuss an API.',
    });
  });

  it('includes the honeypot only when it has a value', () => {
    const clean = contactFormToPayload({ ...emptyContactForm });
    const bot = contactFormToPayload({ ...emptyContactForm, website: ' https://spam.example.com ' });

    assert.equal(clean.website, undefined);
    assert.equal(bot.website, 'https://spam.example.com');
  });
});
