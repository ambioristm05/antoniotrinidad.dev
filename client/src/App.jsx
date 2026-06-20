import { Route, Routes } from 'react-router-dom';

import PublicLayout from './layouts/PublicLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import AboutPage from './pages/AboutPage.jsx';
import AdminCategoriesPage from './pages/AdminCategoriesPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminMessagesPage from './pages/AdminMessagesPage.jsx';
import AdminPostsPage from './pages/AdminPostsPage.jsx';
import AdminProjectsPage from './pages/AdminProjectsPage.jsx';
import BlogPage from './pages/BlogPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PostDetailPage from './pages/PostDetailPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:slug" element={<ProjectDetailPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:slug" element={<PostDetailPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
      </Route>

      <Route path="admin/login" element={<AdminLoginPage />} />
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="projects" element={<AdminProjectsPage />} />
        <Route path="projects/new" element={<AdminProjectsPage mode="new" />} />
        <Route path="projects/:id/edit" element={<AdminProjectsPage mode="edit" />} />
        <Route path="posts" element={<AdminPostsPage />} />
        <Route path="posts/new" element={<AdminPostsPage mode="new" />} />
        <Route path="posts/:id/edit" element={<AdminPostsPage mode="edit" />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="messages" element={<AdminMessagesPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
