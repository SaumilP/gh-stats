const DEFAULT_DOMAIN = "https://wakatime.com";

function normalizeDomain(domain?: string) {
  if (!domain) return DEFAULT_DOMAIN;
  const trimmed = String(domain).trim();
  if (!trimmed) return DEFAULT_DOMAIN;
  return trimmed.replace(/\/+$/, "");
}

export type WakaTimeLanguage = {
  name: string;
  percent: number;
  totalSeconds: number;
  text: string;
};

export type WakaTimeStats = {
  username: string;
  range: string;
  languages: WakaTimeLanguage[];
  isUpToDate?: boolean;
};

export async function getWakaTimeStats(username: string, range: string, apiDomain?: string): Promise<WakaTimeStats> {
  const domain = normalizeDomain(apiDomain);
  const path = `/api/v1/users/${encodeURIComponent(username)}/stats/${encodeURIComponent(range)}`;
  const url = `${domain}${path}`;
  const resp = await fetch(url, { headers: { "User-Agent": "gh-stats-vercel" } });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`WakaTime API error ${resp.status}: ${txt.slice(0, 200)}`);
  }
  const payload = (await resp.json()) as any;
  const languages = Array.isArray(payload?.data?.languages) ? payload.data.languages : [];
  return {
    username,
    range,
    languages: languages.map((l: any) => ({
      name: String(l.name || "Unknown"),
      percent: Number(l.percent) || 0,
      totalSeconds: Number(l.total_seconds) || 0,
      text: String(l.text || ""),
    })),
    isUpToDate: Boolean(payload?.data?.is_up_to_date),
  };
}
