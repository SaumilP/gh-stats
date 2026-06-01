'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700/50">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
            <Image
              src="/logo.svg"
              alt="gh-stats logo"
              width={32}
              height={32}
              className="w-7 h-7 sm:w-8 sm:h-8"
            />
            <span className="hidden xs:inline font-semibold text-slate-900 dark:text-slate-50 text-sm sm:text-base">
              gh-stats
            </span>
          </Link>

          {/* Navigation and Theme Toggle */}
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
            {/* Navigation Links - Hidden on mobile */}
            <nav className="hidden sm:flex items-center gap-4 md:gap-6">
              <Link
                href="#preview"
                className="text-sm md:text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 font-medium transition-colors duration-200"
              >
                Preview
              </Link>
              <Link
                href="#embed"
                className="text-sm md:text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 font-medium transition-colors duration-200"
              >
                Embed
              </Link>
              <Link
                href="#endpoints"
                className="text-sm md:text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 font-medium transition-colors duration-200"
              >
                Endpoints
              </Link>
            </nav>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
