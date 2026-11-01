const REPOSITORY_FIELDS = [
  'name nameWithOwner url description isPrivate',
  'owner { login } primaryLanguage { name }',
  'repositoryTopics(first: 4) { nodes { topic { name } } }',
  'stargazerCount forkCount pushedAt',
  'languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {',
  '  edges { size node { name color } } pageInfo { hasNextPage endCursor }',
  '}',
].join('\n');

const QUERY = [
  'query Profile($login: String!, $after: String) { user(login: $login) {',
  'login name bio followers { totalCount }',
  'pinnedItems(first: 6, types: REPOSITORY) { nodes { ... on Repository { ' + REPOSITORY_FIELDS + ' } } }',
  'repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100, after: $after, orderBy: { field: PUSHED_AT, direction: DESC }) {',
  'totalCount pageInfo { hasNextPage endCursor } nodes { ' + REPOSITORY_FIELDS + ' } }',
  'contributionsCollection { totalCommitContributions totalPullRequestContributions totalIssueContributions',
  'contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } }',
  '} }',
].join('\n');
const REPOSITORY_QUERY = 'query Repository($owner: String!, $name: String!) { repository(owner: $owner, name: $name) { ' + REPOSITORY_FIELDS + ' } }';
const LANGUAGES_QUERY = 'query Languages($owner: String!, $name: String!, $after: String!) { repository(owner: $owner, name: $name) { languages(first: 100, after: $after, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name color } } pageInfo { hasNextPage endCursor } } } }';

export class GitHubError extends Error {
  constructor(message, code) { super(message); this.name = 'GitHubError'; this.code = code; }
}

export async function fetchUser(login, token, { projects = 'pinned', fetchImpl = globalThis.fetch,
  timeoutMs = 15000, retries = 2, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) } = {}) {
  const request = async (query, variables) => {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      let response;
      try {
        response = await fetchImpl('https://api.github.com/graphql', {
          method: 'POST',
          headers: { Authorization: 'bearer ' + token, 'Content-Type': 'application/json', 'User-Agent': 'diagnostic-profile' },
          body: JSON.stringify({ query, variables }),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (error) {
        if (attempt < retries) { await sleep(250 * 2 ** attempt); continue; }
        throw new GitHubError(error.name === 'TimeoutError' || error.name === 'AbortError' ? 'GitHub request timed out; try again later' : 'Cannot reach GitHub; check your connection', 'NETWORK');
      }
      const limited = response.status === 429 || (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0');
      if (limited || response.status >= 500) {
        const retryAfter = Number(response.headers.get('retry-after'));
        const waitMs = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
        if (attempt < retries && waitMs <= 30000) { await sleep(waitMs); continue; }
        throw new GitHubError(limited ? 'GitHub rate limit reached; wait before retrying' : 'GitHub is temporarily unavailable', limited ? 'RATE_LIMITED' : 'UNAVAILABLE');
      }
      if (!response.ok) {
        const message = response.status === 401 ? 'GitHub token is invalid or expired' :
          response.status === 403 ? 'GitHub token does not have permission for this request' : 'GitHub API responded with ' + response.status;
        throw new GitHubError(message, response.status === 401 ? 'AUTH' : 'HTTP');
      }
      let payload;
      try { payload = await response.json(); }
      catch { throw new GitHubError('GitHub returned invalid JSON', 'RESPONSE'); }
      if (payload.errors?.length) {
        const rateLimited = payload.errors.some((e) => e.type === 'RATE_LIMITED');
        if (rateLimited) throw new GitHubError('GitHub rate limit reached; wait before retrying', 'RATE_LIMITED');
        throw new GitHubError('GitHub query failed: ' + payload.errors.map((e) => e.message).join('; '), 'GRAPHQL');
      }
      if (!payload.data) throw new GitHubError('GitHub returned no data', 'RESPONSE');
      return payload.data;
    }
  };

  let user;
  let after = null;
  const nodes = [];
  const cursors = new Set();
  do {
    const result = (await request(QUERY, { login, after })).user;
    if (!result) throw new GitHubError('User "' + login + '" was not found', 'NOT_FOUND');
    user ??= result;
    nodes.push(...result.repositories.nodes.filter(Boolean));
    const page = result.repositories.pageInfo;
    after = page?.hasNextPage ? page.endCursor : null;
    if (page?.hasNextPage && (!after || cursors.has(after))) throw new GitHubError('GitHub returned an invalid repository cursor', 'RESPONSE');
    cursors.add(after);
  } while (after);
  user.repositories.nodes = [...new Map(nodes.map((r) => [r.nameWithOwner.toLowerCase(), r])).values()];
  const privateOwned = user.repositories.nodes.some((r) => r.isPrivate);
  if (privateOwned) throw new GitHubError('GitHub returned private repositories for a public-only query', 'PRIVACY');

  for (const repo of user.repositories.nodes) {
    let page = repo.languages.pageInfo;
    const seen = new Set();
    while (page?.hasNextPage) {
      if (!page.endCursor || seen.has(page.endCursor)) throw new GitHubError('GitHub returned an invalid language cursor', 'RESPONSE');
      seen.add(page.endCursor);
      const [owner, name] = repo.nameWithOwner.split('/');
      const next = (await request(LANGUAGES_QUERY, { owner, name, after: page.endCursor })).repository?.languages;
      if (!next) throw new GitHubError('Language data is unavailable for ' + repo.nameWithOwner, 'RESPONSE');
      repo.languages.edges.push(...next.edges);
      page = next.pageInfo;
    }
    repo.languages.pageInfo = { hasNextPage: false, endCursor: null };
  }

  const known = new Map([...user.repositories.nodes, ...user.pinnedItems.nodes.filter(Boolean)].map((r) => [r.nameWithOwner.toLowerCase(), r]));
  user.selectedRepositories = [];
  if (Array.isArray(projects)) {
    for (const project of projects) {
      const fullName = project.repo.includes('/') ? project.repo : login + '/' + project.repo;
      let repo = known.get(fullName.toLowerCase());
      if (!repo) {
        const [owner, name] = fullName.split('/');
        repo = (await request(REPOSITORY_QUERY, { owner, name })).repository;
      }
      if (!repo) throw new GitHubError('Repository "' + fullName + '" was not found or is not accessible', 'NOT_FOUND');
      if (repo.isPrivate) throw new GitHubError('Private project "' + fullName + '" cannot be published as a profile card', 'PRIVACY');
      user.selectedRepositories.push(repo);
    }
  }
  user.pinnedItems.nodes = user.pinnedItems.nodes.filter((r) => r && !r.isPrivate);
  return user;
}
