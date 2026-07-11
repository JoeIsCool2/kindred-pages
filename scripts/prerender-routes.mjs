import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const shellPath = join(dist, 'index.html');
const shell = readFileSync(shellPath, 'utf8');
const baseUrl = 'https://kindred-pages-wine.vercel.app';

const routes = [
  {
    path: '/',
    title: 'Kindred Pages | Memorial websites families can finish gently',
    description: 'Create a beautiful memorial page, collect memories, share service details, and preserve a private family archive.',
    priority: '1.0'
  },
  {
    path: '/builder',
    title: 'Build a Memorial Page | Kindred Pages',
    description: 'A focused memorial builder for story, service details, guest care, memories, keepsakes, privacy review, and launch approval.',
    priority: '0.9'
  },
  {
    path: '/templates',
    title: 'Memorial Website Templates | Kindred Pages',
    description: 'Choose a research-backed memorial website starting point for a celebration of life, funeral service, graveside gathering, online remembrance, or private family archive.',
    priority: '0.85'
  },
  {
    path: '/preview',
    title: 'Memorial Page Preview | Kindred Pages',
    description: 'Preview the guest-facing memorial page with RSVP, livestream, support options, and gentle memory sharing.',
    priority: '0.8'
  },
  {
    path: '/pricing',
    title: 'Pricing | Kindred Pages',
    description: 'Simple family memorial plans and funeral-home partner pricing for celebration-of-life pages, keepsakes, and archives.',
    priority: '0.8'
  },
  {
    path: '/partners',
    title: 'Funeral Home Partners | Kindred Pages',
    description: 'A co-branded memorial website workflow for funeral homes that need polished family drafts, service exports, and clean handoff.',
    priority: '0.7'
  },
  {
    path: '/trust',
    title: 'Trust, Privacy, and Research | Kindred Pages',
    description: 'How Kindred Pages handles private memorials, family moderation, sensitive details, archive exports, and research-backed guest care.',
    priority: '0.7'
  }
];

function absoluteUrl(path) {
  return `${baseUrl}${path === '/' ? '/' : path}`;
}

function replaceMeta(html, route) {
  const url = absoluteUrl(route.path);
  return html
    .replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${route.description}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${route.title}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${route.description}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${route.title}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${route.description}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
}

for (const route of routes) {
  const html = replaceMeta(shell, route);
  const outputPath = route.path === '/' ? shellPath : join(dist, route.path.slice(1), 'index.html');
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url>
    <loc>${absoluteUrl(route.path)}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
  <url>
    <loc>${baseUrl}/privacy.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>
`;

writeFileSync(join(dist, 'sitemap.xml'), sitemap);
console.log(`Prerendered ${routes.length} route shells with static metadata.`);
