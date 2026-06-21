import { api } from './api.js';

const getTotal = (response, collection) =>
  response?.pagination?.total ?? response?.data?.[collection]?.length ?? 0;

export const createAdminDashboardService = (apiClient) => async ({ signal } = {}) => {
  const options = { signal };
  const [projectsResponse, postsResponse, draftsResponse, messagesResponse] = await Promise.all([
    apiClient.getProjects({ limit: 5, sort: '-createdAt' }, options),
    apiClient.getAdminPosts({ limit: 5, sort: '-createdAt' }, options),
    apiClient.getAdminPosts({ status: 'draft', limit: 1 }, options),
    apiClient.getMessages({ status: 'unread', limit: 1 }, options),
  ]);

  return {
    stats: {
      projects: getTotal(projectsResponse, 'projects'),
      posts: getTotal(postsResponse, 'posts'),
      messages: getTotal(messagesResponse, 'messages'),
      drafts: getTotal(draftsResponse, 'posts'),
    },
    recentProjects: projectsResponse?.data?.projects ?? [],
    recentPosts: postsResponse?.data?.posts ?? [],
  };
};

export const getAdminDashboard = createAdminDashboardService(api);
