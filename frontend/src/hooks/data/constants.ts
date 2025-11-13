const STALE_TIME = 50 * 60 * 1000; // 50 minutes
const GC_TIME = 100 * 60 * 1000; // 100 minutes (formerly cacheTime)

// Chat-specific constants
const CHAT_STALE_TIME = 5 * 60 * 1000; // 5 minutes (shorter for chat)
const CHAT_GC_TIME = 10 * 60 * 1000; // 10 minutes

export { STALE_TIME, GC_TIME, CHAT_STALE_TIME, CHAT_GC_TIME };
