"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

type DensityMode = "compact" | "spacious";

interface DensityContextValue {
  density: DensityMode;
  setDensity: (mode: DensityMode) => void;
  toggleDensity: () => void;
}

const STORAGE_KEY = "density-mode";
const DEFAULT_DENSITY: DensityMode = "spacious";

const DensityContext = createContext<DensityContextValue | null>(null);

function getStoredDensity(): DensityMode {
  if (typeof window === "undefined") return DEFAULT_DENSITY;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "compact" || stored === "spacious") return stored;
  return DEFAULT_DENSITY;
}

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensityState] = useState<DensityMode>(getStoredDensity);

  useEffect(() => {
    document.body.setAttribute("data-density", density);
  }, [density]);

  const setDensity = useCallback((mode: DensityMode) => {
    setDensityState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, []);

  const toggleDensity = useCallback(() => {
    setDensityState((prev) => {
      const next = prev === "compact" ? "spacious" : "compact";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
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
