import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
export async function buildStudio() {
  const output = join(root, 'dist', 'site');
  // Fixed build output under this repository, never a caller-supplied recursive deletion target.
  if (resolve(output) !== resolve(root, 'dist', 'site')) throw new Error('Invalid build directory');
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const folder of ['studio', 'src', 'schema']) await cp(join(root, folder), join(output, folder), { recursive: true });
  for (const file of ['test/fixtures/user.json', 'examples/diagnostic-profile.json']) {
    await mkdir(dirname(join(output, file)), { recursive: true });
    await cp(join(root, file), join(output, file));
  }
  const index = (await readFile(join(root, 'studio', 'index.html'), 'utf8'))
    .replace('./styles.css', './studio/styles.css').replace('./app.mjs', './studio/app.mjs');
  await writeFile(join(output, 'index.html'), index);
  return output;
}
export async function serveStudio(port = 4173) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Port must be an integer between 0 and 65535');
  const output = join(root, 'dist', 'site');
  const types = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const path = resolve(output, '.' + (pathname === '/' ? '/index.html' : pathname));
      const rel = relative(output, path);
      if (!rel || rel.startsWith('..') || isAbsolute(rel) || !types[extname(path)]) { res.writeHead(404).end(); return; }
      const body = await readFile(path);
      res.writeHead(200, { 'Content-Type': types[extname(path)], 'Cache-Control': 'no-store',
        'Content-Security-Policy': "default-src 'self'; img-src 'self' blob: data:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'",
        'X-Content-Type-Options': 'nosniff' });
      res.end(body);
    } catch (error) { res.writeHead(error.code === 'ENOENT' ? 404 : 400).end(); }
  });
  await new Promise((done, fail) => { server.once('error', fail); server.listen(port, '127.0.0.1', done); });
  console.log('Local: http://127.0.0.1:' + server.address().port + '/');
  return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const dir = await buildStudio();
  if (process.argv.includes('--serve')) await serveStudio(Number(process.env.PORT ?? 4173));
  else console.log('Studio built: ' + dir);
}
