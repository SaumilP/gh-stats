'use client';

import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PreviewPanel } from './components/PreviewPanel';
import { EmbedSection } from './components/EmbedSection';
import { EndpointsSection } from './components/EndpointsSection';
import { Footer } from './components/Footer';
import { Theme, PreviewState } from '@/lib/types';

export default function Home() {
  const [username, setUsername] = useState('octocat');
  const [theme, setTheme] = useState<Theme>('auto');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from URL parameters on mount
  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window === 'undefined') {
      return;
    }

    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const urlUsername = params.get('username');
    const urlTheme = params.get('theme') as Theme | null;

    // Update state from URL parameters if provided
    if (urlUsername) {
      setUsername(urlUsername);
    }
    if (urlTheme && ['auto', 'dark', 'light'].includes(urlTheme)) {
      setTheme(urlTheme);
    }

    // Mark as initialized for hydration safety
    setIsInitialized(true);
  }, []);

  // Handle preview updates and URL syncing
  const handlePreviewUpdate = useCallback((state: PreviewState) => {
    setUsername(state.username);
    setTheme(state.theme);

    // Update URL without page reload
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams();
      params.set('username', state.username);
      params.set('theme', state.theme);
      window.history.replaceState({}, '', `?${params.toString()}`);
    }
  }, []);

  // Render nothing during hydration to prevent mismatch
  if (!isInitialized) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="flex flex-col">
        {/* Hero Section */}
        <Hero onPreviewUpdate={handlePreviewUpdate} />

        {/* Preview Section - Responsive Grid */}
        <section id="preview" className="py-8 sm:py-12 md:py-20 px-4 sm:px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
              {/* Description Box - Left on desktop */}
              <div className="order-2 md:order-1">
                <div className="glass rounded-lg bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 p-6 sm:p-8">
                  <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-4 text-slate-900 dark:text-slate-50">
                    Preview Your Stats
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-4">
                    Watch your GitHub statistics come to life in real-time. Update the username and theme in the hero section above to see your personalized cards instantly.
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                    These cards are perfect for README files, portfolios, or any place you want to showcase your GitHub profile.
                  </p>
                </div>
              </div>

              {/* Preview Panel - Right on desktop */}
              <div className="order-1 md:order-2">
                <div className="glass rounded-lg bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                  <PreviewPanel username={username} theme={theme} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Embed Section */}
        <EmbedSection username={username} />

        {/* Endpoints Section */}
        <EndpointsSection />
      </main>
      <Footer />
    </>
  );
}
