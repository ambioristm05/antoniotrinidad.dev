import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  addComment,
  addReplyToComment,
  commentFormToPayload,
  defaultCommentAvatar,
  emptyCommentForm,
  getBrowserCommentUser,
  replyFormToPayload,
} from '../src/services/postComments.js';

describe('post comment helpers', () => {
  it('normalizes comment form values for the API', () => {
    const payload = commentFormToPayload({
      ...emptyCommentForm,
      message: '  Useful article.  ',
      website: '  ',
    }, {
      authorName: '  Ada Lovelace  ',
      authorEmail: '  Ada@Example.com  ',
      authorAvatar: 'https://example.com/ada.png',
    });

    assert.deepEqual(payload, {
      authorName: 'Ada Lovelace',
      authorEmail: 'Ada@Example.com',
      authorAvatar: 'https://example.com/ada.png',
      message: 'Useful article.',
    });
  });

  it('omits optional reply email and adds comments immutably', () => {
    const replyPayload = replyFormToPayload({
      ...emptyCommentForm,
      message: ' Gracias. ',
    }, {
      authorName: ' Antonio ',
      authorEmail: ' ',
      authorAvatar: defaultCommentAvatar,
    });
    const comments = [{ _id: 'one', replies: [] }];
    const nextComments = addComment(comments, { _id: 'two', replies: [] });
    const withReply = addReplyToComment(nextComments, 'one', { _id: 'reply-one' });

    assert.deepEqual(replyPayload, {
      authorName: 'Antonio',
      message: 'Gracias.',
    });
    assert.deepEqual(nextComments.map((comment) => comment._id), ['two', 'one']);
    assert.equal(comments.length, 1);
    assert.deepEqual(withReply[1].replies, [{ _id: 'reply-one' }]);
  });

  it('extracts browser comment identity with a default avatar fallback', () => {
    const originalWindow = globalThis.window;
    globalThis.window = {
      localStorage: {
        getItem: (key) => (key === 'antoniotrinidad:user'
          ? JSON.stringify({ name: 'Ada', email: 'ada@example.com' })
          : null),
      },
    };

    try {
      assert.deepEqual(getBrowserCommentUser('Visitante'), {
        authorName: 'Ada',
        authorEmail: 'ada@example.com',
        authorAvatar: defaultCommentAvatar,
      });
    } finally {
      if (originalWindow === undefined) delete globalThis.window;
      else globalThis.window = originalWindow;
    }
  });
});
