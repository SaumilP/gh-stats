'use client';

import { useState } from 'react';

type ThemePreview = {
  name: string;
  category: string;
  colors: {
    bg: string;
    fg: string;
    accent: string;
  };
};

const THEME_GALLERY: ThemePreview[] = [
  { name: 'light', category: 'Core', colors: { bg: '#ffffff', fg: '#24292f', accent: '#0969da' } },
  { name: 'dark', category: 'Core', colors: { bg: '#0d1117', fg: '#e6edf3', accent: '#58a6ff' } },
  { name: 'transparent', category: 'Core', colors: { bg: 'transparent', fg: '#24292f', accent: '#0969da' } },
  { name: 'radical', category: 'Popular', colors: { bg: '#141321', fg: '#a9fef7', accent: '#fe428e' } },
  { name: 'merko', category: 'Popular', colors: { bg: '#0a0f0b', fg: '#c8e2a7', accent: '#abd200' } },
  { name: 'gruvbox', category: 'Popular', colors: { bg: '#282828', fg: '#ebdbb2', accent: '#fabd2f' } },
  { name: 'tokyonight', category: 'Popular', colors: { bg: '#1a1b27', fg: '#c0caf5', accent: '#7aa2f7' } },
  { name: 'onedark', category: 'Popular', colors: { bg: '#282c34', fg: '#abb2bf', accent: '#61afef' } },
  { name: 'cobalt', category: 'Popular', colors: { bg: '#193549', fg: '#ffffff', accent: '#ffc600' } },
  { name: 'synthwave', category: 'Popular', colors: { bg: '#2b213a', fg: '#f4eee4', accent: '#e2e9ff' } },
  { name: 'highcontrast', category: 'Popular', colors: { bg: '#000000', fg: '#ffffff', accent: '#00e676' } },
  { name: 'dracula', category: 'Popular', colors: { bg: '#282a36', fg: '#f8f8f2', accent: '#ff79c6' } },
  { name: 'solarized_light', category: 'Solarized', colors: { bg: '#fdf6e3', fg: '#657b83', accent: '#268bd2' } },
  { name: 'solarized_dark', category: 'Solarized', colors: { bg: '#002b36', fg: '#839496', accent: '#268bd2' } },
  { name: 'nord', category: 'Popular', colors: { bg: '#2e3440', fg: '#eceff4', accent: '#88c0d0' } },
  { name: 'material', category: 'Material', colors: { bg: '#263238', fg: '#eeffff', accent: '#82b1ff' } },
  { name: 'material_palenight', category: 'Material', colors: { bg: '#292d3e', fg: '#eeffff', accent: '#c792ea' } },
  { name: 'monokai', category: 'Popular', colors: { bg: '#272822', fg: '#f8f8f2', accent: '#f92672' } },
  { name: 'vscode_dark', category: 'Editors', colors: { bg: '#1e1e1e', fg: '#d4d4d4', accent: '#007acc' } },
  { name: 'atom_dark', category: 'Editors', colors: { bg: '#282c34', fg: '#abb2bf', accent: '#61afef' } },
  { name: 'atom_light', category: 'Editors', colors: { bg: '#fafafa', fg: '#383a42', accent: '#0184bc' } },
  { name: 'github', category: 'GitHub', colors: { bg: '#ffffff', fg: '#24292f', accent: '#0969da' } },
  { name: 'github_dark', category: 'GitHub', colors: { bg: '#0d1117', fg: '#e6edf3', accent: '#58a6ff' } },
  { name: 'github_dimmed', category: 'GitHub', colors: { bg: '#0d1117', fg: '#e6edf3', accent: '#79c0ff' } },
  { name: 'slack_dark', category: 'Apps', colors: { bg: '#1f0a1f', fg: '#f7f7f7', accent: '#e01e5a' } },
  { name: 'discord', category: 'Apps', colors: { bg: '#36393f', fg: '#dcddde', accent: '#7289da' } },
  { name: 'twilight', category: 'Popular', colors: { bg: '#141414', fg: '#f7f7f7', accent: '#d1d1d1' } },
  { name: 'seti', category: 'Editors', colors: { bg: '#151718', fg: '#d4d4d4', accent: '#15a0d0' } },
  { name: 'spacegray', category: 'Popular', colors: { bg: '#2b2b2b', fg: '#e0e0e0', accent: '#7ad8ff' } },
  { name: 'zenburn', category: 'Popular', colors: { bg: '#383838', fg: '#dcdcdc', accent: '#e8d4b8' } },
  { name: 'ayu_dark', category: 'Ayu', colors: { bg: '#0f1419', fg: '#e6e1cf', accent: '#39bae6' } },
  { name: 'ayu_mirage', category: 'Ayu', colors: { bg: '#1f2430', fg: '#cbccc6', accent: '#73d7ff' } },
  { name: 'dracula_pro_blue', category: 'Dracula', colors: { bg: '#282a36', fg: '#f8f8f2', accent: '#8be9fd' } },
  { name: 'dracula_pro_green', category: 'Dracula', colors: { bg: '#282a36', fg: '#f8f8f2', accent: '#50fa7b' } },
  { name: 'dracula_pro_pink', category: 'Dracula', colors: { bg: '#282a36', fg: '#f8f8f2', accent: '#ff79c6' } },
  { name: 'catppuccin_latte', category: 'Catppuccin', colors: { bg: '#eff1f5', fg: '#4c4f69', accent: '#1e66f5' } },
  { name: 'catppuccin_frappe', category: 'Catppuccin', colors: { bg: '#292c3c', fg: '#c6d0f5', accent: '#8caaee' } },
  { name: 'catppuccin_macchiato', category: 'Catppuccin', colors: { bg: '#24273a', fg: '#cad3f5', accent: '#8aadf4' } },
  { name: 'catppuccin_mocha', category: 'Catppuccin', colors: { bg: '#1e1e2e', fg: '#cdd6f4', accent: '#89b4fa' } },
  { name: 'onedark_pro', category: 'One', colors: { bg: '#282c34', fg: '#abb2bf', accent: '#61afef' } },
  { name: 'eva_dark', category: 'Popular', colors: { bg: '#0d1117', fg: '#e6e6fa', accent: '#a1ff60' } },
  { name: 'everforest', category: 'Popular', colors: { bg: '#2d2d2d', fg: '#e8e8e8', accent: '#7fbbb3' } },
  { name: 'flexoki_dark', category: 'Popular', colors: { bg: '#100f0f', fg: '#b7b5ac', accent: '#df5e3b' } },
  { name: 'copilot', category: 'GitHub', colors: { bg: '#0d1117', fg: '#c9d1d9', accent: '#58a6ff' } },
];

const categories = Array.from(new Set(THEME_GALLERY.map(t => t.category))).sort();

export default function ThemeGallery() {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredThemes = selectedCategory === 'All'
    ? THEME_GALLERY
    : THEME_GALLERY.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'All'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredThemes.map((theme) => (
          <button
            key={theme.name}
            onClick={() => setSelectedTheme(theme.name)}
            className={`relative group cursor-pointer transition-transform hover:scale-105 ${
              selectedTheme === theme.name ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {/* Theme preview card */}
            <div className="rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700">
              {/* Background */}
              <div
                className="h-24 flex flex-col justify-between p-2"
                style={{ backgroundColor: theme.colors.bg }}
              >
                {/* Text preview */}
                <div
                  className="text-xs font-semibold truncate"
                  style={{ color: theme.colors.accent }}
                >
                  Title
                </div>
                <div
                  className="text-xs truncate opacity-75"
                  style={{ color: theme.colors.fg }}
                >
                  Body text preview
                </div>
              </div>

              {/* Color swatches */}
              <div className="flex gap-1 p-2 bg-slate-50 dark:bg-slate-800">
                <div
                  className="flex-1 h-4 rounded"
                  style={{ backgroundColor: theme.colors.bg }}
                  title="Background"
                />
                <div
                  className="flex-1 h-4 rounded"
                  style={{ backgroundColor: theme.colors.fg }}
                  title="Foreground"
                />
                <div
                  className="flex-1 h-4 rounded"
                  style={{ backgroundColor: theme.colors.accent }}
                  title="Accent"
                />
              </div>

              {/* Theme name */}
              <div className="px-2 py-1 bg-white dark:bg-slate-900 text-center">
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                  {theme.name}
                </p>
              </div>
            </div>

            {/* Copy to clipboard tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs px-2 py-1 rounded whitespace-nowrap">
              Click to copy
            </div>
          </button>
        ))}
      </div>

      {/* Usage example */}
      {selectedTheme && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-3">Usage</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Use the <code className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">{selectedTheme}</code> theme:
          </p>
          <div className="bg-slate-900 dark:bg-slate-950 rounded p-3 overflow-x-auto">
            <code className="text-sm text-slate-100">
              {`https://gh-stats-plum-five.vercel.app/api/stats?username=octocat&theme=${selectedTheme}`}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
