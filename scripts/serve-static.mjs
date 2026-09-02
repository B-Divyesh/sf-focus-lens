import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, normalize, resolve, sep } from 'node:path';

const root = resolve(process.cwd(), 'dist/site');
const knownAppRoutes = new Set(['/', '/demo', '/privacy', '/terms', '/404']);
const mimeTypes = {
  '.avif': 'image/avif', '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.webp': 'image/webp', '.xml': 'application/xml; charset=utf-8', '.zip': 'application/zip'
};

function localFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  const file = resolve(root, `.${normalize(decoded)}`);
  return file === root || file.startsWith(`${root}${sep}`) ? file : null;
}

function sendFile(response, file, status = 200) {
  response.writeHead(status, { 'Content-Type': mimeTypes[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(response);
}

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url || '/', 'http://127.0.0.1').pathname;
  if (knownAppRoutes.has(pathname)) return sendFile(response, resolve(root, 'index.html'));
  const candidate = localFile(pathname);
  if (candidate && existsSync(candidate) && (await stat(candidate)).isFile()) return sendFile(response, candidate);
  return sendFile(response, resolve(root, '404.html'), 404);
});

server.listen(4173, '127.0.0.1', () => console.log('Focus Lens static test server: http://127.0.0.1:4173'));
