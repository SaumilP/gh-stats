'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCardUrls } from '@/lib/api';
import { Theme } from '@/lib/types';

interface PreviewPanelProps {
  username: string;
  theme: Theme;
}

export function PreviewPanel({ username, theme }: PreviewPanelProps) {
  const [cardUrls, setCardUrls] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const urls = getCardUrls(username, theme);
    setCardUrls(urls);
  }, [username, theme]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  if (!cardUrls) {
    return null;
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Stats Card */}
      <motion.div className="card-glass rounded-lg p-2 sm:p-3 md:p-4" variants={cardVariants}>
        <img
          src={cardUrls.stats}
          alt="GitHub stats"
          loading="lazy"
          className="w-full h-auto"
        />
      </motion.div>

      {/* Languages Card */}
      <motion.div className="card-glass rounded-lg p-2 sm:p-3 md:p-4" variants={cardVariants}>
        <img
          src={cardUrls.languages}
          alt="Programming languages"
          loading="lazy"
          className="w-full h-auto"
        />
      </motion.div>

      {/* Repos Card */}
      <motion.div className="card-glass rounded-lg p-2 sm:p-3 md:p-4" variants={cardVariants}>
        <img
          src={cardUrls.repos}
          alt="Top repositories"
          loading="lazy"
          className="w-full h-auto"
        />
      </motion.div>

      {/* Streak Card */}
      <motion.div className="card-glass rounded-lg p-2 sm:p-3 md:p-4" variants={cardVariants}>
        <img
          src={cardUrls.streak}
          alt="GitHub streak"
          loading="lazy"
          className="w-full h-auto"
        />
      </motion.div>
    </motion.div>
  );
}
