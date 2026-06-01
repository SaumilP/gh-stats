import type { ThemeStyle } from "../lib/theme";
import { cardFrame, cardFooter, textLine, muted } from "./svg";

export type ContributionDay = {
  date: string;
  count: number;
};

export type ImpactCardOptions = {
  compact?: boolean;
  hideTitle?: boolean;
  customTitle?: string;
  cardWidth?: number;
  disableAnimations?: boolean;
};

const CELL_SIZE = 12;
const CELL_GAP = 2;
const WEEK_WIDTH = CELL_SIZE + CELL_GAP;

function getContributionColor(count: number, maxCount: number, style: ThemeStyle): string {
  if (count === 0) {
    return style.tokens.border;
  }

  const intensity = Math.min(1, count / (maxCount * 0.7));

  // Use accent color with varying opacity
  const r = parseInt(style.tokens.accent.slice(1, 3), 16);
  const g = parseInt(style.tokens.accent.slice(3, 5), 16);
  const b = parseInt(style.tokens.accent.slice(5, 7), 16);

  // Create color gradient from light to dark
  const lightR = Math.round(r + (255 - r) * (1 - intensity * 0.7));
  const lightG = Math.round(g + (255 - g) * (1 - intensity * 0.7));
  const lightB = Math.round(b + (255 - b) * (1 - intensity * 0.7));

  return `rgb(${lightR}, ${lightG}, ${lightB})`;
}

export function renderImpact(
  style: ThemeStyle,
  username: string,
  contributions: ContributionDay[],
  opts: ImpactCardOptions = {},
) {
  const W = Math.max(320, Math.min(900, Math.floor(opts.cardWidth || 480)));
  const title = opts.customTitle || "Impact Timeline";

  // Organize contributions into weeks and days
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364); // Last 365 days

  const weeks: (ContributionDay | null)[][] = [];
  let currentWeek: (ContributionDay | null)[] = [];

  // Create a map for quick lookup
  const contribMap = new Map<string, number>();
  contributions.forEach((c) => {
    contribMap.set(c.date, c.count);
  });

  // Fill in the calendar grid
  const d = new Date(startDate);
  while (d <= today) {
    const dayOfWeek = d.getDay();
    const dateStr = d.toISOString().split('T')[0];
    const count = contribMap.get(dateStr) || 0;

    currentWeek.push({ date: dateStr, count });

    if (dayOfWeek === 6) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }

    d.setDate(d.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Calculate max contribution for color scaling
  const maxCount = Math.max(...contributions.map((c) => c.count), 1);

  // Calculate grid dimensions
  const gridWidth = weeks.length * WEEK_WIDTH + 40; // Add padding for labels
  const totalWidth = Math.max(W, gridWidth + 40);
  const H = 240;

  let svg = cardFrame(style, totalWidth, H, `${title}: ${username}`, {
    disableAnimations: opts.disableAnimations,
  });

  if (!opts.hideTitle) {
    svg += textLine(style, 18, 34, title, 16, 800, style.tokens.title);
    svg += muted(style, 18, 54, `@${username} • last 365 days`, 12);
  }

  // Draw month labels
  let monthLabelX = 36;
  let prevMonth = -1;
  for (let i = 0; i < weeks.length; i++) {
    if (weeks[i].length > 0) {
      const firstDay = new Date(weeks[i][0]!.date);
      const month = firstDay.getMonth();

      if (month !== prevMonth && monthLabelX < totalWidth - 50) {
        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        svg += `<text x="${monthLabelX}" y="78" font-size="10" fill="${style.tokens.muted}" font-family="system-ui">${monthNames[month]}</text>`;
        prevMonth = month;
      }
    }
    monthLabelX += WEEK_WIDTH;
  }

  // Draw day of week labels (Sun-Sat)
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  for (let d = 0; d < 7; d++) {
    const label = dayLabels[d];
    if (label) {
      svg += `<text x="10" y="${84 + d * WEEK_WIDTH + 8}" font-size="10" fill="${style.tokens.muted}" font-family="system-ui">${label}</text>`;
    }
  }

  // Draw contribution grid
  const gridStartX = 36;
  const gridStartY = 84;

  for (let weekIdx = 0; weekIdx < weeks.length; weekIdx++) {
    const week = weeks[weekIdx];
    for (let dayIdx = 0; dayIdx < week.length; dayIdx++) {
      const day = week[dayIdx];
      if (!day) continue;

      const x = gridStartX + weekIdx * WEEK_WIDTH;
      const y = gridStartY + dayIdx * WEEK_WIDTH;

      const color = getContributionColor(day.count, maxCount, style);
      const opacity = day.count === 0 ? 0.2 : 1;

      svg += `<rect x="${x}" y="${y}" width="${CELL_SIZE}" height="${CELL_SIZE}" rx="2" fill="${color}" opacity="${opacity}" />`;
    }
  }

  // Draw legend
  const legendStartX = gridStartX;
  const legendY = gridStartY + 7 * WEEK_WIDTH + 12;

  svg += muted(style, legendStartX, legendY, 'Less', 10);

  const legendColors = [0, 0.2, 0.4, 0.7, 1];
  for (let i = 0; i < legendColors.length; i++) {
    const intensity = legendColors[i];
    const r = parseInt(style.tokens.accent.slice(1, 3), 16);
    const g = parseInt(style.tokens.accent.slice(3, 5), 16);
    const b = parseInt(style.tokens.accent.slice(5, 7), 16);

    const lightR = Math.round(r + (255 - r) * (1 - intensity * 0.7));
    const lightG = Math.round(g + (255 - g) * (1 - intensity * 0.7));
    const lightB = Math.round(b + (255 - b) * (1 - intensity * 0.7));
    const color = `rgb(${lightR}, ${lightG}, ${lightB})`;

    svg += `<rect x="${legendStartX + 40 + i * 12}" y="${legendY - 8}" width="10" height="10" rx="1" fill="${color}" />`;
  }

  svg += muted(style, legendStartX + 100, legendY, 'More', 10);

  svg += cardFooter();
  return svg;
}
