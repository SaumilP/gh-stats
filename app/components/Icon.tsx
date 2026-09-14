import type { CSSProperties } from "react";

const paths: Record<string, string> = {
  arrow: "M5 12h14m-6-6 6 6-6 6",
  chart: "M4 19V9m5 10V5m5 14v-7m5 7V3",
  code: "m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 20",
  flame: "M12 3c2 6 7 7 7 12a7 7 0 0 1-14 0c0-3 2-5 4-7 0 3 1 4 2 5 2-3 2-6 1-10Z",
  grid: "M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z",
  repo: "M5 3h14v18H5a2 2 0 0 1 0-4h14M5 3a2 2 0 0 0-2 2v14M8 7h7",
  target: "M21 12a9 9 0 1 1-9-9m0 5a4 4 0 1 0 4 4m-4 0 9-9m-5 0h5v5",
  pin: "m9 3 12 12-3 1-3 4-4-4-6 6m3-9-4-4 4-3 1-3Z",
  file: "M14 2H5v20h14V7Zm0 0v6h5M8 12h8m-8 4h6",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-5v5l3 2",
  copy: "M9 9h12v12H9ZM15 5V3H3v12h2",
  check: "m5 12 4 4L19 6",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z",
  sun: "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0-6v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1",
  moon: "M21 13a9 9 0 0 1-10-10A9 9 0 1 0 21 13Z",
  shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Zm-4 9 3 3 5-6",
  bolt: "m13 2-9 12h7l-1 8 10-13h-7Z",
  link: "m10 13 4-4m-5 7-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 8a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-2 2",
  github: "M9 19c-4 1-4-2-6-2m12 5v-4c0-1-.1-1.5-.6-2 3.4-.4 6.6-1.6 6.6-7A5.5 5.5 0 0 0 19.5 5c.2-1.2.1-2.3-.4-3-1.4 0-3.1 1-4.1 1.5a14 14 0 0 0-6 0C8 3 6.3 2 4.9 2c-.5.7-.6 1.8-.4 3A5.5 5.5 0 0 0 3 9c0 5.4 3.2 6.6 6.6 7-.5.5-.6 1-.6 2v4",
};
export function Icon({ name, size = 20, style }: { name: string; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name] || paths.chart} /></svg>;
}
