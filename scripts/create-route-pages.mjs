import { mkdir, readFile, writeFile } from 'node:fs/promises';

const siteUrl = 'https://focus-lens.sociobot.in';
const source = await readFile('dist/site/index.html', 'utf8');
const routes = [
  ['demo', 'Demo — Focus Lens', 'Try Focus Lens controls with isolated sample cases. Demo changes cannot affect extension data.'],
  ['install', 'Install — Focus Lens', 'Download the Focus Lens extension ZIP and follow the Chrome Developer mode installation steps.'],
  ['privacy', 'Privacy — Focus Lens', 'Read what Focus Lens stores in Chrome and how to remove your local settings.'],
  ['terms', 'Terms — Focus Lens', 'Read the terms and practical limits for using the Focus Lens browser extension.'],
  ['404', 'Page not found — Focus Lens', 'The requested Focus Lens page was not found.']
];

const setAttribute = (html, selector, attribute, value) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(<${escapedSelector}[^>]*${attribute}=")[^"]*(")`);
  return html.replace(pattern, `$1${value}$2`);
};

const buildPage = (path, title, description) => {
  let html = source.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = setAttribute(html, 'meta name="description"', 'content', description);
  html = setAttribute(html, 'meta property="og:title"', 'content', title);
  html = setAttribute(html, 'meta property="og:description"', 'content', description);
  html = setAttribute(html, 'meta property="og:url"', 'content', `${siteUrl}/${path === '404' ? '404' : path}`);
  html = setAttribute(html, 'meta name="twitter:title"', 'content', title);
  html = setAttribute(html, 'meta name="twitter:description"', 'content', description);
  html = setAttribute(html, 'link rel="canonical"', 'href', `${siteUrl}/${path === '404' ? '404' : path}`);
  return html;
};

for (const [path, title, description] of routes) {
  const file = path === '404' ? 'dist/site/404.html' : `dist/site/${path}/index.html`;
  if (path !== '404') await mkdir(`dist/site/${path}`, { recursive: true });
  await writeFile(file, buildPage(path, title, description));
}
