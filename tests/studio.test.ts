import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_CONFIG, cardPath, configFromSearch, embedCode } from "../lib/studio";

test("embed formats preserve card configuration and escape HTML", () => {
  const config = { ...DEFAULT_CONFIG, username: "octocat", card: "languages" as const, theme: "nord", layout: "donut", title: 'My "code" & <work>', border: false };
  const markdown = embedCode(config, "https://example.com", "Markdown");
  assert.match(markdown, /theme=nord/);
  assert.match(markdown, /layout=donut/);
  const html = embedCode(config, "https://example.com", "HTML");
  assert.match(html, /&amp;theme=nord/);
  const adaptive = embedCode(config, "https://example.com", "Adaptive");
  assert.match(adaptive, /theme=dark/);
  assert.match(adaptive, /theme=light/);
  assert.doesNotMatch(adaptive, /theme=auto/);
});

test("deep links restore supported configuration and reject unknown themes", () => {
  const config = configFromSearch("?username=someone&card=languages&theme=nord&layout=pie&border=false", ["dark", "nord"]);
  assert.equal(config.card, "languages"); assert.equal(config.layout, "pie"); assert.equal(config.border, false);
  assert.equal(configFromSearch("?theme=unknown&card=nope", ["dark"]).theme, "dark");
  assert.match(cardPath({ ...DEFAULT_CONFIG, card: "pin", repo: "hello" }), /repo=octocat%2Fhello/);
  assert.match(cardPath({ ...DEFAULT_CONFIG, card: "gist", gist: "123" }), /id=123/);
});
