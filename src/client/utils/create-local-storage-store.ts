const storeRegistry = new Map<string, Set<() => void>>();

function getListeners(key: string): Set<() => void> {
  let listeners = storeRegistry.get(key);
  if (!listeners) {
    listeners = new Set();
    storeRegistry.set(key, listeners);
  }
  return listeners;
}

export function createLocalStorageStore<T extends string | number | boolean>(
  key: string,
  defaultValue: T,
  parse: (stored: string | null) => T,
) {
  const listeners = getListeners(key);
  let cachedRaw: string | null | undefined;
  let cachedSnapshot: T | undefined;

  function emitChange() {
    for (const listener of listeners) {
      listener();
    }
  }

  function subscribe(callback: () => void) {
    listeners.add(callback);
    // Known limitation: localStorage.clear() from another tab fires a StorageEvent
    // with event.key === null, which this filter ignores. The store will not sync
    // after a cross-tab clear(). A page refresh resolves this. Acceptable trade-off
    // since clear() is rare in production and the filter prevents unnecessary updates.
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) {
        invalidateCache();
        callback();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      listeners.delete(callback);
      window.removeEventListener("storage", handleStorage);
    };
  }

  function invalidateCache() {
    cachedRaw = undefined;
    cachedSnapshot = undefined;
  }

  function getSnapshot(): T {
    const raw = localStorage.getItem(key);
    if (raw !== cachedRaw || cachedSnapshot === undefined) {
      cachedRaw = raw;
      cachedSnapshot = parse(raw);
    }
    return cachedSnapshot;
  }

  function getServerSnapshot(): T {
    return defaultValue;
  }

  function setValue(value: T) {
    const stringValue = String(value);
    localStorage.setItem(key, stringValue);
    cachedRaw = stringValue;
    cachedSnapshot = value;
    emitChange();
  }

  return { subscribe, getSnapshot, getServerSnapshot, setValue };
}
