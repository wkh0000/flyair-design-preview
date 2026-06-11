/**
 * gen-share-pages.js — post-build step for the static GitHub Pages demo.
 *
 * The demo is a pure SPA (no SSR/prerender), so social scrapers (Facebook,
 * WhatsApp, Twitter/X, LinkedIn, Slack) — which DON'T run JavaScript — only
 * ever see the generic Open Graph tags baked into index.html. The per-page
 * tags the Angular SeoService sets at runtime are invisible to them.
 *
 * This script fixes that without a full SSR pipeline: for every promotion and
 * news article it writes a static  <route>/index.html  that is a copy of the
 * built index.html with the OG / Twitter / <title> / canonical tags replaced
 * for that item. GitHub Pages serves that file directly, so a scraper reading
 * /promotions/<slug> gets the correct image + title + description. Real users
 * still boot the SPA from the same file (it keeps the app's <base href> and
 * script tags) and the router shows the page as normal.
 *
 * Dependency-free (Node core only). Run after the Pages artifact is staged.
 */
const fs = require('fs');
const path = require('path');

const SITE = process.env.SITE_DIR || '_site';
const BASE = 'https://wkh0000.github.io/flyair-design-preview';

const indexPath = path.join(SITE, 'index.html');
if (!fs.existsSync(indexPath)) { console.error('gen-share-pages: no index.html in', SITE); process.exit(0); }
const tpl = fs.readFileSync(indexPath, 'utf8');

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Absolute, scraper-friendly image. Unsplash images are normalised to a
 *  1200x630 crop (the size declared in the meta tags). */
const ogImg = (u) => {
  if (!u) return BASE + '/assets/og-default.jpg';
  let abs = /^https?:\/\//i.test(u) ? u : BASE + '/' + String(u).replace(/^\/+/, '');
  if (/images\.unsplash\.com/i.test(abs)) abs = abs.split('?')[0] + '?auto=format&fit=crop&w=1200&h=630&q=80';
  return abs;
};

const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };

function inject(html, { title, desc, image, url, type }) {
  const t = esc(title), d = esc(desc), im = esc(image), u = esc(url);
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/i, `$1${d}$2`)
    .replace(/(<meta\s+property="og:type"\s+content=")[^"]*(")/i, `$1${esc(type || 'article')}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/i, `$1${t}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/i, `$1${d}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/i, `$1${u}$2`)
    .replace(/(<meta\s+property="og:image"\s+content=")[^"]*(")/i, `$1${im}$2`)
    .replace(/(<meta\s+property="og:image:alt"\s+content=")[^"]*(")/i, `$1${t}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i, `$1${t}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/i, `$1${d}$2`)
    .replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*(")/i, `$1${im}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/i, `$1${u}$2`);
}

function write(routeDir, slug, data) {
  const dir = path.join(SITE, routeDir, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), inject(tpl, data));
}

let n = 0;

// ---- Promotions ----
const promos = readJson(path.join(SITE, 'assets', 'static-api', 'promotions.json')) || [];
for (const p of promos) {
  if (!p.slug) continue;
  const disc = p.promotion_Type === 'Percentage' ? `${p.amount}% off`
            : p.promotion_Type === 'Fixed' ? `Save $${p.amount}` : '';
  write('promotions', p.slug, {
    title: `${p.title || p.promotion_Name || 'Special offer'} — FlyAir`,
    desc: p.subtitle || disc || 'Limited-time flight offer on FlyAir.',
    image: ogImg(p.detail_Image_Url || p.image_Url),
    url: `${BASE}/promotions/${p.slug}`,
    type: 'article',
  });
  n++;
}

// ---- News articles ----
const newsRaw = readJson(path.join(SITE, 'assets', 'static-api', 'News', 'list.json'));
const items = Array.isArray(newsRaw) ? newsRaw : (newsRaw && newsRaw.items) || [];
for (const a of items) {
  if (!a.slug) continue;
  write('news', a.slug, {
    title: `${a.title || 'FlyAir Newsroom'} — FlyAir`,
    desc: a.dek || a.metaDescription || 'Aviation news, airline & airport stories from the FlyAir Newsroom.',
    image: ogImg(a.ogImageUrl || a.heroImageUrl),
    url: `${BASE}/news/${a.slug}`,
    type: 'article',
  });
  n++;
}

console.log(`gen-share-pages: wrote ${n} per-URL share pages (${promos.length} promotions, ${items.length} articles)`);
