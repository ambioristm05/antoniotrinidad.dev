import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { filterPosts, filterProjects, getProjectCategories } from '../src/services/publicContent.js';

describe('public content helpers', () => {
  const projects = [{ category: 'api', title: 'One' }, { category: 'web', title: 'Two' }, { category: 'api', title: 'Three' }];

  it('derives unique categories and filters projects', () => {
    assert.deepEqual(getProjectCategories(projects), ['api', 'web']);
    assert.equal(filterProjects(projects, 'api').length, 2);
    assert.equal(filterProjects(projects, '').length, 3);
  });

  it('searches post metadata case-insensitively', () => {
    const posts = [
      { title: 'Secure Express', excerpt: 'API notes', category: 'backend', tags: ['node'] },
      { title: 'React forms', excerpt: 'Accessible UI', category: 'frontend', tags: ['react'] },
    ];
    assert.deepEqual(filterPosts(posts, ' NODE '), [posts[0]]);
    assert.deepEqual(filterPosts(posts, 'accessible'), [posts[1]]);
    assert.deepEqual(filterPosts(posts, ''), posts);
  });
});
