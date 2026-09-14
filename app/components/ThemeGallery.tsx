"use client";
import { useState } from "react";
import { THEMES } from "@/lib/theme";
export default function ThemeGallery() {
  const [query, setQuery] = useState("");
  const themes = Object.entries(THEMES).filter(([name]) => name !== "default" && name.includes(query.toLowerCase()));
  return <div><label htmlFor="gallery-search" className="sr-only">Search all themes</label><input id="gallery-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search themes…" /><div className="theme-gallery-grid">{themes.map(([name, colors]) => <a href={`/?theme=${name}#studio`} key={name} className="theme-tile" style={{ background: colors.bg, color: colors.accent }}><strong>Aa</strong><span>{name}</span></a>)}</div>{!themes.length && <p>No themes found. Try “dark” or “catppuccin”.</p>}</div>;
}
