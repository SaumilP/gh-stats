import { Icon } from "./Icon";
export function Footer() {
  return <footer className="site-footer"><div className="shell footer-inner"><div><a href="/" className="brand"><span className="brand-mark"><Icon name="chart" size={17} /></span>gh-stats</a><p>A little more you. A little less plain README.</p></div><nav aria-label="Footer"><a href="/docs">Documentation</a><a href="/api/health">Service health</a><a href="https://github.com/SaumilP/gh-stats">Open source ↗</a></nav></div><div className="shell footer-bottom"><span>Made for people who build.</span><span>MIT licensed · Not affiliated with GitHub</span></div></footer>;
}
