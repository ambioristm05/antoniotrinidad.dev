import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildCanonicalUrl, buildPageTitle, resolveSocialImage } from '../src/services/seo.js';

describe('SEO helpers', () => {
  it('builds consistent titles and canonical URLs', () => {
    assert.equal(buildPageTitle(), 'Antonio Trinidad | FullStack Developer');
    assert.equal(buildPageTitle('Proyectos'), 'Proyectos | Antonio Trinidad');
    assert.equal(buildCanonicalUrl('/blog/api-segura'), 'https://www.antoniotrinidad.dev/blog/api-segura');
  });

  it('resolves relative and absolute social images', () => {
    assert.equal(resolveSocialImage('/brand/cover.png'), 'https://www.antoniotrinidad.dev/brand/cover.png');
    assert.equal(resolveSocialImage('https://cdn.example.com/cover.png'), 'https://cdn.example.com/cover.png');
  });
});
