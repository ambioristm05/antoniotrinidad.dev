import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '0';
process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/antoniotrinidad-test';
process.env.JWT_SECRET ??= 'test-secret-for-antoniotrinidad-backend';
process.env.JWT_EXPIRES_IN ??= '1h';
process.env.CLIENT_URL ??= 'http://localhost:5173';
process.env.ADMIN_NAME ??= '';
process.env.ADMIN_EMAIL ??= '';
process.env.ADMIN_PASSWORD ??= '';
process.env.CLOUDINARY_CLOUD_NAME = '';
process.env.CLOUDINARY_API_KEY = '';
process.env.CLOUDINARY_API_SECRET = '';
process.env.CLOUDINARY_FOLDER = '';
process.env.RESEND_API_KEY = '';
process.env.EMAIL_FROM = '';

const { default: app } = await import('../src/app.js');
const { Category } = await import('../src/models/Category.js');
const { ContactMessage } = await import('../src/models/ContactMessage.js');
const { Post } = await import('../src/models/Post.js');
const { PostComment } = await import('../src/models/PostComment.js');
const { Project } = await import('../src/models/Project.js');
const { User } = await import('../src/models/User.js');
const { ensureAdmin, resetAdminPassword } = await import('../src/services/admin.service.js');
const { signToken } = await import('../src/utils/sendToken.js');

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

const seedAuthorizedAdmin = async () => {
  const user = await User.create({
    name: 'Authorized Admin',
    email: 'authorized@example.com',
    passwordHash: 'password123',
  });
  const token = signToken(user._id);

  return {
    user,
    token,
    authorization: `Bearer ${token}`,
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
      PostComment.deleteMany({}),
      Project.deleteMany({}),
      User.deleteMany({}),
    ]);
  });

  it('returns the health status', async () => {
    const { response, body } = await request('/api/health');

    assert.equal(response.status, 200);
    assert.equal(body.status, 'success');
    assert.equal(body.message, 'API is healthy');
    assert.equal(body.services.database, 'connected');
    assert.ok(Number.isInteger(body.uptime));
    assert.ok(!Number.isNaN(Date.parse(body.timestamp)));
    assert.equal(response.headers.has('x-powered-by'), false);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  });

  it('handles malformed, oversized and unknown requests safely', async () => {
    const malformed = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{',
    });
    const malformedBody = await malformed.json();

    assert.equal(malformed.status, 400);
    assert.equal(malformedBody.message, 'Request body contains invalid JSON');

    const oversized = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ payload: 'x'.repeat(1024 * 1024 + 1) }),
    });
    const oversizedBody = await oversized.json();

    assert.equal(oversized.status, 413);
    assert.equal(oversizedBody.message, 'Request body cannot exceed 1mb');

    const unknown = await request('/api/does-not-exist');

    assert.equal(unknown.response.status, 404);
    assert.equal(unknown.body.message, 'Route /api/does-not-exist not found');
  });

  it('only exposes CORS credentials to the configured client origin', async () => {
    const allowed = await fetch(`${baseUrl}/api/health`, {
      headers: {
        Origin: process.env.CLIENT_URL,
      },
    });
    const rejected = await fetch(`${baseUrl}/api/health`, {
      headers: {
        Origin: 'https://malicious.example.com',
      },
    });

    assert.equal(allowed.headers.get('access-control-allow-origin'), process.env.CLIENT_URL);
    assert.equal(allowed.headers.get('access-control-allow-credentials'), 'true');
    assert.equal(rejected.headers.has('access-control-allow-origin'), false);
  });

  it('reports service unavailable when MongoDB is disconnected', async () => {
    await mongoose.disconnect();

    try {
      const { response, body } = await request('/api/health');

      assert.equal(response.status, 503);
      assert.equal(body.status, 'fail');
      assert.equal(body.message, 'API is not ready');
      assert.equal(body.services.database, 'disconnected');
    } finally {
      await mongoose.connect(process.env.MONGODB_URI);
    }
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
    assert.equal(valid.body.message, 'Message received successfully');
    assert.equal(valid.body.data, undefined);

    const stored = await ContactMessage.findOne({ email: 'ada@example.com' });

    assert.equal(stored.name, 'Ada Lovelace');
    assert.equal(stored.status, 'unread');

    const duplicate = await request('/api/contact', {
      method: 'POST',
      body: {
        name: 'Ada Lovelace',
        email: 'ADA@EXAMPLE.COM',
        subject: 'Project inquiry',
        message: 'I would like to talk about a new project.',
      },
    });

    assert.equal(duplicate.response.status, 201);
    assert.equal(await ContactMessage.countDocuments({ email: 'ada@example.com' }), 1);

    const honeypot = await request('/api/contact', {
      method: 'POST',
      body: {
        name: 'Automated Sender',
        email: 'bot@example.com',
        subject: 'Automated message',
        message: 'This message must not be stored.',
        website: 'https://spam.example.com',
      },
    });

    assert.equal(honeypot.response.status, 201);
    assert.equal(honeypot.body.message, 'Message received successfully');
    assert.equal(await ContactMessage.countDocuments({}), 1);
  });

  it('rate limits public contact submissions', async () => {
    const fifthRequest = await request('/api/contact', {
      method: 'POST',
      body: {
        name: 'Grace Hopper',
        email: 'grace@example.com',
        subject: 'Fifth request',
        message: 'This is the final request allowed in the window.',
      },
    });
    const blockedRequest = await request('/api/contact', {
      method: 'POST',
      body: {
        name: 'Grace Hopper',
        email: 'grace@example.com',
        subject: 'Sixth request',
        message: 'This request must be blocked by rate limiting.',
      },
    });

    assert.equal(fifthRequest.response.status, 201);
    assert.equal(blockedRequest.response.status, 429);
    assert.equal(blockedRequest.body.message, 'Too many contact requests. Try again later.');
  });

  it('requires authentication for private contact message routes', async () => {
    const { response, body } = await request('/api/contact/messages');

    assert.equal(response.status, 401);
    assert.equal(body.status, 'fail');
    assert.equal(body.message, 'Authentication token is required');
  });

  it('filters, updates and deletes contact messages as admin', async () => {
    const { authorization } = await seedAuthorizedAdmin();
    const [alpha, beta] = await ContactMessage.create([
      {
        name: 'Alpha Client',
        email: 'alpha@example.com',
        subject: 'Alpha [VIP] inquiry',
        message: 'A detailed unread message for the administrator.',
        status: 'unread',
      },
      {
        name: 'Beta Client',
        email: 'beta@example.com',
        subject: 'Archived inquiry',
        message: 'A message that was already archived.',
        status: 'archived',
      },
    ]);

    const filtered = await request(
      '/api/contact/messages?status=unread&search=%5BVIP%5D&page=1&limit=1&sort=name',
      {
        headers: {
          Authorization: authorization,
        },
      },
    );

    assert.equal(filtered.response.status, 200);
    assert.equal(filtered.body.results, 1);
    assert.equal(filtered.body.pagination.total, 1);
    assert.equal(filtered.body.data.messages[0].email, 'alpha@example.com');

    const invalidQuery = await request('/api/contact/messages?status=unknown&sort=password', {
      headers: {
        Authorization: authorization,
      },
    });

    assert.equal(invalidQuery.response.status, 400);

    const emptyUpdate = await request(`/api/contact/messages/${alpha._id}`, {
      method: 'PATCH',
      headers: {
        Authorization: authorization,
      },
      body: {},
    });

    assert.equal(emptyUpdate.response.status, 400);

    const updated = await request(`/api/contact/messages/${alpha._id}`, {
      method: 'PATCH',
      headers: {
        Authorization: authorization,
      },
      body: {
        status: 'read',
      },
    });

    assert.equal(updated.response.status, 200);
    assert.equal(updated.body.data.contactMessage.status, 'read');

    const missingId = new mongoose.Types.ObjectId();
    const missingUpdate = await request(`/api/contact/messages/${missingId}`, {
      method: 'PATCH',
      headers: {
        Authorization: authorization,
      },
      body: {
        status: 'read',
      },
    });
    const invalidId = await request('/api/contact/messages/not-an-object-id', {
      method: 'PATCH',
      headers: {
        Authorization: authorization,
      },
      body: {
        status: 'read',
      },
    });

    assert.equal(missingUpdate.response.status, 404);
    assert.equal(invalidId.response.status, 400);

    const deleted = await request(`/api/contact/messages/${beta._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: authorization,
      },
    });
    const deletedAgain = await request(`/api/contact/messages/${beta._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: authorization,
      },
    });

    assert.equal(deleted.response.status, 204);
    assert.equal(deletedAgain.response.status, 404);
  });

  it('logs in an admin and returns the current user', async () => {
    const { authorization, token, user } = await seedAdmin();

    const decoded = jwt.decode(token, { complete: true });

    assert.equal(decoded.header.alg, 'HS256');
    assert.equal(decoded.payload.sub, user.id);

    const me = await request('/api/auth/me', {
      headers: {
        Authorization: authorization,
      },
    });

    assert.equal(me.response.status, 200);
    assert.equal(me.body.status, 'success');
    assert.equal(me.body.data.user.email, 'admin@example.com');
    assert.equal(me.body.data.user.role, 'admin');
    assert.equal(me.body.data.user.passwordHash, undefined);
    assert.equal(me.response.headers.get('cache-control'), 'no-store');
  });

  it('normalizes login emails and never exposes password hashes', async () => {
    await User.create({
      name: 'Antonio Admin',
      email: 'admin@example.com',
      passwordHash: 'password123',
    });

    const login = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'ADMIN@EXAMPLE.COM',
        password: 'password123',
      },
    });

    assert.equal(login.response.status, 200);
    assert.equal(login.body.tokenType, 'Bearer');
    assert.equal(login.body.expiresIn, '1h');
    assert.equal(login.body.data.user.email, 'admin@example.com');
    assert.equal(login.body.data.user.passwordHash, undefined);
    assert.equal(login.response.headers.get('cache-control'), 'no-store');
  });

  it('returns the same unauthorized response for invalid credentials', async () => {
    await User.create({
      name: 'Antonio Admin',
      email: 'admin@example.com',
      passwordHash: 'password123',
    });

    const wrongPassword = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@example.com',
        password: 'wrong-password',
      },
    });
    const unknownEmail = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'unknown@example.com',
        password: 'wrong-password',
      },
    });

    assert.equal(wrongPassword.response.status, 401);
    assert.equal(unknownEmail.response.status, 401);
    assert.equal(wrongPassword.body.message, 'Invalid email or password');
    assert.equal(unknownEmail.body.message, 'Invalid email or password');
  });

  it('requests and confirms admin password recovery without exposing account existence', async () => {
    await User.create({
      name: 'Antonio Admin',
      email: 'admin@example.com',
      passwordHash: 'password123',
    });

    const knownEmail = await request('/api/auth/forgot-password', {
      method: 'POST',
      body: {
        email: 'ADMIN@EXAMPLE.COM',
      },
    });
    const unknownEmail = await request('/api/auth/forgot-password', {
      method: 'POST',
      body: {
        email: 'unknown@example.com',
      },
    });

    assert.equal(knownEmail.response.status, 200);
    assert.equal(unknownEmail.response.status, 200);
    assert.equal(knownEmail.body.message, unknownEmail.body.message);
    assert.ok(knownEmail.body.data.resetUrl.startsWith(`${process.env.CLIENT_URL}/admin/reset-password?token=`));
    assert.equal(unknownEmail.body.data, undefined);

    const resetToken = new URL(knownEmail.body.data.resetUrl).searchParams.get('token');
    const storedAdmin = await User.findOne({ email: 'admin@example.com' }).select(
      '+passwordHash +passwordResetToken +passwordResetExpires',
    );

    assert.ok(resetToken);
    assert.notEqual(storedAdmin.passwordResetToken, resetToken);
    assert.ok(storedAdmin.passwordResetExpires > new Date());

    const reset = await request('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: resetToken,
        password: 'new-password-456',
      },
    });

    assert.equal(reset.response.status, 200);
    assert.equal(reset.body.status, 'success');
    assert.ok(reset.body.token);

    const updatedAdmin = await User.findOne({ email: 'admin@example.com' }).select(
      '+passwordHash +passwordResetToken +passwordResetExpires',
    );

    assert.equal(await updatedAdmin.comparePassword('password123'), false);
    assert.equal(await updatedAdmin.comparePassword('new-password-456'), true);
    assert.equal(updatedAdmin.passwordResetToken, undefined);
    assert.equal(updatedAdmin.passwordResetExpires, undefined);

    const reused = await request('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: resetToken,
        password: 'another-password-789',
      },
    });

    assert.equal(reused.response.status, 400);
    assert.equal(reused.body.message, 'Password reset token is invalid or has expired');
  });

  it('rejects malformed tokens and tokens for deleted users', async () => {
    const malformed = await request('/api/auth/me', {
      headers: {
        Authorization: 'Bearer not-a-valid-token',
      },
    });

    assert.equal(malformed.response.status, 401);
    assert.equal(malformed.body.message, 'Invalid or expired token');

    const user = await User.create({
      name: 'Deleted Admin',
      email: 'deleted@example.com',
      passwordHash: 'password123',
    });
    const token = signToken(user._id);
    await user.deleteOne();

    const deleted = await request('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(deleted.response.status, 401);
    assert.equal(deleted.body.message, 'The user for this token no longer exists');
  });

  it('denies admin routes when the authenticated user lacks the admin role', async () => {
    const result = await User.collection.insertOne({
      name: 'Read Only User',
      email: 'reader@example.com',
      passwordHash: 'not-used-in-this-test',
      role: 'reader',
      avatar: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const token = signToken(result.insertedId);

    const response = await request('/api/posts/admin/all', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.response.status, 403);
    assert.equal(response.body.message, 'You do not have permission to perform this action');
  });

  it('protects image uploads and reports missing Cloudinary configuration', async () => {
    const { authorization } = await seedAuthorizedAdmin();
    const unauthenticated = await request('/api/uploads/images', {
      method: 'POST',
      body: {
        dataUrl: 'data:image/png;base64,aGVsbG8=',
        folder: 'projects',
      },
    });
    const invalid = await request('/api/uploads/images', {
      method: 'POST',
      headers: {
        Authorization: authorization,
      },
      body: {
        dataUrl: 'not-an-image',
        folder: 'projects',
      },
    });
    const disabled = await request('/api/uploads/images', {
      method: 'POST',
      headers: {
        Authorization: authorization,
      },
      body: {
        dataUrl: 'data:image/png;base64,aGVsbG8=',
        folder: 'projects',
      },
    });

    assert.equal(unauthenticated.response.status, 401);
    assert.equal(invalid.response.status, 400);
    assert.equal(invalid.body.message, 'Image must be a base64 encoded PNG, JPG, WEBP or GIF data URL');
    assert.equal(disabled.response.status, 503);
    assert.equal(
      disabled.body.message,
      'Image uploads are not configured. Add Cloudinary credentials or paste an existing image URL.',
    );
  });

  it('creates the initial admin only once', async () => {
    const input = {
      name: ' Initial Admin ',
      email: ' INITIAL@EXAMPLE.COM ',
      password: 'password123',
    };

    const first = await ensureAdmin(input);
    const second = await ensureAdmin(input);
    const storedAdmin = await User.findOne({ email: 'initial@example.com' }).select('+passwordHash');

    assert.equal(first.created, true);
    assert.equal(second.created, false);
    assert.equal(await User.countDocuments({ email: 'initial@example.com' }), 1);
    assert.equal(storedAdmin.name, 'Initial Admin');
    assert.equal(await storedAdmin.comparePassword('password123'), true);
  });

  it('resets the password of an existing admin', async () => {
    await ensureAdmin({
      name: 'Initial Admin',
      email: 'initial@example.com',
      password: 'password123',
    });

    await resetAdminPassword({
      email: ' INITIAL@EXAMPLE.COM ',
      password: 'new-password-456',
    });

    const storedAdmin = await User.findOne({ email: 'initial@example.com' }).select('+passwordHash');

    assert.equal(await storedAdmin.comparePassword('password123'), false);
    assert.equal(await storedAdmin.comparePassword('new-password-456'), true);
  });

  it('creates, updates, filters and deletes categories', async () => {
    const { authorization } = await seedAuthorizedAdmin();

    const created = await request('/api/categories', {
      method: 'POST',
      headers: {
        Authorization: authorization,
      },
      body: {
        name: 'Backend',
        slug: 'Desarrollo Backend',
        type: 'post',
      },
    });

    assert.equal(created.response.status, 201);
    assert.equal(created.body.data.category.slug, 'desarrollo-backend');

    const sameSlugDifferentType = await request('/api/categories', {
      method: 'POST',
      headers: {
        Authorization: authorization,
      },
      body: {
        name: 'Backend Projects',
        slug: 'Desarrollo Backend',
        type: 'project',
      },
    });

    assert.equal(sameSlugDifferentType.response.status, 201);

    const duplicate = await request('/api/categories', {
      method: 'POST',
      headers: {
        Authorization: authorization,
      },
      body: {
        name: 'Duplicate Backend',
        slug: 'Desarrollo Backend',
        type: 'post',
      },
    });

    assert.equal(duplicate.response.status, 409);

    const publicList = await request('/api/categories?type=post');

    assert.equal(publicList.response.status, 200);
    assert.equal(publicList.body.results, 1);
    assert.equal(publicList.body.data.categories[0].name, 'Backend');

    const invalidQuery = await request('/api/categories?type=unknown');

    assert.equal(invalidQuery.response.status, 400);

    const emptyUpdate = await request(`/api/categories/${created.body.data.category._id}`, {
      method: 'PATCH',
      headers: {
        Authorization: authorization,
      },
      body: {},
    });

    assert.equal(emptyUpdate.response.status, 400);

    const updated = await request(`/api/categories/${created.body.data.category._id}`, {
      method: 'PATCH',
      headers: {
        Authorization: authorization,
      },
      body: {
        name: 'Node Backend',
        slug: 'Node y Express',
      },
    });

    assert.equal(updated.response.status, 200);
    assert.equal(updated.body.data.category.name, 'Node Backend');
    assert.equal(updated.body.data.category.slug, 'node-y-express');

    const deleted = await request(`/api/categories/${created.body.data.category._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: authorization,
      },
    });
    const deletedAgain = await request(`/api/categories/${created.body.data.category._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: authorization,
      },
    });

    assert.equal(deleted.response.status, 204);
    assert.equal(deletedAgain.response.status, 404);
  });

  it('validates, normalizes and creates projects', async () => {
    const { authorization } = await seedAuthorizedAdmin();

    const missingFields = await request('/api/projects', {
      method: 'POST',
      headers: {
        Authorization: authorization,
      },
      body: {
        title: 'Incomplete project',
      },
    });

    assert.equal(missingFields.response.status, 400);
    assert.match(missingFields.body.message, /Summary is required/);

    const invalidUrl = await request('/api/projects', {
      method: 'POST',
      headers: {
        Authorization: authorization,
      },
      body: {
        title: 'Invalid URL project',
        summary: 'A project with an invalid URL.',
        description: 'The URL validator should reject this payload.',
        liveUrl: 'javascript:alert(1)',
      },
    });

    assert.equal(invalidUrl.response.status, 400);
    assert.match(invalidUrl.body.message, /Live URL must be a valid HTTP or HTTPS URL/);

    const created = await request('/api/projects', {
      method: 'POST',
      headers: {
        Authorization: authorization,
      },
      body: {
        title: 'Portfolio API',
        slug: 'Mi Proyecto Técnico',
        summary: 'API for portfolio content.',
        description: 'A tested Express and MongoDB API for portfolio content.',
        role: ' Fullstack developer ',
        challenge: 'Centralize scattered academic evaluations.',
        solution: 'A role-based workflow for instruments, results and reports.',
        results: [' Printable reports ', 'Student dashboard', 'Printable reports'],
        coverImage: '/projects/eval-apro/cover.webp',
        gallery: ['/projects/eval-apro/dashboard.webp', '/projects/eval-apro/dashboard.webp'],
        technologies: ['Node.js', 'MongoDB', 'Node.js'],
        category: 'FullStack',
        featured: true,
        liveUrl: 'https://example.com',
        repoUrl: 'https://github.com/example/project',
        startDate: '2026-01-01',
        endDate: '2026-02-01',
      },
    });

    assert.equal(created.response.status, 201);
    assert.equal(created.body.data.project.slug, 'mi-proyecto-tecnico');
    assert.equal(created.body.data.project.category, 'fullstack');
    assert.equal(created.body.data.project.role, 'Fullstack developer');
    assert.equal(created.body.data.project.challenge, 'Centralize scattered academic evaluations.');
    assert.equal(created.body.data.project.solution, 'A role-based workflow for instruments, results and reports.');
    assert.deepEqual(created.body.data.project.results, ['Printable reports', 'Student dashboard']);
    assert.equal(created.body.data.project.coverImage, '/projects/eval-apro/cover.webp');
    assert.deepEqual(created.body.data.project.technologies, ['Node.js', 'MongoDB']);
    assert.deepEqual(created.body.data.project.gallery, ['/projects/eval-apro/dashboard.webp']);

    const bySlug = await request('/api/projects/MI-PROYECTO-TECNICO');

    assert.equal(bySlug.response.status, 200);
    assert.equal(bySlug.body.data.project.title, 'Portfolio API');

    const duplicate = await request('/api/projects', {
      method: 'POST',
      headers: {
        Authorization: authorization,
      },
      body: {
        title: 'Another project',
        slug: 'Mi Proyecto Técnico',
        summary: 'This slug is already in use.',
        description: 'Duplicate slugs must return a conflict response.',
      },
    });

    assert.equal(duplicate.response.status, 409);
    assert.match(duplicate.body.message, /Duplicate value for field: slug/);
  });

  it('filters, searches, sorts and paginates projects safely', async () => {
    await Project.create([
      {
        title: 'Alpha React',
        summary: 'React portfolio interface.',
        description: 'A completed React project.',
        category: 'fullstack',
        status: 'completed',
        featured: true,
      },
      {
        title: 'Beta React',
        summary: 'Another React interface.',
        description: 'A second completed React project.',
        category: 'fullstack',
        status: 'completed',
        featured: true,
      },
      {
        title: 'Gamma Node',
        summary: 'Node backend service.',
        description: 'A planned backend project.',
        challenge: 'Coordinate rubric-driven feedback across roles.',
        category: 'backend',
        status: 'planned',
      },
      {
        title: 'Regex [Demo]',
        summary: 'Literal search characters.',
        description: 'Search input is escaped before creating a regex.',
        category: 'fullstack',
        status: 'archived',
        featured: true,
      },
    ]);

    const firstPage = await request(
      '/api/projects?category=FULLSTACK&status=completed&featured=true&search=React&page=1&limit=1&sort=title',
    );
    const secondPage = await request(
      '/api/projects?category=fullstack&status=completed&featured=true&search=React&page=2&limit=1&sort=title',
    );

    assert.equal(firstPage.response.status, 200);
    assert.equal(firstPage.body.results, 1);
    assert.equal(firstPage.body.pagination.total, 2);
    assert.equal(firstPage.body.pagination.pages, 2);
    assert.equal(firstPage.body.data.projects[0].title, 'Alpha React');
    assert.equal(secondPage.body.data.projects[0].title, 'Beta React');

    const literalSearch = await request('/api/projects?search=%5BDemo%5D');

    assert.equal(literalSearch.response.status, 200);
    assert.equal(literalSearch.body.results, 1);
    assert.equal(literalSearch.body.data.projects[0].title, 'Regex [Demo]');

    const caseStudySearch = await request('/api/projects?search=rubric-driven');

    assert.equal(caseStudySearch.response.status, 200);
    assert.equal(caseStudySearch.body.results, 1);
    assert.equal(caseStudySearch.body.data.projects[0].title, 'Gamma Node');

    const invalidQuery = await request('/api/projects?featured=yes&status=unknown&sort=password');

    assert.equal(invalidQuery.response.status, 400);
    assert.match(invalidQuery.body.message, /Featured must be true or false/);
    assert.match(invalidQuery.body.message, /Sort fields must be one of/);
  });

  it('returns at most six completed featured projects', async () => {
    await Project.create(
      Array.from({ length: 7 }, (_, index) => ({
        title: `Featured ${index + 1}`,
        summary: `Featured project ${index + 1}.`,
        description: 'A completed featured project.',
        status: 'completed',
        featured: true,
      })),
    );
    await Project.create({
      title: 'Planned Featured',
      summary: 'This project is not completed.',
      description: 'It must not appear in the featured endpoint.',
      status: 'planned',
      featured: true,
    });

    const featured = await request('/api/projects/featured');

    assert.equal(featured.response.status, 200);
    assert.equal(featured.body.results, 6);
    assert.ok(featured.body.data.projects.every((project) => project.status === 'completed'));
  });

  it('updates and deletes projects with consistent errors', async () => {
    const { authorization } = await seedAuthorizedAdmin();
    const project = await Project.create({
      title: 'Original Project',
      summary: 'Original summary.',
      description: 'Original project description.',
      startDate: '2026-01-01',
      endDate: '2026-02-01',
    });

    const emptyUpdate = await request(`/api/projects/${project._id}`, {
      method: 'PATCH',
      headers: {
        Authorization: authorization,
      },
      body: {},
    });

    assert.equal(emptyUpdate.response.status, 400);
    assert.equal(emptyUpdate.body.message, 'At least one valid field is required');

    const invalidDates = await request(`/api/projects/${project._id}`, {
      method: 'PATCH',
      headers: {
        Authorization: authorization,
      },
      body: {
        endDate: '2025-12-31',
      },
    });

    assert.equal(invalidDates.response.status, 400);
    assert.match(invalidDates.body.message, /Project end date cannot be before start date/);

    const updated = await request(`/api/projects/${project._id}`, {
      method: 'PATCH',
      headers: {
        Authorization: authorization,
      },
      body: {
        title: 'Updated Project',
        slug: 'Updated Custom Slug',
        status: 'in-progress',
        featured: true,
        technologies: ['Node.js', 'Node.js', 'Express'],
      },
    });

    assert.equal(updated.response.status, 200);
    assert.equal(updated.body.data.project.slug, 'updated-custom-slug');
    assert.equal(updated.body.data.project.status, 'in-progress');
    assert.deepEqual(updated.body.data.project.technologies, ['Node.js', 'Express']);

    const missingId = new mongoose.Types.ObjectId();
    const missingUpdate = await request(`/api/projects/${missingId}`, {
      method: 'PATCH',
      headers: {
        Authorization: authorization,
      },
      body: {
        featured: true,
      },
    });

    assert.equal(missingUpdate.response.status, 404);

    const invalidId = await request('/api/projects/not-an-object-id', {
      method: 'PATCH',
      headers: {
        Authorization: authorization,
      },
      body: {
        featured: true,
      },
    });

    assert.equal(invalidId.response.status, 400);

    const deleted = await request(`/api/projects/${project._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: authorization,
      },
    });

    assert.equal(deleted.response.status, 204);

    const afterDelete = await request('/api/projects/updated-custom-slug');
    const deleteAgain = await request(`/api/projects/${project._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: authorization,
      },
    });

    assert.equal(afterDelete.response.status, 404);
    assert.equal(deleteAgain.response.status, 404);
  });

  it('validates, normalizes and creates Markdown posts', async () => {
    const { authorization } = await seedAuthorizedAdmin();

    const missingFields = await request('/api/posts', {
      method: 'POST',
      headers: {
        Authorization: authorization,
      },
      body: {
        title: 'Incomplete Post',
      },
    });

    assert.equal(missingFields.response.status, 400);
    assert.match(missingFields.body.message, /Excerpt is required/);

    const invalidPayload = await request('/api/posts', {
      method: 'POST',
      headers: {
        Authorization: authorization,
      },
      body: {
        title: 'Invalid Post',
        excerpt: 'This post has invalid fields.',
        content: '# Invalid',
        coverImage: 'file:///private/image.jpg',
        tags: ['valid', ''],
      },
    });

    assert.equal(invalidPayload.response.status, 400);
    assert.match(invalidPayload.body.message, /Cover image must be a valid HTTP or HTTPS URL/);
    assert.match(invalidPayload.body.message, /Tags must be an array of non-empty strings/);

    const published = await request('/api/posts', {
      method: 'POST',
      headers: {
        Authorization: authorization,
      },
      body: {
        title: 'Published Markdown Post',
        slug: 'Guía de API Segura',
        excerpt: 'This published Markdown post should be public.',
        content: `# API Security\n\n${'word '.repeat(401)}`,
        coverImage: 'https://example.com/post.jpg',
        category: 'Backend',
        status: 'published',
        featured: true,
        tags: ['API', 'Testing', ' api '],
      },
    });

    assert.equal(published.response.status, 201);
    assert.equal(published.body.data.post.slug, 'guia-de-api-segura');
    assert.equal(published.body.data.post.category, 'backend');
    assert.equal(published.body.data.post.tags[0], 'api');
    assert.deepEqual(published.body.data.post.tags, ['api', 'testing']);
    assert.equal(published.body.data.post.readingTime, 3);
    assert.ok(published.body.data.post.publishedAt);

    const bySlug = await request('/api/posts/GUIA-DE-API-SEGURA');

    assert.equal(bySlug.response.status, 200);
    assert.equal(bySlug.body.data.post.title, 'Published Markdown Post');
    assert.equal(bySlug.body.data.post.author.name, 'Authorized Admin');
    assert.equal(bySlug.body.data.post.author.email, undefined);

    const duplicate = await request('/api/posts', {
      method: 'POST',
      headers: {
        Authorization: authorization,
      },
      body: {
        title: 'Duplicate Post',
        slug: 'Guía de API Segura',
        excerpt: 'This slug is already used.',
        content: '# Duplicate',
      },
    });

    assert.equal(duplicate.response.status, 409);
  });

  it('keeps drafts and scheduled posts out of public listings', async () => {
    const { user, authorization } = await seedAuthorizedAdmin();
    const past = new Date(Date.now() - 60_000);
    const future = new Date(Date.now() + 86_400_000);

    await Post.create([
      {
        title: 'Alpha [Guide]',
        excerpt: 'A public API guide.',
        content: '# Alpha',
        author: user._id,
        category: 'backend',
        tags: ['api', 'testing'],
        status: 'published',
        featured: true,
        publishedAt: past,
      },
      {
        title: 'Beta Guide',
        excerpt: 'A second public API guide.',
        content: '# Beta',
        author: user._id,
        category: 'backend',
        tags: ['api'],
        status: 'published',
        featured: true,
        publishedAt: past,
      },
      {
        title: 'Private Draft',
        excerpt: 'This draft is private.',
        content: '# Draft',
        author: user._id,
        status: 'draft',
      },
      {
        title: 'Scheduled Post',
        excerpt: 'This post is not public yet.',
        content: '# Scheduled',
        author: user._id,
        status: 'published',
        publishedAt: future,
      },
    ]);

    const publicList = await request('/api/posts');

    assert.equal(publicList.response.status, 200);
    assert.equal(publicList.body.results, 2);
    assert.ok(publicList.body.data.posts.every((post) => post.status === 'published'));

    const filtered = await request(
      '/api/posts?category=BACKEND&tag=API&featured=true&search=Guide&page=1&limit=1&sort=title',
    );

    assert.equal(filtered.response.status, 200);
    assert.equal(filtered.body.results, 1);
    assert.equal(filtered.body.pagination.total, 2);
    assert.equal(filtered.body.pagination.pages, 2);
    assert.equal(filtered.body.data.posts[0].title, 'Alpha [Guide]');

    const literalSearch = await request('/api/posts?search=%5BGuide%5D');

    assert.equal(literalSearch.response.status, 200);
    assert.equal(literalSearch.body.results, 1);
    assert.equal(literalSearch.body.data.posts[0].title, 'Alpha [Guide]');

    const adminDrafts = await request('/api/posts/admin/all?status=draft', {
      headers: {
        Authorization: authorization,
      },
    });
    const adminPublished = await request('/api/posts/admin/all?status=published', {
      headers: {
        Authorization: authorization,
      },
    });

    assert.equal(adminDrafts.response.status, 200);
    assert.equal(adminDrafts.body.results, 1);
    assert.equal(adminPublished.body.results, 3);

    const invalidPublicQuery = await request('/api/posts?featured=yes&sort=password');
    const invalidAdminQuery = await request('/api/posts/admin/all?status=unknown', {
      headers: {
        Authorization: authorization,
      },
    });

    assert.equal(invalidPublicQuery.response.status, 400);
    assert.equal(invalidAdminQuery.response.status, 400);
  });

  it('returns at most six currently published featured posts', async () => {
    const { user } = await seedAuthorizedAdmin();
    const past = new Date(Date.now() - 60_000);

    await Post.create(
      Array.from({ length: 7 }, (_, index) => ({
        title: `Featured Post ${index + 1}`,
        excerpt: `Featured excerpt ${index + 1}.`,
        content: '# Featured',
        author: user._id,
        status: 'published',
        featured: true,
        publishedAt: past,
      })),
    );
    await Post.create({
      title: 'Future Featured Post',
      excerpt: 'This post is scheduled.',
      content: '# Future',
      author: user._id,
      status: 'published',
      featured: true,
      publishedAt: new Date(Date.now() + 86_400_000),
    });

    const featured = await request('/api/posts/featured');

    assert.equal(featured.response.status, 200);
    assert.equal(featured.body.results, 6);
    assert.ok(featured.body.data.posts.every((post) => new Date(post.publishedAt) <= new Date()));
  });

  it('moderates public post comments without exposing emails', async () => {
    const { user, authorization } = await seedAuthorizedAdmin();
    const post = await Post.create({
      title: 'Commented Post',
      excerpt: 'A public post that accepts comments.',
      content: '# Comments',
      author: user._id,
      status: 'published',
      publishedAt: new Date(Date.now() - 60_000),
    });
    await Post.create({
      title: 'Private Post',
      excerpt: 'This draft should not accept comments.',
      content: '# Draft',
      author: user._id,
      status: 'draft',
    });

    const invalid = await request(`/api/posts/${post.slug}/comments`, {
      method: 'POST',
      body: {
        authorName: 'A',
        authorEmail: 'invalid',
        message: 'No',
      },
    });

    assert.equal(invalid.response.status, 400);
    assert.match(invalid.body.message, /Email must be a valid email/);

    const created = await request(`/api/posts/${post.slug}/comments`, {
      method: 'POST',
      body: {
        authorName: 'Ada Lovelace',
        authorEmail: 'Ada@Example.com',
        authorAvatar: 'https://example.com/ada.png',
        message: 'This article is useful.',
      },
    });

    assert.equal(created.response.status, 201);
    assert.equal(created.body.data.comment.authorName, 'Ada Lovelace');
    assert.equal(created.body.data.comment.authorAvatar, 'https://example.com/ada.png');
    assert.equal(created.body.data.comment.authorEmail, undefined);
    assert.equal(created.body.data.comment.status, 'hidden');
    assert.equal(await PostComment.countDocuments({ post: post._id }), 1);

    const stored = await PostComment.findById(created.body.data.comment._id).select('+authorEmail');

    assert.equal(stored.authorEmail, 'ada@example.com');

    const pending = await request('/api/posts/admin/comments?status=hidden&search=ada', {
      headers: {
        Authorization: authorization,
      },
    });

    assert.equal(pending.response.status, 200);
    assert.equal(pending.body.results, 1);
    assert.equal(pending.body.data.comments[0].authorEmail, 'ada@example.com');
    assert.equal(pending.body.data.comments[0].post.title, 'Commented Post');

    const hiddenFromPublic = await request(`/api/posts/${post.slug}/comments?limit=5&sort=-createdAt`);

    assert.equal(hiddenFromPublic.response.status, 200);
    assert.equal(hiddenFromPublic.body.results, 0);

    const approved = await request(`/api/posts/admin/comments/${created.body.data.comment._id}`, {
      method: 'PATCH',
      headers: {
        Authorization: authorization,
      },
      body: {
        status: 'visible',
      },
    });

    assert.equal(approved.response.status, 200);
    assert.equal(approved.body.data.comment.status, 'visible');

    const reply = await request(`/api/posts/${post.slug}/comments/${created.body.data.comment._id}/replies`, {
      method: 'POST',
      body: {
        authorName: 'Antonio Trinidad',
        authorEmail: 'hi@antoniotrinidad.dev',
        authorAvatar: 'https://example.com/antonio.png',
        message: 'Gracias por leerlo.',
      },
    });

    assert.equal(reply.response.status, 201);
    assert.equal(reply.body.data.reply.authorName, 'Antonio Trinidad');
    assert.equal(reply.body.data.reply.authorAvatar, 'https://example.com/antonio.png');
    assert.equal(reply.body.data.reply.authorEmail, undefined);

    const listed = await request(`/api/posts/${post.slug}/comments?limit=5&sort=-createdAt`);

    assert.equal(listed.response.status, 200);
    assert.equal(listed.body.results, 1);
    assert.equal(listed.body.data.comments[0].message, 'This article is useful.');
    assert.equal(listed.body.data.comments[0].authorEmail, undefined);
    assert.equal(listed.body.data.comments[0].replies[0].message, 'Gracias por leerlo.');
    assert.equal(listed.body.data.comments[0].replies[0].authorEmail, undefined);

    const removed = await request(`/api/posts/admin/comments/${created.body.data.comment._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: authorization,
      },
    });

    assert.equal(removed.response.status, 204);
    assert.equal(await PostComment.countDocuments({ post: post._id }), 0);

    const hidden = await request('/api/posts/private-post/comments', {
      method: 'POST',
      body: {
        authorName: 'Ada Lovelace',
        authorEmail: 'ada@example.com',
        message: 'Draft comments should fail.',
      },
    });

    assert.equal(hidden.response.status, 404);

    const honeypot = await request(`/api/posts/${post.slug}/comments`, {
      method: 'POST',
      body: {
        authorName: 'Spam Sender',
        authorEmail: 'spam@example.com',
        message: 'This should not be stored.',
        website: 'https://spam.example.com',
      },
    });

    assert.equal(honeypot.response.status, 201);
    assert.equal(await PostComment.countDocuments({ post: post._id }), 0);
  });

  it('updates publication state and deletes posts with consistent errors', async () => {
    const { user, authorization } = await seedAuthorizedAdmin();
    const post = await Post.create({
      title: 'Draft Lifecycle',
      excerpt: 'A post used to test lifecycle changes.',
      content: '# Draft',
      author: user._id,
      status: 'draft',
    });

    const hiddenDraft = await request('/api/posts/draft-lifecycle');

    assert.equal(hiddenDraft.response.status, 404);

    const emptyUpdate = await request(`/api/posts/${post._id}`, {
      method: 'PATCH',
      headers: {
        Authorization: authorization,
      },
      body: {},
    });

    assert.equal(emptyUpdate.response.status, 400);

    const published = await request(`/api/posts/${post._id}`, {
      method: 'PATCH',
      headers: {
        Authorization: authorization,
      },
      body: {
        slug: 'Published Lifecycle',
        content: `# Published\n\n${'word '.repeat(201)}`,
        tags: ['Node', 'node', 'Express'],
        status: 'published',
      },
    });

    assert.equal(published.response.status, 200);
    assert.equal(published.body.data.post.slug, 'published-lifecycle');
    assert.equal(published.body.data.post.readingTime, 2);
    assert.deepEqual(published.body.data.post.tags, ['node', 'express']);
    assert.ok(published.body.data.post.publishedAt);

    const publicPost = await request('/api/posts/published-lifecycle');

    assert.equal(publicPost.response.status, 200);

    const returnedToDraft = await request(`/api/posts/${post._id}`, {
      method: 'PATCH',
      headers: {
        Authorization: authorization,
      },
      body: {
        status: 'draft',
      },
    });

    assert.equal(returnedToDraft.response.status, 200);
    assert.equal(returnedToDraft.body.data.post.publishedAt, undefined);

    const hiddenAgain = await request('/api/posts/published-lifecycle');
    assert.equal(hiddenAgain.response.status, 404);

    const missingId = new mongoose.Types.ObjectId();
    const missingUpdate = await request(`/api/posts/${missingId}`, {
      method: 'PATCH',
      headers: {
        Authorization: authorization,
      },
      body: {
        featured: true,
      },
    });
    const invalidId = await request('/api/posts/not-an-object-id', {
      method: 'PATCH',
      headers: {
        Authorization: authorization,
      },
      body: {
        featured: true,
      },
    });

    assert.equal(missingUpdate.response.status, 404);
    assert.equal(invalidId.response.status, 400);

    const deleted = await request(`/api/posts/${post._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: authorization,
      },
    });
    const deletedAgain = await request(`/api/posts/${post._id}`, {
      method: 'DELETE',
      headers: {
        Authorization: authorization,
      },
    });

    assert.equal(deleted.response.status, 204);
    assert.equal(deletedAgain.response.status, 404);
  });
});
