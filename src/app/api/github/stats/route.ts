export const dynamic = "force-dynamic";

const GITHUB_USERNAME = "xRugHere"; // your GitHub username

export async function GET() {
  const query = `
    query {
      user(login: "${GITHUB_USERNAME}") {
        contributionsCollection {
          totalCommitContributions
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
        repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC) {
          totalCount
          nodes {
            stargazerCount
            primaryLanguage { name color }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
    next: { revalidate: 3600 },
  });

  const json = await res.json();

  if (!json.data?.user) {
    return Response.json({ error: "GitHub API error" }, { status: 500 });
  }

  const user = json.data.user;

  const langMap: Record<string, number> = {};
  for (const repo of user.repositories.nodes) {
    if (repo.primaryLanguage) {
      langMap[repo.primaryLanguage.name] =
        (langMap[repo.primaryLanguage.name] ?? 0) + 1;
    }
  }

  const topLanguages = Object.entries(langMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return Response.json({
    totalContributions:
      user.contributionsCollection.contributionCalendar.totalContributions,
    totalCommits:
      user.contributionsCollection.totalCommitContributions,
    totalRepos: user.repositories.totalCount,
    topLanguages,
    weeks: user.contributionsCollection.contributionCalendar.weeks,
  });
}