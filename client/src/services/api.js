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
  getFeaturedProjects: () => http.get('/projects/featured'),
  getProject: (slug) => http.get(`/projects/${encodeURIComponent(slug)}`),
  getPosts: (query) => http.get('/posts', { query }),
  getAdminPosts: (query, options) => http.get('/posts/admin/all', { ...options, query }),
  getFeaturedPosts: () => http.get('/posts/featured'),
  getPost: (slug) => http.get(`/posts/${encodeURIComponent(slug)}`),
  getCategories: (query, options) => http.get('/categories', { ...options, query }),
  sendMessage: (payload) => http.post('/contact', payload),
  getMessages: (query, options) => http.get('/contact/messages', { ...options, query }),
};

export { ApiError, isApiError } from './httpClient.js';
