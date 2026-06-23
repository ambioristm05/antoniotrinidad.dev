import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  addComment,
  addReplyToComment,
  commentFormToPayload,
  emptyCommentForm,
  replyFormToPayload,
} from '../src/services/postComments.js';

describe('post comment helpers', () => {
  it('normalizes comment form values for the API', () => {
    const payload = commentFormToPayload({
      ...emptyCommentForm,
      authorName: '  Ada Lovelace  ',
      authorEmail: '  Ada@Example.com  ',
      message: '  Useful article.  ',
      website: '  ',
    });

    assert.deepEqual(payload, {
      authorName: 'Ada Lovelace',
      authorEmail: 'Ada@Example.com',
      message: 'Useful article.',
    });
  });

  it('omits optional reply email and adds comments immutably', () => {
    const replyPayload = replyFormToPayload({
      ...emptyCommentForm,
      authorName: ' Antonio ',
      authorEmail: ' ',
      message: ' Gracias. ',
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
});
