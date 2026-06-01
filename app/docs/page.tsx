'use client';

import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'api-endpoints', label: 'API Endpoints' },
    { id: 'query-parameters', label: 'Query Parameters' },
    { id: 'themes', label: 'Themes' },
    { id: 'examples', label: 'Examples' },
    { id: 'deployment', label: 'Deployment' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <>
      <Header />
      <main className="flex flex-col">
        <div className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-20 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wider mb-4">
                    Documentation
                  </h3>
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50'
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="lg:col-span-3">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {/* Overview */}
                  {activeSection === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4">
                          gh-stats Documentation
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                          Generate beautiful GitHub statistics cards as SVG images for your README files, portfolios, or any web project.
                        </p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">What is gh-stats?</h3>
                        <p className="text-blue-800 dark:text-blue-300 text-sm">
                          gh-stats is a self-hosted GitHub statistics card generator that runs on Vercel. It provides multiple card types to showcase your GitHub profile metrics including stats, languages, repositories, and contribution streaks.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">📊 Features</h4>
                          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                            <li>✓ 8+ card types</li>
                            <li>✓ 15+ built-in themes</li>
                            <li>✓ Custom colors & styling</li>
                            <li>✓ Server-side caching</li>
                            <li>✓ JSON & SVG output</li>
                            <li>✓ Zero dependencies</li>
                          </ul>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">⚡ Performance</h4>
                          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                            <li>✓ Image optimization</li>
                            <li>✓ 6h API cache</li>
                            <li>✓ 30s function timeout</li>
                            <li>✓ CDN caching</li>
                            <li>✓ Fast TTFB</li>
                            <li>✓ Minimal JS bundle</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Getting Started */}
                  {activeSection === 'getting-started' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Getting Started</h2>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">Basic Usage</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                          The simplest way to add a gh-stats card to your README is with a markdown image link:
                        </p>
                        <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto">
                          <code className="text-sm text-slate-100">
                            {`![GitHub stats](https://gh-stats-plum-five.vercel.app/api/stats?username=YOUR_USERNAME&theme=dark)`}
                          </code>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">Theme-Aware Embedding</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                          For theme-aware cards that respect user's light/dark mode preference:
                        </p>
                        <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto">
                          <code className="text-sm text-slate-100 block whitespace-pre-wrap">
{`<picture>
  <source media="(prefers-color-scheme: dark)"
          srcset="https://gh-stats-plum-five.vercel.app/api/stats?username=YOUR_USERNAME&theme=dark" />
  <img src="https://gh-stats-plum-five.vercel.app/api/stats?username=YOUR_USERNAME&theme=light"
       alt="GitHub stats" />
</picture>`}
                          </code>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">Available Card Types</h3>
                        <div className="space-y-2">
                          {[
                            { name: '/api/stats', desc: 'Profile stats (repos, followers, stars, forks)' },
                            { name: '/api/languages', desc: 'Top programming languages' },
                            { name: '/api/repos', desc: 'Top repositories by stars/forks' },
                            { name: '/api/streak', desc: 'Contribution streak' },
                            { name: '/api/focus', desc: 'Language category distribution' },
                            { name: '/api/impact', desc: 'Contribution timeline heatmap' },
                            { name: '/api/pin', desc: 'Pinned repository' },
                            { name: '/api/gist', desc: 'Gist card' },
                            { name: '/api/wakatime', desc: 'WakaTime statistics' },
                          ].map((card) => (
                            <div key={card.name} className="bg-slate-50 dark:bg-slate-800 rounded p-3 border border-slate-200 dark:border-slate-700">
                              <code className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">{card.name}</code>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{card.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* API Endpoints */}
                  {activeSection === 'api-endpoints' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">API Endpoints</h2>

                      <div className="space-y-6">
                        {[
                          {
                            endpoint: '/api/stats',
                            desc: 'GitHub profile statistics card',
                            params: ['username (required)', 'theme', 'format', 'compact'],
                            example: '/api/stats?username=octocat&theme=dark',
                          },
                          {
                            endpoint: '/api/languages',
                            desc: 'Top programming languages by frequency',
                            params: ['username (required)', 'theme', 'mode (primary|bytes)', 'layout (normal|compact|donut|pie)'],
                            example: '/api/languages?username=octocat&mode=bytes&theme=dark',
                          },
                          {
                            endpoint: '/api/repos',
                            desc: 'Top repositories',
                            params: ['username (required)', 'theme', 'count (1-10)', 'sort (stars|forks|updated)'],
                            example: '/api/repos?username=octocat&count=6&sort=stars',
                          },
                          {
                            endpoint: '/api/streak',
                            desc: 'Contribution streak',
                            params: ['username (required)', 'theme'],
                            example: '/api/streak?username=octocat&theme=dark',
                          },
                          {
                            endpoint: '/api/focus',
                            desc: 'Recent focus by language category',
                            params: ['username (required)', 'theme', 'max_repos (10-100)'],
                            example: '/api/focus?username=octocat&theme=dark',
                          },
                          {
                            endpoint: '/api/impact',
                            desc: 'Contribution timeline heatmap (365 days)',
                            params: ['username (required)', 'theme', 'hide_title', 'custom_title'],
                            example: '/api/impact?username=octocat&theme=dark',
                          },
                        ].map((item, idx) => (
                          <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                            <h3 className="font-mono font-bold text-blue-600 dark:text-blue-400 mb-2">{item.endpoint}</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">{item.desc}</p>
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase mb-2">Parameters:</p>
                              <div className="flex flex-wrap gap-2">
                                {item.params.map((param) => (
                                  <span key={param} className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs px-2 py-1 rounded">
                                    {param}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 rounded p-2">
                              <code className="text-xs text-slate-600 dark:text-slate-400 break-all">{item.example}</code>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Query Parameters */}
                  {activeSection === 'query-parameters' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Query Parameters</h2>

                      <div className="space-y-4">
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">username</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">GitHub username to fetch stats for. <span className="font-semibold">Required.</span></p>
                          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">?username=octocat</code>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">theme</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Color theme for the card.</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Options: <code>light | dark | auto | default | transparent | radical | merko | gruvbox | tokyonight | onedark | cobalt | synthwave | highcontrast | dracula</code></p>
                          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">?theme=dark</code>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">format</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Response format.</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Options: <code>svg | json</code> (default: svg)</p>
                          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">?format=json</code>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">compact</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Use compact card layout.</p>
                          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">?compact=1</code>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">cacheSeconds</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Override CDN cache duration in seconds.</p>
                          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">?cacheSeconds=86400</code>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">Custom Colors</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Customize card appearance with color parameters:</p>
                          <div className="space-y-2 text-sm">
                            <p><code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">title_color</code> - Title text color</p>
                            <p><code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">text_color</code> - Body text color</p>
                            <p><code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">bg_color</code> - Background color</p>
                            <p><code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">border_color</code> - Border color</p>
                          </div>
                          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded mt-3 block">?title_color=0969da&bg_color=ffffff</code>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Themes */}
                  {activeSection === 'themes' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Built-in Themes</h2>

                      <p className="text-slate-600 dark:text-slate-400">
                        Choose from 15+ carefully designed themes or create your own with custom colors.
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {['light', 'dark', 'default', 'transparent', 'radical', 'merko', 'gruvbox', 'tokyonight', 'onedark', 'cobalt', 'synthwave', 'highcontrast', 'dracula'].map((theme) => (
                          <div key={theme} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-center">
                            <p className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-50">{theme}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                              <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">theme={theme}</code>
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Custom Colors</h3>
                        <p className="text-blue-800 dark:text-blue-300 text-sm">
                          Override any theme colors using query parameters: <code>?title_color=FF0000&bg_color=FFFFFF</code>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Examples */}
                  {activeSection === 'examples' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Examples</h2>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">Basic Stats Card</h3>
                          <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto mb-3">
                            <code className="text-sm text-slate-100">{`![GitHub stats](https://gh-stats-plum-five.vercel.app/api/stats?username=octocat&theme=dark)`}</code>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">Languages with Donut Chart</h3>
                          <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto mb-3">
                            <code className="text-sm text-slate-100">{`![Languages](https://gh-stats-plum-five.vercel.app/api/languages?username=octocat&layout=donut&theme=dark)`}</code>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">Top Repos</h3>
                          <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto mb-3">
                            <code className="text-sm text-slate-100">{`![Top Repos](https://gh-stats-plum-five.vercel.app/api/repos?username=octocat&count=6&sort=stars&theme=dark)`}</code>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">JSON Output</h3>
                          <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto mb-3">
                            <code className="text-sm text-slate-100">{`https://gh-stats-plum-five.vercel.app/api/stats?username=octocat&format=json`}</code>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Returns JSON data for custom integrations</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Deployment */}
                  {activeSection === 'deployment' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Self-Hosting & Deployment</h2>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">Deploy to Vercel</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                          The easiest way to self-host gh-stats is on Vercel:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400">
                          <li>Fork the repository</li>
                          <li>Create a new Vercel project and import your fork</li>
                          <li>Add environment variables (optional): <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">GITHUB_TOKEN</code></li>
                          <li>Deploy automatically on push</li>
                        </ol>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">Environment Variables</h3>
                        <div className="space-y-3">
                          <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 border border-slate-200 dark:border-slate-700">
                            <p className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-50">GITHUB_TOKEN</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Personal access token for GitHub API. Increases rate limits (optional)</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 border border-slate-200 dark:border-slate-700">
                            <p className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-50">CACHE_ENABLED</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Enable server-side caching (default: true)</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 border border-slate-200 dark:border-slate-700">
                            <p className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-50">KV_REST_API_URL</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Vercel KV database URL for distributed caching (optional)</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                        <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">✅ Requirements</h3>
                        <ul className="text-green-800 dark:text-green-300 text-sm space-y-1">
                          <li>Node.js 24+</li>
                          <li>npm or pnpm</li>
                          <li>Vercel account (free tier supported)</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* FAQ */}
                  {activeSection === 'faq' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Frequently Asked Questions</h2>

                      <div className="space-y-4">
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">Do I need a GitHub token?</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            No, but it's recommended. GitHub's public API has lower rate limits (60 req/hr) without a token. With a token, you get 5,000 req/hr.
                          </p>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">How often are cards updated?</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Cards are cached for 6 hours by default, then fetched fresh from GitHub. You can override with the <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">cacheSeconds</code> parameter.
                          </p>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">Can I customize the appearance?</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Yes! Use color query parameters like <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">title_color</code>, <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">bg_color</code>, etc. Or choose from 15+ built-in themes.
                          </p>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">What data is collected?</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            None. All data comes from GitHub's public API. We don't store usernames, tokens, or any personal information.
                          </p>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">Is there an uptime SLA?</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            We aim for 99.95% uptime on Vercel's infrastructure. Check status at <a href="https://www.vercel-status.com" className="text-blue-600 dark:text-blue-400 hover:underline">vercel-status.com</a>.
                          </p>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">How do I report bugs?</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Open an issue on GitHub at <a href="https://github.com/SaumilP/gh-stats" className="text-blue-600 dark:text-blue-400 hover:underline">github.com/SaumilP/gh-stats</a>.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
