import { readFile } from 'node:fs/promises';
import { DEFAULT_EXCLUDED_LANGUAGES } from './stats.mjs';
import { paletteNames } from './themes.mjs';

const slug = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function loadConfig(path) {
  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch {
    throw new Error(`Config file not found: ${path}`);
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Config file is not valid JSON: ${error.message}`);
  }
}

export function normalizeConfig(input, fallbackLogin) {
  const errors = [];
  const login = input.login ?? fallbackLogin;
  if (!login) errors.push('"login" is required');

  const theme = input.theme ?? 'amber';
  if (!paletteNames.includes(theme)) errors.push(`"theme" must be one of: ${paletteNames.join(', ')}`);

  const header = input.header ?? {};
  const readouts = (header.readouts ?? []).map((entry) => ({ label: String(entry.label ?? ''), value: String(entry.value ?? '') }));
  if (readouts.length > 3) errors.push('"header.readouts" accepts at most 3 entries');
  const tags = (header.tags ?? []).map(String);
  if (tags.length > 6) errors.push('"header.tags" accepts at most 6 entries');

  const projects = input.projects === undefined ? 'pinned' : input.projects;
  if (projects !== 'pinned' && !Array.isArray(projects)) errors.push('"projects" must be an array or "pinned"');
  if (Array.isArray(projects)) {
    projects.forEach((project, index) => {
      if (!project?.repo) errors.push(`"projects[${index}].repo" is required`);
    });
    if (projects.length > 8) errors.push('"projects" accepts at most 8 entries');
  }

  const contacts = (input.contacts ?? []).map((contact, index) => {
    if (!contact?.label || !contact?.url) errors.push(`"contacts[${index}]" needs "label" and "url"`);
    return {
      id: slug(contact?.id ?? contact?.label ?? index),
      label: String(contact?.label ?? ''),
      url: String(contact?.url ?? ''),
      glyph: String(contact?.glyph ?? contact?.label?.slice(0, 2).toLowerCase() ?? '').slice(0, 3),
    };
  });

  if (errors.length) {
    throw new Error(`Invalid config:\n- ${errors.join('\n- ')}`);
  }

  return {
    login,
    theme,
    assetsBaseUrl: input.assetsBaseUrl ?? `https://raw.githubusercontent.com/${login}/${login}/output/`,
    header: {
      name: header.name,
      headline: header.headline,
      prompt: header.prompt ?? `$ scan --target ${slug(login)}`,
      systemLabel: header.systemLabel ?? 'DEVELOPER PROFILE',
      readouts,
      tags,
    },
    projects,
    contacts,
    telemetry: {
      excludeLanguages: input.telemetry?.excludeLanguages ?? DEFAULT_EXCLUDED_LANGUAGES,
      languageLimit: input.telemetry?.languageLimit ?? 7,
    },
    footer: {
      message: input.footer?.message ?? 'NO FAULTS DETECTED',
    },
  };
}

export function resolveProjects(config, data) {
  if (config.projects !== 'pinned') {
    return config.projects.map((project) => ({
      repo: project.repo,
      title: project.title ?? project.repo,
      kind: project.kind ?? data.repos[project.repo]?.primaryLanguage?.name ?? 'Repository',
      summary: project.summary ?? '',
      tags: (project.tags ?? []).slice(0, 5),
      url: project.url ?? `https://github.com/${config.login}/${project.repo}`,
    }));
  }
  return data.pinned.map((repo) => ({
    repo: repo.name,
    title: repo.name,
    kind: repo.primaryLanguage?.name ?? 'Repository',
    summary: repo.description ?? '',
    tags: (repo.repositoryTopics?.nodes ?? []).map((node) => node.topic.name).slice(0, 4),
    url: `https://github.com/${config.login}/${repo.name}`,
  }));
}

export const fileSlug = slug;
