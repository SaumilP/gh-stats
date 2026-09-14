import { test } from "node:test";
import assert from "node:assert/strict";
import { targets, validateSvg } from "../scripts/pregenerate.mjs";
test("static export accepts valid config and only adds optional resources when configured", () => {
  const env = { GH_STATS_BASE_URL: "https://example.com", GH_STATS_USERNAME: "octocat" };
  assert.equal(targets(env).length, 12);
  const extended = targets({ ...env, GH_REPOSITORY_NAME: "hello-world", GIST_ID: "abc123" });
  assert.equal(extended.length, 16);
  assert.equal(extended.find(target => target.name === "pin-dark.svg")?.url.searchParams.get("repo"), "octocat/hello-world");
  assert.equal(extended.find(target => target.name === "gist-light.svg")?.url.searchParams.get("id"), "abc123");
});
test("static export rejects HTTP-200 error cards as well as non-SVG responses", () => {
  assert.throws(() => validateSvg('<svg data-error="true"></svg>'));
  assert.throws(() => validateSvg('<svg aria-label="Error: stats"></svg>'));
  assert.throws(() => validateSvg("Service unavailable"));
  assert.doesNotThrow(() => validateSvg('<svg xmlns="http://www.w3.org/2000/svg"></svg>'));
});
