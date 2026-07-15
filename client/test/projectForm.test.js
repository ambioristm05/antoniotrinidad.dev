import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { emptyProjectForm, projectFormToPayload, projectToForm } from '../src/services/projectForm.js';

describe('project form transformations', () => {
  it('normalizes form values into the backend payload', () => {
    const payload = projectFormToPayload({
      ...emptyProjectForm,
      title: '  Portfolio API  ', summary: '  A summary  ', description: '  Details  ',
      role: '  Fullstack developer  ', challenge: '  Scattered evaluation data  ',
      solution: '  Role-based academic workflow  ', results: 'Published reports\nStudent dashboard\nPublished reports',
      category: ' FullStack ', featured: true, technologies: 'React, Node\nReact',
      coverImage: ' /projects/eval-apro/cover.webp ',
      gallery: '/projects/eval-apro/one.webp\nhttps://example.com/two.png', liveUrl: '  ',
    });

    assert.deepEqual(payload, {
      title: 'Portfolio API', summary: 'A summary', description: 'Details', category: 'fullstack',
      status: 'completed', featured: true,
      role: 'Fullstack developer',
      challenge: 'Scattered evaluation data',
      solution: 'Role-based academic workflow',
      results: ['Published reports', 'Student dashboard'],
      coverImage: '/projects/eval-apro/cover.webp',
      gallery: ['/projects/eval-apro/one.webp', 'https://example.com/two.png'],
      technologies: ['React', 'Node'],
    });
  });

  it('converts API arrays and dates into editable values', () => {
    const form = projectToForm({
      technologies: ['React', 'Node'],
      gallery: ['one', 'two'],
      results: ['Centralized flow', 'Printable reports'],
      startDate: '2026-06-01T00:00:00.000Z',
    });
    assert.equal(form.technologies, 'React, Node');
    assert.equal(form.gallery, 'one\ntwo');
    assert.equal(form.results, 'Centralized flow\nPrintable reports');
    assert.equal(form.startDate, '2026-06-01');
    assert.equal(form.status, 'completed');
  });
});
