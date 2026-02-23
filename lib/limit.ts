export function pLimit(concurrency: number) {
  let activeCount = 0;
  const queue: Array<() => void> = [];

  const next = () => {
    activeCount--;
    const fn = queue.shift();
    if (fn) fn();
  };

  return function limit<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const run = () => {
        activeCount++;
        fn()
          .then(resolve, reject)
          .finally(next);
      };

      if (activeCount < concurrency) run();
      else queue.push(run);
    });
  };
}

