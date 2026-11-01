export const DEFAULT_EXCLUDED_LANGUAGES = ['HTML', 'CSS', 'SCSS', 'Smarty', 'CMake', 'Makefile', 'Batchfile', 'Dockerfile', 'Procfile'];

export function summarize(user, { excludeLanguages = DEFAULT_EXCLUDED_LANGUAGES, languageLimit = 7 } = {}) {
  const repos = user.repositories.nodes;
  const contributions = user.contributionsCollection;
  const days = contributions.contributionCalendar.weeks.flatMap((week) => week.contributionDays);
  const weekly = contributions.contributionCalendar.weeks.map((week) => ({
    start: week.contributionDays[0]?.date,
    count: week.contributionDays.reduce((sum, day) => sum + day.contributionCount, 0),
  }));

  return {
    login: user.login,
    name: user.name,
    bio: user.bio,
    totals: {
      contributions: contributions.contributionCalendar.totalContributions,
      commits: contributions.totalCommitContributions,
      pullRequests: contributions.totalPullRequestContributions,
      issues: contributions.totalIssueContributions,
      stars: repos.reduce((sum, repo) => sum + repo.stargazerCount, 0),
      repositories: user.repositories.totalCount,
      followers: user.followers.totalCount,
    },
    streaks: streaks(days),
    weekly: weekly.slice(-52),
    languages: languageMix(repos, new Set(excludeLanguages), languageLimit),
    repos: repositoryIndex(user),
    pinned: user.pinnedItems.nodes.filter((node) => node?.name),
  };
}

function repositoryIndex(user) {
  const index = Object.create(null);
  const repos = [...(user.pinnedItems?.nodes ?? []), ...user.repositories.nodes, ...(user.selectedRepositories ?? [])];
  for (const repo of repos.filter(Boolean)) {
    const fullName = repo.nameWithOwner ?? (repo.owner?.login ?? user.login) + '/' + repo.name;
    index[fullName.toLowerCase()] = repo;
    if (fullName.toLowerCase().startsWith(user.login.toLowerCase() + '/')) index[repo.name] = repo;
  }
  return index;
}

export function streaks(days) {
  let longest = 0;
  let run = 0;
  let bestDay = 0;
  for (const day of days) {
    bestDay = Math.max(bestDay, day.contributionCount);
    run = day.contributionCount > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  let current = 0;
  let index = days.length - 1;
  if (index >= 0 && days[index].contributionCount === 0) index -= 1;
  while (index >= 0 && days[index].contributionCount > 0) {
    current += 1;
    index -= 1;
  }
  return { current, longest, bestDay };
}

export function languageMix(repos, excluded = new Set(DEFAULT_EXCLUDED_LANGUAGES), limit = 7) {
  const totals = new Map();
  for (const repo of repos) {
    for (const { size, node } of repo.languages?.edges ?? []) {
      if (excluded.has(node.name)) continue;
      const entry = totals.get(node.name) ?? { name: node.name, color: node.color, size: 0 };
      entry.size += size;
      totals.set(node.name, entry);
    }
  }
  const sorted = [...totals.values()].sort((a, b) => b.size - a.size);
  const total = sorted.reduce((sum, entry) => sum + entry.size, 0) || 1;
  const top = sorted.slice(0, limit);
  const rest = sorted.slice(limit).reduce((sum, entry) => sum + entry.size, 0);
  if (rest > 0) top.push({ name: 'Other', color: null, size: rest });
  return top.map((entry) => ({ ...entry, share: entry.size / total }));
}
