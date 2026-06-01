'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateEmbedCode } from '@/lib/api';
import Button from './Button';

interface EmbedSectionProps {
  username: string;
}

export function EmbedSection({ username }: EmbedSectionProps) {
  const [embedCode, setEmbedCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get the domain from window.location
    const domain = typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.host}`
      : 'https://gh-stats.com';

    const code = generateEmbedCode(username, `${domain}/api`);
    setEmbedCode(code);
  }, [username]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.section
      id="embed"
      className="py-8 sm:py-12 md:py-20 px-4 sm:px-6 md:px-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, margin: '-100px' }}
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-slate-900 dark:text-slate-50">
          Embed Your Stats
        </h2>

        <p className="text-slate-600 dark:text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">
          Copy the code below and paste it into your GitHub README:
        </p>

        {/* Code Block */}
        <div className="relative mb-4 sm:mb-6">
          <div className="glass rounded-lg bg-slate-900/50 dark:bg-slate-950/50 backdrop-blur-sm border border-slate-700/50 dark:border-slate-700 p-3 sm:p-4 md:p-6 overflow-x-auto">
            <pre className="text-xs sm:text-sm text-slate-100 font-mono whitespace-pre-wrap break-words">
              <code>{embedCode}</code>
            </pre>
          </div>

          {/* Copy Button */}
          <Button
            onClick={handleCopy}
            variant="secondary"
            size="sm"
            className="absolute top-3 sm:top-4 right-3 sm:right-4"
            aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>

        {/* Note Box */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4 sm:p-5 md:p-6">
          <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
            <span className="font-semibold">Note:</span> The embed code is cached for performance. If you recently made changes to your GitHub profile, it may take a few minutes to update.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
