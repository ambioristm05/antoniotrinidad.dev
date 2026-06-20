const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? 'No se pudo completar la solicitud.');
  }

  return response.json();
}

export const api = {
  getProjects: () => request('/projects'),
  getFeaturedProjects: () => request('/projects/featured'),
  getProject: (slug) => request(`/projects/${slug}`),
  getPosts: () => request('/posts'),
  getFeaturedPosts: () => request('/posts/featured'),
  getPost: (slug) => request(`/posts/${slug}`),
  sendMessage: (payload) =>
    request('/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
