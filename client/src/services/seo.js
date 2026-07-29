import { env } from '../config/env.js';

export const siteName = 'Antonio Trinidad';
export const defaultDescription = 'Portafolio y blog de Antonio Trinidad Mercedes, desarrollador Fullstack especializado en Next.js y el ecosistema MERN.';
export const defaultImage = `${env.siteUrl}/brand/antonio-trinidad-logo.png`;

export const buildPageTitle = (title) => (title ? `${title} | ${siteName}` : `${siteName} | FullStack Developer`);

export const buildCanonicalUrl = (path = '/') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, `${env.siteUrl}/`).toString();
};

export const resolveSocialImage = (image) => (image ? new URL(image, `${env.siteUrl}/`).toString() : defaultImage);
