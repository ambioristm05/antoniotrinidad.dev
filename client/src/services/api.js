import { env } from '../config/env.js';
import { clearAccessToken, getAccessToken } from './authToken.js';
import { createHttpClient } from './httpClient.js';

const http = createHttpClient({
  baseUrl: env.apiUrl,
  getAccessToken,
  onUnauthorized: clearAccessToken,
});

export const api = {
  getHealth: () => http.get('/health'),
  login: (credentials) => http.post('/auth/login', credentials),
  logout: () => http.post('/auth/logout'),
  getMe: () => http.get('/auth/me'),
  getProjects: (query, options) => http.get('/projects', { ...options, query }),
  getFeaturedProjects: (options) => http.get('/projects/featured', options),
  getProject: (slug, options) => http.get(`/projects/${encodeURIComponent(slug)}`, options),
  createProject: (payload, options) => http.post('/projects', payload, options),
  updateProject: (id, payload, options) =>
    http.patch(`/projects/${encodeURIComponent(id)}`, payload, options),
  deleteProject: (id, options) => http.delete(`/projects/${encodeURIComponent(id)}`, options),
  getPosts: (query, options) => http.get('/posts', { ...options, query }),
  getAdminPosts: (query, options) => http.get('/posts/admin/all', { ...options, query }),
  getFeaturedPosts: (options) => http.get('/posts/featured', options),
  getPost: (slug, options) => http.get(`/posts/${encodeURIComponent(slug)}`, options),
  createPost: (payload, options) => http.post('/posts', payload, options),
  updatePost: (id, payload, options) =>
    http.patch(`/posts/${encodeURIComponent(id)}`, payload, options),
  deletePost: (id, options) => http.delete(`/posts/${encodeURIComponent(id)}`, options),
  getCategories: (query, options) => http.get('/categories', { ...options, query }),
  createCategory: (payload, options) => http.post('/categories', payload, options),
  updateCategory: (id, payload, options) =>
    http.patch(`/categories/${encodeURIComponent(id)}`, payload, options),
  deleteCategory: (id, options) => http.delete(`/categories/${encodeURIComponent(id)}`, options),
  sendMessage: (payload, options) => http.post('/contact', payload, options),
  getMessages: (query, options) => http.get('/contact/messages', { ...options, query }),
  updateMessage: (id, payload, options) =>
    http.patch(`/contact/messages/${encodeURIComponent(id)}`, payload, options),
  deleteMessage: (id, options) =>
    http.delete(`/contact/messages/${encodeURIComponent(id)}`, options),
};

export { ApiError, isApiError } from './httpClient.js';
