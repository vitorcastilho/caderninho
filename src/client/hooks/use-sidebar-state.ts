"use client";

import { useSyncExternalStore, useCallback } from "react";
import { createLocalStorageStore } from "@/client/utils/create-local-storage-store";

const store = createLocalStorageStore(
  "sidebar-collapsed",
  false,
  (stored) => stored === "true",
);

export function useSidebarState() {
  const collapsed = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  const setCollapsed = useCallback((value: boolean) => {
    store.setValue(value);
  }, []);

  const toggle = useCallback(() => {
    store.setValue(!store.getSnapshot());
  }, []);

  return { collapsed, setCollapsed, toggle };
}
