import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicLayout from './layouts/PublicLayout.jsx';
import HomePage from './pages/HomePage.jsx';

const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const AdminCategoriesPage = lazy(() => import('./pages/AdminCategoriesPage.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage.jsx'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout.jsx'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage.jsx'));
const AdminMessagesPage = lazy(() => import('./pages/AdminMessagesPage.jsx'));
const AdminPostsPage = lazy(() => import('./pages/AdminPostsPage.jsx'));
const AdminProjectsPage = lazy(() => import('./pages/AdminProjectsPage.jsx'));
const BlogPage = lazy(() => import('./pages/BlogPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage.jsx'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage.jsx'));

const routeElement = (Component, props) => (
  <Suspense fallback={<div className="route-loading" aria-busy="true" aria-label="Cargando" role="status" />}>
    <Component {...props} />
  </Suspense>
);

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={routeElement(AboutPage)} />
        <Route path="projects" element={routeElement(ProjectsPage)} />
        <Route path="projects/:slug" element={routeElement(ProjectDetailPage)} />
        <Route path="blog" element={routeElement(BlogPage)} />
        <Route path="blog/:slug" element={routeElement(PostDetailPage)} />
        <Route path="contact" element={routeElement(ContactPage)} />
        <Route path="privacy" element={routeElement(PrivacyPage)} />
      </Route>

      <Route path="admin/login" element={routeElement(AdminLoginPage)} />
      <Route element={<ProtectedRoute />}>
        <Route path="admin" element={routeElement(AdminLayout)}>
          <Route index element={routeElement(AdminDashboardPage)} />
          <Route path="projects" element={routeElement(AdminProjectsPage)} />
          <Route path="projects/new" element={routeElement(AdminProjectsPage, { mode: 'new' })} />
          <Route path="projects/:id/edit" element={routeElement(AdminProjectsPage, { mode: 'edit' })} />
          <Route path="posts" element={routeElement(AdminPostsPage)} />
          <Route path="posts/new" element={routeElement(AdminPostsPage, { mode: 'new' })} />
          <Route path="posts/:id/edit" element={routeElement(AdminPostsPage, { mode: 'edit' })} />
          <Route path="categories" element={routeElement(AdminCategoriesPage)} />
          <Route path="messages" element={routeElement(AdminMessagesPage)} />
        </Route>
      </Route>

      <Route path="*" element={routeElement(NotFoundPage)} />
    </Routes>
  );
}
