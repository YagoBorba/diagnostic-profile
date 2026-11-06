import { cp, lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const digest = (content) => createHash('sha256').update(content).digest('hex');
const validName = (name) => /^(?:[a-z0-9-]+\.svg|README\.snippet\.md)$/.test(name);
async function stat(path) { try { return await lstat(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; } }
function within(parent, path) {
  const rel = relative(parent, path);
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

export async function writeAssets(output, files, metadata = {}, { beforePublish } = {}) {
  const destination = resolve(output);
  const cwd = resolve('.');
  if (destination === cwd || within(destination, cwd)) throw new Error('Output directory cannot be the project directory or its parent');
  if (await stat(join(destination, '.git'))) throw new Error('Output directory cannot be a Git repository');
  const parent = dirname(destination);
  await mkdir(parent, { recursive: true });
  const original = await stat(destination);
  if (original && (!original.isDirectory() || original.isSymbolicLink())) throw new Error('Output must be a directory, not a symlink or file');
  for (const [name, content] of Object.entries(files)) {
    if (!validName(name) || typeof content !== 'string') throw new Error('Unsafe asset filename or content: ' + name);
  }

  const lock = join(parent, '.' + basename(destination) + '.diagnostic-profile-lock');
  try { await mkdir(lock); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error('Another build owns the output lock: ' + lock);
    throw error;
  }
  let staging;
  let backup;
  let movedOriginal = false;
  let committed = false;
  try {
    staging = await mkdtemp(join(parent, '.diagnostic-profile-'));
    backup = staging + '-previous';
    // Every recursive cleanup and rename is confined to a unique sibling staging path.
    if (!within(parent, staging) || !within(parent, backup)) throw new Error('Invalid staging paths');
    if (original) await cp(destination, staging, { recursive: true, dereference: false });
    let previous;
    try { previous = JSON.parse(await readFile(join(staging, 'manifest.json'), 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error; }
    if (previous?.generator === 'diagnostic-profile' && previous.files) {
      for (const [name, hash] of Object.entries(previous.files)) {
        if (!validName(name) || Object.hasOwn(files, name)) continue;
        const path = join(staging, name);
        const info = await stat(path);
        if (info?.isFile() && !info.isSymbolicLink() && digest(await readFile(path)) === hash) await rm(path);
      }
    }
    const manifest = {
      generator: 'diagnostic-profile', schemaVersion: 1,
      generatedAt: new Date().toISOString(), ...metadata,
      files: Object.fromEntries(Object.entries(files).map(([name, content]) => [name, digest(content)])),
    };
    for (const [name, content] of Object.entries({ ...files, 'manifest.json': JSON.stringify(manifest, null, 2) + '\n' })) {
      const path = join(staging, name);
      const existing = await stat(path);
      if (existing?.isDirectory()) throw new Error('An asset filename conflicts with a directory: ' + name);
      if (existing) await rm(path);
      await writeFile(path, content, { flag: 'wx' });
    }
    await beforePublish?.(staging);
    if (original) { await rename(destination, backup); movedOriginal = true; }
    try { await rename(staging, destination); committed = true; }
    catch (error) {
      if (movedOriginal) { await rename(backup, destination); movedOriginal = false; }
      throw error;
    }
    return manifest;
  } finally {
    if (staging && within(parent, staging)) await rm(staging, { recursive: true, force: true });
    if (committed && movedOriginal && within(parent, backup)) await rm(backup, { recursive: true, force: true });
    await rm(lock, { recursive: true, force: true });
  }
}
