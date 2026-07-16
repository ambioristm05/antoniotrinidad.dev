import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { filterPosts, filterProjects, getProjectCategories } from '../src/services/publicContent.js';
import { getSiteContent } from '../src/data/siteContent.js';

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

  it('loads localized site content with comment samples', () => {
    const content = getSiteContent('es');

    assert.equal(content.profile.github, 'https://github.com/ambioristm05');
    assert.equal(content.profile.linkedin, 'https://www.linkedin.com/in/antoniotrinidad/');
    assert.equal(content.profile.facebook, 'https://web.facebook.com/Antoniotrinidad.dev/');
    assert.equal(content.blogPage.comments.samples.length, 12);
    assert.ok(content.blogPage.comments.samples[0].avatarUrl);
  });

  it('does not publish placeholder project links', () => {
    const { projects } = getSiteContent('es');

    assert.equal(projects.some((project) => project.liveUrl === 'https://example.com'), false);
    assert.equal(projects.some((project) => project.repoUrl === 'https://github.com/'), false);
  });
});
