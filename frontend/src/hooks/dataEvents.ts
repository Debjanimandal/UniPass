import { useEffect, useRef } from 'react';

/**
 * A tiny in-app event bus so that a mutation on one page (e.g. editing a movie
 * on the Movies page) can tell other already-mounted pages to refetch, keeping
 * every linked page in sync without a shared cache or a page reload.
 *
 * Resources that pages care about. Mutating one should refresh any page that
 * displays it. Movies feed screenings and the student-facing lists, so a movie
 * change broadcasts "movies" (and callers may also broadcast "screenings").
 */
export type DataResource = 'movies' | 'screenings' | 'screens' | 'seats' | 'bookings';

type Listener = () => void;

const listeners: Record<DataResource, Set<Listener>> = {
  movies: new Set(),
  screenings: new Set(),
  screens: new Set(),
  seats: new Set(),
  bookings: new Set(),
};

/** Notify every subscriber that one or more resources changed. */
export function emitDataChange(...resources: DataResource[]) {
  for (const resource of resources) {
    for (const listener of listeners[resource]) {
      try {
        listener();
      } catch {
        /* a failing listener must not block the others */
      }
    }
  }
}

/**
 * Subscribe a refetch callback to one or more resources. The callback runs
 * whenever `emitDataChange` is called for any of the given resources.
 */
export function useDataChange(resources: DataResource[], onChange: () => void) {
  const cbRef = useRef(onChange);
  cbRef.current = onChange;

  // Stable key so the effect doesn't re-subscribe on every render.
  const key = resources.join(',');

  useEffect(() => {
    const listener: Listener = () => cbRef.current();
    const subscribed = key.split(',').filter(Boolean) as DataResource[];
    subscribed.forEach((r) => listeners[r].add(listener));
    return () => {
      subscribed.forEach((r) => listeners[r].delete(listener));
    };
  }, [key]);
}
