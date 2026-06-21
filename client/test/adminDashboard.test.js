import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createAdminDashboardService } from '../src/services/adminDashboard.js';

describe('admin dashboard service', () => {
  it('loads dashboard resources in parallel and maps totals and recent content', async () => {
    const calls = [];
    const project = { _id: 'project-1', title: 'Portfolio' };
    const post = { _id: 'post-1', title: 'Express API' };
    const apiClient = {
      getProjects: async (query, options) => {
        calls.push(['projects', query, options]);
        return { pagination: { total: 7 }, data: { projects: [project] } };
      },
      getAdminPosts: async (query, options) => {
        calls.push(['posts', query, options]);
        return query.status === 'draft'
          ? { pagination: { total: 2 }, data: { posts: [] } }
          : { pagination: { total: 5 }, data: { posts: [post] } };
      },
      getMessages: async (query, options) => {
        calls.push(['messages', query, options]);
        return { pagination: { total: 3 }, data: { messages: [] } };
      },
    };
    const controller = new AbortController();
    const getDashboard = createAdminDashboardService(apiClient);

    const dashboard = await getDashboard({ signal: controller.signal });

    assert.deepEqual(dashboard, {
      stats: { projects: 7, posts: 5, messages: 3, drafts: 2 },
      recentProjects: [project],
      recentPosts: [post],
    });
    assert.deepEqual(
      calls.map(([resource, query]) => [resource, query]),
      [
        ['projects', { limit: 5, sort: '-createdAt' }],
        ['posts', { limit: 5, sort: '-createdAt' }],
        ['posts', { status: 'draft', limit: 1 }],
        ['messages', { status: 'unread', limit: 1 }],
      ],
    );
    calls.forEach(([, , options]) => assert.equal(options.signal, controller.signal));
  });

  it('falls back to collection lengths when pagination is unavailable', async () => {
    const apiClient = {
      getProjects: async () => ({ data: { projects: [{}, {}] } }),
      getAdminPosts: async (query) => ({ data: { posts: query.status ? [{}] : [{}, {}, {}] } }),
      getMessages: async () => ({ data: { messages: [] } }),
    };

    const dashboard = await createAdminDashboardService(apiClient)();

    assert.deepEqual(dashboard.stats, { projects: 2, posts: 3, messages: 0, drafts: 1 });
  });
});
