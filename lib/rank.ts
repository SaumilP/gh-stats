export type RankResult = {
  level: string;
  percentile: number;
  score: number;
};

export type RankInputs = {
  stars: number;
  forks: number;
  followers: number;
  repos: number;
  commits?: number | null;
  prs?: number | null;
  issues?: number | null;
  reviews?: number | null;
};

export function computeRank(input: RankInputs): RankResult {
  const stars = Math.max(0, input.stars || 0);
  const forks = Math.max(0, input.forks || 0);
  const followers = Math.max(0, input.followers || 0);
  const repos = Math.max(0, input.repos || 0);
  const commits = Math.max(0, input.commits || 0);
  const prs = Math.max(0, input.prs || 0);
  const issues = Math.max(0, input.issues || 0);
  const reviews = Math.max(0, input.reviews || 0);

  const score =
    stars * 4 +
    forks * 2 +
    followers * 3 +
    repos * 1 +
    commits * 0.5 +
    prs * 2 +
    issues * 1 +
    reviews * 1;

  let level = "C";
  let percentile = 90;
  if (score >= 5000) { level = "S"; percentile = 1; }
  else if (score >= 3500) { level = "A+"; percentile = 5; }
  else if (score >= 2500) { level = "A"; percentile = 10; }
  else if (score >= 1800) { level = "B+"; percentile = 20; }
  else if (score >= 1200) { level = "B"; percentile = 35; }
  else if (score >= 700) { level = "C+"; percentile = 50; }
  else if (score >= 300) { level = "C"; percentile = 65; }
  else { level = "D"; percentile = 80; }

  return { level, percentile, score };
}
