"use client";

import { useEffect, useState, useRef, type FormEvent } from "react";
import { CARD_TYPES, DEFAULT_CONFIG, cardPath, configFromSearch, embedCode, type StudioConfig } from "@/lib/studio";
import { Icon } from "./Icon";

type ThemeOption = { name: string; bg: string; accent: string };
type Preview = { src: string; status: "example" | "fresh" | "stale"; updatedAt?: string };

export function CardStudio({ themes }: { themes: ThemeOption[] }) {
  const [config, setConfig] = useState<StudioConfig>(DEFAULT_CONFIG);
  const [draft, setDraft] = useState(DEFAULT_CONFIG.username);
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [themeSearch, setThemeSearch] = useState("");
  const [format, setFormat] = useState("Markdown");
  const [origin, setOrigin] = useState("");
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);
  const usernameRef = useRef<HTMLInputElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const responseCache = useRef(new Map<string, Preview>());

  useEffect(() => {
    const restore = () => {
      const restored = configFromSearch(window.location.search, themes.map(theme => theme.name));
      setConfig(restored); setDraft(restored.username);
      setLive(new URLSearchParams(window.location.search).has("username"));
    };
    restore(); setOrigin(window.location.origin); setReady(true);
    window.addEventListener("popstate", restore);
    return () => { window.removeEventListener("popstate", restore); if (copyTimer.current) clearTimeout(copyTimer.current); };
  }, [themes]);

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(config)) {
      if (key === "username" && !live) continue;
      if (String(value) !== String(DEFAULT_CONFIG[key as keyof StudioConfig]) || key === "card" || (key === "username" && live)) params.set(key, String(value));
    }
    window.history.replaceState(null, "", `?${params}${window.location.hash}`);
  }, [config, live, ready]);

  const path = cardPath(config);
  useEffect(() => {
    setError("");
    if (!live) { setPreview(null); return; }
    const cached = responseCache.current.get(path);
    if (cached && !retry) { setPreview(cached); setLoading(false); return; }
    const controller = new AbortController();
    let timedOut = false;
    setLoading(true);
    const deadline = setTimeout(() => { timedOut = true; controller.abort(); }, 26_000);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(path, { signal: controller.signal });
        const svg = await response.text();
        if (!response.ok || response.headers.get("X-Card-Status") === "error" || svg.includes('data-error="true"')) {
          throw new Error("This card couldn’t be generated. Check the profile or resource is public. If it is, the data provider may be temporarily unavailable.");
        }
        if (!svg.includes("<svg") || svg.length > 1_000_000) throw new Error("The service returned an unexpected response. Please try again shortly.");
        const next: Preview = { src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, status: response.headers.get("X-Card-Status") === "stale" ? "stale" : "fresh", updatedAt: response.headers.get("X-Data-Updated-At") || undefined };
        if (responseCache.current.size >= 30) responseCache.current.delete(responseCache.current.keys().next().value!);
        responseCache.current.set(path, next);
        setPreview(next);
      } catch (cause) {
        if (!controller.signal.aborted || timedOut) setError(timedOut ? "The preview took too long. Your existing embed is unchanged; try again shortly." : cause instanceof Error ? cause.message : "Unable to load the preview.");
      } finally { if (!controller.signal.aborted || timedOut) setLoading(false); clearTimeout(deadline); }
    }, 450);
    return () => { clearTimeout(timer); clearTimeout(deadline); controller.abort(); };
  }, [path, live, retry]);

  const update = <K extends keyof StudioConfig>(key: K, value: StudioConfig[K]) => { setConfig(current => ({ ...current, [key]: value })); setRetry(0); };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = draft.trim().replace(/^@/, "");
    if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(value)) { setError("Enter a valid username: 1–39 letters, numbers, or hyphens."); usernameRef.current?.focus(); return; }
    update("username", value.toLowerCase()); setDraft(value); setLive(true); setRetry(value.toLowerCase() === config.username ? retry + 1 : 0);
  };
  const code = embedCode(config, origin, format);
  const copy = async (value: string, message: string) => {
    try { await navigator.clipboard.writeText(value); setNotice(message); }
    catch { setNotice("Clipboard unavailable. Select and copy the code below."); }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setNotice(""), 4000);
  };
  const selectedCard = CARD_TYPES.find(card => card.id === config.card)!;
  const popular = ["dark", "light", "tokyonight", "catppuccin_mocha", "radical", "nord"];
  const visibleThemes = themeSearch ? themes.filter(theme => theme.name.includes(themeSearch.toLowerCase())).slice(0, 8) : popular.map(name => themes.find(theme => theme.name === name)!).filter(Boolean);

  return <section id="studio" className="studio-section shell">
    <div className="section-heading"><div><span className="eyebrow">THE CARD STUDIO</span><h2>Make it unmistakably yours.</h2><p>One username. A few personal touches. Ready for your README.</p></div><span className="step-label"><span>01</span> Customize <i /> <span>02</span> Embed</span></div>
    <div className="studio-workspace">
      <aside className="studio-controls" aria-label="Card configuration">
        <form onSubmit={submit} className="profile-form"><label htmlFor="studio-username">GitHub username</label><div className="username-field"><span aria-hidden="true">@</span><input ref={usernameRef} id="studio-username" name="username" value={draft} onChange={event => setDraft(event.target.value)} placeholder="your-handle…" autoComplete="off" spellCheck={false} maxLength={39} /><button type="submit" className="icon-button" aria-label="Generate cards for username" disabled={loading}><Icon name="arrow" /></button></div><button type="submit" className="button primary generate-button" disabled={loading}>{loading ? "Creating your card…" : "Generate my card"}<Icon name="arrow" size={16} /></button></form>
        <div className="control-group"><span className="control-label">Choose your card <span>09</span></span><div className="card-type-grid">{CARD_TYPES.map(card => <button key={card.id} className={`card-type ${config.card === card.id ? "selected" : ""}`} onClick={() => update("card", card.id)} aria-pressed={config.card === card.id}><Icon name={card.icon} size={17} />{card.label}</button>)}</div></div>
        {config.card === "pin" && <div className="control-group"><label htmlFor="repo">Repository name</label><input id="repo" name="repo" value={config.repo} spellCheck={false} onChange={event => update("repo", event.target.value)} placeholder="your-project…" /></div>}
        {config.card === "gist" && <div className="control-group"><label htmlFor="gist">Public gist ID</label><input id="gist" name="gist" value={config.gist} spellCheck={false} onChange={event => update("gist", event.target.value)} placeholder="Paste a gist ID…" /></div>}
        {config.card === "wakatime" && <div className="control-group"><label htmlFor="range">WakaTime range</label><select id="range" value={config.range} onChange={event => update("range", event.target.value)}><option value="last_7_days">Last 7 days</option><option value="last_30_days">Last 30 days</option><option value="last_year">Last year</option><option value="all_time">All time</option></select><p className="field-hint">Enter your WakaTime username above. Statistics must be public.</p></div>}
        <div className="control-group"><label htmlFor="theme-search">Find your theme <span className="count-label">{themes.length} themes</span></label><input id="theme-search" type="search" value={themeSearch} onChange={event => setThemeSearch(event.target.value)} placeholder="Search themes…" autoComplete="off" /><div className="theme-swatches">{visibleThemes.map(theme => <button key={theme.name} title={theme.name} className={config.theme === theme.name ? "selected" : ""} style={{ background: theme.bg, color: theme.accent }} onClick={() => update("theme", theme.name)} aria-label={`${theme.name} theme`} aria-pressed={config.theme === theme.name}><span>Aa</span>{config.theme === theme.name && <Icon name="check" size={12} />}</button>)}</div>{visibleThemes.length === 0 && <p className="field-hint">No matching themes. Try “dark” or “nord”.</p>}<select aria-label="Card theme" value={config.theme} onChange={event => update("theme", event.target.value)}>{themes.map(theme => <option key={theme.name} value={theme.name}>{theme.name.replaceAll("_", " ")}</option>)}</select></div>
        <details className="advanced-controls"><summary>Fine-tune your card <span>+</span></summary><div className="control-group"><label htmlFor="custom-title">Custom title</label><input id="custom-title" maxLength={40} value={config.title} onChange={event => update("title", event.target.value)} placeholder="Make it personal…" /></div>{["languages", "wakatime"].includes(config.card) && <div className="control-group"><label htmlFor="layout">Chart layout</label><select id="layout" value={config.layout} onChange={event => update("layout", event.target.value)}>{["normal", "compact", "donut", "donut-vertical", "pie"].map(layout => <option key={layout}>{layout}</option>)}</select></div>}<div className="control-group inline-control"><label htmlFor="accent">Title color</label><input type="color" id="accent" value={/^#[0-9a-f]{6}$/i.test(config.accent) ? config.accent : "#6ee7b7"} onChange={event => update("accent", event.target.value)} /><button className="text-button" onClick={() => update("accent", "")}>Reset</button></div><label className="checkbox-label"><input type="checkbox" checked={config.border} onChange={event => update("border", event.target.checked)} />Show card border</label></details>
      </aside>
      <div className="studio-output">
        <div className="preview-toolbar"><span><span className={`status-dot ${loading ? "busy" : ""}`} />{loading ? "Generating preview" : preview?.status === "stale" ? "Saved snapshot" : live && preview ? "Your preview" : "Example preview"}</span><span className="mono">SVG <span className="muted">/</span> {selectedCard.label}</span></div>
        <div className={`preview-canvas ${loading ? "is-loading" : ""}`} aria-busy={loading}>
          <div className="canvas-guide guide-top" aria-hidden="true" /><div className="canvas-guide guide-bottom" aria-hidden="true" />
          <img src={preview?.src || `/examples/${config.card}.svg`} alt={`${selectedCard.label} ${preview ? `for ${config.username}` : "example with illustrative data"}`} width={480} height={268} className="generated-card" onError={() => setError("The card image could not be displayed. Try generating it again.")} />
          <span className="canvas-caption">{live && preview ? `@${config.username}` : "Illustrative data · Your profile goes here"}</span>
        </div>
        <div className="preview-detail"><div><Icon name={selectedCard.icon} size={17} /><span>{selectedCard.description}</span></div><span>Vector sharp. Anywhere.</span></div>
        <div className="preview-feedback" aria-live="polite">{error ? <div className="error-message"><strong>Let’s try that again.</strong><p>{error}</p>{live && <button className="text-button" onClick={() => setRetry(value => value + 1)}>Retry preview →</button>}</div> : preview?.status === "stale" ? <p>Showing the last successful snapshot while the provider recovers. {preview.updatedAt && `Updated ${new Date(preview.updatedAt).toLocaleDateString()}.`}</p> : <p><Icon name="clock" size={14} />Refreshed daily. Cached for fast, reliable embeds.</p>}</div>
        <div className="embed-panel" id="embed"><div className="embed-heading"><div><span className="eyebrow">TAKE IT WITH YOU</span><h3>Your README, upgraded.</h3></div><button className="button primary" disabled={!origin || loading || Boolean(error)} onClick={() => copy(code, "Embed code copied. Your README is ready for an upgrade.")}><Icon name="copy" size={16} />Copy embed</button></div>
          <div className="code-tabs" role="group" aria-label="Embed format">{["Markdown", "HTML", "Adaptive", "URL"].map(value => <button key={value} aria-pressed={format === value} className={format === value ? "selected" : ""} onClick={() => setFormat(value)}>{value}</button>)}</div>
          <pre tabIndex={0} aria-label="Embed code"><code>{origin ? code : "Preparing your embed…"}</code></pre><div className="embed-bottom"><span>{format === "Adaptive" ? "Uses dark and light cards to match the reader’s appearance." : "Paste into your profile’s README.md. That’s it."}</span><button className="text-button" onClick={() => copy(window.location.href, "Studio link copied.")}><Icon name="link" size={14} />Share setup</button></div><p className="copy-notice" role="status">{notice}</p>
        </div>
      </div>
    </div>
  </section>;
}
