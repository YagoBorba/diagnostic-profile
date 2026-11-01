const QUERY = `
query($login: String!) {
  user(login: $login) {
    login
    name
    bio
    followers { totalCount }
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name
          description
          primaryLanguage { name }
          repositoryTopics(first: 4) { nodes { topic { name } } }
        }
      }
    }
    repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100, orderBy: { field: PUSHED_AT, direction: DESC }) {
      totalCount
      nodes {
        name
        stargazerCount
        forkCount
        pushedAt
        languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name color } }
        }
      }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

export async function fetchUser(login, token) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'diagnostic-profile',
    },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  if (!response.ok) {
    throw new Error(`GitHub API responded with ${response.status}`);
  }
  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('; '));
  }
  if (!payload.data?.user) {
    throw new Error(`User "${login}" was not found`);
  }
  return payload.data.user;
}
