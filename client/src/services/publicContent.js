export const getProjectCategories = (projects) =>
  [...new Set(projects.map((project) => project.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));

export const filterProjects = (projects, category) =>
  category ? projects.filter((project) => project.category === category) : projects;

export const filterPosts = (posts, query) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return posts;

  return posts.filter((post) =>
    [post.title, post.excerpt, post.category, ...(post.tags ?? [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery),
  );
};
