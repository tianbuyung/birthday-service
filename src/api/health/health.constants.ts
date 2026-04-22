export const HEALTH_KEYS = {
  DISK: 'disk',
  MEMORY_HEAP: 'memory_heap',
  MEMORY_RSS: 'memory_rss',
  MONGODB: 'mongodb',
  DOCS: 'docs',
} as const;

export const HEALTH_THRESHOLDS = {
  DISK_PATH: '/',
  DISK_PERCENT: 0.7,
  MEMORY_HEAP_BYTES: 150 * 1024 * 1024,
  MEMORY_RSS_BYTES: 500 * 1024 * 1024,
} as const;
