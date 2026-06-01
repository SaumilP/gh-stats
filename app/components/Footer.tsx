'use client';

import { motion } from 'framer-motion';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-8 sm:py-12 mt-12 md:mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true, margin: '-50px' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 text-center">
            {/* Tagline */}
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              gh-stats — built for stable embeds and low-cost hosting.
            </p>

            {/* Links Row */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <a
                href="/api/health"
                className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
              >
                Health
              </a>
              <span className="text-gray-400 dark:text-gray-600">·</span>
              <a
                href="/api/limits?format=json"
                className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
              >
                Limits
              </a>
              <span className="text-gray-400 dark:text-gray-600">·</span>
              <a
                href="https://github.com/SaumilP/gh-stats"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
