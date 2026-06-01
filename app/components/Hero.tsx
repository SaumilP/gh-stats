'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Input from './Input';
import Button from './Button';
import { clampUsername } from '@/lib/api';
import { Theme, PreviewState } from '@/lib/types';

interface HeroProps {
  onPreviewUpdate: (state: PreviewState) => void;
}

export function Hero({ onPreviewUpdate }: HeroProps) {
  const [username, setUsername] = useState('octocat');
  const [theme, setTheme] = useState<Theme>('auto');

  const handleUpdate = useCallback(() => {
    const cleanedUsername = clampUsername(username);
    onPreviewUpdate({
      username: cleanedUsername,
      theme,
    });
  }, [username, theme, onPreviewUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUpdate();
    }
  }, [handleUpdate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 -z-10" />

      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Form and Content */}
          <motion.div
            className="order-2 md:order-1 space-y-6 sm:space-y-8"
            variants={itemVariants}
          >
            {/* Logo and Badge */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium rounded-full">
                  Vercel-friendly GitHub stats
                </span>
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl font-black leading-tight text-slate-900 dark:text-slate-50">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Beautiful Stats
                </span>
                {' '}for Your GitHub
              </h1>
            </div>

            {/* Lead paragraph */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
              Generate stunning GitHub statistics cards instantly. No backend needed. Perfect for your README or profile.
            </p>

            {/* Glass Form Panel */}
            <motion.div
              className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 rounded-2xl p-5 sm:p-6 space-y-4"
              variants={itemVariants}
            >
              {/* Input Grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                  <Input
                    id="username"
                    label="GitHub Username"
                    placeholder="octocat"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                    type="text"
                  />
                </div>

                {/* Theme Select */}
                <div className="space-y-2">
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Theme
                  </label>
                  <select
                    id="theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as Theme)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-50 text-base sm:text-sm h-11 sm:h-10 px-3 sm:px-4 py-2 sm:py-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="auto">Auto</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>

              {/* Update Button */}
              <Button
                onClick={handleUpdate}
                className="w-full"
                size="md"
              >
                Update Preview
              </Button>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col xs:flex-row gap-3"
              variants={itemVariants}
            >
              <a
                href="#preview"
                className="flex-1"
              >
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  Get Started
                </Button>
              </a>
              <a
                href="/docs"
                className="flex-1"
              >
                <Button
                  variant="ghost"
                  size="md"
                  className="w-full"
                >
                  View Docs
                </Button>
              </a>
            </motion.div>

            {/* Fine Print */}
            <motion.p
              className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed"
              variants={itemVariants}
            >
              <span className="font-medium">Note:</span> Set your{' '}
              <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-900 dark:text-slate-50 font-mono text-xs">
                GITHUB_TOKEN
              </code>
              {' '}environment variable for enhanced API rate limits and private repository access.
            </motion.p>
          </motion.div>

          {/* Right Side - Preview Panel */}
          <motion.div
            className="order-1 md:order-2"
            variants={itemVariants}
          >
            {/* Browser Window Chrome */}
            <div className="bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-2 shadow-2xl">
              {/* Title Bar */}
              <div className="bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700 rounded-t-lg px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
              </div>

              {/* Content Area */}
              <div className="bg-white dark:bg-slate-900 rounded-b-lg p-6 sm:p-8 space-y-4">
                {/* Animated Loading Placeholders */}
                <motion.div
                  className="space-y-3"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {/* Placeholder 1 */}
                  <div className="h-40 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg" />

                  {/* Placeholder 2 */}
                  <div className="h-32 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg" />

                  {/* Placeholder 3 */}
                  <div className="h-24 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg" />
                </motion.div>

                {/* Preview Text */}
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center pt-4">
                  Preview will appear here
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
