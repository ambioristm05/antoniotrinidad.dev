import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';

import mongoose from 'mongoose';

process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '0';
process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/antoniotrinidad-test';
process.env.JWT_SECRET ??= 'test-secret-for-antoniotrinidad-backend';
process.env.JWT_EXPIRES_IN ??= '1h';
process.env.CLIENT_URL ??= 'http://localhost:5173';

const { default: app } = await import('../src/app.js');
const { Category } = await import('../src/models/Category.js');
const { ContactMessage } = await import('../src/models/ContactMessage.js');
const { Post } = await import('../src/models/Post.js');
const { Project } = await import('../src/models/Project.js');
const { User } = await import('../src/models/User.js');

let server;
let baseUrl;

const getDatabaseName = (uri) => {
  const match = uri.match(/\/([^/?]+)(?:\?|$)/);
  return match ? decodeURIComponent(match[1]) : '';
};

const request = async (path, options = {}) => {
  const headers = {
    ...(options.body && { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : await response.text();

  return { response, body };
};

const seedAdmin = async () => {
  const credentials = {
    email: 'admin@example.com',
    password: 'password123',
  };

  const user = await User.create({
    name: 'Antonio Admin',
    email: credentials.email,
    passwordHash: credentials.password,
  });

  const login = await request('/api/auth/login', {
    method: 'POST',
    body: credentials,
  });

  assert.equal(login.response.status, 200);
  assert.equal(login.body.status, 'success');
  assert.ok(login.body.token);

  return {
    user,
    token: login.body.token,
    authorization: `Bearer ${login.body.token}`,
  };
};

describe('Backend API', { concurrency: false }, () => {
  before(async () => {
    const databaseName = getDatabaseName(process.env.MONGODB_URI);

    assert.match(
      databaseName,
      /test/i,
      `Refusing to run tests against non-test database "${databaseName}". Use a dedicated test database.`,
    );

    await mongoose.connect(process.env.MONGODB_URI);
    await mongoose.connection.db.dropDatabase();

    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));

    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Promise.all([
      Category.deleteMany({}),
      ContactMessage.deleteMany({}),
      Post.deleteMany({}),
      Project.deleteMany({}),
      User.deleteMany({}),
    ]);
  });

  it('returns the health status', async () => {
    const { response, body } = await request('/api/health');

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      status: 'success',
      message: 'API is healthy',
    });
  });

  it('validates and stores contact messages', async () => {
    const invalid = await request('/api/contact', {
      method: 'POST',
      body: {
        name: 'Ada Lovelace',
        email: 'not-an-email',
        subject: 'Hello',
        message: 'This should fail validation.',
      },
    });

    assert.equal(invalid.response.status, 400);
    assert.equal(invalid.body.status, 'fail');
    assert.match(invalid.body.message, /Email must be a valid email/);

    const valid = await request('/api/contact', {
      method: 'POST',
      body: {
        name: 'Ada Lovelace',
        email: 'Ada@Example.com',
        subject: 'Project inquiry',
        message: 'I would like to talk about a new project.',
      },
    });

    assert.equal(valid.response.status, 201);
    assert.equal(valid.body.status, 'success');
    assert.equal(valid.body.data.contactMessage.email, 'ada@example.com');
    assert.equal(valid.body.data.contactMessage.status, 'unread');
  });

  it('requires authentication for private contact message routes', async () => {
    const { response, body } = await request('/api/contact/messages');

    assert.equal(response.status, 401);
    assert.equal(body.status, 'fail');
    assert.equal(body.message, 'Authentication token is required');
  });

  it('logs in an admin and returns the current user', async () => {
    const { authorization } = await seedAdmin();

    const me = await request('/api/auth/me', {
      headers: {
        Authorization: authorization,
      },
    });

    assert.equal(me.response.status, 200);
    assert.equal(me.body.status, 'success');
    assert.equal(me.body.data.user.email, 'admin@example.com');
    assert.equal(me.body.data.user.role, 'admin');
  });

  it('allows an admin to create categories', async () => {
    const { authorization } = await seedAdmin();

    const created = await request('/api/categories', {
      method: 'POST',
      headers: {
        Authorization: authorization,
      },
      body: {
        name: 'Backend',
        type: 'post',
      },
    });

    assert.equal(created.response.status, 201);
    assert.equal(created.body.data.category.slug, 'backend');

    const publicList = await request('/api/categories?type=post');

    assert.equal(publicList.response.status, 200);
    assert.equal(publicList.body.results, 1);
    assert.equal(publicList.body.data.categories[0].name, 'Backend');
  });

  it('allows an admin to publish projects and fetch them by slug', async () => {
    const { authorization } = await seedAdmin();

    const created = await request('/api/projects', {
      method: 'POST',
      headers: {
        Authorization: authorization,
      },
      body: {
        title: 'Portfolio API',
        summary: 'API for portfolio content.',
        description: 'A tested Express and MongoDB API for portfolio content.',
        technologies: ['Node.js', 'MongoDB'],
        featured: true,
      },
    });

    assert.equal(created.response.status, 201);
    assert.equal(created.body.data.project.slug, 'portfolio-api');

    const bySlug = await request('/api/projects/portfolio-api');

    assert.equal(bySlug.response.status, 200);
    assert.equal(bySlug.body.data.project.title, 'Portfolio API');
  });

  it('publishes posts and hides drafts from public post listings', async () => {
    const { authorization } = await seedAdmin();

    const draft = await request('/api/posts', {
      method: 'POST',
      headers: {
        Authorization: authorization,
      },
      body: {
        title: 'Draft Post',
        excerpt: 'This draft should stay private.',
        content: 'Private draft content.',
        status: 'draft',
      },
    });

    assert.equal(draft.response.status, 201);

    const published = await request('/api/posts', {
      method: 'POST',
      headers: {
        Authorization: authorization,
      },
      body: {
        title: 'Published Post',
        excerpt: 'This published post should be public.',
        content: 'Public article content with enough words for reading time.',
        status: 'published',
        featured: true,
        tags: ['API', 'Testing'],
      },
    });

    assert.equal(published.response.status, 201);
    assert.equal(published.body.data.post.slug, 'published-post');
    assert.equal(published.body.data.post.tags[0], 'api');

    const publicList = await request('/api/posts');

    assert.equal(publicList.response.status, 200);
    assert.equal(publicList.body.results, 1);
    assert.equal(publicList.body.data.posts[0].title, 'Published Post');

    const bySlug = await request('/api/posts/published-post');

    assert.equal(bySlug.response.status, 200);
    assert.equal(bySlug.body.data.post.title, 'Published Post');
  });
});
