"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";
import { createLocalStorageStore } from "@/client/utils/create-local-storage-store";

type DensityMode = "compact" | "spacious";

interface DensityContextValue {
  density: DensityMode;
  setDensity: (mode: DensityMode) => void;
  toggleDensity: () => void;
}

const DensityContext = createContext<DensityContextValue | null>(null);

const store = createLocalStorageStore<DensityMode>(
  "density-mode",
  "spacious",
  (stored) => (stored === "compact" || stored === "spacious" ? stored : "spacious"),
);

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const density = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  useEffect(() => {
    document.body.setAttribute("data-density", density);
  }, [density]);

  const setDensity = useCallback((mode: DensityMode) => {
    store.setValue(mode);
  }, []);

  const toggleDensity = useCallback(() => {
    const current = store.getSnapshot();
    store.setValue(current === "compact" ? "spacious" : "compact");
  }, []);

  return (
    <DensityContext.Provider value={{ density, setDensity, toggleDensity }}>
      {children}
    </DensityContext.Provider>
  );
}

export function useDensity(): DensityContextValue {
  const context = useContext(DensityContext);
  if (!context) {
    throw new Error("useDensity deve ser usado dentro de um DensityProvider");
  }
  return context;
}
