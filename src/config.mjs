import { DEFAULT_EXCLUDED_LANGUAGES } from './stats.mjs';
import { paletteNames } from './themes.mjs';

const slug = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export async function loadConfig(path) {
  const { readFile } = await import('node:fs/promises');
  let raw;
  try { raw = await readFile(path, 'utf8'); }
  catch (error) {
    if (error.code === 'ENOENT') throw new Error('Config file not found: ' + path);
    throw new Error('Cannot read config file: ' + path + ' (' + error.code + ')');
  }
  if (Buffer.byteLength(raw) > 128 * 1024) throw new Error('Config file exceeds 128 KiB');
  try { return JSON.parse(raw); }
  catch (error) { throw new Error('Config file is not valid JSON: ' + error.message); }
}

export function normalizeConfig(input, fallbackLogin) {
  if (!isObject(input)) throw new Error('Invalid config:\n- config must be an object');
  const errors = [];
  const text = (value, path, fallback = '', max = 200) => {
    const result = value === undefined ? fallback : value;
    if (typeof result !== 'string') { errors.push('"' + path + '" must be a string'); return fallback; }
    if (result.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(result)) errors.push('"' + path + '" exceeds ' + max + ' characters or contains control characters');
    return result;
  };
  const object = (value, path) => {
    if (value === undefined) return {};
    if (!isObject(value)) { errors.push('"' + path + '" must be an object'); return {}; }
    return value;
  };
  const list = (value, path, max) => {
    if (value === undefined) return [];
    if (!Array.isArray(value)) { errors.push('"' + path + '" must be an array'); return []; }
    if (value.length > max) errors.push('"' + path + '" accepts at most ' + max + ' entries');
    return value.slice(0, max);
  };
  const url = (value, path, protocols = ['https:', 'http:', 'mailto:']) => {
    const raw = text(value, path, '', 2048);
    try {
      const parsed = new URL(raw);
      if (!protocols.includes(parsed.protocol) || parsed.username || parsed.password) throw new Error();
    } catch { errors.push('"' + path + '" must be a valid ' + protocols.join('/') + ' URL without credentials'); }
    return raw;
  };
  const login = text(input.login ?? fallbackLogin, 'login', '', 39);
  if (!login) errors.push('"login" is required');
  else if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(login)) errors.push('"login" must be a GitHub username');
  const theme = text(input.theme, 'theme', 'amber', 40);
  if (!paletteNames.includes(theme)) errors.push('"theme" must be one of: ' + paletteNames.join(', '));
  const header = object(input.header, 'header');
  const readouts = list(header.readouts, 'header.readouts', 3).map((entry, i) => {
    const path = 'header.readouts[' + i + ']';
    const r = object(entry, path);
    return { label: text(r.label, path + '.label', '', 40), value: text(r.value, path + '.value', '', 80) };
  });
  const tags = list(header.tags, 'header.tags', 6).map((v, i) => text(v, 'header.tags[' + i + ']', '', 50));
  let projects = input.projects === undefined ? 'pinned' : input.projects;
  if (projects !== 'pinned') {
    const seen = new Set();
    projects = list(projects, 'projects', 8).map((entry, i) => {
      const path = 'projects[' + i + ']';
      const p = object(entry, path);
      const repo = text(p.repo, path + '.repo', '', 140);
      if (!repo) errors.push('"' + path + '.repo" is required');
      else if (!/^(?:[a-z\d][a-z\d-]*\/)?[a-z\d_.-]+$/i.test(repo) || repo === '.' || repo === '..') errors.push('"' + path + '.repo" must be a repository name or owner/name');
      const filename = slug(repo);
      if (seen.has(filename)) errors.push('"' + path + '.repo" has a duplicate output filename');
      seen.add(filename);
      const result = { repo };
      for (const key of ['title', 'kind', 'summary']) {
        if (p[key] !== undefined) result[key] = text(p[key], path + '.' + key, '', key === 'summary' ? 1000 : 120);
      }
      if (p.tags !== undefined) result.tags = list(p.tags, path + '.tags', 5).map((v, j) => text(v, path + '.tags[' + j + ']', '', 50));
      if (p.url !== undefined) result.url = url(p.url, path + '.url', ['https:', 'http:']);
      return result;
    });
  }
  const ids = new Set();
  const contacts = list(input.contacts, 'contacts', 12).map((entry, i) => {
    const path = 'contacts[' + i + ']';
    const c = object(entry, path);
    const label = text(c.label, path + '.label', '', 40);
    const link = url(c.url, path + '.url');
    if (!label || !link) errors.push('"' + path + '" needs "label" and "url"');
    const id = slug(text(c.id, path + '.id', label, 60));
    if (!id || ids.has(id)) errors.push('"' + path + '.id" must produce a nonempty, unique filename');
    ids.add(id);
    return { id, label, url: link, glyph: text(c.glyph, path + '.glyph', label.slice(0, 2).toLowerCase(), 3) };
  });
  const telemetry = object(input.telemetry, 'telemetry');
  const footer = object(input.footer, 'footer');
  const languageLimit = telemetry.languageLimit ?? 7;
  if (!Number.isInteger(languageLimit) || languageLimit < 1 || languageLimit > 10) errors.push('"telemetry.languageLimit" must be an integer between 1 and 10');
  const excludeLanguages = telemetry.excludeLanguages === undefined ? DEFAULT_EXCLUDED_LANGUAGES :
    list(telemetry.excludeLanguages, 'telemetry.excludeLanguages', 100).map((v, i) => text(v, 'telemetry.excludeLanguages[' + i + ']', '', 80));
  const assetsBaseUrl = input.assetsBaseUrl === undefined ? 'https://raw.githubusercontent.com/' + login + '/' + login + '/output/' :
    url(input.assetsBaseUrl, 'assetsBaseUrl', ['https:', 'http:']);
  if (/[?#\s,]/.test(assetsBaseUrl)) errors.push('"assetsBaseUrl" cannot contain query strings, fragments, whitespace or commas');
  const result = {
    login, theme, assetsBaseUrl,
    header: {
      name: header.name === undefined ? undefined : text(header.name, 'header.name', '', 120),
      headline: header.headline === undefined ? undefined : text(header.headline, 'header.headline', '', 200),
      prompt: text(header.prompt, 'header.prompt', '$ scan --target ' + slug(login), 120),
      systemLabel: text(header.systemLabel, 'header.systemLabel', 'DEVELOPER PROFILE', 80),
      readouts, tags,
    },
    projects, contacts,
    telemetry: { excludeLanguages, languageLimit },
    footer: { message: text(footer.message, 'footer.message', 'NO FAULTS DETECTED', 120) },
  };
  if (errors.length) throw new Error('Invalid config:\n- ' + errors.join('\n- '));
  return result;
}

export function resolveProjects(config, data) {
  const resolve = (p) => {
    const fullName = p.repo.includes('/') ? p.repo : config.login + '/' + p.repo;
    const repo = data.repos[fullName.toLowerCase()] ?? data.repos[fullName] ?? data.repos[p.repo];
    return {
      repo: p.repo,
      title: p.title ?? repo?.name ?? p.repo.split('/').at(-1),
      kind: p.kind ?? repo?.primaryLanguage?.name ?? 'Repository',
      summary: p.summary ?? repo?.description ?? '',
      tags: p.tags ?? (repo?.repositoryTopics?.nodes ?? []).map((n) => n.topic.name).slice(0, 4),
      url: p.url ?? repo?.url ?? 'https://github.com/' + fullName,
    };
  };
  const projects = config.projects !== 'pinned' ? config.projects.map(resolve) : data.pinned.filter((r) => !r.isPrivate).map((r) => {
    const fullName = r.nameWithOwner ?? (r.owner?.login ?? config.login) + '/' + r.name;
    const id = fullName.toLowerCase().startsWith(config.login.toLowerCase() + '/') ? r.name : fullName;
    return resolve({ repo: id, title: r.name, kind: r.primaryLanguage?.name ?? 'Repository', summary: r.description ?? '',
      tags: (r.repositoryTopics?.nodes ?? []).map((n) => n.topic.name).slice(0, 4), url: r.url ?? 'https://github.com/' + fullName });
  });
  const seen = new Set();
  for (const p of projects) {
    const filename = slug(p.repo);
    if (!filename || seen.has(filename)) throw new Error('Project output filename collision: ' + p.repo);
    seen.add(filename);
  }
  return projects;
}
export const fileSlug = slug;
