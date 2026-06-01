'use client';

import { motion } from 'framer-motion';

interface Endpoint {
  path: string;
  description: string;
  params: string;
}

const endpoints: Endpoint[] = [
  {
    path: '/api/stats',
    description: 'Profile stats: repos, followers, stars, forks.',
    params: '?username= (required) • ?theme=',
  },
  {
    path: '/api/repos',
    description: 'Top repos. Sorted deterministically.',
    params: '?count=1..10 • ?sort=stars|forks',
  },
  {
    path: '/api/languages',
    description: 'Default cheap mode + accurate bytes mode.',
    params: '?mode=primary • ?mode=bytes',
  },
  {
    path: '/api/streak',
    description: 'Contribution streak via GraphQL.',
    params: 'GITHUB_TOKEN recommended',
  },
];

export function EndpointsSection() {
  return (
    <motion.section
      id="endpoints"
      className="py-8 sm:py-12 md:py-20 px-4 sm:px-6 md:px-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, margin: '-100px' }}
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-slate-900 dark:text-slate-50">
          API Endpoints
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {endpoints.map((endpoint, idx) => (
            <motion.div
              key={endpoint.path}
              className="glass rounded-lg p-4 sm:p-5 border border-slate-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <h3 className="font-mono font-bold text-blue-400 text-sm sm:text-base mb-2">
                {endpoint.path}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                {endpoint.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                {endpoint.params}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
