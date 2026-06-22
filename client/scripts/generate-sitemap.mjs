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

const toEntry = (siteUrl, route, lastModified) => ({
  loc: new URL(route, `${siteUrl}/`).toString(),
  lastmod: lastModified ? new Date(lastModified).toISOString().slice(0, 10) : undefined,
});

const fetchItems = async (url, collection) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  const payload = await response.json();
  return payload.data?.[collection] ?? [];
};

const environment = await readEnvironment();
const siteUrl = (environment.VITE_SITE_URL || 'https://antoniotrinidad.dev').replace(/\/+$/, '');
const apiUrl = (environment.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
const entries = ['/', '/about', '/projects', '/blog', '/contact', '/privacy'].map((route) => toEntry(siteUrl, route));

try {
  const [projects, posts] = await Promise.all([
    fetchItems(`${apiUrl}/projects?status=completed&limit=100&sort=-updatedAt`, 'projects'),
    fetchItems(`${apiUrl}/posts?limit=100&sort=-updatedAt`, 'posts'),
  ]);

  entries.push(
    ...projects.map((project) => toEntry(siteUrl, `/projects/${encodeURIComponent(project.slug)}`, project.updatedAt)),
    ...posts.map((post) => toEntry(siteUrl, `/blog/${encodeURIComponent(post.slug)}`, post.updatedAt || post.publishedAt)),
  );
} catch (error) {
  console.warn(`Sitemap generated with static routes only: ${error.message}`);
}

const body = entries
  .map(({ loc, lastmod }) => `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`)
  .join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

await writeFile(path.join(projectRoot, 'public', 'sitemap.xml'), xml, 'utf8');
console.log(`Generated sitemap.xml with ${entries.length} URLs.`);
