"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY = "sidebar-collapsed";

function getStoredState(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return false;
  return stored === "true";
}

export function useSidebarState() {
  const [collapsed, setCollapsedState] = useState<boolean>(getStoredState);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  }, []);

  const toggle = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return { collapsed, setCollapsed, toggle };
}
