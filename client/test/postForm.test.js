import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { emptyPostForm, postFormToPayload, postToForm } from '../src/services/postForm.js';

describe('post form transformations', () => {
  it('normalizes published posts for the backend', () => {
    const payload = postFormToPayload({
      ...emptyPostForm,
      title: '  Secure APIs  ', excerpt: '  Practical notes  ', content: '  # API  ',
      category: ' Backend ', tags: 'Node, API\nnode', status: 'published', featured: true,
      publishedAt: '2026-06-21T08:30', coverImage: 'https://example.com/post.jpg',
    });

    assert.equal(payload.title, 'Secure APIs');
    assert.equal(payload.category, 'backend');
    assert.deepEqual(payload.tags, ['node', 'api']);
    assert.equal(payload.status, 'published');
    assert.equal(payload.featured, true);
    assert.equal(payload.publishedAt, new Date('2026-06-21T08:30').toISOString());
  });

  it('does not send publication dates for drafts', () => {
    const payload = postFormToPayload({ ...emptyPostForm, title: 'Draft', excerpt: 'Excerpt', content: '# Draft', publishedAt: '2026-06-21T08:30' });
    assert.equal(payload.publishedAt, undefined);
  });

  it('converts API tags and publication dates into editable values', () => {
    const form = postToForm({ tags: ['node', 'express'], status: 'published', publishedAt: '2026-06-21T12:30:00.000Z' });
    assert.equal(form.tags, 'node, express');
    assert.equal(form.status, 'published');
    assert.match(form.publishedAt, /^2026-06-21T/);
  });
});
