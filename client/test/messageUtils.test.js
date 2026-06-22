import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildEmailReplyUrl,
  buildMessageQuery,
  removeMessage,
  replaceMessage,
} from '../src/services/messageUtils.js';

describe('message utilities', () => {
  it('builds bounded API queries and omits inactive filters', () => {
    assert.deepEqual(buildMessageQuery(), { page: 1, limit: 10, sort: '-createdAt' });
    assert.deepEqual(buildMessageQuery({ filter: 'unread', page: 2, search: '  API project  ' }), {
      page: 2,
      limit: 10,
      sort: '-createdAt',
      status: 'unread',
      search: 'API project',
    });
  });

  it('replaces and removes messages without mutating the original list', () => {
    const original = [{ _id: 'one', status: 'unread' }, { _id: 'two', status: 'read' }];
    const replaced = replaceMessage(original, { _id: 'one', status: 'read' });
    const removed = removeMessage(replaced, 'two');

    assert.equal(original[0].status, 'unread');
    assert.deepEqual(replaced, [{ _id: 'one', status: 'read' }, { _id: 'two', status: 'read' }]);
    assert.deepEqual(removed, [{ _id: 'one', status: 'read' }]);
  });

  it('builds a Gmail reply composer URL with encoded message details', () => {
    const url = new URL(buildEmailReplyUrl({
      email: 'client@example.com',
      name: 'Ana',
      subject: 'Proyecto & API',
      language: 'es',
    }));

    assert.equal(url.origin, 'https://mail.google.com');
    assert.equal(url.searchParams.get('to'), 'client@example.com');
    assert.equal(url.searchParams.get('su'), 'Re: Proyecto & API');
    assert.equal(url.searchParams.get('body'), 'Hola Ana,\n\n');
  });
});
