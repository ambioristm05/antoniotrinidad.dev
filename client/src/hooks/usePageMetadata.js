import { useEffect } from 'react';

import {
  buildCanonicalUrl,
  buildPageTitle,
  defaultDescription,
  resolveSocialImage,
  siteName,
} from '../services/seo.js';

const setMeta = (attribute, key, content) => {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

export function usePageMetadata({
  title,
  description = defaultDescription,
  path = '/',
  image,
  type = 'website',
  noIndex = false,
  structuredData,
} = {}) {
  const structuredDataJson = structuredData ? JSON.stringify(structuredData) : '';

  useEffect(() => {
    const pageTitle = buildPageTitle(title);
    const canonicalUrl = buildCanonicalUrl(path);
    const socialImage = resolveSocialImage(image);
    document.title = pageTitle;

    setMeta('name', 'description', description);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:site_name', siteName);
    setMeta('property', 'og:title', pageTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:image', socialImage);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', pageTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', socialImage);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    let script = document.head.querySelector('#page-structured-data');
    if (structuredDataJson) {
      if (!script) {
        script = document.createElement('script');
        script.id = 'page-structured-data';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = structuredDataJson;
    } else {
      script?.remove();
    }
  }, [description, image, noIndex, path, structuredDataJson, title, type]);
}
