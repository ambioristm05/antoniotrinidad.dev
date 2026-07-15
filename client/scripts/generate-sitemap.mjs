import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();

const readEnvironment = async () => {
  const values = {};

  for (const filename of ['.env', '.env.production']) {
    try {
      const content = await readFile(path.join(projectRoot, filename), 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (match) values[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  return { ...values, ...process.env };
};

const escapeXml = (value) =>
  String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

const unescapeXml = (value) =>
  String(value).replaceAll('&apos;', "'").replaceAll('&quot;', '"').replaceAll('&gt;', '>').replaceAll('&lt;', '<').replaceAll('&amp;', '&');

const toEntry = (siteUrl, route, lastModified) => ({
  loc: new URL(route, `${siteUrl}/`).toString(),
  lastmod: lastModified ? new Date(lastModified).toISOString().slice(0, 10) : undefined,
});

const readExistingEntries = async (sitemapPath) => {
  try {
    const xml = await readFile(sitemapPath, 'utf8');
    const matches = xml.matchAll(/<url>\s*<loc>(.*?)<\/loc>(?:\s*<lastmod>(.*?)<\/lastmod>)?\s*<\/url>/gs);

    return [...matches].map((match) => ({
      loc: unescapeXml(match[1]),
      lastmod: match[2] ? unescapeXml(match[2]) : undefined,
    }));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
};

const fetchItems = async (url, collection) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  const payload = await response.json();
  return payload.data?.[collection] ?? [];
};

const environment = await readEnvironment();
const siteUrl = (environment.VITE_SITE_URL || 'https://www.antoniotrinidad.dev').replace(/\/+$/, '');
const apiUrl = (environment.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
const sitemapPath = path.join(projectRoot, 'public', 'sitemap.xml');
const staticRoutes = ['/', '/about', '/projects', '/blog', '/contact', '/privacy'];
const entries = staticRoutes.map((route) => toEntry(siteUrl, route));
const staticLocs = new Set(entries.map((entry) => entry.loc));
const existingDynamicEntries = (await readExistingEntries(sitemapPath))
  .filter((entry) => !staticLocs.has(entry.loc));

const dynamicRequests = [
  {
    label: 'projects',
    request: fetchItems(`${apiUrl}/projects?status=completed&limit=100&sort=-updatedAt`, 'projects'),
    toEntries: (projects) => projects.map((project) => toEntry(siteUrl, `/projects/${encodeURIComponent(project.slug)}`, project.updatedAt)),
  },
  {
    label: 'posts',
    request: fetchItems(`${apiUrl}/posts?limit=100&sort=-updatedAt`, 'posts'),
    toEntries: (posts) => posts.map((post) => toEntry(siteUrl, `/blog/${encodeURIComponent(post.slug)}`, post.updatedAt || post.publishedAt)),
  },
];

const dynamicResults = await Promise.allSettled(dynamicRequests.map(({ request }) => request));
const dynamicEntries = [];
const failures = [];

dynamicResults.forEach((result, index) => {
  const { label, toEntries } = dynamicRequests[index];

  if (result.status === 'fulfilled') {
    dynamicEntries.push(...toEntries(result.value));
  } else {
    failures.push(`${label}: ${result.reason.message}`);
  }
});

if (failures.length > 0 && existingDynamicEntries.length > 0) {
  console.warn(`Sitemap dynamic API unavailable; preserving ${existingDynamicEntries.length} existing dynamic routes. ${failures.join('; ')}`);
}

if (failures.length > 0 && existingDynamicEntries.length === 0) {
  console.warn(`Sitemap generated with static routes only. ${failures.join('; ')}`);
}

entries.push(...(dynamicEntries.length > 0 ? dynamicEntries : existingDynamicEntries));

const body = entries
  .map(({ loc, lastmod }) => `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`)
  .join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

await writeFile(sitemapPath, xml, 'utf8');
console.log(`Generated sitemap.xml with ${entries.length} URLs.`);
