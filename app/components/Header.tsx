import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Icon } from "./Icon";

export function Header() {
  return <header className="site-header"><div className="shell header-inner">
    <Link href="/" className="brand" aria-label="gh-stats home"><span className="brand-mark"><Icon name="chart" size={19} /></span>gh-stats<span className="brand-slash">/</span></Link>
    <nav aria-label="Main navigation"><Link href="/#studio">Card studio</Link><Link href="/#collection" className="hide-small">Collection</Link><Link href="/docs">Docs</Link></nav>
    <div className="header-actions"><a href="https://github.com/SaumilP/gh-stats" className="github-link" aria-label="View gh-stats on GitHub"><Icon name="github" size={18} /><span className="hide-small">GitHub</span><Icon name="arrow" size={14} /></a><ThemeToggle /></div>
  </div></header>;
}
