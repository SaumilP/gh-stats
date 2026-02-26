function qs(id) {
  return document.getElementById(id);
}

function clampUsername(u) {
  const s = String(u || "").trim();
  if (!s) return "octocat";
  // GitHub usernames: alnum or hyphen, max 39, no leading/trailing hyphen (keep it simple here)
  const clean = s.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 39);
  return clean || "octocat";
}

function buildUrl(path, params) {
  const u = new URL(path, window.location.origin);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
  return u.toString();
}

function pictureUrl(endpoint, username, themeChoice, extra) {
  const common = { username, format: "svg", compact: "1", ...extra };
  if (themeChoice === "dark" || themeChoice === "light") {
    return buildUrl(endpoint, { ...common, theme: themeChoice });
  }
  // auto: let the viewer decide using prefers-color-scheme via a single SVG; default to dark
  return buildUrl(endpoint, { ...common, theme: "dark" });
}

function updatePreview() {
  const username = clampUsername(qs("username").value);
  const themeChoice = qs("theme").value;

  qs("img-stats").src = pictureUrl("/api/stats", username, themeChoice, {});
  qs("img-langs").src = pictureUrl("/api/languages", username, themeChoice, { mode: "primary" });
  qs("img-repos").src = pictureUrl("/api/repos", username, themeChoice, { count: "6", sort: "stars" });
  qs("img-streak").src = pictureUrl("/api/streak", username, themeChoice, {});

  const domain = window.location.host;
  const base = `https://${domain}`;
  const user = username;

  const code = [
    `<picture>`,
    `  <source srcset="${base}/api/stats?username=${user}&theme=dark" media="(prefers-color-scheme: dark)">`,
    `  <img src="${base}/api/stats?username=${user}&theme=light" alt="GitHub stats" />`,
    `</picture>`,
    ``,
    `<!-- Languages (cheap default) -->`,
    `<img src="${base}/api/languages?username=${user}&mode=primary&theme=dark" alt="Top languages" />`,
    ``,
    `<!-- Repos -->`,
    `<img src="${base}/api/repos?username=${user}&count=6&sort=stars&theme=dark" alt="Top repos" />`,
    ``,
    `<!-- Streak (token recommended) -->`,
    `<img src="${base}/api/streak?username=${user}&theme=dark" alt="Contribution streak" />`,
  ].join("\n");

  qs("embedCode").textContent = code;

  const url = new URL(window.location.href);
  url.searchParams.set("username", username);
  url.searchParams.set("theme", themeChoice);
  window.history.replaceState({}, "", url.toString());
}

function init() {
  const url = new URL(window.location.href);
  const u = clampUsername(url.searchParams.get("username") || "octocat");
  const t = (url.searchParams.get("theme") || "auto").toLowerCase();

  qs("username").value = u;
  qs("theme").value = (t === "dark" || t === "light" || t === "auto") ? t : "auto";

  qs("apply").addEventListener("click", updatePreview);
  qs("username").addEventListener("keydown", (e) => {
    if (e.key === "Enter") updatePreview();
  });

  qs("copyEmbed").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(qs("embedCode").textContent || "");
      qs("copyEmbed").textContent = "Copied";
      setTimeout(() => (qs("copyEmbed").textContent = "Copy"), 900);
    } catch {
      qs("copyEmbed").textContent = "Copy failed";
      setTimeout(() => (qs("copyEmbed").textContent = "Copy"), 900);
    }
  });

  updatePreview();
}

init();

