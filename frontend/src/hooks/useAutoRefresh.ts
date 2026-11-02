import { useEffect, useRef } from 'react';

/**
 * Keeps a page's data fresh without a full React Query migration.
 *
 * Re-runs `refresh` whenever:
 *   - the browser window regains focus, and
 *   - the tab becomes visible again (visibilitychange),
 *
 * optionally throttled so rapid focus/visibility flips don't spam the API.
 *
 * Usage:
 *   const fetchData = useCallback(async () => { ... }, [deps]);
 *   useEffect(() => { fetchData(); }, [fetchData]); // initial load
 *   useAutoRefresh(fetchData);                      // keep it fresh
 *
 * This makes edits made on one page (e.g. a movie's duration/genre on the
 * Movies page) show up on linked pages (Screenings, Films, etc.) as soon as
 * the user navigates/returns to them, instead of requiring a manual reload.
 */
export function useAutoRefresh(
  refresh: () => void | Promise<void>,
  options: { throttleMs?: number; enabled?: boolean } = {}
) {
  const { throttleMs = 1000, enabled = true } = options;

  // Keep the latest callback without re-binding the listeners every render.
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  const lastRunRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const run = () => {
      const now = Date.now();
      if (now - lastRunRef.current < throttleMs) return;
      lastRunRef.current = now;
      void refreshRef.current();
    };

    const onFocus = () => run();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') run();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [throttleMs, enabled]);
}
