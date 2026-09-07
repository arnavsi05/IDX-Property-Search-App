import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "idx-favorites";
const listeners = new Set();

function readFavorites() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let favoriteIds = readFavorites();

function setFavoriteIds(next) {
  favoriteIds = next;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage may be unavailable (e.g. private browsing); ignore.
  }

  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return favoriteIds;
}

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, getSnapshot);

  const isFavorite = useCallback(
    (id) => ids.includes(id),
    [ids]
  );

  const toggleFavorite = useCallback((id) => {
    setFavoriteIds(
      favoriteIds.includes(id)
        ? favoriteIds.filter((favoriteId) => favoriteId !== id)
        : [...favoriteIds, id]
    );
  }, []);

  return {
    favoriteIds: ids,
    isFavorite,
    toggleFavorite,
  };
}
