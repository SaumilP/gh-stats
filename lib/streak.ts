export function computeStreak(contribDays: Array<{ date: string; count: number }>) {
  let current = 0, longest = 0, total = 0;
  const byDate = new Map<string, number>();
  for (const d of contribDays) {
    byDate.set(d.date, d.count);
    if (d.count > 0) total++;
  }

  const today = new Date();
  const iso = (dt: Date) => dt.toISOString().slice(0,10);
  let cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if ((byDate.get(iso(cursor)) || 0) === 0) cursor.setUTCDate(cursor.getUTCDate() - 1);

  while ((byDate.get(iso(cursor)) || 0) > 0) {
    current++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let run = 0;
  for (const d of contribDays) {
    if (d.count > 0) run++;
    else run = 0;
    if (run > longest) longest = run;
  }
  return { current, longest, total };
}
